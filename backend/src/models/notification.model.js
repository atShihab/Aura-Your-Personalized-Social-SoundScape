import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
	{
		userId: {
			type: String, // clerkId of the user receiving the notification
			required: true,
		},
		type: {
			type: String,
			enum: [
				'friend_request',
				'friend_request_accepted',
				'friend_request_rejected',
				'artist_approved',
				'artist_rejected',
				'new_follower',
				'new_message',
				'song_uploaded',
				'song_approved',
				'song_rejected',
				'album_uploaded',
				'playlist_shared'
			],
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
		data: {
			type: mongoose.Schema.Types.Mixed,
			default: {},
		},
		isRead: {
			type: Boolean,
			default: false,
		},
		readAt: {
			type: Date,
		},
		actionUrl: {
			type: String, // URL to navigate to when notification is clicked
		},
		senderId: {
			type: String, // clerkId of the user who triggered the notification
		},
		senderName: {
			type: String, // Name of the sender for display
		},
		senderImage: {
			type: String, // Profile image of the sender
		},
	},
	{ timestamps: true }
);

// Index for better query performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ type: 1 });

export const Notification = mongoose.model("Notification", notificationSchema);
