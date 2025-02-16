import express, { json } from "express";
import notificationRouter from "./routes/notification.js";
import dbConnection from "./db/dbConnection.js";
import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config({ path: "./config.env" });
import {
  connectQueue,
  consumeQueue,
} from "./utils/messageQueue.js";
const app = express();

app.use(json());

// Connect to Message Queue
connectQueue();
consumeQueue(); // Start consuming messages

// Connect to Redis
const redis = new Redis(process.env.REDIS_URI);
redis.on("connect", () => console.log("Connected to Redis"));
redis.on("error", (err) => console.error("Redis Connection Error:", err));

// SSE Endpoint for Real-Time Notifications
app.get("/api/notifications/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  redis.subscribe("notifications");
  redis.on("message", (channel, message) => {
    if (channel === "notifications") {
      sendEvent(JSON.parse(message));
    }
  });

  req.on("close", () => {
    redis.unsubscribe("notifications");
  });
});
// Routes
app.use("/api/v1/notifications", notificationRouter);

const PORT = process.env.PORT || 5000;
dbConnection();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
