import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
	{
		senderId: {
			type: String, // clerkId of sender
			required: true,
		},
		receiverId: {
			type: String, // clerkId of receiver
			required: true,
		},
		status: {
			type: String,
			enum: ['pending', 'accepted', 'rejected'],
			default: 'pending',
		},
		message: {
			type: String,
			maxLength: 200,
		},
	},
	{ timestamps: true }
);

// Index for better query performance
friendRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });
friendRequestSchema.index({ receiverId: 1, status: 1 });
friendRequestSchema.index({ senderId: 1, status: 1 });

export const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);
