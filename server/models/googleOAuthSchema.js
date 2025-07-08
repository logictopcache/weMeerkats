const mongoose = require("mongoose");

const googleOAuthSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    userType: {
      type: String,
      enum: ["Mentor", "Learner"],
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    tokenType: {
      type: String,
      default: "Bearer",
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    scope: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookups
googleOAuthSchema.index({ userId: 1, userType: 1 });
googleOAuthSchema.index({ expiryDate: 1 });

// Method to check if token is expired
googleOAuthSchema.methods.isTokenExpired = function () {
  return new Date() >= this.expiryDate;
};

// Method to refresh token if needed
googleOAuthSchema.methods.shouldRefresh = function () {
  // Refresh if token expires in next 5 minutes
  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
  return fiveMinutesFromNow >= this.expiryDate;
};

const GoogleOAuth = mongoose.model("GoogleOAuth", googleOAuthSchema);
module.exports = GoogleOAuth;
