import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import imgRoutes from './routes/upload.route.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();


const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow methods you intend to use
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow headers you intend to use
  credentials: true // Allow sending cookies and other credentials
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up multer for file uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'tree_images', // Optional: specify a folder in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [
      {
        width: 500,
        height: 500,
        crop: 'pad', // Adds padding to the image
        background: 'green', // Sets the padding color to green
      }
    ],
  },
});

const upload = multer({ storage });

// Use routes
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', upload.single('image'), imgRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server listening on port 5000');
});
