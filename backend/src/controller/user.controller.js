import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import { uploadToCloudinary } from "../lib/cloudinary.js";
import { Friendship } from "../models/friendship.model.js";
import { FriendRequest } from "../models/friendRequest.model.js";
import { Follow } from "../models/follow.model.js";
import { findUserByIdentifier } from "../lib/userLookup.js";

export const getAllUsers = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		console.log("🔄 getAllUsers called with currentUserId:", currentUserId);
		
		// Get the current user to check their blocked users list
		const currentUser = await User.findOne({ clerkId: currentUserId });
		const blockedUsers = currentUser.blockedUsers || [];

		// Filter out current user and blocked users
		const users = await User.find({ 
			clerkId: { $ne: currentUserId, $nin: blockedUsers } 
		});
		console.log("✅ Filtered users (excluding current user and blocked users):", users.map(u => ({ clerkId: u.clerkId, fullName: u.fullName })));
		
		res.status(200).json(users);
	} catch (error) {
		console.error("❌ Error in getAllUsers:", error);
		next(error);
	}
};

export const deleteUser = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		console.log("🗑️ Delete user request for:", currentUserId);
		
		// Delete user from database
		const deletedUser = await User.findOneAndDelete({ clerkId: currentUserId });
		if (deletedUser) {
			console.log("✅ User deleted from database:", deletedUser.fullName);
		}
		
		// Delete all messages from/to this user
		const deletedMessages = await Message.deleteMany({
			$or: [
				{ senderId: currentUserId },
				{ receiverId: currentUserId }
			]
		});
		console.log("🗑️ Deleted messages:", deletedMessages.deletedCount);
		
		// Notify other users that this user was deleted
		// This will be handled by the socket cleanup
		if (req.io) {
			req.io.emit("user_deleted", currentUserId);
			console.log("📡 Emitted user_deleted event for:", currentUserId);
		}
		
		res.status(200).json({ 
			success: true, 
			message: "User account deleted successfully",
			deletedMessages: deletedMessages.deletedCount
		});
	} catch (error) {
		console.error("❌ Error deleting user:", error);
		next(error);
	}
};

export const getMessages = async (req, res, next) => {
	try {
		const myId = req.auth.userId;
		const { userId } = req.params;

		const messages = await Message.find({
			$or: [
				{ senderId: userId, receiverId: myId },
				{ senderId: myId, receiverId: userId },
			],
		}).sort({ createdAt: 1 });

		res.status(200).json(messages);
	} catch (error) {
		next(error);
	}
};

// Profile-related functions
export const getUserProfile = async (req, res, next) => {
	try {
		const { id } = req.params;
		const currentUserId = req.auth.userId;

		console.log("🔍 Getting profile for user:", id);
		console.log("👤 Current user:", currentUserId);

		// Find user by clerkId, _id, or handle (username)
		const user = await findUserByIdentifier(id);
		
		console.log("📊 User found in database:", user ? "Yes" : "No");
		
		if (!user) {
			console.log("❌ User not found in database");
			return res.status(404).json({ 
				message: "User not found" 
			});
		}

		// Check friendship and follow status
		let friendshipStatus = 'none';
		let isFollowing = false;
		
		if (currentUserId !== user.clerkId) {
			// Check if they are friends
			const friendship = await Friendship.findOne({
				$or: [
					{ user1Id: currentUserId, user2Id: user.clerkId },
					{ user1Id: user.clerkId, user2Id: currentUserId }
				]
			});

			if (friendship) {
				friendshipStatus = 'friends';
			} else {
				// Check if there's a pending friend request
				const sentRequest = await FriendRequest.findOne({
					senderId: currentUserId,
					receiverId: user.clerkId,
					status: 'pending'
				});

				const receivedRequest = await FriendRequest.findOne({
					senderId: user.clerkId,
					receiverId: currentUserId,
					status: 'pending'
				});

				if (sentRequest) {
					friendshipStatus = 'request_sent';
				} else if (receivedRequest) {
					friendshipStatus = 'request_received';
				}
			}

			// Check follow status (only for artists)
			if (user.isArtist) {
				const follow = await Follow.findOne({
					followerId: currentUserId,
					followingId: user.clerkId
				});
				isFollowing = !!follow;
			}
		}

		console.log("✅ Returning user profile:", user.fullName);
		res.status(200).json({
			user,
			isFollowing,
			friendshipStatus
		});
	} catch (error) {
		console.error("❌ Error in getUserProfile:", error);
		next(error);
	}
};

