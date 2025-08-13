import mongoose from 'mongoose';

export interface ITeam extends mongoose.Document {
  name: string;
  description: string;
  members: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  goals: {
    dailyTarget: number;
    weeklyTarget: number;
    monthlyTarget: number;
  };
  settings: {
    allowMemberInvites: boolean;
    requireApproval: boolean;
    visibility: 'public' | 'private';
  };
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new mongoose.Schema<ITeam>({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [100, 'Team name cannot exceed 100 characters'],
    unique: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  goals: {
    dailyTarget: {
      type: Number,
      default: 15,
      min: [1, 'Daily target must be at least 1']
    },
    weeklyTarget: {
      type: Number,
      default: 90,
      min: [1, 'Weekly target must be at least 1']
    },
    monthlyTarget: {
      type: Number,
      default: 360,
      min: [1, 'Monthly target must be at least 1']
    }
  },
  settings: {
    allowMemberInvites: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private'
    }
  }
}, {
  timestamps: true
});

// Ensure admins are also members
teamSchema.pre('save', function(next) {
  const adminIds = this.admins.map(admin => admin.toString());
  const memberIds = this.members.map(member => member.toString());
  
  // Add admins to members if they're not already there
  adminIds.forEach(adminId => {
    if (!memberIds.includes(adminId)) {
      this.members.push(adminId as any);
    }
  });
  
  next();
});

// Create indexes
teamSchema.index({ name: 1 });
teamSchema.index({ members: 1 });
teamSchema.index({ admins: 1 });
teamSchema.index({ visibility: 1 });

// Method to add member
teamSchema.methods.addMember = function(userId: mongoose.Types.ObjectId) {
  if (!this.members.includes(userId)) {
    this.members.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove member
teamSchema.methods.removeMember = function(userId: mongoose.Types.ObjectId) {
  this.members = this.members.filter((member: mongoose.Types.ObjectId) => !member.equals(userId));
  this.admins = this.admins.filter((admin: mongoose.Types.ObjectId) => !admin.equals(userId));
  return this.save();
};

// Method to promote member to admin
teamSchema.methods.promoteToAdmin = function(userId: mongoose.Types.ObjectId) {
  if (this.members.includes(userId) && !this.admins.includes(userId)) {
    this.admins.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to demote admin
teamSchema.methods.demoteAdmin = function(userId: mongoose.Types.ObjectId) {
  this.admins = this.admins.filter((admin: mongoose.Types.ObjectId) => !admin.equals(userId));
  return this.save();
};

// Static method to get user's teams
teamSchema.statics.getUserTeams = function(userId: string) {
  return this.find({
    members: userId
  }).populate('members', 'name email role').populate('admins', 'name email role');
};

// Static method to get team with members
teamSchema.statics.getTeamWithMembers = function(teamId: string) {
  return this.findById(teamId)
    .populate('members', 'name email role lastLogin')
    .populate('admins', 'name email role');
};

// Add the static methods to the interface
interface ITeamModel extends mongoose.Model<ITeam> {
  getUserTeams(userId: string): Promise<ITeam[]>;
  getTeamWithMembers(teamId: string): Promise<ITeam | null>;
}

export default mongoose.models.Team || mongoose.model<ITeam, ITeamModel>('Team', teamSchema);
