import Notification from "../model/Notification.js";
import { sendToQueue } from "../utils/messageQueue.js";

export const notification = async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    await sendToQueue(notification);
    res
      .status(201)
      .json({
        message: "Notification created and sent to queue",
        notification,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
    const notification = await Notification.findById(req.params.id);
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
