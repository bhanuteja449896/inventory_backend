const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['Product Added', 'Product Updated', 'Product Deleted', 'Low Stock Alert', 'Sale Recorded', 'Supplier Updated']
  },
  item: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['success', 'warning', 'info']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = { Activity }; 