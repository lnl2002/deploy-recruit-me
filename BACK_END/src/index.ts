import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import routes from './routes';
import { errorHandler, responseMiddleware } from './middlewares/responseMiddleware';
import 'module-alias/register';
// Load environment variables from .env file
dotenv.config();
import './auth'


const MONGO_DB_URL = process.env.DB_CONNECTION || "";


// Initialize the express application
const app = express();

// Middleware for parsing JSON requests
app.use(express.json());
app.use(cors());

//api endpoint
app.use(responseMiddleware);
routes(app);
app.use(errorHandler);



// Basic route for testing
app.get('/', (req: Request, res: Response) => {
  res.send('Server is up and running!');
});

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_DB_URL);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`RecruitMe is running on port ${PORT}`);
  connectDB(); // Connect to the database when the server starts
});
