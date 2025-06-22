const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter configuration
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png/;
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb("Error: Allowed file types are jpeg, jpg and png only!");
  }
};

// Middleware to handle file uploads
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10 MB
  },
});

module.exports = upload;
