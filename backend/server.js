import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import jobRoutes from './routes/jobRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { requestLogger } from './middleware/requestLogger.js';

// ES MODULE FIX
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ENV
dotenv.config({ path: path.resolve(__dirname, 'config.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
let isDbConnected = false;
let isConnectingDb = false;

// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(requestLogger);



// DEBUG LOGS
console.log('--- System Diagnostics ---');
console.log('Current Directory:', __dirname);
console.log('Mongo URI Found:', process.env.MONGO_URI ? 'YES' : 'NO');
console.log('--------------------------');

// DB CONNECTION
const getMongoUris = () => [
    process.env.MONGO_URI,
    process.env.MONGO_URI_DIRECT
].filter(Boolean);

const connectDB = async () => {
    if (isConnectingDb || isDbConnected) return;
    isConnectingDb = true;

    try {
        const mongoUris = getMongoUris();
        if (mongoUris.length === 0) {
            throw new Error('MONGO_URI is missing. Add it to backend/config.env or backend/.env');
        }

        let lastError;
        for (const uri of mongoUris) {
            try {
                const connectionType = uri.startsWith('mongodb+srv://') ? 'SRV' : 'direct';
                console.log(`Trying MongoDB ${connectionType} connection...`);

                await mongoose.connect(uri, {
                    serverSelectionTimeoutMS: 8000
                });

                lastError = null;
                break;
            } catch (err) {
                lastError = err;
                await mongoose.disconnect().catch(() => {});
            }
        }

        if (lastError) throw lastError;

        isDbConnected = true;
        console.log('MongoDB Connected Successfully');
    } catch (err) {
        isDbConnected = false;
        console.error('MongoDB Connection Failed:', err.message);
        console.error('API is still running, but database-backed routes will return 503 until MongoDB is reachable.');
    } finally {
        isConnectingDb = false;
    }
};

connectDB();
setInterval(connectDB, 10000);

app.use((req, res, next) => {
    if (req.path === '/' || req.path === '/api/health') return next();

    if (!isDbConnected) {
        return res.status(503).json({
            error: 'Database unavailable. Check MongoDB Atlas/network connection. The backend retries automatically every 30 seconds.'
        });
    }

    next();
});

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);


// Upload folder static access
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(notFound);
app.use(errorHandler);

// BASE ROUTE
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Job Matching API Running Successfully',
        version: '1.0.0'
    });
});

app.get('/api/health', (req, res) => {
    res.status(isDbConnected ? 200 : 503).json({
        api: 'running',
        database: isDbConnected ? 'connected' : 'unavailable'
    });
});

// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
