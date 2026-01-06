import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
	{
		followerId: {
			type: String, // clerkId of follower
			required: true,
		},
		followingId: {
			type: String, // clerkId of person being followed
			required: true,
		},
	},
	{ timestamps: true }
);

// Index for better query performance
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
followSchema.index({ followerId: 1 });
followSchema.index({ followingId: 1 });

export const Follow = mongoose.model("Follow", followSchema);
