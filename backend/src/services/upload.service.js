const cloudinary = require('cloudinary').v2;
const { ApiError } = require('../utils/apiResponse');
const { logger } = require('../middleware/logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class UploadService {
  async uploadImage(file, folder = 'products') {
    try {
      if (!file) throw new ApiError('No file provided', 400);

      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: 'auto',
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      logger.error('Image upload failed:', error);
      throw new ApiError('Image upload failed', 500);
    }
  }

  async uploadMultipleImages(files, folder = 'products') {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, folder));
      return await Promise.all(uploadPromises);
    } catch (error) {
      logger.error('Multiple image upload failed:', error);
      throw new ApiError('Multiple image upload failed', 500);
    }
  }

  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      logger.error('Image deletion failed:', error);
      throw new ApiError('Image deletion failed', 500);
    }
  }

  async deleteMultipleImages(publicIds) {
    try {
      const deletePromises = publicIds.map(publicId => this.deleteImage(publicId));
      return await Promise.all(deletePromises);
    } catch (error) {
      logger.error('Multiple image deletion failed:', error);
      throw new ApiError('Multiple image deletion failed', 500);
    }
  }

  async updateImage(oldPublicId, newFile, folder = 'products') {
    try {
      // Delete old image
      if (oldPublicId) {
        await this.deleteImage(oldPublicId);
      }

      // Upload new image
      return await this.uploadImage(newFile, folder);
    } catch (error) {
      logger.error('Image update failed:', error);
      throw new ApiError('Image update failed', 500);
    }
  }

  getImageUrl(publicId, options = {}) {
    try {
      return cloudinary.url(publicId, {
        secure: true,
        ...options,
      });
    } catch (error) {
      logger.error('Get image URL failed:', error);
      throw new ApiError('Get image URL failed', 500);
    }
  }
}

module.exports = new UploadService(); 