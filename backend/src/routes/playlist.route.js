import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
	searchPlaylists,
	getAllPlaylists,
	getPlaylistById,
	createPlaylist,
	getLikedSongsPlaylist,
	addSongToPlaylist,
	removeSongFromPlaylist,
	updatePlaylist,
	deletePlaylist,
	likePlaylist,
	unlikePlaylist,
	checkPlaylistLikeStatus,
	getLikedPlaylists
} from "../controller/playlist.controller.js";

const router = Router();

// Search playlists
router.get("/search", searchPlaylists);

// Get all playlists
router.get("/", protectRoute, getAllPlaylists);

// Get liked playlists (playlists in user's library)
router.get("/liked", protectRoute, getLikedPlaylists);

// Get liked songs playlist (must be before ":id" to avoid route conflicts)
router.get("/liked-songs", protectRoute, getLikedSongsPlaylist);

// Get playlist by ID
router.get("/:id", protectRoute, getPlaylistById);

// Create playlist
router.post("/", protectRoute, createPlaylist);

// Update playlist
router.put("/:playlistId", protectRoute, updatePlaylist);

// Delete playlist
router.delete("/:playlistId", protectRoute, deletePlaylist);

// Add song to playlist
router.post("/:playlistId/songs", protectRoute, addSongToPlaylist);

// Remove song from playlist
router.delete("/:playlistId/songs/:songId", protectRoute, removeSongFromPlaylist);

// Like a playlist (add to library)
router.post("/:playlistId/like", protectRoute, likePlaylist);

// Unlike a playlist (remove from library)
router.delete("/:playlistId/like", protectRoute, unlikePlaylist);

// Check playlist like status
router.get("/:playlistId/like", protectRoute, checkPlaylistLikeStatus);

export default router;
