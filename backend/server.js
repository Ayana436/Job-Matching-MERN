import express from 'express';
// import fileUpload from 'express-fileupload';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import jobRoutes from './routes/jobRoutes.js';

// 1. Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Load Environment Variables from the backend folder
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

// 3. Middlewares
app.use(cors());
app.use(express.json()); // Allows parsing of JSON data in request bodies
// app.use(fileUpload()); NOW USE MULTER!

app.use('/api/jobs', jobRoutes);

// 4. Debug Logs (Helpful for University Reports)
console.log('--- System Diagnostics ---');
console.log('Current Directory:', __dirname);
console.log('Database URI Found:', process.env.MONGO_URI ? '✅ Yes' : '❌ No');
console.log('--------------------------');

// 5. Database Connection Logic
const connectDB = async () => {
    try {
        // This is your backup string in case .env fails
        const fallbackURI = "mongodb://admin_user:saveNDccure1@ac-5e5ak1d-shard-00-00.pdienec.mongodb.net:27017,ac-5e5ak1d-shard-00-01.pdienec.mongodb.net:27017,ac-5e5ak1d-shard-00-02.pdienec.mongodb.net:27017/?ssl=true&replicaSet=atlas-osab0d-shard-0&authSource=admin&appName=Cluster0";
        
        const connString = process.env.MONGO_URI || fallbackURI;
        
        console.log('Attempting connection with:', connString.substring(0, 20) + '...');

        await mongoose.connect(connString);
        console.log('🚀 SUCCESS: MongoDB Connected to Atlas');
    } catch (err) {
        console.error('❌ Database Connection Error:', err.message);
        process.exit(1);
    }
};

connectDB();

// 6. Base API Route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Job Matching API is running successfully.',
        version: '1.0.0'
    });
});

// 7. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🌍 Server active on http://localhost:${PORT}`);
});
