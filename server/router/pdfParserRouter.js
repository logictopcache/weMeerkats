const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdf = require("pdf-parse");
const jwt = require("jsonwebtoken"); // Add JWT for token verification
const geminiService = require("../services/geminiService");
const Mentor = require("../models/mentorSchema");
const Learner = require("../models/learnerSchema");

// Gemini service is initialized in the service file

// Middleware to authenticate and extract user info from bearer token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: "Access token is required",
    });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Try to find the user as a mentor first
    let user = await Mentor.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (user) {
      req.user = {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        profileType: "MENTOR",
        email: user.email,
      };
      req.mentor = user;
    } else {
      // Try to find the user as a learner
      user = await Learner.findOne({
        _id: decoded._id,
        "tokens.token": token,
      });

      if (user) {
        req.user = {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          profileType: "LEARNER",
          email: user.email,
        };
        req.learner = user;
      } else {
        return res.status(401).json({
          error: "User not found",
        });
      }
    }

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(403).json({
      error: "Invalid or expired token",
    });
  }
};

// Storage configuration for resume uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/resume";

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and user ID
    const uniqueName = `${req.user?.id || "unknown"}-${Date.now()}-${
      file.originalname
    }`;
    cb(null, uniqueName);
  },
});

// File filter configuration for PDF files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["application/pdf"];
  const fileTypes = /pdf/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Error: Only PDF files are allowed for resume upload!"));
  }
};

// Multer configuration for resume uploads
const uploadResume = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit for PDF files
  },
});

// Helper function to parse PDF and extract text
const parsePDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to parse PDF file");
  }
};

// Helper function to analyze resume with Gemini based on known profile type
const analyzeResumeWithGemini = async (resumeText, profileType) => {
  try {
    return await geminiService.analyzeResume(resumeText, profileType);
  } catch (error) {
    console.error("Error analyzing resume with Gemini:", error);
    throw error;
  }
};

// Helper function to validate extracted data structure
const validateExtractedData = (profileType, data) => {
  const errors = [];

  if (profileType === "MENTOR") {
    if (!data.fullName) errors.push("fullName is required for mentor");
    if (!Array.isArray(data.education))
      errors.push("education must be an array for mentor");
    if (!Array.isArray(data.skills))
      errors.push("skills must be an array for mentor");
  } else if (profileType === "LEARNER") {
    if (!data.fullName) errors.push("fullName is required for learner");
    if (!Array.isArray(data.education))
      errors.push("education must be an array for learner");
    if (!Array.isArray(data.skills))
      errors.push("skills must be an array for learner");
    if (data.workExperiences && !Array.isArray(data.workExperiences)) {
      errors.push("workExperiences must be an array for learner");
    }
    if (data.certification && !Array.isArray(data.certification)) {
      errors.push("certification must be an array for learner");
    }
    if (data.expertise && !Array.isArray(data.expertise)) {
      errors.push("expertise must be an array for learner");
    }
  }

  return errors;
};

// Route to handle resume upload with AI analysis (now requires authentication)
router.post(
  "/upload-resume",
  authenticateToken,
  uploadResume.single("resume"),
  async (req, res) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded. Please select a PDF file to upload.",
        });
      }

      // Get user info from token
      const { profileType, id: userId, name: userName } = req.user;

      // Validate profile type
      if (!profileType || !["MENTOR", "LEARNER"].includes(profileType)) {
        return res.status(400).json({
          error: "Invalid profile type in token. Must be MENTOR or LEARNER.",
        });
      }

      // Get the uploaded file path
      const filePath = req.file.path;
      const fileName = req.file.filename;
      const originalName = req.file.originalname;

      console.log("=== Resume Upload Details ===");
      console.log("User ID:", userId);
      console.log("User Name:", userName);
      console.log("Profile Type:", profileType);
      console.log("Original filename:", originalName);
      console.log("Saved filename:", fileName);
      console.log("File path:", filePath);
      console.log("File size:", req.file.size, "bytes");

      // Parse the PDF and extract text
      console.log("\n=== Parsing PDF Content ===");
      const resumeText = await parsePDF(filePath);

      console.log("Extracted Resume Text:");
      console.log("=".repeat(50));
      console.log(resumeText);
      console.log("=".repeat(50));

      // Analyze resume with Gemini using known profile type
      console.log(`\n=== Analyzing Resume with Gemini for ${profileType} ===`);
      const extractedData = await analyzeResumeWithGemini(
        resumeText,
        profileType
      );

      console.log("AI Extraction Result:");
      console.log("Extracted Data:", JSON.stringify(extractedData, null, 2));

      // Validate the extracted data structure
      const validationErrors = validateExtractedData(
        profileType,
        extractedData
      );

      if (validationErrors.length > 0) {
        console.warn("Validation warnings:", validationErrors);
      }

      // Send success response with AI analysis
      res.status(200).json({
        message: "Resume uploaded, parsed, and analyzed successfully",
        user: {
          id: userId,
          name: userName,
          profileType: profileType,
        },
        file: {
          originalName: originalName,
          fileName: fileName,
          filePath: filePath,
          size: req.file.size,
        },
        analysis: {
          profileType: profileType,
          extractedData: extractedData,
          validationErrors:
            validationErrors.length > 0 ? validationErrors : null,
        },
        rawText: resumeText, // Optional: include raw text
      });
    } catch (error) {
      console.error("Resume processing error:", error);

      // Clean up uploaded file if processing failed
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
          console.log("Cleaned up failed upload file");
        } catch (cleanupError) {
          console.error("Error cleaning up file:", cleanupError);
        }
      }

      res.status(500).json({
        error: "Error processing resume",
        details: error.message,
      });
    }
  }
);

