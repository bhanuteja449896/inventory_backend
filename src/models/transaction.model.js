const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      // Generate transaction ID: TRN + timestamp + random number
      return `TRN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }
  },
  InventoryId: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['SALE', 'PURCHASE', 'RETURN', 'ADJUSTMENT', 'TRANSFER'],
    default: 'SALE'
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED'],
    default: 'PENDING'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CREDIT'],
    default: 'CASH'
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['PENDING', 'PAID', 'PARTIALLY_PAID', 'REFUNDED'],
    default: 'PENDING'
  },
  customerDetails: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  notes: String,
  referenceNumber: String, // For external reference (e.g., invoice number, receipt number)
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save hook to calculate total amount
transactionSchema.pre('save', function(next) {
  this.totalAmount = this.quantity * this.unitPrice;
  this.updatedAt = new Date();
  next();
});

// Create indexes
transactionSchema.index({ transactionId: 1 }, { unique: true });
transactionSchema.index({ InventoryId: 1, productId: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { Transaction }; 