import { User } from "../models/user.model.js";
import { FriendRequest } from "../models/friendRequest.model.js";
import { Friendship } from "../models/friendship.model.js";
import { Follow } from "../models/follow.model.js";
import { findUserByIdentifier } from "../lib/userLookup.js";
import { createNotification } from "./notification.controller.js";

// Send friend request
export const sendFriendRequest = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { receiverId } = req.params;
		const { message } = req.body;

		// Find the receiver by receiverId (could be username, clerkId, or _id)
		const receiver = await findUserByIdentifier(receiverId);
		if (!receiver) {
			return res.status(404).json({ message: "User not found" });
		}

		// Check if trying to send request to self
		if (currentUserId === receiver.clerkId) {
			return res.status(400).json({ message: "Cannot send friend request to yourself" });
		}

		// Check if already friends
		const existingFriendship = await Friendship.findOne({
			$or: [
				{ user1Id: currentUserId, user2Id: receiver.clerkId },
				{ user1Id: receiver.clerkId, user2Id: currentUserId }
			]
		});

		if (existingFriendship) {
			return res.status(400).json({ message: "Already friends" });
		}

		// Check if friend request already exists (in any direction)
		const existingRequests = await FriendRequest.find({
			$or: [
				{ senderId: currentUserId, receiverId: receiver.clerkId },
				{ senderId: receiver.clerkId, receiverId: currentUserId }
			]
		});

		// If there are multiple requests, clean up duplicates first
		if (existingRequests.length > 1) {
			console.log(`🧹 Found ${existingRequests.length} duplicate requests, cleaning up...`);
			// Keep the most recent one, delete others
			existingRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
			const keepRequest = existingRequests[0];
			const removeRequests = existingRequests.slice(1);
			
			for (const request of removeRequests) {
				await FriendRequest.findByIdAndDelete(request._id);
			}
			existingRequests.length = 1;
			existingRequests[0] = keepRequest;
		}

		if (existingRequests.length > 0) {
			const existingRequest = existingRequests[0];
			if (existingRequest.status === 'pending') {
				return res.status(400).json({ message: "Friend request already exists" });
			}
			// If there's a rejected or accepted request, delete it and allow new request
			if (existingRequest.status === 'rejected' || existingRequest.status === 'accepted') {
				await FriendRequest.findByIdAndDelete(existingRequest._id);
			}
		}

		// Create friend request
		const friendRequest = new FriendRequest({
			senderId: currentUserId,
			receiverId: receiver.clerkId,
			message: message || ""
		});

		try {
			await friendRequest.save();
		} catch (error) {
			if (error.code === 11000) {
				// Duplicate key error - clean up and retry
				console.log("🧹 Duplicate key error detected, cleaning up...");
				await FriendRequest.deleteMany({
					$or: [
						{ senderId: currentUserId, receiverId: receiver.clerkId },
						{ senderId: receiver.clerkId, receiverId: currentUserId }
					]
				});
				// Retry saving
				await friendRequest.save();
			} else {
				throw error;
			}
		}

		// Get sender info for notification
		const sender = await User.findOne({ clerkId: currentUserId });
		const senderName = sender ? sender.fullName : 'Someone';

		// Create notification for the receiver
		await createNotification(
			receiver.clerkId,
			'friend_request',
			'New Friend Request',
			`${senderName} sent you a friend request`,
			{ requestId: friendRequest._id, senderId: currentUserId },
			currentUserId
		);

		res.status(201).json({
			message: "Friend request sent successfully",
			friendRequest
		});
	} catch (error) {
		next(error);
	}
};

// Accept friend request
export const acceptFriendRequest = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { requestId } = req.params;

		// Find the friend request
		const friendRequest = await FriendRequest.findById(requestId);
		if (!friendRequest) {
			return res.status(404).json({ message: "Friend request not found" });
		}

		// Check if current user is the receiver
		if (friendRequest.receiverId !== currentUserId) {
			return res.status(403).json({ message: "Not authorized to accept this request" });
		}

		// Check if request is pending
		if (friendRequest.status !== 'pending') {
			return res.status(400).json({ message: "Friend request is not pending" });
		}

		// Update request status
		friendRequest.status = 'accepted';
		await friendRequest.save();

		// Create friendship (store smaller clerkId first)
		const user1Id = friendRequest.senderId < friendRequest.receiverId 
			? friendRequest.senderId 
			: friendRequest.receiverId;
		const user2Id = friendRequest.senderId < friendRequest.receiverId 
			? friendRequest.receiverId 
			: friendRequest.senderId;

		const friendship = new Friendship({
			user1Id,
			user2Id
		});
		await friendship.save();

		// Update friend counts for both users
		await User.updateMany(
			{ clerkId: { $in: [friendRequest.senderId, friendRequest.receiverId] } },
			{ $inc: { friendCount: 1 } }
		);

		// Get receiver info for notification
		const receiver = await User.findOne({ clerkId: currentUserId });
		const receiverName = receiver ? receiver.fullName : 'Someone';

		// Create notification for the sender
		await createNotification(
			friendRequest.senderId,
			'friend_request_accepted',
			'Friend Request Accepted',
			`${receiverName} accepted your friend request`,
			{ requestId: friendRequest._id, receiverId: currentUserId },
			currentUserId
		);

		res.status(200).json({
			message: "Friend request accepted",
			friendship
		});
	} catch (error) {
		next(error);
	}
};

