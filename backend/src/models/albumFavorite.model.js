import mongoose from "mongoose";

const albumFavoriteSchema = new mongoose.Schema({
	userId: {
		type: String,
		required: true
	},
	albumId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Album',
		required: true
	},
	addedAt: {
		type: Date,
		default: Date.now
	}
}, {
	timestamps: true
});

// Compound index to ensure a user can only add an album to library once
albumFavoriteSchema.index({ userId: 1, albumId: 1 }, { unique: true });

// Add text index for search functionality
albumFavoriteSchema.index({
	userId: 1
});

export const AlbumFavorite = mongoose.model("AlbumFavorite", albumFavoriteSchema);
