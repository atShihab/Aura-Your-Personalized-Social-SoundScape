import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		artist: {
			type: String,
			required: true,
		},
		featuredArtist: {
			type: String,
			required: false,
		},
		imageUrl: {
			type: String,
			required: true,
		},
		audioUrl: {
			type: String,
			required: true,
		},
		duration: {
			type: Number, // Duration in minutes
			required: true,
		},
		genre: {
			type: String,
			enum: ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'Country', 'R&B', 'Folk', 'Metal', 'Punk', 'Blues', 'Reggae', 'Indie', 'Alternative', 'EDM', 'Trap', 'Lo-Fi', 'Ambient', 'Other'],
			required: true,
		},
		mood: {
			type: String,
			enum: ['Happy', 'Sad', 'Energetic', 'Chill', 'Romantic', 'Melancholic', 'Uplifting', 'Dark', 'Peaceful', 'Angry', 'Excited', 'Calm', 'Passionate', 'Reflective', 'Playful', 'Intense', 'Dreamy', 'Confident', 'Nostalgic', 'Motivational'],
			required: false,
		},
		releaseDate: {
			type: Date,
			required: false,
			default: Date.now,
		},
		albumId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Album",
			required: false,
		},
		totalPlays: {
			type: Number,
			default: 0,
		},
		// Approval status for artist-uploaded songs
		approvalStatus: {
			type: String,
			enum: ['approved', 'pending', 'rejected'],
			default: 'approved', // Admin-uploaded songs are auto-approved
		},
		approvalNotes: {
			type: String,
			maxLength: 1000,
		},
		approvedBy: {
			type: String, // Admin clerkId
		},
		approvedAt: {
			type: Date,
		},
		uploadedBy: {
			type: String, // Artist clerkId (if uploaded by artist)
		},
	},
	{ timestamps: true }
);

export const Song = mongoose.model("Song", songSchema);