// Reject friend request
export const rejectFriendRequest = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { requestId } = req.params;

		// Find the friend request
		const friendRequest = await FriendRequest.findById(requestId);
		if (!friendRequest) {
			return res.status(404).json({ message: "Friend request not found" });
		}

		// Check if current user is the receiver
		if (friendRequest.receiverId !== currentUserId) {
			return res.status(403).json({ message: "Not authorized to reject this request" });
		}

		// Update request status
		friendRequest.status = 'rejected';
		await friendRequest.save();

		res.status(200).json({
			message: "Friend request rejected"
		});
	} catch (error) {
		next(error);
	}
};

// Cancel friend request
export const cancelFriendRequest = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { requestId } = req.params;

		// Find the friend request
		const friendRequest = await FriendRequest.findById(requestId);
		if (!friendRequest) {
			return res.status(404).json({ message: "Friend request not found" });
		}

		// Check if current user is the sender
		if (friendRequest.senderId !== currentUserId) {
			return res.status(403).json({ message: "Not authorized to cancel this request" });
		}

		// Delete the request
		await FriendRequest.findByIdAndDelete(requestId);

		res.status(200).json({
			message: "Friend request cancelled"
		});
	} catch (error) {
		next(error);
	}
};

// Remove friend
export const removeFriend = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { friendId } = req.params;

		// Find the user by friendId (could be username, clerkId, or _id)
		const friendUser = await findUserByIdentifier(friendId);
		if (!friendUser) {
			return res.status(404).json({ message: "User not found" });
		}

		// Find the friendship using the actual clerkId
		const friendship = await Friendship.findOne({
			$or: [
				{ user1Id: currentUserId, user2Id: friendUser.clerkId },
				{ user1Id: friendUser.clerkId, user2Id: currentUserId }
			]
		});

		if (!friendship) {
			return res.status(404).json({ message: "Friendship not found" });
		}

		// Delete the friendship
		await Friendship.findByIdAndDelete(friendship._id);

		// Clean up any existing friend requests between these users
		await FriendRequest.deleteMany({
			$or: [
				{ senderId: currentUserId, receiverId: friendUser.clerkId },
				{ senderId: friendUser.clerkId, receiverId: currentUserId }
			]
		});

		// Update friend counts for both users
		await User.updateMany(
			{ clerkId: { $in: [currentUserId, friendUser.clerkId] } },
			{ $inc: { friendCount: -1 } }
		);

		res.status(200).json({
			message: "Friend removed"
		});
	} catch (error) {
		next(error);
	}
};

// Get friend requests (received)
export const getFriendRequests = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;

		const friendRequests = await FriendRequest.find({
			receiverId: currentUserId,
			status: 'pending'
		}).lean();

		// Manually fetch user data for each request
		const transformedRequests = await Promise.all(
			friendRequests.map(async (request) => {
				const sender = await User.findOne(
					{ clerkId: request.senderId },
					'clerkId fullName imageUrl handle isArtist artistName isVerified'
				).lean();

				return {
					...request,
					sender: sender,
					receiver: null
				};
			})
		);

		res.status(200).json({
			friendRequests: transformedRequests
		});
	} catch (error) {
		next(error);
	}
};

// Get sent friend requests
export const getSentFriendRequests = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;

		const sentRequests = await FriendRequest.find({
			senderId: currentUserId,
			status: 'pending'
		}).lean();

		// Manually fetch user data for each request
		const transformedRequests = await Promise.all(
			sentRequests.map(async (request) => {
				const receiver = await User.findOne(
					{ clerkId: request.receiverId },
					'clerkId fullName imageUrl handle isArtist artistName isVerified'
				).lean();

				return {
					...request,
					sender: null,
					receiver: receiver
				};
			})
		);

		res.status(200).json({
			sentRequests: transformedRequests
		});
	} catch (error) {
		next(error);
	}
};

// Get friends list
export const getFriendsList = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;

		// Find all friendships where current user is involved
		const friendships = await Friendship.find({
			$or: [
				{ user1Id: currentUserId },
				{ user2Id: currentUserId }
			]
		});

		// Get the other user's ID from each friendship
		const friendIds = friendships.map(friendship => 
			friendship.user1Id === currentUserId ? friendship.user2Id : friendship.user1Id
		);

		// Get friend details
		const friends = await User.find({
			clerkId: { $in: friendIds }
		}).select('clerkId fullName imageUrl handle isArtist artistName isVerified');

		res.status(200).json({
			friends
		});
	} catch (error) {
		next(error);
	}
};

// Check friendship status
export const checkFriendshipStatus = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { userId } = req.params;

		// Find the user by userId (could be username, clerkId, or _id)
		const targetUser = await findUserByIdentifier(userId);
		if (!targetUser) {
			return res.status(404).json({ message: "User not found" });
		}

		// Check if they are friends
		const friendship = await Friendship.findOne({
			$or: [
				{ user1Id: currentUserId, user2Id: targetUser.clerkId },
				{ user1Id: targetUser.clerkId, user2Id: currentUserId }
			]
		});

		// Check if there's a pending friend request
		const sentRequest = await FriendRequest.findOne({
			senderId: currentUserId,
			receiverId: targetUser.clerkId,
			status: 'pending'
		});

		const receivedRequest = await FriendRequest.findOne({
			senderId: targetUser.clerkId,
			receiverId: currentUserId,
			status: 'pending'
		});

		let status = 'none';
		if (friendship) {
			status = 'friends';
		} else if (sentRequest) {
			status = 'request_sent';
		} else if (receivedRequest) {
			status = 'request_received';
		}

		res.status(200).json({
			status,
			requestId: sentRequest?._id || receivedRequest?._id
		});
	} catch (error) {
		next(error);
	}
};
