import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot be more than 100 characters']
  },
  key: {
    type: String,
    required: [true, 'Project key is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [10, 'Project key cannot be more than 10 characters'],
    match: [/^[A-Z0-9]+$/, 'Project key can only contain uppercase letters and numbers']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [500, 'Project description cannot be more than 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project owner is required']
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['member', 'developer', 'manager', 'viewer'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'archived'],
    default: 'active'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'team'],
    default: 'team'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot be more than 20 characters']
  }],
  settings: {
    allowGuestAccess: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    autoAssignTasks: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for project member count
projectSchema.virtual('memberCount').get(function() {
  return this.members ? this.members.length : 0;
});

// Virtual for project URL
projectSchema.virtual('projectUrl').get(function() {
  return `/projects/${this.key}`;
});

// Method to add member
projectSchema.methods.addMember = function(userId, role = 'member') {
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    existingMember.role = role;
  } else {
    this.members.push({ user: userId, role });
  }
  
  return this.save();
};

// Method to remove member
projectSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to check if user is member
projectSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString()
  );
};

// Method to check if user is owner
projectSchema.methods.isOwner = function(userId) {
  return this.owner.toString() === userId.toString();
};

// Indexes for better query performance (key is already indexed by unique: true)
projectSchema.index({ owner: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ tags: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
