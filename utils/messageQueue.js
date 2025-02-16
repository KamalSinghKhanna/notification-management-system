import amqp from "amqplib";
import Notification from "../model/Notification.js";
import {
  sendEmailNotification,
  sendSmsNotification,
  sendWebNotification,
} from "./notificationService.js";

let channel;

export const connectQueue = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URI);
    channel = await connection.createChannel();
    await channel.assertQueue("notifications");
    console.log("Connected to RabbitMQ");
  } catch (error) {
    console.error("RabbitMQ Connection Error:", error);
  }
};

export const sendToQueue = async (message) => {
  if (channel) {
    channel.sendToQueue("notifications", Buffer.from(JSON.stringify(message)));
  } else {
    console.error("RabbitMQ channel not initialized");
  }
};

export const consumeQueue = async () => {
  if (channel) {
    channel.consume("notifications", async (msg) => {
      if (msg !== null) {
        const notification = JSON.parse(msg.content.toString());
        console.log("Processing Notification:", notification);
        await processNotification(notification);
        channel.ack(msg);
      }
    });
  }
};

const processNotification = async (notification) => {
  try {
    console.log(
      `Sending ${notification.type} notification to user ${notification.userId}`
    );
    if (notification.type === "email") {
      await sendEmailNotification(notification);
    } else if (notification.type === "sms") {
      await sendSmsNotification(notification);
    } else if (notification.type === "web") {
      await sendWebNotification(notification);
    }
    await Notification.findByIdAndUpdate(notification._id, { status: "sent" });
  } catch (error) {
    console.error("Error processing notification:", error);
    await Notification.findByIdAndUpdate(notification._id, {
      status: "failed",
    });
  }
};
