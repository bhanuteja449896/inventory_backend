const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const productRouter = require('./routes/product.routes.js');
const activityRoutes = require('./routes/activity.routes.js');
const supplierRouter = require('./routes/supplier.routes.js');
const authRoutes = require('./routes/auth.routes.js');
const transactionRouter = require('./routes/transaction.routes.js');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = "mongodb+srv://bhanutejamakkineni:teja449896@cluster0.qaypdyf.mongodb.net/inventory?retryWrites=true&w=majority";

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/products', productRouter);
app.use('/api/activities', activityRoutes);
app.use('/api/suppliers', supplierRouter);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRouter);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Inventory Management API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 