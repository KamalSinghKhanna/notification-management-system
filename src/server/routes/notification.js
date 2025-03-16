import { Router } from "express";
import {
  getNotifications,
  getNotificationsById,
  notification,
  testNotification,
} from "../controller/notification.js";

const router = Router();

router.post("/send", notification);
router.post("/test", testNotification);
router.get("/receive", getNotifications);
router.get("/:id", getNotificationsById);

export default router;
