import mongoose from 'mongoose';

export interface IAnalytics extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  period: 'daily' | 'weekly' | 'monthly';
  metrics: {
    totalVideos: number;
    totalHours: number;
    averageProductivity: number;
    targetAchievement: number;
    consistencyScore: number;
    improvementRate: number;
  };
  trends: {
    productivityTrend: 'increasing' | 'decreasing' | 'stable';
    efficiencyTrend: 'improving' | 'declining' | 'maintained';
    workloadTrend: 'increasing' | 'decreasing' | 'stable';
  };
  insights: {
    bestPerformingDay: string;
    peakProductivityHour: number;
    recommendedBreakTime: number;
    focusAreas: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const analyticsSchema = new mongoose.Schema<IAnalytics>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: [true, 'Period is required'],
    index: true
  },
  metrics: {
    totalVideos: {
      type: Number,
      default: 0,
      min: [0, 'Total videos cannot be negative']
    },
    totalHours: {
      type: Number,
      default: 0,
      min: [0, 'Total hours cannot be negative']
    },
    averageProductivity: {
      type: Number,
      default: 0,
      min: [0, 'Average productivity cannot be negative'],
      max: [100, 'Average productivity cannot exceed 100']
    },
    targetAchievement: {
      type: Number,
      default: 0,
      min: [0, 'Target achievement cannot be negative'],
      max: [100, 'Target achievement cannot exceed 100']
    },
    consistencyScore: {
      type: Number,
      default: 0,
      min: [0, 'Consistency score cannot be negative'],
      max: [100, 'Consistency score cannot exceed 100']
    },
    improvementRate: {
      type: Number,
      default: 0,
      min: [-100, 'Improvement rate cannot be less than -100'],
      max: [100, 'Improvement rate cannot exceed 100']
    }
  },
  trends: {
    productivityTrend: {
      type: String,
      enum: ['increasing', 'decreasing', 'stable'],
      default: 'stable'
    },
    efficiencyTrend: {
      type: String,
      enum: ['improving', 'declining', 'maintained'],
      default: 'maintained'
    },
    workloadTrend: {
      type: String,
      enum: ['increasing', 'decreasing', 'stable'],
      default: 'stable'
    }
  },
  insights: {
    bestPerformingDay: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      default: 'monday'
    },
    peakProductivityHour: {
      type: Number,
      min: [0, 'Peak hour must be between 0-23'],
      max: [23, 'Peak hour must be between 0-23'],
      default: 10
    },
    recommendedBreakTime: {
      type: Number,
      min: [5, 'Break time must be at least 5 minutes'],
      max: [60, 'Break time cannot exceed 60 minutes'],
      default: 15
    },
    focusAreas: [{
      type: String,
      maxlength: [100, 'Focus area description cannot exceed 100 characters']
    }]
  }
}, {
  timestamps: true
});

// Create compound indexes
analyticsSchema.index({ userId: 1, date: 1, period: 1 }, { unique: true });
analyticsSchema.index({ userId: 1, period: 1, date: -1 });
analyticsSchema.index({ date: -1 });

// Method to calculate trends
analyticsSchema.methods.calculateTrends = function(previousAnalytics: IAnalytics) {
  if (!previousAnalytics) return;

  // Calculate productivity trend
  if (this.metrics.averageProductivity > previousAnalytics.metrics.averageProductivity) {
    this.trends.productivityTrend = 'increasing';
  } else if (this.metrics.averageProductivity < previousAnalytics.metrics.averageProductivity) {
    this.trends.productivityTrend = 'decreasing';
  } else {
    this.trends.productivityTrend = 'stable';
  }

  // Calculate efficiency trend
  const currentEfficiency = this.metrics.totalVideos / this.metrics.totalHours;
  const previousEfficiency = previousAnalytics.metrics.totalVideos / previousAnalytics.metrics.totalHours;
  
  if (currentEfficiency > previousEfficiency) {
    this.trends.efficiencyTrend = 'improving';
  } else if (currentEfficiency < previousEfficiency) {
    this.trends.efficiencyTrend = 'declining';
  } else {
    this.trends.efficiencyTrend = 'maintained';
  }

  // Calculate improvement rate
  this.metrics.improvementRate = Math.round(
    ((this.metrics.averageProductivity - previousAnalytics.metrics.averageProductivity) / 
     previousAnalytics.metrics.averageProductivity) * 100
  );
};

// Method to generate insights
analyticsSchema.methods.generateInsights = function(entries: any[]) {
  if (!entries || entries.length === 0) return;

  // Find best performing day
  const dayPerformance: { [key: string]: number } = {};
  entries.forEach(entry => {
    const day = entry.date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    dayPerformance[day] = (dayPerformance[day] || 0) + entry.productivityScore;
  });

  const bestDay = Object.entries(dayPerformance).reduce((a, b) => 
    dayPerformance[a[0]] > dayPerformance[b[0]] ? a : b
  )[0];
  
  this.insights.bestPerformingDay = bestDay;

  // Find peak productivity hour
  const hourPerformance: { [key: number]: number } = {};
  entries.forEach(entry => {
    const hour = new Date(entry.shiftStart).getHours();
    hourPerformance[hour] = (hourPerformance[hour] || 0) + entry.productivityScore;
  });

  const peakHour = Object.entries(hourPerformance).reduce((a, b) => 
    hourPerformance[Number(a[0])] > hourPerformance[Number(b[0])] ? a : b
  )[0];
  
  this.insights.peakProductivityHour = Number(peakHour);

  // Calculate recommended break time based on average session length
  const avgSessionLength = entries.reduce((sum, entry) => sum + entry.totalHours, 0) / entries.length;
  this.insights.recommendedBreakTime = Math.min(Math.max(Math.round(avgSessionLength * 10), 5), 60);
};

// Static method to get user analytics
analyticsSchema.statics.getUserAnalytics = function(userId: string, period: string, startDate: Date, endDate: Date) {
  return this.find({
    userId,
    period,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
};

// Static method to get team analytics
analyticsSchema.statics.getTeamAnalytics = function(teamMemberIds: string[], period: string, startDate: Date, endDate: Date) {
  return this.aggregate([
    {
      $match: {
        userId: { $in: teamMemberIds.map(id => new mongoose.Types.ObjectId(id)) },
        period,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalVideos: { $sum: '$metrics.totalVideos' },
        totalHours: { $sum: '$metrics.totalHours' },
        averageProductivity: { $avg: '$metrics.averageProductivity' },
        averageTargetAchievement: { $avg: '$metrics.targetAchievement' },
        consistencyScore: { $avg: '$metrics.consistencyScore' }
      }
    }
  ]);
};

export default mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', analyticsSchema);
