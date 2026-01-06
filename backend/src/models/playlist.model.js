import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	description: {
		type: String,
		trim: true,
		default: ""
	},
	creator: {
		type: String,
		required: true
	},
	creatorName: {
		type: String,
		required: true
	},
	imageUrl: {
		type: String,
		default: ""
	},
	songs: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Song'
	}],
	songCount: {
		type: Number,
		default: 0
	},
	followers: {
		type: Number,
		default: 0
	},
	isPublic: {
		type: Boolean,
		default: true
	},
	isCollaborative: {
		type: Boolean,
		default: false
	},
	isLikedSongs: {
		type: Boolean,
		default: false
	},
	collaborators: [{
		type: String
	}],
	tags: [{
		type: String,
		trim: true
	}],
	genre: {
		type: String,
		trim: true
	},
	mood: {
		type: String,
		trim: true
	},
	playCount: {
		type: Number,
		default: 0
	},
	lastPlayed: {
		type: Date
	}
}, {
	timestamps: true
});

// Add text index for search functionality
playlistSchema.index({
	name: 'text',
	description: 'text',
	creatorName: 'text',
	tags: 'text',
	genre: 'text',
	mood: 'text'
});

// Update song count when songs are added/removed
playlistSchema.pre('save', function(next) {
	this.songCount = this.songs.length;
	next();
});

// Virtual for formatted duration
playlistSchema.virtual('formattedDuration').get(function() {
	// This would calculate total duration from songs
	return "0:00"; // Placeholder
});

// Ensure virtual fields are serialized
playlistSchema.set('toJSON', {
	virtuals: true,
	transform: function(doc, ret) {
		delete ret.__v;
		return ret;
	}
});

export const Playlist = mongoose.model("Playlist", playlistSchema);
