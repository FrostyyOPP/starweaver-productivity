import mongoose from 'mongoose';

export interface IEntry extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  // Legacy fields (optional for backward compatibility)
  shiftStart?: Date;
  shiftEnd?: Date;
  totalHours?: number;
  // New video tracking fields
  courseVideos: number;
  marketingVideos: number;
  totalVideos: number;
  targetVideos: number;
  videoType: 'course' | 'marketing' | 'leave';
  // Legacy field for backward compatibility
  videosCompleted?: number;
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
  // New video tracking fields
  courseVideos: {
    type: Number,
    required: false,
    min: [0, 'Course videos cannot be negative'],
    default: 0
  },
  marketingVideos: {
    type: Number,
    required: false,
    min: [0, 'Marketing videos cannot be negative'],
    default: 0
  },
  totalVideos: {
    type: Number,
    required: false,
    min: [0, 'Total videos cannot be negative'],
    default: 0
  },
  targetVideos: {
    type: Number,
    required: false,
    min: [0, 'Target videos cannot be negative'],
    default: 15
  },
  videoType: {
    type: String,
    enum: ['course', 'marketing', 'leave'],
    default: 'course'
  },
  // Legacy field for backward compatibility
  videosCompleted: {
    type: Number,
    required: false,
    min: [0, 'Videos completed cannot be negative'],
    default: 0
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

// Calculate total videos and productivity score before saving
entrySchema.pre('save', function(next) {
  // Calculate total videos based on course and marketing videos
  if (this.isModified('courseVideos') || this.isModified('marketingVideos')) {
    const courseCount = this.courseVideos || 0;
    const marketingCount = this.marketingVideos || 0;
    // 1 marketing video = 6 course videos
    this.totalVideos = courseCount + (marketingCount * 6);
    
    // Update legacy field for backward compatibility
    this.videosCompleted = this.totalVideos;
  }

  // Calculate productivity score
  if (this.isModified('totalVideos') || this.isModified('targetVideos')) {
    if (this.videoType === 'leave') {
      this.productivityScore = 0;
    } else if (this.targetVideos && this.targetVideos > 0) {
      this.productivityScore = Math.round((this.totalVideos / this.targetVideos) * 100);
      // Cap productivity score at 100%
      if (this.productivityScore > 100) {
        this.productivityScore = 100;
      }
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
      if (!entry.notes && (entry as any).remarks) {
        entry.notes = (entry as any).remarks;
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
  endDate.setDate(startDate.getDate() + 6);

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
