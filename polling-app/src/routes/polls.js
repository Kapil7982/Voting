const express = require('express');
const { createPoll, getPolls, getPollById, updatePoll } = require('../controllers/pollController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getPolls);
router.get('/:id', getPollById);

// Protected routes
router.post('/', authenticateToken, createPoll);
router.put('/:id', authenticateToken, updatePoll);

module.exports = router;