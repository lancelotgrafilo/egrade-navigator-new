// utils.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Promisify unlink for use with async/await
const unlinkAsync = promisify(fs.unlink);

const convertToPng = async (filePath, outputFilePath) => {
  await sharp(filePath)
    .toFormat('png')
    .toFile(outputFilePath);
};

module.exports = { convertToPng, unlinkAsync };
