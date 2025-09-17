const express = require('express');
const { submitVote, getVotesByPoll } = require('../controllers/voteController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.post('/', authenticateToken, submitVote);
router.get('/poll/:pollId', authenticateToken, getVotesByPoll);

module.exports = router;