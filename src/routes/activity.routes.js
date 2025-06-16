const express = require('express');
const { Activity } = require('../models/activity.model.js');

const router = express.Router();

// Get all activities
router.get('/', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ timestamp: -1 }).limit(10);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new activity
router.post('/', async (req, res) => {
  const activity = new Activity({
    action: req.body.action,
    item: req.body.item,
    type: req.body.type
  });

  try {
    const newActivity = await activity.save();
    res.status(201).json(newActivity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 