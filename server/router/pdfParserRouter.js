const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdf = require("pdf-parse");

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
    // Generate unique filename with timestamp
    const uniqueName = `${Date.now()}-${file.originalname}`;
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
    fileSize: 1024 * 1024 * 5, // 5 MB limit for PDF files
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

// Route to handle resume upload
router.post(
  "/upload-resume",
  uploadResume.single("resume"),
  async (req, res) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded. Please select a PDF file to upload.",
        });
      }

      // Get the uploaded file path
      const filePath = req.file.path;
      const fileName = req.file.filename;
      const originalName = req.file.originalname;

      console.log("=== Resume Upload Details ===");
      console.log("Original filename:", originalName);
      console.log("Saved filename:", fileName);
      console.log("File path:", filePath);
      console.log("File size:", req.file.size, "bytes");

      // Parse the PDF and extract text
      console.log("\n=== Parsing PDF Content ===");
      const resumeText = await parsePDF(filePath);

      // Display extracted text on console
      console.log("Extracted Resume Text:");
      console.log("=".repeat(50));
      console.log(resumeText);
      console.log("=".repeat(50));

      // You can also save the extracted text to database or perform further processing here
      // Example: Save to database, analyze skills, extract contact info, etc.

      // Send success response
      res.status(200).json({
        message: "Resume uploaded and parsed successfully",
        file: {
          originalName: originalName,
          fileName: fileName,
          filePath: filePath,
          size: req.file.size,
        },
        extractedText: resumeText, // Optional: include in response
      });
    } catch (error) {
      console.error("Resume upload error:", error);

      // Clean up uploaded file if parsing failed
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

// Route to get list of uploaded resumes
router.get("/resumes", async (req, res) => {
  try {
    const resumeDir = "uploads/resume";

    if (!fs.existsSync(resumeDir)) {
      return res.status(200).json({
        message: "No resumes found",
        resumes: [],
      });
    }

    const files = fs.readdirSync(resumeDir);
    const resumeFiles = files
      .filter((file) => path.extname(file).toLowerCase() === ".pdf")
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
      count: resumeFiles.length,
      resumes: resumeFiles,
    });
  } catch (error) {
    console.error("Error fetching resumes:", error);
    res.status(500).json({
      error: "Error fetching resumes",
      details: error.message,
    });
  }
});

// Route to re-parse a specific resume by filename
router.get("/parse-resume/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join("uploads/resume", filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: "Resume file not found",
      });
    }

    // Parse the PDF
    const resumeText = await parsePDF(filePath);

    console.log(`\n=== Re-parsing Resume: ${filename} ===`);
    console.log("Extracted Text:");
    console.log("=".repeat(50));
    console.log(resumeText);
    console.log("=".repeat(50));

    res.status(200).json({
      message: "Resume parsed successfully",
      filename: filename,
      extractedText: resumeText,
    });
  } catch (error) {
    console.error("Error parsing resume:", error);
    res.status(500).json({
      error: "Error parsing resume",
      details: error.message,
    });
  }
});

// Route to delete a resume
router.delete("/resume/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join("uploads/resume", filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: "Resume file not found",
      });
    }

    // Delete the file
    fs.unlinkSync(filePath);

    console.log(`Resume deleted: ${filename}`);

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

module.exports = router;
