import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// 1. REGISTER
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();
        
        res.status(201).json({ message: "User created successfully!" });
    } catch (err) {
        res.status(400).json({ error: "Email already exists or invalid data" });
    }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }); // Simplified
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'your_secret_key', 
            { expiresIn: '1d' }
        );

        // Fixed the 'generateToken' crash here
        res.json({ 
            token, 
            user: { id: user._id, name: user.name, role: user.role } 
        });
    } catch (err) {
        console.error("Login Error:", err); // Helps you see errors in terminal
        res.status(500).json({ error: "Server error" });
    }
});

export default router;