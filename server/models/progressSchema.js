const mongoose = require('mongoose');
const { Schema } = mongoose;

const skillAssignmentSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  skillName: {
    type: String,
    required: true
  },
  weightage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Mentor',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const progressSchema = new Schema({
  learnerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Learner', 
    required: true 
  },
  skillProgress: [{
    skillName: String,
    completedAssignments: [{
      type: Schema.Types.ObjectId,
      ref: 'SkillAssignment'
    }],
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update lastUpdated timestamp
progressSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Calculate progress for a single skill
progressSchema.methods.calculateSkillProgress = async function(skillName) {
  const skill = this.skillProgress.find(s => s.skillName === skillName);
  if (!skill) return 0;

  const allAssignments = await SkillAssignment.find({ skillName });
  if (allAssignments.length === 0) return 0;

  const completedAssignments = await SkillAssignment.find({
    _id: { $in: skill.completedAssignments }
  });

  const totalWeightage = allAssignments.reduce((sum, assignment) => sum + assignment.weightage, 0);
  const completedWeightage = completedAssignments.reduce((sum, assignment) => sum + assignment.weightage, 0);

  console.log(`Calculating progress for ${skillName}:`, {
    totalAssignments: allAssignments.length,
    completedAssignments: completedAssignments.length,
    totalWeightage,
    completedWeightage
  });

  return Math.round((completedWeightage / totalWeightage) * 100);
};

// Pre-save middleware to update progress for modified skills
progressSchema.pre('save', async function(next) {
  try {
    const modifiedPaths = this.modifiedPaths();
    console.log('Modified paths:', modifiedPaths);
    
    const updatePromises = this.skillProgress.map(async (skillProgress, index) => {
      const skillPath = `skillProgress.${index}.completedAssignments`;
      if (modifiedPaths.includes(skillPath)) {
        console.log(`Updating progress for skill: ${skillProgress.skillName}`);
        const newProgress = await this.calculateSkillProgress(skillProgress.skillName);
        skillProgress.progress = newProgress;
        skillProgress.lastUpdated = new Date();
        console.log(`New progress for ${skillProgress.skillName}: ${newProgress}%`);
      }
    });

    await Promise.all(updatePromises);
    next();
  } catch (error) {
    next(error);
  }
});

const Progress = mongoose.model('Progress', progressSchema);
const SkillAssignment = mongoose.model('SkillAssignment', skillAssignmentSchema);

module.exports = { Progress, SkillAssignment }; 