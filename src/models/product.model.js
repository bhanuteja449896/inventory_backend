const mongoose = require('mongoose');

// Function to convert UTC to IST
const convertToIST = (date) => {
  if (!date) return date;
  return new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
};

const productSchema = new mongoose.Schema({
  inventoryId: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 1000);
      const categoryPrefix = this.category ? this.category.substring(0, 3).toUpperCase() : 'PRD';
      return `PRD${categoryPrefix}${timestamp}${randomNum}`;
    }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  original_price: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  supplierId: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: () => convertToIST(new Date())
  },
  updatedAt: {
    type: Date,
    default: () => convertToIST(new Date())
  }
});

// Update the updatedAt timestamp before saving
productSchema.pre('save', function(next) {
  this.updatedAt = convertToIST(new Date());
  next();
});

// Convert timestamps to IST when converting to JSON
productSchema.set('toJSON', {
  transform: function(doc, ret) {
    if (ret.createdAt) ret.createdAt = convertToIST(ret.createdAt);
    if (ret.updatedAt) ret.updatedAt = convertToIST(ret.updatedAt);
    return ret;
  }
});

const Product = mongoose.model('Product', productSchema);

// Drop any existing indexes except productId
Product.collection.dropIndexes().catch(err => {
  if (err.code !== 26) { // Ignore if no indexes exist
    console.error('Error dropping indexes:', err);
  }
});

// Create only the productId index
Product.collection.createIndex({ productId: 1 }, { unique: true });

module.exports = { Product }; 