const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) =>
    jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
exports.registerUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password required' });
        if (await User.findOne({ email }))
            return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ email, password, role });
        const token = generateToken(user);
        res.status(201).json({ token, role: user.role, user: { id: user._id, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/auth/login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password required' });

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password)))
            return res.status(401).json({ message: 'Invalid credentials' });

        const token = generateToken(user);
        res.json({ token, role: user.role, user: { id: user._id, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/auth/profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -__v');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ id: user._id, email: user.email, role: user.role });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
