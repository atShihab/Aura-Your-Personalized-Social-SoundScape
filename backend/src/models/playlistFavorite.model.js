import mongoose from "mongoose";

const playlistFavoriteSchema = new mongoose.Schema({
	userId: {
		type: String,
		required: true
	},
	playlistId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Playlist',
		required: true
	},
	addedAt: {
		type: Date,
		default: Date.now
	}
}, {
	timestamps: true
});

// Compound index to ensure a user can only like a playlist once
playlistFavoriteSchema.index({ userId: 1, playlistId: 1 }, { unique: true });

// Add text index for search functionality
playlistFavoriteSchema.index({
	userId: 1
});

export const PlaylistFavorite = mongoose.model("PlaylistFavorite", playlistFavoriteSchema);
