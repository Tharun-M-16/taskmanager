import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [2000, 'Task description cannot be more than 2000 characters']
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['lowest', 'low', 'medium', 'high', 'highest'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['story', 'task', 'bug', 'epic'],
    default: 'task'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter is required']
  },
  dueDate: {
    type: Date,
    default: null
  },
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative'],
    max: [1000, 'Estimated hours cannot exceed 1000']
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative'],
    default: 0
  },
  labels: [{
    type: String,
    trim: true,
    maxlength: [30, 'Label cannot be more than 30 characters']
  }],
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  dependencies: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    type: {
      type: String,
      enum: ['blocks', 'blocked_by', 'relates_to'],
      default: 'relates_to'
    }
  }],
  timeTracking: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      default: null
    },
    duration: {
      type: Number, // in minutes
      default: 0
    },
    description: String
  }],
  comments: [{
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot be more than 1000 characters']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    attachments: [{
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
      url: String
    }]
  }, {
    timestamps: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for task completion percentage
taskSchema.virtual('completionPercentage').get(function() {
  const statusWeights = {
    'todo': 0,
    'in-progress': 25,
    'review': 75,
    'done': 100
  };
  return statusWeights[this.status] || 0;
});

// Virtual for task age
taskSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'done') return false;
  return new Date() > this.dueDate;
});

// Method to add comment
taskSchema.methods.addComment = function(content, authorId) {
  this.comments.push({
    content,
    author: authorId
  });
  return this.save();
};

// Method to update status
taskSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'done') {
    this.completedAt = new Date();
  }
  return this.save();
};

// Method to assign task
taskSchema.methods.assignTo = function(userId) {
  this.assignee = userId;
  return this.save();
};

// Method to track time
taskSchema.methods.startTimeTracking = function(userId, description = '') {
  this.timeTracking.push({
    user: userId,
    startTime: new Date(),
    description
  });
  return this.save();
};

// Method to stop time tracking
taskSchema.methods.stopTimeTracking = function(userId) {
  const activeTracking = this.timeTracking.find(
    tracking => tracking.user.toString() === userId.toString() && !tracking.endTime
  );
  
  if (activeTracking) {
    activeTracking.endTime = new Date();
    activeTracking.duration = Math.round(
      (activeTracking.endTime - activeTracking.startTime) / (1000 * 60)
    );
  }
  
  return this.save();
};

// Indexes for better query performance
taskSchema.index({ project: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ reporter: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ type: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ 'labels': 1 });
taskSchema.index({ createdAt: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
