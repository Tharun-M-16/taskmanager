import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { connectDB } from '../config/database.js';

dotenv.config();

// Sample data
const sampleUsers = [
  {
    name: 'Tharun Admin',
    email: 'tharun1616t@gmail.com',
    password: 'password123',
    role: 'admin',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    role: 'user',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    password: 'password123',
    role: 'user',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    password: 'password123',
    role: 'user',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'David Brown',
    email: 'david.brown@example.com',
    password: 'password123',
    role: 'user',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face'
  }
];

const sampleProjects = [
  {
    name: 'Project Bolt',
    key: 'BOLT',
    description: 'A comprehensive project management platform built with modern technologies',
    status: 'active',
    visibility: 'team',
    tags: ['web-app', 'project-management', 'react']
  },
  {
    name: 'E-commerce Platform',
    key: 'ECOMM',
    description: 'Modern e-commerce solution with advanced features',
    status: 'active',
    visibility: 'team',
    tags: ['e-commerce', 'shopping', 'payment']
  },
  {
    name: 'Mobile App Development',
    key: 'MOBILE',
    description: 'Cross-platform mobile application for iOS and Android',
    status: 'active',
    visibility: 'team',
    tags: ['mobile', 'react-native', 'cross-platform']
  }
];

const sampleTasks = [
  {
    title: 'Setup project structure',
    description: 'Initialize the basic project structure with proper folder organization',
    status: 'done',
    priority: 'high',
    type: 'task',
    estimatedHours: 4
  },
  {
    title: 'Design user interface',
    description: 'Create wireframes and mockups for the main user interface',
    status: 'in-progress',
    priority: 'medium',
    type: 'story',
    estimatedHours: 8
  },
  {
    title: 'Implement authentication',
    description: 'Build user authentication system with JWT tokens',
    status: 'todo',
    priority: 'high',
    type: 'task',
    estimatedHours: 6
  },
  {
    title: 'Fix login bug',
    description: 'Users are experiencing issues with the login functionality',
    status: 'todo',
    priority: 'highest',
    type: 'bug',
    estimatedHours: 2
  },
  {
    title: 'Add project management features',
    description: 'Implement core project management functionality',
    status: 'todo',
    priority: 'medium',
    type: 'epic',
    estimatedHours: 16
  }
];

// Connect to MongoDB using the main database configuration
const connectToDB = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Clear existing data (only when forced)
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('🗑️ Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }
};

// Seed users (insert if not exists)
const seedUsers = async () => {
  try {
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (exists) {
        createdUsers.push(exists);
        console.log(`👤 Skipped existing user: ${exists.email}`);
        continue;
      }
      const user = new User({
        ...userData,
        password: userData.password // Let the User model handle password hashing
      });
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`👤 Created user: ${savedUser.name} (${savedUser.email})`);
    }
    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

// Seed projects (insert if key not exists)
const seedProjects = async (users) => {
  try {
    const adminUser = users.find(u => u.role === 'admin');
    const regularUsers = users.filter(u => u.role === 'user');
    
    const createdProjects = [];
    
    for (let i = 0; i < sampleProjects.length; i++) {
      const projectData = sampleProjects[i];
      const existing = await Project.findOne({ key: projectData.key });
      if (existing) {
        createdProjects.push(existing);
        console.log(`📁 Skipped existing project: ${existing.key}`);
        continue;
      }
      const project = new Project({
        ...projectData,
        owner: adminUser._id,
        members: [
          { user: adminUser._id, role: 'manager' },
          ...regularUsers.slice(0, 2).map(user => ({
            user: user._id,
            role: 'developer'
          }))
        ]
      });
      const savedProject = await project.save();
      createdProjects.push(savedProject);
      console.log(`📁 Created project: ${savedProject.name} (${savedProject.key})`);
    }
    
    return createdProjects;
  } catch (error) {
    console.error('❌ Error seeding projects:', error);
    throw error;
  }
};

// Seed tasks (insert if not exists by title+project)
const seedTasks = async (users, projects) => {
  try {
    const adminUser = users.find(u => u.role === 'admin');
    const regularUsers = users.filter(u => u.role === 'user');
    
    const createdTasks = [];
    
    for (let i = 0; i < sampleTasks.length; i++) {
      const taskData = sampleTasks[i];
      const project = projects[i % projects.length]; // Distribute tasks across projects
      const assignee = i % 2 === 0 ? regularUsers[0] : regularUsers[1]; // Alternate assignees
      const exists = await Task.findOne({ title: taskData.title, project: project._id });
      if (exists) {
        createdTasks.push(exists);
        console.log(`✅ Skipped existing task: ${exists.title}`);
        continue;
      }
      const task = new Task({
        ...taskData,
        project: project._id,
        assignee: assignee._id,
        reporter: adminUser._id,
        dueDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000)
      });
      const savedTask = await task.save();
      createdTasks.push(savedTask);
      console.log(`✅ Created task: ${savedTask.title}`);
    }
    
    return createdTasks;
  } catch (error) {
    console.error('❌ Error seeding tasks:', error);
    throw error;
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    const force = process.env.SEED_MODE === 'force' || process.argv.includes('--force');
    console.log(`🌱 Starting database seeding... (mode: ${force ? 'force' : 'safe'})`);
    
    // Connect to database
    await connectToDB();
    
    // Clear existing data only when forced
    if (force) {
      await clearDatabase();
    }
    
    // Seed data
    console.log('\n👥 Seeding users...');
    const users = await seedUsers();
    
    console.log('\n📁 Seeding projects...');
    const projects = await seedProjects(users);
    
    console.log('\n✅ Seeding tasks...');
    const tasks = await seedTasks(users, projects);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Created ${users.length} users, ${projects.length} projects, and ${tasks.length} tasks`);
    
    // Display admin credentials
    const adminUser = users.find(u => u.role === 'admin');
    console.log('\n🔑 Admin Login Credentials:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: password123`);
    console.log(`   Role: ${adminUser.role}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (import.meta.url.startsWith('file:')) {
  const modulePath = new URL(import.meta.url).pathname;
  const scriptPath = process.argv[1];
  
  if (modulePath.includes('seedDatabase.js')) {
    seedDatabase();
  }
}

export default seedDatabase;