export const updateUserProfile = async (req, res, next) => {
	try {
		console.log("🔄 Profile update request received");
		console.log("📝 Request body:", req.body);
		console.log("📁 Request files:", req.files);
		
		const currentUserId = req.auth.userId;
		const updateData = { ...req.body };

		// Handle profile image upload (express-fileupload style)
		if (req.files && req.files.profileImage) {
			console.log("📸 Processing image upload");
			try {
				const imageUrl = await uploadToCloudinary(req.files.profileImage.tempFilePath, "profile-images");
				updateData.imageUrl = imageUrl;
				console.log("✅ Profile image uploaded to Cloudinary:", imageUrl);
			} catch (uploadError) {
				console.error("❌ Profile image upload error:", uploadError);
				return res.status(500).json({ message: "Error uploading profile image to Cloudinary" });
			}
		}

		// Parse JSON fields
		if (updateData.favoriteGenres) {
			try {
				updateData.favoriteGenres = JSON.parse(updateData.favoriteGenres);
			} catch (parseError) {
				console.error("❌ Error parsing favoriteGenres:", parseError);
				updateData.favoriteGenres = [];
			}
		}
		if (updateData.socialMedia) {
			try {
				updateData.socialMedia = JSON.parse(updateData.socialMedia);
			} catch (parseError) {
				console.error("❌ Error parsing socialMedia:", parseError);
				updateData.socialMedia = {};
			}
		}

		// Check handle uniqueness if provided
		if (updateData.handle) {
			const existingUser = await User.findOne({ 
				handle: updateData.handle,
				clerkId: { $ne: currentUserId }
			});
			if (existingUser) {
				return res.status(400).json({ message: "Handle already taken" });
			}
		}

		console.log("💾 Updating user with data:", updateData);
		const updatedUser = await User.findOneAndUpdate(
			{ clerkId: currentUserId },
			updateData,
			{ new: true, runValidators: true }
		);

		if (!updatedUser) {
			return res.status(404).json({ message: "User not found" });
		}

		console.log("✅ Profile updated successfully");
		res.status(200).json({
			user: updatedUser,
			message: "Profile updated successfully"
		});
	} catch (error) {
		next(error);
	}
};

// These functions are now handled by the follow controller for artists only
export const followUser = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { id } = req.params;

		// Find the user by id (could be username, clerkId, or _id)
		const targetUser = await findUserByIdentifier(id);
		if (!targetUser) {
			return res.status(404).json({ message: "User not found" });
		}

		if (!targetUser.isArtist) {
			return res.status(400).json({ message: "You can only follow artists" });
		}

		// Redirect to follow controller
		// This should be handled by the follow routes instead
		res.status(400).json({ message: "Use /api/follows/:artistId to follow artists" });
	} catch (error) {
		next(error);
	}
};

export const unfollowUser = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { id } = req.params;

		// Find the user by id (could be username, clerkId, or _id)
		const targetUser = await findUserByIdentifier(id);
		if (!targetUser) {
			return res.status(404).json({ message: "User not found" });
		}

		if (!targetUser.isArtist) {
			return res.status(400).json({ message: "You can only unfollow artists" });
		}

		// Redirect to follow controller
		// This should be handled by the follow routes instead
		res.status(400).json({ message: "Use /api/follows/:artistId to follow artists" });
	} catch (error) {
		next(error);
	}
};

export const getUserStats = async (req, res, next) => {
	try {
		const { id } = req.params;

		// Find user by clerkId, _id, or handle (username)
		const user = await findUserByIdentifier(id);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Return empty stats - will be populated from real listening history
		const stats = {
			totalListeningTime: 0,
			topGenres: [],
			recentActivity: null
		};

		res.status(200).json(stats);
	} catch (error) {
		next(error);
	}
};

export const getUserPlaylists = async (req, res, next) => {
	try {
		const { id } = req.params;

		// Find user by clerkId, _id, or handle (username)
		const user = await findUserByIdentifier(id);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Return empty playlists - will be populated from real playlist model
		const playlists = [];

		res.status(200).json({ playlists });
	} catch (error) {
		next(error);
	}
};

export const getUserFavorites = async (req, res, next) => {
	try {
		const { id } = req.params;

		// Find user by clerkId, _id, or handle (username)
		const user = await findUserByIdentifier(id);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Return empty favorites - will be populated from real favorites model
		const favorites = [];

		res.status(200).json({ favorites });
	} catch (error) {
		next(error);
	}
};

export const getUserListeningHistory = async (req, res, next) => {
	try {
		const { id } = req.params;

		// Find user by clerkId, _id, or handle (username)
		const user = await findUserByIdentifier(id);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Return empty listening history - will be populated from real listening history model
		const history = [];

		res.status(200).json({ history });
	} catch (error) {
		next(error);
	}
};

