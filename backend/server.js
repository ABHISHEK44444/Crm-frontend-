import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import tenderRoutes from './routes/tenderRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import userRoutes from './routes/userRoutes.js';
import financialRoutes from './routes/financialRoutes.js';
import oemRoutes from './routes/oemRoutes.js';
import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

connectDB();

const app = express();

// CORS Configuration
const allowedOrigins = [
  'https://crm-frontend-ct9i.onrender.com/', // Your frontend URL
  'http://localhost:5173', // Your local Vite dev server
  'http://localhost:3000' // Common local dev server port
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' })); // Increase limit for data URLs in documents

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/tenders', tenderRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/financials', financialRoutes);
app.use('/api/oems', oemRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);


const PORT = process.env.PORT || 5001;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
