import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { requestLogger } from './middleware/requestLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, 'config.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

let isDbConnected = false;
let isConnectingDb = false;

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://hirecraft-orpin.vercel.app"
    ],
    credentials: true
}));

app.use(express.json());
app.use(requestLogger);

console.log('--- System Diagnostics ---');
console.log('Current Directory:', __dirname);
console.log('Mongo URI Found:', process.env.MONGO_URI ? 'YES' : 'NO');
console.log('--------------------------');

const uploadsPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use(
    "/uploads",
    express.static(uploadsPath)
);

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
            throw new Error(
                'MONGO_URI missing'
            );
        }

        let lastError;

        for (const uri of mongoUris) {

            try {

                await mongoose.connect(uri, {
                    serverSelectionTimeoutMS: 8000
                });

                lastError = null;
                break;

            } catch (err) {

                lastError = err;

                await mongoose.disconnect()
                    .catch(() => {});

            }
        }

        if (lastError) throw lastError;

        isDbConnected = true;

        console.log(
            'MongoDB Connected Successfully'
        );

    } catch (err) {

        isDbConnected = false;

        console.error(
            'MongoDB Connection Failed:',
            err.message
        );

    } finally {

        isConnectingDb = false;
    }
};

connectDB();

setInterval(connectDB, 10000);

app.use((req, res, next) => {

    if (
        req.path === '/' ||
        req.path === '/api/health' ||
        req.path.startsWith('/uploads')
    ) {
        return next();
    }

    if (!isDbConnected) {

        return res.status(503).json({
            error: 'Database unavailable'
        });
    }

    next();
});

app.get('/', (req, res) => {

    res.status(200).json({
        success: true,
        message: 'Job Matching API Running Successfully',
        version: '1.0.0'
    });
});

app.get('/api/health', (req, res) => {

    res.status(isDbConnected ? 200 : 503)
        .json({
            api: 'running',
            database: isDbConnected
                ? 'connected'
                : 'unavailable'
        });
});

app.use('/api/analytics', analyticsRoutes);

app.use('/api/auth', authRoutes);

app.use('/api/jobs', jobRoutes);

app.use(notFound);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );
});