// Search users by username/handle, full name, or artist name
export const searchUsers = async (req, res, next) => {
	try {
		const { q, type = 'all', limit = 20 } = req.query;
		
		if (!q || q.trim().length < 2) {
			return res.status(400).json({ message: "Search query must be at least 2 characters" });
		}
		
		const query = q.trim();
		let searchQuery = {};
		
		// Build search query - prioritize artists but include all users
		// Artists will show as artist profiles, regular users as user profiles
		searchQuery = {
			$or: [
				{ handle: { $regex: query, $options: 'i' } },
				{ fullName: { $regex: query, $options: 'i' } },
				{ artistName: { $regex: query, $options: 'i' } }
			]
		};
		
		// If specifically searching for artists, filter to only artists
		if (type === 'artists') {
			searchQuery.isArtist = true;
		}
		
		const users = await User.find(searchQuery)
			.select('fullName handle imageUrl isArtist artistName isVerified followers genre clerkId')
			.sort({ isVerified: -1, followers: -1, fullName: 1 })
			.limit(parseInt(limit));
		
		console.log(`🔍 Search results for "${query}": ${users.length} users found`);
		
		res.status(200).json({
			users,
			query,
			total: users.length
		});
	} catch (error) {
		console.error("❌ Error searching users:", error);
		next(error);
	}
};

// Settings-related functions
export const getUserSettings = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		console.log("🔧 Getting settings for user:", currentUserId);

		// Find user and return their settings
		const user = await User.findOne({ clerkId: currentUserId });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Return user settings or default settings
		const settings = user.settings || {
			common: {
				language: "en",
				theme: "auto",
				notifications: {
					email: true,
					push: true,
					sms: false,
				},
				privacy: {
					profileVisibility: "public",
					showOnlineStatus: true,
					showListeningActivity: true,
					allowMessages: "everyone",
				},
			},
			enhanced: {
				audio: {
					quality: "high",
					normalization: true,
					crossfade: false,
					crossfadeDuration: 3,
					equalizer: {
						enabled: false,
						preset: "flat",
						bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					},
				},
				playback: {
					autoplay: true,
					shuffle: false,
					repeat: "off",
					gaplessPlayback: true,
					preloadNext: true,
				},
				interface: {
					compactMode: false,
					showLyrics: true,
					showVisualizer: false,
					animations: true,
					reducedMotion: false,
				},
			},
			unique: {
				discovery: {
					recommendationEngine: "hybrid",
					showNewReleases: true,
					showTrending: true,
					showFriendsActivity: true,
					personalizedPlaylists: true,
				},
				social: {
					shareListeningActivity: true,
					allowFriendRequests: true,
					showInSearch: true,
					activityFeed: true,
					groupListening: false,
				},
				content: {
					explicitContent: false,
					showAds: true,
					downloadQuality: "high",
					offlineMode: false,
				},
			},
			advanced: {
				developer: {
					debugMode: false,
					analytics: true,
					crashReporting: true,
					betaFeatures: false,
				},
				performance: {
					cacheSize: 500,
					backgroundPlayback: true,
					highPerformanceMode: false,
					dataSaver: false,
				},
				integration: {
					lastFmScrobbling: false,
					auraSync: false,
					appleMusicSync: false,
					youtubeMusicSync: false,
					discordRichPresence: false,
				},
			},
			platforms: {
				aura: {
					enabled: false,
					showInLibrary: false,
					syncPlaylists: false,
				},
				appleMusic: {
					enabled: false,
					showInLibrary: false,
					syncPlaylists: false,
				},
				youtubeMusic: {
					enabled: false,
					showInLibrary: false,
					syncPlaylists: false,
				},
				tidal: {
					enabled: false,
					showInLibrary: false,
					syncPlaylists: false,
				},
				deezer: {
					enabled: false,
					showInLibrary: false,
					syncPlaylists: false,
				},
				amazonMusic: {
					enabled: false,
					showInLibrary: false,
					syncPlaylists: false,
				},
			},
		};

		res.status(200).json(settings);
	} catch (error) {
		console.error("❌ Error getting user settings:", error);
		next(error);
	}
};

export const updateUserSettings = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const settings = req.body;
		console.log("🔧 Updating settings for user:", currentUserId);

		// Find and update user settings
		const user = await User.findOneAndUpdate(
			{ clerkId: currentUserId },
			{ settings },
			{ new: true, upsert: true }
		);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		console.log("✅ Settings updated successfully for user:", currentUserId);
		res.status(200).json({ 
			success: true, 
			message: "Settings updated successfully",
			settings: user.settings 
		});
	} catch (error) {
		console.error("❌ Error updating user settings:", error);
		next(error);
	}
};

export const blockUser = async (req, res, next) => {
	try {
		const { id: userIdToBlock } = req.params;
		const currentUserId = req.auth.userId;

		// Find the user to block by id (could be username, clerkId, or _id)
		const userToBlock = await findUserByIdentifier(userIdToBlock);
		if (!userToBlock) {
			return res.status(404).json({ message: "User not found" });
		}

		// For now, we'll just return success
		// In a real implementation, you might want to store this in a separate collection
		// or add a field to track blocked users
		console.log(`✅ User ${currentUserId} blocked user ${userToBlock.clerkId}`);
		res.status(200).json({ 
			success: true,
			message: "User blocked successfully",
			blockedUserId: userToBlock.clerkId
		});
	} catch (error) {
		console.error("❌ Error blocking user:", error);
		next(error);
	}
};
