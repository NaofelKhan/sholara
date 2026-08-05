const mongoose = require('mongoose');

const skillRequestSchema = new mongoose.Schema(
  {
    skillTitle: {
      type: String,
      required: [true, 'Skill title is required'],
      trim: true,
      maxlength: [200, 'Skill title cannot exceed 200 characters'],
    },
    learningObjectives: {
      type: String,
      required: [true, 'Learning objectives are required'],
      trim: true,
    },
    skillCategory: {
      type: String,
      required: [true, 'Skill category is required'],
      enum: [
        'Programming',
        'Design',
        'Mathematics',
        'Science',
        'Language',
        'Music',
        'Business',
        'Other',
      ],
    },
    difficultyLevel: {
      type: String,
      required: [true, 'Difficulty level is required'],
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    availability: {
      type: [String],
      enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      default: [],
    },
    scheduleNotes: {
      type: String,
      trim: true,
    },
    estimatedBudget: {
      type: Number,
      min: [0, 'Budget cannot be negative'],
    },
    frequency: {
      type: String,
      enum: ['Per Hour', 'Per Session', 'Per Week', 'Per Month', 'Fixed'],
      default: 'Per Hour',
    },
    estimatedDuration: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'posted', 'matched', 'completed', 'cancelled'],
      default: 'draft',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SkillRequest', skillRequestSchema);