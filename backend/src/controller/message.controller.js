import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { Conversation } from "../models/conversation.model.js";
import cloudinary from "../lib/cloudinary.js";

// Helper function for cloudinary uploads
const uploadToCloudinary = async (file) => {
	try {
		const result = await cloudinary.uploader.upload(file.tempFilePath, {
			resource_type: "auto",
		});
		return result.secure_url;
	} catch (error) {
		console.log("Error in uploadToCloudinary", error);
		throw new Error("Error uploading to cloudinary");
	}
};

export const sendMessage = async (req, res, next) => {
	try {
		console.log("Request body:", req.body);
		console.log("Request files:", req.files);
		
		const { receiverId, content, playlistData, songData } = req.body;
		const senderId = req.auth.userId;

		if (!receiverId) {
			return res.status(400).json({ message: "Receiver ID is required" });
		}

		if (!content && !req.files?.imageFile && !playlistData && !songData) {
			return res.status(400).json({ message: "Message content, image, playlist data, or song data is required" });
		}

		let messageData = {
			senderId,
			receiverId,
			content: content || "", // Allow empty content for image-only, playlist-only, or song-only messages
			messageType: "text"
		};

		// Handle playlist data if present
		if (playlistData) {
			try {
				const parsedPlaylistData = JSON.parse(playlistData);
				messageData.playlistData = parsedPlaylistData;
				messageData.messageType = content ? "mixed" : "playlist";
				console.log("Playlist data added to message:", parsedPlaylistData);
			} catch (parseError) {
				console.log("Error parsing playlist data:", parseError);
				return res.status(400).json({ message: "Invalid playlist data format" });
			}
		}

		// Handle song data if present
		if (songData) {
			try {
				const parsedSongData = JSON.parse(songData);
				messageData.songData = parsedSongData;
				messageData.messageType = content ? "mixed" : "song";
				console.log("Song data added to message:", parsedSongData);
			} catch (parseError) {
				console.log("Error parsing song data:", parseError);
				return res.status(400).json({ message: "Invalid song data format" });
			}
		}

		// Handle image upload if present
		if (req.files?.imageFile) {
			try {
				console.log("Processing image file:", req.files.imageFile);
				const imageUrl = await uploadToCloudinary(req.files.imageFile);
				console.log("Image uploaded successfully:", imageUrl);
				messageData.imageUrl = imageUrl;
				messageData.messageType = content ? "mixed" : "image";
			} catch (uploadError) {
				console.log("Error uploading image:", uploadError);
				return res.status(500).json({ message: "Failed to upload image: " + uploadError.message });
			}
		}

		console.log("Creating message with data:", messageData);
		const message = new Message(messageData);
		await message.save();

		console.log("Message saved successfully:", message);

		// Create or update conversation
		try {
			const participants = [senderId, receiverId].sort();
			await Conversation.findOneAndUpdate(
				{ participants },
				{
					lastMessage: message._id,
					lastMessageTime: message.createdAt,
					$inc: { unreadCount: 1 }
				},
				{ upsert: true, new: true }
			);
			console.log("✅ Conversation updated successfully");
		} catch (convError) {
			console.log("⚠️ Error updating conversation:", convError);
		}

		// Emit real-time event for the receiver if they're online
		if (req.io && req.userSockets) {
			const receiverSocketId = req.userSockets.get(receiverId);
			if (receiverSocketId) {
				console.log("📤 Sending real-time message to receiver:", receiverId);
				req.io.to(receiverSocketId).emit("receive_message", message);
				
				// Emit unread count update to receiver
				const unreadCount = await Message.countDocuments({
					senderId: senderId,
					receiverId: receiverId,
					isRead: false
				});

				const totalUnreadCount = await Message.countDocuments({
					receiverId: receiverId,
					isRead: false
				});

				req.io.to(receiverSocketId).emit("unread_count_update", {
					userId: senderId,
					count: unreadCount,
					totalCount: totalUnreadCount
				});
			} else {
				console.log("📤 Receiver offline, message stored:", receiverId);
			}
		}

		res.status(201).json(message);
	} catch (error) {
		console.log("Error in sendMessage:", error);
		next(error);
	}
};

export const getMessages = async (req, res, next) => {
	try {
		const { userId } = req.params;
		const currentUserId = req.auth.userId;

		const messages = await Message.find({
			$or: [
				{ senderId: currentUserId, receiverId: userId },
				{ senderId: userId, receiverId: currentUserId }
			]
		}).sort({ createdAt: 1 });

		res.status(200).json(messages);
	} catch (error) {
		console.log("Error in getMessages", error);
		next(error);
	}
};

