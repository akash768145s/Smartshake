import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import flavoursRouter from './routes/flavours';
import ordersRouter from './routes/orders';
import machinesRouter from './routes/machines';
import salesRouter from './routes/sales';
import alertsRouter from './routes/alerts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/flavours', flavoursRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/machines', machinesRouter);
app.use('/api/sales', salesRouter);
app.use('/api/alerts', alertsRouter);

app.listen(PORT, () => {
  console.log(`🚀 Smartshake Backend running on port ${PORT}`);
});

