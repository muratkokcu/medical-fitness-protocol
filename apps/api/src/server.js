const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const reportsRoutes = require('./routes/reports');
const assessmentRoutes = require('./routes/assessments');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

// CORS configuration for development and production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN
    : ['http://localhost:5173', 'http://localhost:5678', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Start server first, then connect to MongoDB
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/assessments', assessmentRoutes);

app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK', 
    message: 'Medical Fitness API is running',
    mongodb: mongoStatus
  });
});

app.use(errorHandler);

// Start server first
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Then try to connect to MongoDB
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medical-fitness-dashboard', {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('MongoDB connected successfully!');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.log('Server is running but MongoDB is not connected. Some features may not work.');
  });