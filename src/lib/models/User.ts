import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'team_manager' | 'editor' | 'viewer';
  isActive: boolean;
  teamId?: mongoose.Types.ObjectId; // Reference to team
  teamManagerId?: mongoose.Types.ObjectId; // Reference to team manager
  position?: string; // Job title/position
  department?: string; // Department within the organization
  employeeId?: string; // Employee ID
  phone?: string; // Contact phone
  avatar?: string; // Profile picture URL
  skills?: string[]; // Array of skills
  joinDate?: Date; // When they joined the team
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    validate: {
      validator: function(password: string) {
        // Check for at least one uppercase, lowercase, number, and special character
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
        
        return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
      },
      message: 'Password must contain uppercase, lowercase, numbers, and special characters'
    },
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['admin', 'team_manager', 'editor', 'viewer'],
    default: 'editor'
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: function() { return this.role === 'editor' || this.role === 'team_manager'; }
  },
  teamManagerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.role === 'editor'; }
  },
  position: {
    type: String,
    trim: true,
    maxlength: [100, 'Position cannot be more than 100 characters']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department cannot be more than 100 characters']
  },
  employeeId: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  avatar: {
    type: String,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  joinDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Create indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ teamId: 1 });
userSchema.index({ teamManagerId: 1 });
userSchema.index({ employeeId: 1 });
userSchema.index({ department: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
