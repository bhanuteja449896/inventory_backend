const express = require('express');
const router = express.Router();
const User = require('../models/user.model');

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new user with plain text password
    const user = new User({
      email: email.toLowerCase(),
      password: password,
      inventoryId: `INV${Date.now()}` // Generate a unique inventory ID
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        email: user.email,
        inventoryId: user.inventoryId
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    // Log the entire request
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password:', { email, password });
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide both email and password' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('Found user:', user);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Since password is stored as plain text in your DB
    if (password !== user.password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Return success with inventoryId
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        inventoryId: user.inventoryId,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

module.exports = router; 