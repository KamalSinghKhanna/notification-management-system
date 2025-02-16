import nodemailer from "nodemailer";
import twilio from "twilio";

export const sendEmailNotification = async (notification) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: notification.userId,
    subject: "New Notification",
    text: notification.message,
  });
};

export const sendSmsNotification = async (notification) => {
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body: notification.message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: notification.userId,
  });
};

export const sendWebNotification = async (notification) => {
  console.log(
    `Sending Web Notification to user: ${notification.userId}, Message: ${notification.message}`
  );
};
