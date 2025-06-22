const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema({
  startTime: {
    type: String,
    enum: [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:00",
    ],
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  skills: [{
    type: String,
    required: true
  }],
  duration: {
    type: Number,
    default: 60,  // Duration in minutes
    required: true
  }
});

const availabilitySchema = new mongoose.Schema({
  monday: [timeSlotSchema],
  tuesday: [timeSlotSchema],
  wednesday: [timeSlotSchema],
  thursday: [timeSlotSchema],
  friday: [timeSlotSchema],
  saturday: [timeSlotSchema],
  sunday: [timeSlotSchema],
});

const mentorProfileSchema = new mongoose.Schema({
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  fullName: {
    type: String,
    required: [true, "Full name is required"],
  },
  email: String,
  phone: String,
  bio: String,
  profilePictureUrl: String,
  education: [
    {
      degree: String,
      universityName: String,
      location: String,
      duration: String,
      description: String,
    },
  ],
  designation: String,
  workExperiences: [
    {
      title: String,
      companyName: String,
      location: String,
      duration: String,
      description: String,
    },
  ],
  certification: String,
  expertise: String,
  skills: [String],
  availability: {
    type: availabilitySchema,
    required: true,
    default: () => ({}),
  },
  isVerified: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("MentorProfile", mentorProfileSchema);
