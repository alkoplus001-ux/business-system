const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');

// Step 1: Company registration (creates company + first admin user)
exports.registerCompany = async (req, res) => {
  try {
    const { companyName, companyEmail, companyPhone, companyAddress, gst, adminName, adminEmail, adminPassword } = req.body;

    if (!companyName || !companyEmail || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({ error: 'Company name, email, admin name, email and password are required' });
    }

    // Check if company email already registered
    const companyExists = await Company.findOne({ email: companyEmail });
    if (companyExists) return res.status(400).json({ error: 'Company already registered with this email' });

    // Create company
    const company = new Company({
      name: companyName,
      email: companyEmail,
      phone: companyPhone || '',
      address: companyAddress || '',
      gst: gst || ''
    });
    await company.save();

    // Create admin user for this company
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const admin = new User({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      companyId: company._id
    });
    await admin.save();

    const token = jwt.sign(
      { user: { id: admin._id, role: admin.role, companyId: company._id } },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(201).json({
      token,
      company: { id: company._id, name: company.name, email: company.email },
      user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Step 2: Login (email + password, system finds company automatically)
exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email);
  try {
    const user = await User.findOne({ email }).populate('companyId', 'name email');
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!(await bcrypt.compare(password, user.password))) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { user: { id: user._id, role: user.role, companyId: user.companyId._id } },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      company: { id: user.companyId._id, name: user.companyId.name, email: user.companyId.email },
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add employee/user to existing company (admin only)
exports.addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const companyId = req.user.companyId;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const userExists = await User.findOne({ email, companyId });
    if (userExists) return res.status(400).json({ error: 'User already exists in this company' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      companyId
    });
    await user.save();

    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all users of company (admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ companyId: req.user.companyId })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user name/role (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { name, role } = req.body;
    const user = await User.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Admin apna role khud change nahi kar sakta
    if (String(user._id) === String(req.user.id) && role && role !== user.role) {
      return res.status(400).json({ error: 'Apna role khud change nahi kar sakte' });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    await user.save();

    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete user (admin only, can't delete self)
exports.deleteUser = async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user.id)) {
      return res.status(400).json({ error: 'Apna account khud delete nahi kar sakte' });
    }
    const user = await User.findOneAndDelete({ _id: req.params.id, companyId: req.user.companyId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Change own password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current aur new password dono chahiye' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password kam se kam 6 characters ka hona chahiye' });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Current password galat hai' });

    user.password = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
    await user.save();

    res.json({ message: 'Password successfully change ho gaya' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
