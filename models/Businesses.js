const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    required: true,
    trim: true
  },
  occupation: {
    type: String,
    required: true,
    trim: true
  },
  stands_for: {
    type: String,
    required: true,
    trim: true
  },
  communication_tone: {
    type: String,
    required: true,
    trim: true
  },
  main_competitors: {
    type: String,
    required: true,
    trim: true
  },
  strengths: {
    type: String,
    required: true,
    trim: true
  },
  weaknesses: {
    type: String,
    required: true,
    trim: true
  },
  typical_growth: {
    type: String,
    required: true,
    trim: true
  },
  teamsize_and_structure: {
    type: String,
    required: true,
    trim: true
  },
  company_culture: {
    type: String,
    required: true,
    trim: true
  },
  main_bussiness_goals: {
    type: String,
    required: true,
    trim: true
  },

  gpt_business_summary: {
    type: String,
    required: true,
    trim: true
  },




  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

const Business = mongoose.model('Business', businessSchema);

module.exports = Business;
