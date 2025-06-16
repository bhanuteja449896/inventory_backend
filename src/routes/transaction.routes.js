const express = require('express');
const { Transaction } = require('../models/transaction.model.js');
const { Product } = require('../models/product.model.js');

const transactionRouter = express.Router();

// Get all transactions for an inventory
transactionRouter.get('/inventory/:inventoryId', async (req, res) => {
  try {
    const transactions = await Transaction.find({ InventoryId: req.params.inventoryId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      message: transactions.length > 0 ? 'Transactions retrieved successfully' : 'No transactions found',
      count: transactions.length,
      data: transactions,
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

// Get a single transaction
transactionRouter.get('/:transactionId', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ transactionId: req.params.transactionId });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }
    
    res.json({
      success: true,
      message: 'Transaction retrieved successfully',
      data: transaction,
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

// Create a new transaction
transactionRouter.post('/', async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['InventoryId', 'productId', 'type', 'quantity', 'unitPrice'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }

    // Validate product exists
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

    // Validate stock for sales
    if (req.body.type === 'SALE' && product.stock < req.body.quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }

    // Calculate total amount
    const totalAmount = req.body.quantity * req.body.unitPrice;

    // Create transaction with calculated totalAmount
    const transactionData = {
      ...req.body,
      totalAmount: totalAmount
    };

    const transaction = new Transaction(transactionData);
    const newTransaction = await transaction.save();

    // Update product stock
    if (req.body.type === 'SALE') {
      product.stock -= req.body.quantity;
    } else if (req.body.type === 'PURCHASE') {
      product.stock += req.body.quantity;
    } else if (req.body.type === 'RETURN') {
      product.stock += req.body.quantity;
    }
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: newTransaction,
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

// Update transaction status
transactionRouter.patch('/:transactionId/status', async (req, res) => {
  try {
    if (!req.body.status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }

    const transaction = await Transaction.findOne({ transactionId: req.params.transactionId });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    }

    // Handle status changes
    if (req.body.status === 'CANCELLED' && transaction.status === 'COMPLETED') {
      // Reverse stock changes
      const product = await Product.findOne({
        InventoryId: transaction.InventoryId,
        productId: transaction.productId
      });

      if (product) {
        if (transaction.type === 'SALE') {
          product.stock += transaction.quantity;
        } else if (transaction.type === 'PURCHASE') {
          product.stock -= transaction.quantity;
        } else if (transaction.type === 'RETURN') {
          product.stock -= transaction.quantity;
        }
        await product.save();
      }
    }

    transaction.status = req.body.status;
    if (req.body.paymentStatus) {
      transaction.paymentStatus = req.body.paymentStatus;
    }
    
    const updatedTransaction = await transaction.save();
    
    res.json({
      success: true,
      message: 'Transaction status updated successfully',
      data: updatedTransaction,
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

// Get transaction statistics
transactionRouter.get('/stats/:inventoryId', async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      { $match: { InventoryId: req.params.inventoryId } },
      {
        $group: {
          _id: '$type',
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    res.json({
      success: true,
      message: 'Transaction statistics retrieved successfully',
      data: stats,
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

module.exports = transactionRouter; 