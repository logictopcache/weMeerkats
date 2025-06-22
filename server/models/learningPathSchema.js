const mongoose = require('mongoose');
const { Schema } = mongoose;

const learningPathSchema = new Schema({
  learnerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Learner', 
    required: true 
  },
  selectedCategory: {
    type: String,
    required: true
  },
  selectedSkills: [{
    name: {
      type: String,
      required: true
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    targetDate: Date
  }],
  completedProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Update lastUpdated timestamp and calculate completedProgress
learningPathSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  
  if (this.selectedSkills.length > 0) {
    const totalProgress = this.selectedSkills.reduce((sum, skill) => sum + skill.progress, 0);
    this.completedProgress = Math.round(totalProgress / this.selectedSkills.length);
  } else {
    this.completedProgress = 0;
  }
  
  next();
});

// Validate that all skills exist in the selected category
learningPathSchema.pre('save', async function(next) {
  try {
    const SkillCategory = mongoose.model('SkillCategory');
    const category = await SkillCategory.findOne({ name: this.selectedCategory });
    
    if (!category) {
      return next(new Error('Selected category does not exist'));
    }
    
    const categorySkills = category.skills.map(skill => skill.name);
    const invalidSkills = this.selectedSkills.filter(skill => !categorySkills.includes(skill.name));
    
    if (invalidSkills.length > 0) {
      return next(new Error(`Invalid skills for category ${this.selectedCategory}: ${invalidSkills.map(s => s.name).join(', ')}`));
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

const LearningPath = mongoose.model('LearningPath', learningPathSchema);
module.exports = LearningPath; 