export const editMessage = async (req, res, next) => {
	try {
		const { messageId } = req.params;
		const { content } = req.body;
		const currentUserId = req.auth.userId;

		if (!content || !content.trim()) {
			return res.status(400).json({ message: "Message content is required" });
		}

		const message = await Message.findById(messageId);
		
		if (!message) {
			return res.status(404).json({ message: "Message not found" });
		}

		if (message.senderId !== currentUserId) {
			return res.status(403).json({ message: "You can only edit your own messages" });
		}

		// Update the message
		message.content = content.trim();
		message.isEdited = true;
		message.editedAt = new Date();
		await message.save();

		// Emit real-time event for message edit
		if (req.io && req.userSockets) {
			const receiverSocketId = req.userSockets.get(message.receiverId);
			if (receiverSocketId) {
				console.log("📤 Sending real-time message edit to receiver:", message.receiverId);
				req.io.to(receiverSocketId).emit("message_edited", message);
			}
		}

		res.status(200).json(message);
	} catch (error) {
		console.log("Error in editMessage", error);
		next(error);
	}
};

export const getConversations = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;

		// Get all conversations for the current user from the Conversation model
		const conversations = await Conversation.find({
			participants: currentUserId
		}).populate('lastMessage').sort({ lastMessageTime: -1 });

		// Transform the data to match frontend expectations
		const usersWithMessages = [];
		const conversationsMap = {};
		const userIds = [];
		
		conversations.forEach(conv => {
			// Safety check for participants array
			if (conv.participants && Array.isArray(conv.participants)) {
				const otherUserId = conv.participants.find(id => id !== currentUserId);
				if (otherUserId) {
					usersWithMessages.push(otherUserId);
					userIds.push(otherUserId);
					conversationsMap[otherUserId] = {
						lastMessage: conv.lastMessage,
						lastMessageTime: conv.lastMessageTime,
						isPinned: conv.isPinned,
						isMuted: conv.isMuted,
						isArchived: conv.isArchived,
						unreadCount: conv.unreadCount
					};
				}
			}
		});

		// Fetch user details for all users with messages
		const User = (await import('../models/user.model.js')).default;
		const users = userIds.length > 0 ? await User.find({ clerkId: { $in: userIds } }) : [];

		console.log("🔍 getConversations Debug:");
		console.log("- Current User ID:", currentUserId);
		console.log("- Found conversations:", conversations.length);
		console.log("- User IDs with messages:", userIds);
		console.log("- Users found:", users.length);
		console.log("- Users data:", users.map(u => ({ clerkId: u.clerkId, fullName: u.fullName })));

		res.status(200).json({
			usersWithMessages,
			conversations: conversationsMap,
			users: users
		});
	} catch (error) {
		console.log("Error in getConversations", error);
		next(error);
	}
};

export const deleteConversation = async (req, res, next) => {
	try {
		const { userId } = req.params;
		const currentUserId = req.auth.userId;

		// Delete all messages between current user and specified user
		await Message.deleteMany({
			$or: [
				{ senderId: currentUserId, receiverId: userId },
				{ senderId: userId, receiverId: currentUserId }
			]
		});

		res.status(200).json({ message: "Conversation deleted successfully" });
	} catch (error) {
		console.log("Error in deleteConversation", error);
		next(error);
	}
};

export const deleteMessage = async (req, res, next) => {
	try {
		const { messageId } = req.params;
		const currentUserId = req.auth.userId;

		const message = await Message.findById(messageId);
		
		if (!message) {
			return res.status(404).json({ message: "Message not found" });
		}

		if (message.senderId !== currentUserId) {
			return res.status(403).json({ message: "You can only delete your own messages" });
		}

		// Emit real-time event for message deletion
		if (req.io && req.userSockets) {
			const receiverSocketId = req.userSockets.get(message.receiverId);
			if (receiverSocketId) {
				console.log("📤 Sending real-time message deletion to receiver:", message.receiverId);
				req.io.to(receiverSocketId).emit("message_deleted", messageId);
			}
		}

		await Message.findByIdAndDelete(messageId);
		res.status(200).json({ message: "Message deleted successfully" });
	} catch (error) {
		console.log("Error in deleteMessage", error);
		next(error);
	}
};

