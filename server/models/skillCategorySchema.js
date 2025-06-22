const mongoose = require('mongoose');
const { Schema } = mongoose;

const skillCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  skills: [{
    name: {
      type: String,
      required: true
    },
    baseProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    description: String,
    prerequisites: [String]
  }]
});

// Ensure skill names within a category are unique
skillCategorySchema.pre('save', function(next) {
  const skillNames = this.skills.map(skill => skill.name);
  const uniqueSkillNames = new Set(skillNames);
  
  if (skillNames.length !== uniqueSkillNames.size) {
    next(new Error('Duplicate skill names are not allowed within a category'));
  } else {
    next();
  }
});

const SkillCategory = mongoose.model('SkillCategory', skillCategorySchema);
module.exports = SkillCategory; 