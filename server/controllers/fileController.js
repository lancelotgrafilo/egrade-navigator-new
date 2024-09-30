// controllers/fileController.js
const fs = require('fs');
const path = require('path');

// Utility function to get file names from a directory
const getFilesFromDirectory = (dirPath) => {
  return fs.readdirSync(dirPath).map(file => ({
    name: file,
    url: `/uploads/${path.basename(dirPath)}/${file}`
  }));
};

// Get grade sheets and removal/completion forms
exports.getFiles = (req, res) => {
  const gradeSheetsDir = path.join(__dirname, '../uploads/grade-sheets');
  const removalFormsDir = path.join(__dirname, '../uploads/removal-completion-form');

  try {
    const gradeSheets = getFilesFromDirectory(gradeSheetsDir);
    const removalForms = getFilesFromDirectory(removalFormsDir);

    res.json({
      gradeSheets,
      removalForms
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};
