const mongoose = require("mongoose");

const learnerProfileSchema = new mongoose.Schema({
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  fullName: {
    type: String,
    required: [true, "Full name is required"],
  },
  profilePictureUrl: {
    type: String,
    default: null,
  },
  education: [
    {
      degree: String,
      universityName: String,
      location: String,
      duration: String,
      description: String,
    },
  ],
  bio: String,
  skills: [String],
});

module.exports = mongoose.model("LearnerProfile", learnerProfileSchema);
