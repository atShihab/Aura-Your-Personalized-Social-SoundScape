import { User } from "../models/user.model.js";
import { Follow } from "../models/follow.model.js";

// Follow an artist
export const followArtist = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { artistId } = req.params;

		// Check if artist exists and is actually an artist
		const artist = await User.findOne({ clerkId: artistId, isArtist: true });
		if (!artist) {
			return res.status(404).json({ message: "Artist not found" });
		}

		// Check if trying to follow self
		if (currentUserId === artistId) {
			return res.status(400).json({ message: "Cannot follow yourself" });
		}

		// Check if already following
		const existingFollow = await Follow.findOne({
			followerId: currentUserId,
			followingId: artistId
		});

		if (existingFollow) {
			return res.status(400).json({ message: "Already following this artist" });
		}

		// Create follow relationship
		const follow = new Follow({
			followerId: currentUserId,
			followingId: artistId
		});
		await follow.save();

		// Update artist's follower count
		await User.findOneAndUpdate(
			{ clerkId: artistId },
			{ $inc: { followers: 1 } }
		);

		// Update current user's following count
		await User.findOneAndUpdate(
			{ clerkId: currentUserId },
			{ $inc: { following: 1 } }
		);

		res.status(201).json({
			message: "Successfully followed artist",
			follow
		});
	} catch (error) {
		next(error);
	}
};

// Unfollow an artist
export const unfollowArtist = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { artistId } = req.params;

		// Find the follow relationship
		const follow = await Follow.findOne({
			followerId: currentUserId,
			followingId: artistId
		});

		if (!follow) {
			return res.status(404).json({ message: "Follow relationship not found" });
		}

		// Delete the follow relationship
		await Follow.findByIdAndDelete(follow._id);

		// Update artist's follower count
		await User.findOneAndUpdate(
			{ clerkId: artistId },
			{ $inc: { followers: -1 } }
		);

		// Update current user's following count
		await User.findOneAndUpdate(
			{ clerkId: currentUserId },
			{ $inc: { following: -1 } }
		);

		res.status(200).json({
			message: "Successfully unfollowed artist"
		});
	} catch (error) {
		next(error);
	}
};

// Check if following an artist
export const checkFollowStatus = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { artistId } = req.params;

		const follow = await Follow.findOne({
			followerId: currentUserId,
			followingId: artistId
		});

		res.status(200).json({
			isFollowing: !!follow
		});
	} catch (error) {
		next(error);
	}
};

// Get followers list (for artists only)
export const getFollowers = async (req, res, next) => {
	try {
		const { artistId } = req.params;

		// Check if user is an artist
		const artist = await User.findOne({ clerkId: artistId, isArtist: true });
		if (!artist) {
			return res.status(404).json({ message: "Artist not found" });
		}

		const followers = await Follow.find({ followingId: artistId })
			.populate('followerId', 'clerkId fullName imageUrl handle isArtist artistName isVerified');

		res.status(200).json({
			followers: followers.map(f => f.followerId)
		});
	} catch (error) {
		next(error);
	}
};

// Get following list (for current user)
export const getFollowing = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;

		const following = await Follow.find({ followerId: currentUserId })
			.populate('followingId', 'clerkId fullName imageUrl handle isArtist artistName isVerified');

		res.status(200).json({
			following: following.map(f => f.followingId)
		});
	} catch (error) {
		next(error);
	}
};
