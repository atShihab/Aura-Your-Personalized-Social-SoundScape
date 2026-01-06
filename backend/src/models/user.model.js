import mongoose from "mongoose";

const conversationSettingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  isMuted: {
    type: Boolean,
    default: false,
  },
});

const userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		imageUrl: {
			type: String,
			required: true,
		},
		clerkId: {
			type: String,
			required: true,
			unique: true,
		},
    conversationSettings: [conversationSettingsSchema],
    blockedUsers: [{
      type: String,
    }],
		// Profile fields
		handle: {
			type: String,
			unique: true,
			sparse: true,
			trim: true,
			lowercase: true,
		},
		favoriteGenres: [{
			type: String,
			enum: ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'Country', 'R&B', 'Folk', 'Metal', 'Punk', 'Blues', 'Reggae', 'Indie', 'Alternative', 'EDM', 'Trap', 'Lo-Fi', 'Ambient', 'Other'],
		}],
		// Social fields - only for artists
		followers: {
			type: Number,
			default: 0,
		},
		following: {
			type: Number,
			default: 0,
		},
		// Friend count for all users (private)
		friendCount: {
			type: Number,
			default: 0,
		},
		// Artist-specific fields
		isArtist: {
			type: Boolean,
			default: false,
		},
		artistName: {
			type: String,
			trim: true,
		},
		genre: {
			type: String,
			enum: ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'Country', 'R&B', 'Folk', 'Metal', 'Punk', 'Blues', 'Reggae', 'Other'],
		},
		bio: {
			type: String,
			maxLength: 500,
			trim: true,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		verificationDate: {
			type: Date,
		},
		verificationType: {
			type: String,
			enum: ['artist', 'industry'],
			default: 'artist',
		},
		verificationStatus: {
			type: String,
			enum: ['pending', 'approved', 'rejected'],
			default: 'pending',
		},
		verificationNotes: {
			type: String,
			maxLength: 1000,
		},
		socialMedia: {
			instagram: String,
			twitter: String,
			youtube: String,
			tiktok: String,
			website: String,
		},
		artistDocuments: [{
			name: {
				type: String,
				required: true
			},
			url: {
				type: String,
				required: true
			},
			type: {
				type: String,
				required: true
			},
			size: {
				type: Number,
				required: true
			}
		}],
		// Artist statistics
		totalPlays: {
			type: Number,
			default: 0,
		},
		monthlyListeners: {
			type: Number,
			default: 0,
		},
		// User settings
		settings: {
			type: mongoose.Schema.Types.Mixed,
			default: {},
		},
		// Email preferences
		emailPreferences: {
			account: {
				signupVerification: { type: Boolean, default: true },
				passwordReset: { type: Boolean, default: true },
				newDeviceLogin: { type: Boolean, default: true }
			},
			subscription: {
				confirmation: { type: Boolean, default: true },
				renewal: { type: Boolean, default: true }
			},
			music: {
				newReleases: { type: Boolean, default: true },
				artistUpdates: { type: Boolean, default: true }
			},
			artist: {
				verification: { type: Boolean, default: true },
				uploadStatus: { type: Boolean, default: true },
				payments: { type: Boolean, default: true }
			}
		},
		// Account suspension
		isSuspended: {
			type: Boolean,
			default: false,
		},
		suspendedAt: {
			type: Date,
		},
		suspendedReason: {
			type: String,
			maxLength: 500,
		},
	},
	{ timestamps: true } //  createdAt, updatedAt
);

// Index for better query performance
userSchema.index({ isArtist: 1, isVerified: 1 });
userSchema.index({ genre: 1 });
userSchema.index({ artistName: 1 });
userSchema.index({ favoriteGenres: 1 });
// Add text index for search functionality
userSchema.index({ 
	fullName: 'text', 
	artistName: 'text', 
	handle: 'text',
	bio: 'text' 
});

export const User = mongoose.model("User", userSchema);

