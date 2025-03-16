import amqp from 'amqplib';
import dotenv from 'dotenv';
import Notification from "../model/Notification.js";
import {
  sendEmailNotification,
  sendSmsNotification,
  sendWebNotification,
} from "./notificationService.js";

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
let channel;

export const connectQueue = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue("notifications");
    console.log('Connected to RabbitMQ');

    connection.on('error', (error) => {
      console.error('RabbitMQ Connection Error:', error);
    });

    connection.on('close', () => {
      console.warn('RabbitMQ Connection Closed. Retrying in 5 seconds...');
      setTimeout(connectQueue, 5000);
    });

    return channel;
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error.message);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectQueue, 5000);
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
  try {
    if (!channel) {
      console.warn('Channel not established. Waiting for connection...');
      return;
    }

    channel.consume("notifications", async (msg) => {
      if (msg !== null) {
        const notification = JSON.parse(msg.content.toString());
        console.log(notification, "notification")
        console.log("Processing Notification:", notification);
        await processNotification(notification);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('Error in consumeQueue:', error);
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
