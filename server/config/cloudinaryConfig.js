// Cloudinary Configuration for Production File Uploads
// This file replaces the local multer storage with Cloudinary cloud storage

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage engine for profile pictures
const profilePictureStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "vachchat/profile-pictures",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      { width: 500, height: 500, crop: "limit" },
      { quality: "auto" },
    ],
  },
});

// Create storage engine for message attachments (images)
const messageImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "vachchat/message-images",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      { width: 1200, height: 1200, crop: "limit" },
      { quality: "auto" },
    ],
  },
});

// Create storage engine for message files
const messageFileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "vachchat/message-files",
    resource_type: "raw", // For non-image files (PDFs, documents, etc.)
  },
});

// Multer upload instances
const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const uploadMessageImage = multer({
  storage: messageImageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

const uploadMessageFile = multer({
  storage: messageFileStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
});

module.exports = {
  cloudinary,
  uploadProfilePicture,
  uploadMessageImage,
  uploadMessageFile,
};

// USAGE EXAMPLE:
//
// In authController.js:
// const { uploadProfilePicture } = require('../config/cloudinaryConfig');
//
// In routes/authRoutes.js:
// router.put("/update-profile-picture", protectRoute, uploadProfilePicture.single('profilePicture'), updateProfilePicture);
//
// In controller, access file URL with:
// const profilePicUrl = req.file.path; // Cloudinary URL
//
// No need to prepend localhost or handle local file paths!
