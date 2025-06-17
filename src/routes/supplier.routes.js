const express = require('express');
const { Supplier } = require('../models/supplier.model.js');
const { Product } = require('../models/product.model.js');

const supplierRouter = express.Router();

// Create a new supplier
supplierRouter.post('/', async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['inventoryId', 'name', 'email', 'phone'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }

    // Check if email already exists
    const existingEmail = await Supplier.findOne({ email: req.body.email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }

    // Check if name already exists
    const existingName = await Supplier.findOne({ name: req.body.name });
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: 'Supplier name already exists',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }

    // Create new supplier
    const supplierData = {
      inventoryId: req.body.inventoryId,
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      phone: req.body.phone,
      address: req.body.address,
      status: req.body.status || 'active'
    };

    const supplier = new Supplier(supplierData);
    const newSupplier = await supplier.save();
    
    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: newSupplier,
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(400).json({ 
      success: false,
      message: error.message,
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    });
  }
});

// Get all suppliers for an inventory
supplierRouter.get('/inventory/:inventoryId', async (req, res) => {
  try {
    // Validate inventoryId
    if (!req.params.inventoryId) {
      return res.status(400).json({
        success: false,
        message: 'inventoryId is required',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }

    const suppliers = await Supplier.find({ inventoryId: req.params.inventoryId });
    
    res.json({
      success: true,
      message: suppliers.length > 0 ? 'Suppliers retrieved successfully' : 'No suppliers found',
      count: suppliers.length,
      data: suppliers,
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

// Get products by supplierId
supplierRouter.get('/products/:supplierId', async (req, res) => {
  try {
    // Validate supplierId
    if (!req.params.supplierId) {
      return res.status(400).json({
        success: false,
        message: 'SupplierId is required',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }

    // Find supplier first to verify it exists
    const supplier = await Supplier.findOne({ supplierId: req.params.supplierId });
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }

    // Find all products for this supplier
    const products = await Product.find({ supplierId: req.params.supplierId });
    
    res.json({
      success: true,
      message: products.length > 0 ? 'Products retrieved successfully' : 'No products found for this supplier',
      supplier: {
        supplierId: supplier.supplierId,
        name: supplier.name,
        email: supplier.email
      },
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

// Update supplier details
supplierRouter.patch('/update', async (req, res) => {
  try {
    // Validate required fields for update
    if (!req.body.inventoryId || !req.body.supplierId) {
      return res.status(400).json({
        success: false,
        message: 'Both inventoryId and supplierId are required for update',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }

    // Find supplier by both inventoryId and supplierId
    const supplier = await Supplier.findOne({ 
      inventoryId: req.body.inventoryId,
      supplierId: req.body.supplierId
    });

    if (!supplier) {
      return res.status(404).json({ 
        success: false,
        message: 'Supplier not found in the specified inventory',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }

    // If email is being updated, check if it already exists
    if (req.body.email && req.body.email !== supplier.email) {
      const existingEmail = await Supplier.findOne({ 
        email: req.body.email.toLowerCase(),
        supplierId: { $ne: req.body.supplierId }
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
          timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
        });
      }
    }

    // If name is being updated, check if it already exists
    if (req.body.name && req.body.name !== supplier.name) {
      const existingName = await Supplier.findOne({ 
        name: req.body.name,
        supplierId: { $ne: req.body.supplierId }
      });
      if (existingName) {
        return res.status(400).json({
          success: false,
          message: 'Supplier name already exists',
          timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
        });
      }
    }
    
    // Fields that can be updated
    const allowedUpdates = ['name', 'email', 'phone', 'address', 'status'];
    
    // Update only the fields that are provided and allowed
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'email') {
          supplier[key] = req.body[key].toLowerCase();
        } else {
          supplier[key] = req.body[key];
        }
      }
    });
    
    const updatedSupplier = await supplier.save();
    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: updatedSupplier,
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

module.exports = supplierRouter; 