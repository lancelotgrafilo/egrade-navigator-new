const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');

const writeFileAsync = promisify(fs.writeFile);

// Use memoryStorage to access file buffer
const memoryStorage = multer.memoryStorage();

const removalCompleteStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/removal-completion-form'); // Temporary storage for uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Original extension
  }
});

const uploadRemovalCompletionStorage = multer({
  storage: removalCompleteStorage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
});

const userProfilesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/user-profiles'); // Specify the directory for storing images
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Save with unique name
  }
});

// Set up memory storage for multer
const upload = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit (adjust as needed)
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

const uploadCSV = multer({
  storage: memoryStorage, // Assumes memory storage is correctly defined
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit (adjust as needed)
  fileFilter: (req, file, cb) => {
    // Allow only CSV files
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel']; // MIME types for CSV files
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // Accept file
    } else {
      // Reject file with a clear error message
      cb(new Error('Invalid file type. Only CSV files are allowed!'), false);
    }
  },
});





const uploadUserProfiles = multer({
  storage: userProfilesStorage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
});

module.exports = { 
  upload, 
  uploadCSV,
  uploadRemovalCompletionStorage,
  uploadUserProfiles
};
