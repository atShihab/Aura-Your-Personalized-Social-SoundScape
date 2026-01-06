import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
	{
		userId: {
			type: String, // clerkId of user
			required: true,
		},
		type: {
			type: String,
			enum: ['song', 'album', 'artist'],
			required: true,
		},
		itemId: {
			type: String, // ID of the favorited item
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		artist: {
			type: String,
			required: false,
		},
		imageUrl: {
			type: String,
			required: false,
		},
		metadata: {
			type: mongoose.Schema.Types.Mixed, // Additional data specific to type
			default: {},
		},
	},
	{ timestamps: true }
);

// Index for better query performance
favoriteSchema.index({ userId: 1, type: 1 });
favoriteSchema.index({ userId: 1, itemId: 1 }, { unique: true });
favoriteSchema.index({ type: 1, itemId: 1 });

export const Favorite = mongoose.model("Favorite", favoriteSchema);
