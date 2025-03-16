import express from 'express';
import cors from 'cors';
import notificationRouter from './routes/notification.js';
import dbConnection from './db/dbConnection.js';
import dotenv from 'dotenv';
import Redis from 'ioredis';

dotenv.config({ path: "./config.env" });

const app = express();

// Apply CORS middleware
app.use(cors({
  origin: 'http://localhost:5173', // Change this to your frontend origin
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Connect to Redis
const redis = new Redis(process.env.REDIS_URI);
redis.on("connect", () => console.log("Connected to Redis"));
redis.on("error", (err) => console.error("Redis Connection Error:", err));

// SSE Endpoint for Real-Time Notifications
app.get('/api/v1/notifications/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('X-Accel-Buffering', 'no');

  const intervalId = setInterval(() => {
    res.write(':\n\n'); // heartbeat
  }, 30000);

  res.write('data: {"type":"connection","message":"Connected!"}\n\n');

  const messageHandler = (channel, message) => {
    if (channel === 'notifications') {
      res.write(`data: ${message}\n\n`);
    }
  };

  redis.subscribe('notifications');
  redis.on('message', messageHandler);

  req.on('close', () => {
    clearInterval(intervalId);
    redis.removeListener('message', messageHandler);
    redis.unsubscribe('notifications');
    res.end();
  });
});

// Other routes
app.use('/api/v1/notifications', notificationRouter);

const PORT = process.env.PORT || 5000;
dbConnection();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));