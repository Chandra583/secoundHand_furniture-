import fs from 'fs';
import Product from '../models/Product.js';

export const uploadProductImage = async (productId, file) => {
  try {
    // Read file as Buffer
    const imageBuffer = fs.readFileSync(file.path);
    
    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Add image to product
    product.images.push({
      name: file.originalname,
      data: imageBuffer,
      contentType: file.mimetype
    });

    // Save the updated product
    await product.save();
    
    // Clean up temporary file
    fs.unlinkSync(file.path);
    
    return product;
  } catch (error) {
    throw new Error("Image upload failed: " + error.message);
  }
};

export const getProductImages = async (productId) => {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    return product.images;
  } catch (error) {
    throw new Error("Image fetch failed: " + error.message);
  }
};
