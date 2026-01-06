import mongoose from "mongoose";

const adminActivityLogSchema = new mongoose.Schema(
	{
		adminId: {
			type: String, // Clerk ID of admin
			required: true,
		},
		adminName: {
			type: String,
			required: true,
		},
		action: {
			type: String,
			required: true,
			enum: [
				'song_approved',
				'song_rejected',
				'song_deleted',
				'album_created',
				'album_updated',
				'album_deleted',
				'artist_approved',
				'artist_rejected',
				'artist_deleted',
				'user_suspended',
				'user_unsuspended',
				'user_deleted',
			],
		},
		targetType: {
			type: String,
			enum: ['song', 'album', 'artist', 'user'],
		},
		targetId: {
			type: String,
		},
		targetName: {
			type: String,
		},
		details: {
			type: mongoose.Schema.Types.Mixed,
			default: {},
		},
		ipAddress: {
			type: String,
		},
	},
	{ timestamps: true }
);

// Index for better query performance
adminActivityLogSchema.index({ adminId: 1, createdAt: -1 });
adminActivityLogSchema.index({ action: 1, createdAt: -1 });
adminActivityLogSchema.index({ targetType: 1, targetId: 1 });

export const AdminActivityLog = mongoose.model("AdminActivityLog", adminActivityLogSchema);
