const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const adminRouter = express.Router();

// Admin credentials (in production, this should be in database)
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || "admin@wemeerkats.com",
  password: process.env.ADMIN_PASSWORD || "admin123", // This will be hashed
};

// Hash the admin password on startup
let hashedAdminPassword;
bcrypt.hash(ADMIN_CREDENTIALS.password, 12).then((hash) => {
  hashedAdminPassword = hash;
});

// Admin authentication middleware
const adminAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (decoded.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Access denied. Admin privileges required." });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token." });
  }
};

// Admin login
adminRouter.post(
  "/admin/login",
  [
    body("email", "Please provide a valid email address").isEmail(),
    body("password", "Password is required").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    try {
      // Check if email matches admin email
      if (email !== ADMIN_CREDENTIALS.email) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(
        password,
        hashedAdminPassword
      );
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          email: email,
          role: "admin",
          id: "admin",
        },
        process.env.SECRET_KEY,
        { expiresIn: "24h" }
      );

      res.json({
        message: "Admin login successful",
        token,
        admin: {
          email: email,
          role: "admin",
        },
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Verify admin token
adminRouter.get("/admin/verify", adminAuthMiddleware, (req, res) => {
  res.json({
    message: "Admin verified",
    admin: req.admin,
  });
});

module.exports = { adminRouter, adminAuthMiddleware };
