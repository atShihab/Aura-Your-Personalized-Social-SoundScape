import { Playlist } from "../models/playlist.model.js";
import { Song } from "../models/song.model.js";
import { User } from "../models/user.model.js";
import { clerkClient } from "@clerk/express";
import { PlaylistFavorite } from "../models/playlistFavorite.model.js";

// Search playlists
export const searchPlaylists = async (req, res, next) => {
	try {
		const { q: query, limit = 20 } = req.query;
		
		if (!query) {
			return res.status(400).json({ message: "Search query is required" });
		}

		const playlists = await Playlist.find({
			$text: { $search: query },
			isPublic: true,
			isLikedSongs: { $ne: true } // Exclude liked songs playlists from search
		})
		.populate('creator', 'fullName')
		.limit(parseInt(limit))
		.sort({ score: { $meta: "textScore" } });

		console.log(`🔍 Search results for playlists "${query}": ${playlists.length} playlists found`);
		res.json({
			playlists,
			query,
			total: playlists.length
		});
	} catch (error) {
		console.error("Search playlists error:", error);
		next(error);
	}
};

// Get all playlists for the current user
export const getAllPlaylists = async (req, res, next) => {
	try {
		const userId = req.auth.userId;
		
		const playlists = await Playlist.find({ 
			creator: userId,
			isLikedSongs: { $ne: true } // Exclude liked songs playlist from regular playlists
		}).populate('songs', 'title artist imageUrl duration genre albumId');

		res.json({
			playlists,
			total: playlists.length
		});
	} catch (error) {
		console.error("Get all playlists error:", error);
		next(error);
	}
};

// Get playlist by ID
export const getPlaylistById = async (req, res, next) => {
	try {
		const { id } = req.params;
		const userId = req.auth.userId;
		
		// First try to find playlist created by the user
		let playlist = await Playlist.findOne({ 
			_id: id, 
			creator: userId 
		}).populate('songs', 'title artist imageUrl duration genre albumId audioUrl');

		// If not found, try to find public playlists (for shared playlists)
		if (!playlist) {
			playlist = await Playlist.findOne({ 
				_id: id, 
				isPublic: true 
			}).populate('songs', 'title artist imageUrl duration genre albumId audioUrl');
		}

		if (!playlist) {
			return res.status(404).json({ message: "Playlist not found" });
		}

		// Add a flag to indicate if this is the user's own playlist
		const isOwnPlaylist = playlist.creator === userId;

		// Check if user has liked this playlist (for "Add to Library" functionality)
		let isLiked = false;
		if (!isOwnPlaylist) {
			const existingFavorite = await PlaylistFavorite.findOne({
				userId,
				playlistId: id
			});
			isLiked = !!existingFavorite;
		}

		res.json({
			playlist: {
				...playlist.toObject(),
				isOwnPlaylist,
				isLiked
			}
		});
	} catch (error) {
		console.error("Get playlist by ID error:", error);
		next(error);
	}
};

// Create a new playlist
export const createPlaylist = async (req, res, next) => {
	try {
		const userId = req.auth.userId;
		const { name, description, isPublic = true, isLikedSongs = false } = req.body;

		if (!name) {
			return res.status(400).json({ message: "Playlist name is required" });
		}

		// Get user from Clerk
		const clerkUser = await clerkClient.users.getUser(userId);
		const creatorName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Unknown User';

		const playlist = new Playlist({
			name,
			description,
			creator: userId,
			creatorName,
			isPublic,
			isLikedSongs,
			songs: [],
			songCount: 0
		});

		await playlist.save();

		res.status(201).json({
			message: "Playlist created successfully",
			playlist
		});
	} catch (error) {
		console.error("Create playlist error:", error);
		next(error);
	}
};

// Get or create liked songs playlist
export const getLikedSongsPlaylist = async (req, res, next) => {
	try {
		const userId = req.auth.userId;

		let likedSongsPlaylist = await Playlist.findOne({ 
			creator: userId, 
			isLikedSongs: true 
		}).populate({
			path: 'songs',
			select: 'title artist imageUrl duration genre albumId audioUrl',
			populate: {
				path: 'albumId',
				select: 'title'
			}
		});


		if (!likedSongsPlaylist) {
			// Create liked songs playlist if it doesn't exist
			const clerkUser = await clerkClient.users.getUser(userId);
			const creatorName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Unknown User';

			likedSongsPlaylist = new Playlist({
				name: 'Liked Songs',
				description: 'Your favorite songs',
				creator: userId,
				creatorName,
				isPublic: false,
				isLikedSongs: true,
				songs: [],
				songCount: 0
			});

			await likedSongsPlaylist.save();
		}

		res.json({
			playlist: likedSongsPlaylist
		});
	} catch (error) {
		console.error("Get liked songs playlist error:", error);
		next(error);
	}
};

// Add song to playlist
export const addSongToPlaylist = async (req, res, next) => {
	try {
		const { playlistId } = req.params;
		const { songId, title, artist, imageUrl, audioUrl, duration, genre, albumId } = req.body;
		const userId = req.auth.userId;

		const playlist = await Playlist.findOne({ _id: playlistId, creator: userId });
		if (!playlist) {
			return res.status(404).json({ message: "Playlist not found" });
		}

		// Check if song already exists in playlist
		const existingSong = playlist.songs.find(song => song.toString() === songId);
		if (existingSong) {
			return res.status(400).json({ message: "Song already in playlist" });
		}

		// Verify the song exists
		const song = await Song.findById(songId);
		if (!song) {
			return res.status(404).json({ message: "Song not found" });
		}

		// Add song to playlist
		playlist.songs.push(songId);
		playlist.songCount = playlist.songs.length;
		await playlist.save();

		// Populate songs for response
		await playlist.populate('songs', 'title artist imageUrl duration genre albumId audioUrl');

		res.json({
			message: "Song added to playlist successfully",
			songs: playlist.songs
		});
	} catch (error) {
		console.error("Add song to playlist error:", error);
		next(error);
	}
};

