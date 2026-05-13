import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import jobRoutes from './routes/jobRoutes.js';
import authRoutes from './routes/authRoutes.js';

// ES MODULE FIX
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ENV
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());

// Upload folder static access
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

// DEBUG LOGS
console.log('--- System Diagnostics ---');
console.log('Current Directory:', __dirname);
console.log('Mongo URI Found:', process.env.MONGO_URI ? 'YES' : 'NO');
console.log('--------------------------');

// DB CONNECTION
const connectDB = async () => {
    try {
        const fallbackURI = 'mongodb://admin_user:saveNDccure1@ac-5e5ak1d-shard-00-00.pdienec.mongodb.net:27017,ac-5e5ak1d-shard-00-01.pdienec.mongodb.net:27017,ac-5e5ak1d-shard-00-02.pdienec.mongodb.net:27017/?ssl=true&replicaSet=atlas-osab0d-shard-0&authSource=admin&appName=Cluster0';

        const connString = process.env.MONGO_URI || fallbackURI;

        await mongoose.connect(connString);

        console.log('MongoDB Connected Successfully');
    } catch (err) {
        console.error('MongoDB Connection Failed:', err.message);
        process.exit(1);
    }
};

connectDB();

// BASE ROUTE
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Job Matching API Running Successfully',
        version: '1.0.0'
    });
});

// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});