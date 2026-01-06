import mongoose from "mongoose";

const listeningHistorySchema = new mongoose.Schema(
	{
		userId: {
			type: String, // clerkId of user
			required: true,
		},
		songId: {
			type: String, // ID of the song
			required: true,
		},
		songTitle: {
			type: String,
			required: true,
		},
		artistName: {
			type: String,
			required: true,
		},
		artistId: {
			type: String, // ID of the artist
			required: false,
		},
		albumId: {
			type: String, // ID of the album
			required: false,
		},
		albumTitle: {
			type: String,
			required: false,
		},
		imageUrl: {
			type: String,
			required: false,
		},
		duration: {
			type: Number, // Duration in seconds
			required: true,
		},
		playedAt: {
			type: Date,
			default: Date.now,
		},
		completed: {
			type: Boolean, // Whether the song was played to completion
			default: false,
		},
		playCount: {
			type: Number, // How many times this song was played in this session
			default: 1,
		},
		metadata: {
			type: mongoose.Schema.Types.Mixed, // Additional data
			default: {},
		},
	},
	{ timestamps: true }
);

// Index for better query performance
listeningHistorySchema.index({ userId: 1, playedAt: -1 });
listeningHistorySchema.index({ userId: 1, songId: 1 });
listeningHistorySchema.index({ songId: 1, playedAt: -1 });
listeningHistorySchema.index({ artistId: 1, playedAt: -1 });

export const ListeningHistory = mongoose.model("ListeningHistory", listeningHistorySchema);
