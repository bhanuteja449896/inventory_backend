const express = require('express');
const { Product } = require('../models/product.model.js');

const productRouter = express.Router();

// Get all products from a specific inventory
productRouter.get('/inventory/:inventoryId', async (req, res) => {
  try {
    // Validate inventoryId
    if (!req.params.inventoryId) {
      return res.status(400).json({
        success: false,
        message: 'InventoryId is required',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }

    const products = await Product.find({ InventoryId: req.params.inventoryId });
    
    res.json({
      success: true,
      message: products.length > 0 ? 'Products retrieved successfully' : 'No products found in this inventory',
      count: products.length,
      data: products,
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message,
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    });
  }
});

// Get a single product by productId and InventoryId
productRouter.get('/product', async (req, res) => {
  try {
    // Validate required query parameters
    if (!req.query.InventoryId || !req.query.productId) {
      return res.status(400).json({
        success: false,
        message: 'Both InventoryId and productId are required',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }

    const product = await Product.findOne({ 
      InventoryId: req.query.InventoryId,
      productId: req.query.productId
    });
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found in the specified inventory',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }
    
    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: product,
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message,
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    });
  }
});

// Create a new product
productRouter.post('/', async (req, res) => {
  try {
    // Validate required fields (excluding productId as it's auto-generated)
    const requiredFields = ['InventoryId', 'name', 'description', 'original_price', 'price', 'stock', 'category', 'supplierId'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }

    // Validate numeric fields
    if (req.body.original_price < 0 || req.body.price < 0 || req.body.stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Original price, price, and stock must be non-negative numbers',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }

    // Create new product with only the fields we want
    const productData = {
      InventoryId: req.body.InventoryId,
      name: req.body.name,
      description: req.body.description,
      original_price: req.body.original_price,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
      supplierId: req.body.supplierId,
      imageUrl: req.body.imageUrl
    };

    const product = new Product(productData);
    const newProduct = await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct,
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ 
      success: false,
      message: error.message,
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    });
  }
});

// Update a product
productRouter.patch('/update', async (req, res) => {
  try {
    // Validate required fields for update
    if (!req.body.InventoryId || !req.body.productId) {
      return res.status(400).json({
        success: false,
        message: 'Both InventoryId and productId are required for update',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }

    // Find product by both InventoryId and productId
    const product = await Product.findOne({ 
      InventoryId: req.body.InventoryId,
      productId: req.body.productId
    });

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found in the specified inventory',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }

    // Validate numeric fields if they are being updated
    if (req.body.original_price !== undefined && req.body.original_price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Original price must be a non-negative number',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }
    if (req.body.price !== undefined && req.body.price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a non-negative number',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }
    if (req.body.stock !== undefined && req.body.stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a non-negative number',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }
    
    // Fields that can be updated
    const allowedUpdates = ['name', 'description', 'original_price', 'price', 'stock', 'category', 'supplierId', 'imageUrl'];
    
    // Update only the fields that are provided and allowed
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        product[key] = req.body[key];
      }
    });
    
    const updatedProduct = await product.save();
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message,
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    });
  }
});

// Delete a product
productRouter.delete('/delete', async (req, res) => {
  try {
    // Validate required fields for deletion
    if (!req.body.InventoryId || !req.body.productId) {
      return res.status(400).json({
        success: false,
        message: 'Both InventoryId and productId are required for deletion',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }

    // Find and delete product by both InventoryId and productId
    const product = await Product.findOne({ 
      InventoryId: req.body.InventoryId,
      productId: req.body.productId
    });

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found in the specified inventory',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }
    
    await product.deleteOne();
    res.json({ 
      success: true,
      message: 'Product deleted successfully',
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message,
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    });
  }
});

module.exports = productRouter; 