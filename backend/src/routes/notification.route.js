import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
	getNotifications,
	markNotificationAsRead,
	markAllNotificationsAsRead,
	deleteNotification,
	getUnreadCount
} from "../controller/notification.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/:notificationId/read", markNotificationAsRead);
router.put("/mark-all-read", markAllNotificationsAsRead);
router.delete("/:notificationId", deleteNotification);

export default router;