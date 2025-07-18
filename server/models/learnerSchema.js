const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const learnerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    unique: true,
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  rejected: {
    type: Boolean,
    default: false,
  },
  rejectionReason: String,
  approvedAt: Date,
  rejectedAt: Date,
  approvedBy: String,
  rejectedBy: String,
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

learnerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

learnerSchema.methods.generateAuthenticationToken = async function () {
  try {
    const token = jwt.sign(
      { _id: this._id.toString() },
      process.env.SECRET_KEY
    );
    this.tokens = this.tokens.concat({ token });
    await this.save();
    return token;
  } catch (error) {
    console.error(error);
    throw new Error("Token generation failed");
  }
};

const Learner = mongoose.model("Learner", learnerSchema);
module.exports = Learner;
