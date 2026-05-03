const express = require('express');
const router = express.Router();
const { registerCompany, login, addUser, getUsers, updateUser, deleteUser, changePassword } = require('../controllers/authController');
const auth = require('../middlewares/auth');
const User = require('../models/User');

// Register new company + admin user
router.post('/register-company', registerCompany);

// Login
router.post('/login', login);

// Get current user info
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('companyId', 'name email phone address gst');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add user to company (admin only)
router.post('/add-user', auth, addUser);

// Get all users of company (admin only)
router.get('/users', auth, getUsers);

// Update user (admin only)
router.put('/users/:id', auth, updateUser);

// Delete user (admin only)
router.delete('/users/:id', auth, deleteUser);

// Change own password
router.put('/change-password', auth, changePassword);

module.exports = router;