// Route to re-analyze a specific resume by filename (requires authentication)
router.get("/analyze-resume/:filename", authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const { profileType, id: userId } = req.user;

    // Check if the filename belongs to the authenticated user
    if (!filename.startsWith(`${userId}-`)) {
      return res.status(403).json({
        error: "You can only analyze your own resume files",
      });
    }

    const filePath = path.join("uploads/resume", filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: "Resume file not found",
      });
    }

    // Parse the PDF
    const resumeText = await parsePDF(filePath);

    // Analyze with Gemini using known profile type
    const extractedData = await analyzeResumeWithGemini(
      resumeText,
      profileType
    );

    console.log(
      `\n=== Re-analyzing Resume: ${filename} for ${profileType} ===`
    );
    console.log("Extracted Data:", JSON.stringify(extractedData, null, 2));

    // Validate the extracted data
    const validationErrors = validateExtractedData(profileType, extractedData);

    res.status(200).json({
      message: "Resume analyzed successfully",
      filename: filename,
      analysis: {
        profileType: profileType,
        extractedData: extractedData,
        validationErrors: validationErrors.length > 0 ? validationErrors : null,
      },
    });
  } catch (error) {
    console.error("Error analyzing resume:", error);
    res.status(500).json({
      error: "Error analyzing resume",
      details: error.message,
    });
  }
});

// Route to get list of uploaded resumes for authenticated user
router.get("/resumes", authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const resumeDir = "uploads/resume";

    if (!fs.existsSync(resumeDir)) {
      return res.status(200).json({
        message: "No resumes found",
        resumes: [],
      });
    }

    const files = fs.readdirSync(resumeDir);
    const userResumeFiles = files
      .filter(
        (file) =>
          file.startsWith(`${userId}-`) &&
          path.extname(file).toLowerCase() === ".pdf"
      )
      .map((file) => {
        const filePath = path.join(resumeDir, file);
        const stats = fs.statSync(filePath);

        return {
          filename: file,
          path: filePath,
          size: stats.size,
          uploadedAt: stats.birthtime,
        };
      });

    res.status(200).json({
      message: "Resumes retrieved successfully",
      count: userResumeFiles.length,
      resumes: userResumeFiles,
    });
  } catch (error) {
    console.error("Error fetching resumes:", error);
    res.status(500).json({
      error: "Error fetching resumes",
      details: error.message,
    });
  }
});

// Route to delete a resume (requires authentication and ownership)
router.delete("/resume/:filename", authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const { id: userId } = req.user;

    // Check if the filename belongs to the authenticated user
    if (!filename.startsWith(`${userId}-`)) {
      return res.status(403).json({
        error: "You can only delete your own resume files",
      });
    }

    const filePath = path.join("uploads/resume", filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: "Resume file not found",
      });
    }

    // Delete the file
    fs.unlinkSync(filePath);

    console.log(`Resume deleted: ${filename} by user: ${userId}`);

    res.status(200).json({
      message: "Resume deleted successfully",
      filename: filename,
    });
  } catch (error) {
    console.error("Error deleting resume:", error);
    res.status(500).json({
      error: "Error deleting resume",
      details: error.message,
    });
  }
});

// Route to get profile suggestions based on analysis (requires authentication)
router.post("/profile-suggestions", authenticateToken, async (req, res) => {
  try {
    const { extractedData } = req.body;
    const { profileType } = req.user;

    if (!extractedData) {
      return res.status(400).json({
        error: "Extracted data is required",
      });
    }

    // Create profile suggestions based on the user's profile type
    let suggestions = {};

    if (profileType === "MENTOR") {
      suggestions = {
        profileType: "MENTOR",
        suggestions: {
          fullName: extractedData.fullName || "",
          education: extractedData.education || [],
          skills: extractedData.skills || [],
          experience: extractedData.experience || [],
          certifications: extractedData.certifications || [],
          bio:
            extractedData.bio ||
            `Experienced professional with expertise in ${
              extractedData.skills?.slice(0, 3).join(", ") ||
              "various technologies"
            }`,
          designation: extractedData.designation || "Senior Professional",
        },
      };
    } else if (profileType === "LEARNER") {
      suggestions = {
        profileType: "LEARNER",
        suggestions: {
          fullName: extractedData.fullName || "",
          email: extractedData.email || "",
          phone: extractedData.phone || "",
          education: extractedData.education || [],
          workExperiences: extractedData.workExperiences || [],
          certification: extractedData.certification || [],
          expertise: extractedData.expertise || [],
          skills: extractedData.skills || [],
          projects: extractedData.projects || [],
        },
      };
    }

    res.status(200).json({
      message: "Profile suggestions generated successfully",
      suggestions: suggestions,
    });
  } catch (error) {
    console.error("Error generating profile suggestions:", error);
    res.status(500).json({
      error: "Error generating profile suggestions",
      details: error.message,
    });
  }
});

module.exports = router;
