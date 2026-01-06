import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		artist: { type: String, required: false },
		imageUrl: { type: String, required: true },
		releaseYear: { type: Number, required: true },
		genre: {
			type: String,
			enum: ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'Country', 'R&B', 'Folk', 'Metal', 'Punk', 'Blues', 'Reggae', 'Indie', 'Alternative', 'EDM', 'Trap', 'Lo-Fi', 'Ambient', 'Other'],
			required: false,
		},
		songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
	},
	{ timestamps: true }
); //  createdAt, updatedAt

export const Album = mongoose.model("Album", albumSchema);
