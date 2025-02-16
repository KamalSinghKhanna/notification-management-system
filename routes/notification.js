import { Router } from "express";
import {
  getNotifications,
  getNotificationsById,
  notification,
} from "../controller/notification.js";

const router = Router();

router.post("/send", notification);
router.get("/receive", getNotifications);
router.get("/:id", getNotificationsById);

export default router;
