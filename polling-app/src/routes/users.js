const express = require('express');
const { createUser, loginUser, getUsers } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', createUser);
router.post('/login', loginUser);

// Protected routes
router.get('/', authenticateToken, getUsers);

module.exports = router;