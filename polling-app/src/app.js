const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/users');
const pollRoutes = require('./routes/polls');
const voteRoutes = require('./routes/votes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/votes', voteRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Polling API is running' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;