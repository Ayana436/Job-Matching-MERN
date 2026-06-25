import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const validRoles = ['candidate', 'recruiter', 'admin'];
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id));

// 1. REGISTER
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, adminCode } = req.body;
        const cleanRole = validRoles.includes(role) ? role : 'candidate';

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        if (
            cleanRole === 'admin' &&
            (!process.env.ADMIN_SIGNUP_CODE || adminCode !== process.env.ADMIN_SIGNUP_CODE)
        ) {
            return res.status(403).json({
                error: "Admin registration code is invalid"
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return res.status(409).json({ error: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: cleanRole
        });
        await newUser.save();
        
        res.status(201).json({ message: "User created successfully!" });
    } catch (err) {
        res.status(400).json({ error: err.message || "Invalid registration data" });
    }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'your_secret_key', 
            { expiresIn: '1d' }
        );

        res.json({ 
            token, 
            user: { id: user._id, name: user.name, email: user.email, role: user.role } 
        });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Profile Update Logic
router.put('/update/:id', protect, async (req, res) => {
    try {
        const { name } = req.body;

        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: "Invalid user id" });
        }

        if (String(req.user.id) !== String(req.params.id)) {
            return res.status(403).json({ error: "You can only update your own profile" });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});

export default router;
