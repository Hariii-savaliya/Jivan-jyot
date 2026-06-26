const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

const uploadToCloudinary = async (localFilePath, folderName = 'aashram') => {
  if (!localFilePath) return '';

  const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;

  if (!isCloudinaryConfigured) {
    // Serving locally. Return the absolute server URL
    const fileName = path.basename(localFilePath);
    return `${serverUrl}/uploads/${fileName}`;
  }

  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: folderName
    });
    // Clean up local temp file after upload to Cloudinary
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload failed, falling back to local storage:', error);
    const fileName = path.basename(localFilePath);
    return `${serverUrl}/uploads/${fileName}`;
  }
};

module.exports = { uploadToCloudinary };
