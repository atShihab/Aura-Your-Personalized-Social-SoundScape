import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { FriendRequest } from "../models/friendRequest.model.js";
import { sendNotificationToUser, updateNotificationCount } from "../lib/socket.js";

export const getNotifications = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { page = 1, limit = 20, unreadOnly = false } = req.query;

		const query = { userId: currentUserId };
		if (unreadOnly === 'true') {
			query.isRead = false;
		}

		const notifications = await Notification.find(query)
			.sort({ createdAt: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.lean();

		const total = await Notification.countDocuments(query);
		const unreadCount = await Notification.countDocuments({ 
			userId: currentUserId, 
			isRead: false 
		});

		res.status(200).json({
			notifications,
			total,
			unreadCount,
			page: parseInt(page),
			limit: parseInt(limit)
		});
	} catch (error) {
		console.error("❌ Error getting notifications:", error);
		next(error);
	}
};

export const markNotificationAsRead = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { notificationId } = req.params;

		const notification = await Notification.findOne({
			_id: notificationId,
			userId: currentUserId
		});

		if (!notification) {
			return res.status(404).json({ message: "Notification not found" });
		}

		notification.isRead = true;
		notification.readAt = new Date();
		await notification.save();

		// Update notification count via socket
		const unreadCount = await Notification.countDocuments({
			userId: currentUserId,
			isRead: false
		});
		updateNotificationCount(currentUserId, unreadCount);

		res.status(200).json({
			message: "Notification marked as read",
			notification
		});
	} catch (error) {
		console.error("❌ Error marking notification as read:", error);
		next(error);
	}
};

export const markAllNotificationsAsRead = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;

		await Notification.updateMany(
			{ userId: currentUserId, isRead: false },
			{ isRead: true, readAt: new Date() }
		);

		// Update notification count via socket
		updateNotificationCount(currentUserId, 0);

		res.status(200).json({
			message: "All notifications marked as read"
		});
	} catch (error) {
		console.error("❌ Error marking all notifications as read:", error);
		next(error);
	}
};

export const deleteNotification = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { notificationId } = req.params;

		const notification = await Notification.findOneAndDelete({
			_id: notificationId,
			userId: currentUserId
		});

		if (!notification) {
			return res.status(404).json({ message: "Notification not found" });
		}

		res.status(200).json({
			message: "Notification deleted successfully"
		});
	} catch (error) {
		console.error("❌ Error deleting notification:", error);
		next(error);
	}
};

export const getUnreadCount = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;

		const unreadCount = await Notification.countDocuments({
			userId: currentUserId,
			isRead: false
		});

		res.status(200).json({ unreadCount });
	} catch (error) {
		console.error("❌ Error getting unread count:", error);
		next(error);
	}
};

export const createNotification = async (userId, type, title, message, data = {}, senderId = null) => {
	try {
		let senderName = null;
		let senderImage = null;

		if (senderId) {
			const sender = await User.findOne({ clerkId: senderId });
			if (sender) {
				senderName = sender.fullName;
				senderImage = sender.imageUrl;
			}
		}

		const notification = new Notification({
			userId,
			type,
			title,
			message,
			data,
			senderId,
			senderName,
			senderImage
		});

		await notification.save();
		
		// Send real-time notification to user
		sendNotificationToUser(userId, notification);
		
		// Update notification count
		const unreadCount = await Notification.countDocuments({
			userId,
			isRead: false
		});
		updateNotificationCount(userId, unreadCount);
		
		return notification;
	} catch (error) {
		console.error("❌ Error creating notification:", error);
		throw error;
	}
};