export const pinConversation = async (req, res, next) => {
	try {
		const { userId } = req.params;
		const currentUserId = req.auth.userId;

		// Find and update the conversation
		const participants = [currentUserId, userId].sort();
		const conversation = await Conversation.findOneAndUpdate(
			{ participants },
			{ isPinned: true },
			{ new: true }
		);

		if (!conversation) {
			return res.status(404).json({ message: "Conversation not found" });
		}

		res.status(200).json({ 
			message: "Conversation pinned successfully",
			userId,
			isPinned: true
		});
	} catch (error) {
		console.log("Error in pinConversation", error);
		next(error);
	}
};

export const unpinConversation = async (req, res, next) => {
	try {
		const { userId } = req.params;
		const currentUserId = req.auth.userId;

		// Find and update the conversation
		const participants = [currentUserId, userId].sort();
		const conversation = await Conversation.findOneAndUpdate(
			{ participants },
			{ isPinned: false },
			{ new: true }
		);

		if (!conversation) {
			return res.status(404).json({ message: "Conversation not found" });
		}

		res.status(200).json({ 
			message: "Conversation unpinned successfully",
			userId,
			isPinned: false
		});
	} catch (error) {
		console.log("Error in unpinConversation", error);
		next(error);
	}
};

export const archiveConversation = async (req, res, next) => {
	try {
		const { userId } = req.params;
		const currentUserId = req.auth.userId;

		// For now, we'll just return success
		// In a real implementation, you might want to store this in a separate collection
		// or add a field to track archived conversations
		res.status(200).json({ 
			message: "Conversation archived successfully",
			userId,
			isArchived: true
		});
	} catch (error) {
		console.log("Error in archiveConversation", error);
		next(error);
	}
};

export const muteConversation = async (req, res, next) => {
	try {
		const { userId } = req.params;
		const currentUserId = req.auth.userId;

		// For now, we'll just return success
		// In a real implementation, you might want to store this in a separate collection
	// or add a field to track muted conversations
		res.status(200).json({ 
			message: "Conversation muted successfully",
			userId,
			isMuted: true
		});
	} catch (error) {
		console.log("Error in muteConversation", error);
		next(error);
	}
};

// Mark messages as read
export const markMessagesAsRead = async (req, res, next) => {
	try {
		const { userId } = req.params;
		const currentUserId = req.auth.userId;

		// Mark all messages from the other user as read
		await Message.updateMany(
			{
				senderId: userId,
				receiverId: currentUserId,
				isRead: false
			},
			{
				isRead: true,
				readAt: new Date()
			}
		);

		// Reset unread count for this conversation
		const participants = [currentUserId, userId].sort();
		await Conversation.findOneAndUpdate(
			{ participants },
			{ unreadCount: 0 }
		);

		// Emit real-time event to notify sender that messages were read
		if (req.io && req.userSockets) {
			const senderSocketId = req.userSockets.get(userId);
			if (senderSocketId) {
				req.io.to(senderSocketId).emit("messages_read", {
					userId: currentUserId,
					readAt: new Date()
				});
			}
		}

		// Emit unread count update to current user
		if (req.io && req.userSockets) {
			const currentUserSocketId = req.userSockets.get(currentUserId);
			if (currentUserSocketId) {
				// Get updated unread count for this conversation
				const unreadCount = await Message.countDocuments({
					senderId: userId,
					receiverId: currentUserId,
					isRead: false
				});

				// Get total unread count
				const totalUnreadCount = await Message.countDocuments({
					receiverId: currentUserId,
					isRead: false
				});

				req.io.to(currentUserSocketId).emit("unread_count_update", {
					userId: userId,
					count: unreadCount,
					totalCount: totalUnreadCount
				});
			}
		}

		res.status(200).json({ message: "Messages marked as read" });
	} catch (error) {
		console.log("Error in markMessagesAsRead", error);
		next(error);
	}
};

// Get unread message count for a specific conversation
export const getUnreadCount = async (req, res, next) => {
	try {
		const { userId } = req.params;
		const currentUserId = req.auth.userId;

		const unreadCount = await Message.countDocuments({
			senderId: userId,
			receiverId: currentUserId,
			isRead: false
		});

		res.status(200).json({ unreadCount });
	} catch (error) {
		console.log("Error in getUnreadCount", error);
		next(error);
	}
};

// Get total unread message count for all conversations
export const getTotalUnreadCount = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;

		const totalUnreadCount = await Message.countDocuments({
			receiverId: currentUserId,
			isRead: false
		});

		res.status(200).json({ totalUnreadCount });
	} catch (error) {
		console.log("Error in getTotalUnreadCount", error);
		next(error);
	}
};
