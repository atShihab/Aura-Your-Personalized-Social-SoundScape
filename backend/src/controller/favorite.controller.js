import { Favorite } from "../models/favorite.model.js";
import { User } from "../models/user.model.js";
import { Playlist } from "../models/playlist.model.js";

// Add item to favorites
export const addToFavorites = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { type, itemId, title, artist, imageUrl, metadata } = req.body;

		console.log("🔍 Add to favorites - User ID:", currentUserId);
		console.log("🔍 Add to favorites - Type:", type, "Item ID:", itemId);

		// Validate type
		if (!['song', 'album', 'artist'].includes(type)) {
			return res.status(400).json({ message: "Invalid favorite type" });
		}

		// Check if already favorited
		const existingFavorite = await Favorite.findOne({
			userId: currentUserId,
			itemId: itemId
		});

		if (existingFavorite) {
			return res.status(400).json({ message: "Item is already in favorites" });
		}

		// Create new favorite
		const favorite = new Favorite({
			userId: currentUserId,
			type,
			itemId,
			title,
			artist,
			imageUrl,
			metadata: metadata || {}
		});

		await favorite.save();

		// If it's a song, also add to liked songs playlist
		if (type === 'song') {
			try {
				let likedSongsPlaylist = await Playlist.findOne({
					creator: currentUserId,
					isLikedSongs: true
				});

				// Create liked songs playlist if it doesn't exist
				if (!likedSongsPlaylist) {
					likedSongsPlaylist = new Playlist({
						creator: currentUserId,
						name: 'Liked Songs',
						description: 'Your favorite songs',
						isPublic: false,
						isLikedSongs: true,
						songs: [],
						songCount: 0
					});
				}

				// Add song to playlist if not already there
				if (!likedSongsPlaylist.songs.includes(itemId)) {
					likedSongsPlaylist.songs.push(itemId);
					likedSongsPlaylist.songCount = likedSongsPlaylist.songs.length;
					await likedSongsPlaylist.save();
					console.log(`✅ Song ${itemId} added to Liked Songs playlist`);
				}
			} catch (error) {
				console.error("Error adding song to Liked Songs playlist:", error);
				// Don't fail the request if this fails
			}
		}

		res.status(201).json({
			message: "Added to favorites successfully",
			favorite
		});
	} catch (error) {
		next(error);
	}
};

// Remove item from favorites
export const removeFromFavorites = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { itemId } = req.params;

		console.log("🔍 Remove from favorites - User ID:", currentUserId);
		console.log("🔍 Remove from favorites - Item ID:", itemId);

		const favorite = await Favorite.findOneAndDelete({
			userId: currentUserId,
			itemId: itemId
		});

		console.log("🔍 Found favorite to delete:", favorite);

		if (!favorite) {
			console.log("❌ Favorite not found for user:", currentUserId, "item:", itemId);
			return res.status(404).json({ message: "Favorite not found" });
		}

		// If it was a song, also remove from liked songs playlist
		if (favorite.type === 'song') {
			try {
				const likedSongsPlaylist = await Playlist.findOne({
					creator: currentUserId,
					isLikedSongs: true
				});

				if (likedSongsPlaylist) {
					// Remove song from playlist
					likedSongsPlaylist.songs = likedSongsPlaylist.songs.filter(
						song => song.toString() !== itemId
					);
					likedSongsPlaylist.songCount = likedSongsPlaylist.songs.length;
					await likedSongsPlaylist.save();
					console.log(`✅ Song ${itemId} removed from Liked Songs playlist`);
				}
			} catch (error) {
				console.error("Error removing song from Liked Songs playlist:", error);
				// Don't fail the request if this fails
			}
		}

		res.status(200).json({
			message: "Removed from favorites successfully"
		});
	} catch (error) {
		next(error);
	}
};

// Get user's favorites
export const getFavorites = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { type, limit = 20, page = 1 } = req.query;

		console.log("🔍 Get favorites - User ID:", currentUserId);
		console.log("🔍 Get favorites - Type:", type);

		let query = { userId: currentUserId };
		if (type && ['song', 'album', 'artist'].includes(type)) {
			query.type = type;
		}

		console.log("🔍 Get favorites - Query:", query);

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const favorites = await Favorite.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		console.log("🔍 Found favorites count:", favorites.length);

		const total = await Favorite.countDocuments(query);

		res.status(200).json({
			favorites,
			total,
			page: parseInt(page),
			limit: parseInt(limit),
			totalPages: Math.ceil(total / parseInt(limit))
		});
	} catch (error) {
		next(error);
	}
};

// Check if item is favorited
export const checkFavoriteStatus = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { itemId } = req.params;

		const favorite = await Favorite.findOne({
			userId: currentUserId,
			itemId: itemId
		});

		res.status(200).json({
			isFavorited: !!favorite,
			favorite: favorite || null
		});
	} catch (error) {
		next(error);
	}
};

// Get favorites count for an item
export const getFavoriteCount = async (req, res, next) => {
	try {
		const { itemId } = req.params;

		const count = await Favorite.countDocuments({ itemId });

		res.status(200).json({
			count
		});
	} catch (error) {
		next(error);
	}
};

// Get user's favorite stats
export const getFavoriteStats = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;

		const [songCount, albumCount, artistCount] = await Promise.all([
			Favorite.countDocuments({ userId: currentUserId, type: 'song' }),
			Favorite.countDocuments({ userId: currentUserId, type: 'album' }),
			Favorite.countDocuments({ userId: currentUserId, type: 'artist' })
		]);

		res.status(200).json({
			stats: {
				totalFavorites: songCount + albumCount + artistCount,
				songs: songCount,
				albums: albumCount,
				artists: artistCount
			}
		});
	} catch (error) {
		next(error);
	}
};
