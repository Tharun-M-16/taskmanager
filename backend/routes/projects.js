import express from 'express';
import jwt from 'jsonwebtoken';
import Project from '../models/Project.js';
import User from '../models/User.js';

const router = express.Router();

// Middleware to verify authentication
const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Apply auth middleware to all routes
router.use(requireAuth);

// @route   GET /api/projects
// @desc    Get all projects for current user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '' } = req.query;
    
    // Build query - user must be owner or member
    let query = {
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    };

    if (search) {
      query.$and = [{
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { key: { $regex: search, $options: 'i' } }
        ]
      }];
    }

    if (status) {
      if (!query.$and) query.$and = [];
      query.$and.push({ status });
    }

    // Execute query with pagination
    const projects = await Project.find(query)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProjects: total,
          projectsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Projects fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects'
    });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { name, key, description, visibility = 'team', tags = [] } = req.body;

    // Check if project key already exists
    const existingProject = await Project.findOne({ key: key.toUpperCase() });
    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: 'Project key already exists'
      });
    }

    // Create new project
    const project = new Project({
      name,
      key: key.toUpperCase(),
      description,
      owner: req.user._id,
      visibility,
      tags,
      members: [{ user: req.user._id, role: 'manager' }]
    });

    await project.save();

    // Populate owner and members for response
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project }
    });

  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project'
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user has access to this project
    if (!project.isOwner(req.user._id) && !project.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.'
      });
    }

    res.json({
      success: true,
      data: { project }
    });

  } catch (error) {
    console.error('Project fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project'
    });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is owner
    if (!project.isOwner(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only project owners can update projects.'
      });
    }

    const { name, description, status, visibility, tags } = req.body;
    
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, status, visibility, tags },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project: updatedProject }
    });

  } catch (error) {
    console.error('Project update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project'
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is owner
    if (!project.isOwner(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only project owners can delete projects.'
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Project deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project'
    });
  }
});

// @route   POST /api/projects/:id/members
// @desc    Add member to project
// @access  Private
router.post('/:id/members', async (req, res) => {
  try {
    const { userId, email, name, role = 'member' } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is owner or manager
    if (!project.isOwner(req.user._id) && 
        !project.members.find(m => m.user.toString() === req.user._id.toString() && m.role === 'manager')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only owners and managers can add members.'
      });
    }

    // Resolve user by id or email. If only name/email provided and user doesn't exist, create one.
    let user = null;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (!user && name) {
        // Create a basic active user with a random password; model should hash password.
        const randomPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        user = new User({ name, email: email.toLowerCase(), password: randomPassword, isActive: true });
        await user.save();
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await project.addMember(user._id, role);

    // Populate for response
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    res.json({
      success: true,
      message: 'Member added successfully',
      data: { project }
    });

  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding member'
    });
  }
});

// @route   DELETE /api/projects/:id/members/:userId
// @desc    Remove member from project
// @access  Private
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is owner or manager
    if (!project.isOwner(req.user._id) && 
        !project.members.find(m => m.user.toString() === req.user._id.toString() && m.role === 'manager')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only owners and managers can remove members.'
      });
    }

    // Prevent removing the owner
    if (project.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove project owner'
      });
    }

    await project.removeMember(userId);

    // Populate for response
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    res.json({
      success: true,
      message: 'Member removed successfully',
      data: { project }
    });

  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing member'
    });
  }
});

export default router;