// Remove song from playlist
export const removeSongFromPlaylist = async (req, res, next) => {
	try {
		const { playlistId, songId } = req.params;
		const userId = req.auth.userId;

		const playlist = await Playlist.findOne({ _id: playlistId, creator: userId });
		if (!playlist) {
			return res.status(404).json({ message: "Playlist not found" });
		}

		// Remove song from playlist
		playlist.songs = playlist.songs.filter(song => song.toString() !== songId);
		playlist.songCount = playlist.songs.length;
		await playlist.save();

		res.json({
			message: "Song removed from playlist successfully"
		});
	} catch (error) {
		console.error("Remove song from playlist error:", error);
		next(error);
	}
};

// Update playlist
export const updatePlaylist = async (req, res, next) => {
	try {
		const { playlistId } = req.params;
		const { name, description, isPublic } = req.body;
		const userId = req.auth.userId;

		const playlist = await Playlist.findOne({ _id: playlistId, creator: userId });
		if (!playlist) {
			return res.status(404).json({ message: "Playlist not found" });
		}

		if (name) playlist.name = name;
		if (description !== undefined) playlist.description = description;
		if (isPublic !== undefined) playlist.isPublic = isPublic;

		await playlist.save();

		res.json({
			message: "Playlist updated successfully",
			playlist
		});
	} catch (error) {
		console.error("Update playlist error:", error);
		next(error);
	}
};

// Delete playlist
export const deletePlaylist = async (req, res, next) => {
	try {
		const { playlistId } = req.params;
		const userId = req.auth.userId;

		const playlist = await Playlist.findOne({ _id: playlistId, creator: userId });
		if (!playlist) {
			return res.status(404).json({ message: "Playlist not found" });
		}

		// Don't allow deletion of liked songs playlist
		if (playlist.isLikedSongs) {
			return res.status(400).json({ message: "Cannot delete liked songs playlist" });
		}

		await Playlist.findByIdAndDelete(playlistId);

		res.json({
			message: "Playlist deleted successfully"
		});
	} catch (error) {
		console.error("Delete playlist error:", error);
		next(error);
	}
};

// Like a playlist (add to user's library)
export const likePlaylist = async (req, res, next) => {
	try {
		const { playlistId } = req.params;
		const userId = req.auth.userId;

		// Check if playlist exists and is public
		const playlist = await Playlist.findById(playlistId);
		if (!playlist) {
			return res.status(404).json({ message: "Playlist not found" });
		}

		if (!playlist.isPublic) {
			return res.status(403).json({ message: "Cannot like private playlist" });
		}

		// Check if user already liked this playlist
		const existingFavorite = await PlaylistFavorite.findOne({
			userId,
			playlistId
		});

		if (existingFavorite) {
			return res.status(400).json({ message: "Playlist already liked" });
		}

		// Add to favorites
		const playlistFavorite = new PlaylistFavorite({
			userId,
			playlistId
		});

		await playlistFavorite.save();

		// Update playlist followers count
		playlist.followers = playlist.followers + 1;
		await playlist.save();

		res.status(201).json({
			message: "Playlist added to library successfully",
			favorite: playlistFavorite
		});
	} catch (error) {
		console.error("Like playlist error:", error);
		next(error);
	}
};

// Unlike a playlist (remove from user's library)
export const unlikePlaylist = async (req, res, next) => {
	try {
		const { playlistId } = req.params;
		const userId = req.auth.userId;

		// Find and remove the favorite
		const playlistFavorite = await PlaylistFavorite.findOneAndDelete({
			userId,
			playlistId
		});

		if (!playlistFavorite) {
			return res.status(404).json({ message: "Playlist not found in library" });
		}

		// Update playlist followers count
		const playlist = await Playlist.findById(playlistId);
		if (playlist) {
			playlist.followers = Math.max(0, playlist.followers - 1);
			await playlist.save();
		}

		res.json({
			message: "Playlist removed from library successfully"
		});
	} catch (error) {
		console.error("Unlike playlist error:", error);
		next(error);
	}
};

// Check if user has liked a playlist
export const checkPlaylistLikeStatus = async (req, res, next) => {
	try {
		const { playlistId } = req.params;
		const userId = req.auth.userId;

		const playlistFavorite = await PlaylistFavorite.findOne({
			userId,
			playlistId
		});

		res.json({
			isLiked: !!playlistFavorite
		});
	} catch (error) {
		console.error("Check playlist like status error:", error);
		next(error);
	}
};

// Get user's liked playlists (playlists in their library)
export const getLikedPlaylists = async (req, res, next) => {
	try {
		const userId = req.auth.userId;

		const playlistFavorites = await PlaylistFavorite.find({ userId })
			.populate('playlistId')
			.sort({ addedAt: -1 });

		const likedPlaylists = playlistFavorites
			.map(fav => fav.playlistId)
			.filter(playlist => playlist && playlist.isPublic); // Only return public playlists

		res.json({
			playlists: likedPlaylists,
			total: likedPlaylists.length
		});
	} catch (error) {
		console.error("Get liked playlists error:", error);
		next(error);
	}
};
