import mongoose from 'mongoose';

export interface IEntry extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  // Legacy fields (optional for backward compatibility)
  shiftStart?: Date;
  shiftEnd?: Date;
  totalHours?: number;
  // Current fields
  videosCompleted: number;
  targetVideos: number;
  productivityScore: number;
  notes: string;
  mood: 'excellent' | 'good' | 'average' | 'poor';
  energyLevel: 1 | 2 | 3 | 4 | 5;
  challenges: string[];
  achievements: string[];
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const entrySchema = new mongoose.Schema<IEntry>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  // Legacy fields (optional for backward compatibility)
  shiftStart: {
    type: Date,
    required: false
  },
  shiftEnd: {
    type: Date,
    required: false
  },
  totalHours: {
    type: Number,
    required: false,
    min: [0, 'Total hours cannot be negative'],
    max: [24, 'Total hours cannot exceed 24']
  },
  // Current fields
  videosCompleted: {
    type: Number,
    required: [true, 'Videos completed count is required'],
    min: [0, 'Videos completed cannot be negative'],
    default: 0
  },
  targetVideos: {
    type: Number,
    required: [true, 'Target videos count is required'],
    min: [1, 'Target videos must be at least 1'],
    default: 15
  },
  productivityScore: {
    type: Number,
    required: [true, 'Productivity score is required'],
    min: [0, 'Productivity score cannot be negative'],
    max: [100, 'Productivity score cannot exceed 100'],
    default: 0
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    default: ''
  },
  mood: {
    type: String,
    enum: ['excellent', 'good', 'average', 'poor'],
    default: 'good'
  },
  energyLevel: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    default: 3
  },
  challenges: [{
    type: String,
    maxlength: [200, 'Challenge description cannot exceed 200 characters']
  }],
  achievements: [{
    type: String,
    maxlength: [200, 'Achievement description cannot exceed 200 characters']
  }],
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Calculate productivity score before saving
entrySchema.pre('save', function(next) {
  if (this.isModified('videosCompleted') || this.isModified('targetVideos')) {
    this.productivityScore = Math.round((this.videosCompleted / this.targetVideos) * 100);
    // Cap productivity score at 100%
    if (this.productivityScore > 100) {
      this.productivityScore = 100;
    }
  }
  next();
});

// Create compound indexes for efficient queries
entrySchema.index({ userId: 1, date: 1 }, { unique: true }); // One entry per user per day
entrySchema.index({ userId: 1, date: -1 }); // User entries sorted by date
entrySchema.index({ date: -1 }); // All entries sorted by date
entrySchema.index({ productivityScore: -1 }); // Entries sorted by productivity

// Virtual for completion percentage
entrySchema.virtual('completionPercentage').get(function() {
  return Math.round((this.videosCompleted / this.targetVideos) * 100);
});

// Virtual for shift duration in hours (for backward compatibility)
entrySchema.virtual('shiftDuration').get(function() {
  return this.totalHours || 0;
});

// Method to mark entry as completed
entrySchema.methods.markCompleted = function() {
  this.isCompleted = true;
  return this.save();
};

// Static method to migrate legacy entries
entrySchema.statics.migrateLegacyEntries = async function() {
  try {
    // Find entries that have legacy fields but missing current fields
    const legacyEntries = await this.find({
      $or: [
        { shiftStart: { $exists: true } },
        { shiftEnd: { $exists: true } },
        { totalHours: { $exists: true } }
      ]
    });

    console.log(`Found ${legacyEntries.length} legacy entries to migrate`);

    for (const entry of legacyEntries) {
      // Set default values for missing fields
      if (!entry.notes && entry.remarks) {
        entry.notes = entry.remarks;
      }
      
      if (!entry.notes) {
        entry.notes = '';
      }

      if (!entry.mood) {
        entry.mood = 'good';
      }

      if (!entry.energyLevel) {
        entry.energyLevel = 3;
      }

      if (!entry.challenges) {
        entry.challenges = [];
      }

      if (!entry.achievements) {
        entry.achievements = [];
      }

      if (!entry.targetVideos) {
        entry.targetVideos = 15;
      }

      // Recalculate productivity score
      if (entry.videosCompleted && entry.targetVideos) {
        entry.productivityScore = Math.round((entry.videosCompleted / entry.targetVideos) * 100);
        if (entry.productivityScore > 100) {
          entry.productivityScore = 100;
        }
      }

      await entry.save();
    }

    console.log(`Successfully migrated ${legacyEntries.length} legacy entries`);
    return legacyEntries.length;
  } catch (error) {
    console.error('Error migrating legacy entries:', error);
    throw error;
  }
};

// Static method to get user's daily stats
entrySchema.statics.getUserDailyStats = async function(userId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.findOne({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay }
  });
};

// Static method to get user's weekly stats
entrySchema.statics.getUserWeeklyStats = async function(userId: string, startDate: Date) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  return this.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
};

// Static method to get user's monthly stats
entrySchema.statics.getUserMonthlyStats = async function(userId: string, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  return this.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
};

export default mongoose.models.Entry || mongoose.model<IEntry>('Entry', entrySchema);
