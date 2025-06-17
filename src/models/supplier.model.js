const mongoose = require('mongoose');

// Function to convert UTC to IST
const convertToIST = (date) => {
  if (!date) return date;
  return new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
};

const supplierSchema = new mongoose.Schema({
  inventoryId: {
    type: String,
    required: true
  },
  supplierId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 1000);
      return `SUP${timestamp}${randomNum}`;
    }
  },
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: () => convertToIST(new Date())
  },
  updatedAt: {
    type: Date,
    default: () => convertToIST(new Date())
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
supplierSchema.pre('save', function(next) {
  this.updatedAt = convertToIST(new Date());
  next();
});

// Convert timestamps to IST when converting to JSON
supplierSchema.set('toJSON', {
  transform: function(doc, ret) {
    if (ret.createdAt) ret.createdAt = convertToIST(ret.createdAt);
    if (ret.updatedAt) ret.updatedAt = convertToIST(ret.updatedAt);
    return ret;
  }
});

const Supplier = mongoose.model('Supplier', supplierSchema);

// Drop any existing indexes except supplierId
Supplier.collection.dropIndexes().catch(err => {
  if (err.code !== 26) { // Ignore if no indexes exist
    console.error('Error dropping indexes:', err);
  }
});

// Create indexes for unique fields
Supplier.collection.createIndex({ supplierId: 1 }, { unique: true });
Supplier.collection.createIndex({ email: 1 }, { unique: true });
Supplier.collection.createIndex({ name: 1 }, { unique: true });

module.exports = { Supplier }; 