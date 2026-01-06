import mongoose from "mongoose";

const genreSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		description: {
			type: String,
			trim: true,
			default: "",
		},
		imageUrl: {
			type: String,
			default: "",
		},
		color: {
			type: String,
			default: "#1DB954", // Default green color
		},
		// Statistics
		totalSongs: {
			type: Number,
			default: 0,
		},
		totalAlbums: {
			type: Number,
			default: 0,
		},
		totalArtists: {
			type: Number,
			default: 0,
		},
		totalPlays: {
			type: Number,
			default: 0,
		},
		// Popularity metrics
		popularity: {
			type: Number,
			default: 0,
		},
		// Related genres
		relatedGenres: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Genre",
		}],
		// Genre tags for better categorization
		tags: [{
			type: String,
			trim: true,
		}],
		// Mood associations
		moods: [{
			type: String,
			enum: ['Happy', 'Sad', 'Energetic', 'Chill', 'Romantic', 'Melancholic', 'Uplifting', 'Dark', 'Peaceful', 'Angry', 'Excited', 'Calm', 'Passionate', 'Reflective', 'Playful', 'Intense', 'Dreamy', 'Confident', 'Nostalgic', 'Motivational'],
		}],
		// Active status
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

// Indexes for better performance
genreSchema.index({ popularity: -1 });
genreSchema.index({ totalSongs: -1 });
genreSchema.index({ tags: 1 });
genreSchema.index({ moods: 1 });

// Text index for search
genreSchema.index({ 
	name: 'text', 
	description: 'text', 
	tags: 'text' 
});

// Virtual for formatted statistics
genreSchema.virtual('formattedStats').get(function() {
	return {
		songs: this.totalSongs.toLocaleString(),
		albums: this.totalAlbums.toLocaleString(),
		artists: this.totalArtists.toLocaleString(),
		plays: this.totalPlays.toLocaleString(),
	};
});

// Ensure virtual fields are serialized
genreSchema.set('toJSON', {
	virtuals: true,
	transform: function(doc, ret) {
		delete ret.__v;
		return ret;
	}
});

export const Genre = mongoose.model("Genre", genreSchema);
