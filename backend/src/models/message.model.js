import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		senderId: { type: String, required: true }, // Clerk user ID
		receiverId: { type: String, required: true }, // Clerk user ID
		content: { type: String, required: false }, // Made optional to allow image-only messages
		imageUrl: { type: String }, // Optional image URL
		messageType: { 
			type: String, 
			enum: ['text', 'image', 'mixed', 'playlist', 'song'], 
			default: 'text' 
		}, // Type of message
		playlistData: {
			playlistId: { type: String },
			playlistName: { type: String },
			playlistImage: { type: String },
			songCount: { type: Number },
			description: { type: String }
		},
		songData: {
			songId: { type: String },
			songTitle: { type: String },
			songArtist: { type: String },
			songImage: { type: String },
			songUrl: { type: String },
			duration: { type: Number }
		},
		isEdited: { type: Boolean, default: false },
		editedAt: { type: Date },
		replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
		isPinned: { type: Boolean, default: false },
		isRead: { type: Boolean, default: false },
		readAt: { type: Date }
	},
	{ timestamps: true }
);

// Custom validator: either content, imageUrl, playlistData, or songData must be present
messageSchema.pre('validate', function(next) {
	if (!this.content && !this.imageUrl && !this.playlistData && !this.songData) {
		this.invalidate('content', 'Either message content, image, playlist data, or song data is required');
	}
	next();
});

export const Message = mongoose.model("Message", messageSchema);
