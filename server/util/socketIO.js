const jwt = require("jsonwebtoken");
const Mentor = require("../models/mentorSchema");
const Learner = require("../models/learnerSchema");

const authMiddleware = async (token) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    let user = await Mentor.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      user = await Learner.findOne({
        _id: decoded._id,
        "tokens.token": token,
      });
    }

    if (!user) {
      throw new Error("No token provided");
    }

    return user;
  } catch (error) {
    throw new Error("Authentication failed");
  }
};

module.exports = authMiddleware;
