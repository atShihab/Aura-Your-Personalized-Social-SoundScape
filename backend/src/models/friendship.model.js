import mongoose from "mongoose";

const friendshipSchema = new mongoose.Schema(
	{
		user1Id: {
			type: String, // clerkId of first user
			required: true,
		},
		user2Id: {
			type: String, // clerkId of second user
			required: true,
		},
		// Store the smaller clerkId first for consistent ordering
		// This helps with querying and prevents duplicate friendships
	},
	{ timestamps: true }
);

// Index for better query performance
friendshipSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });
friendshipSchema.index({ user1Id: 1 });
friendshipSchema.index({ user2Id: 1 });

export const Friendship = mongoose.model("Friendship", friendshipSchema);
