import Notification from "../model/Notification.js";
import { sendToQueue } from "../utils/messageQueue.js";
import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URI);
export const notification = async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();

    console.log('Publishing notification to Redis:', notification); // Debug log
    redis.publish('notifications', JSON.stringify(notification));

    await sendToQueue(notification);

    res.status(201).json({
      message: "Notification created and sent to queue",
      notification,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: error.message });
  }
};


export const testNotification = (req, res) => {
  const testNotification = {
    userId: 'testUserId',
    type: 'test',
    message: 'Test notification ' + new Date().toISOString(),
    status: 'sent'
  };

  redis.publish('notifications', JSON.stringify(testNotification));
  res.json({ message: 'Test notification sent' });
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNotificationsById = async (req, res) => {
  try {
    const notification = await Notification.find({id : req.params.id});
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
