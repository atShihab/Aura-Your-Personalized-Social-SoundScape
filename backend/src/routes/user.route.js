import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
	getAllUsers, 
	getMessages, 
	deleteUser,
	getUserProfile,
	updateUserProfile,
	followUser,
	unfollowUser,
	getUserStats,
	getUserPlaylists,
	getUserFavorites,
	getUserListeningHistory,
	getUserSettings,
	updateUserSettings,
	searchUsers,
	blockUser
} from "../controller/user.controller.js";

const router = Router();

// Existing routes
router.get("/", protectRoute, getAllUsers);
router.get("/messages/:userId", protectRoute, getMessages);
router.delete("/", protectRoute, deleteUser);

// Profile routes
router.get("/profile/:id", protectRoute, getUserProfile);

// Handle profile updates with optional file upload (using express-fileupload)
router.put("/profile", protectRoute, updateUserProfile);
router.post("/:id/follow", protectRoute, followUser);
router.delete("/:id/follow", protectRoute, unfollowUser);
router.get("/:id/stats", protectRoute, getUserStats);
router.get("/:id/playlists", protectRoute, getUserPlaylists);
router.get("/:id/favorites", protectRoute, getUserFavorites);
router.get("/:id/listening-history", protectRoute, getUserListeningHistory);

// Settings routes
router.get("/settings", protectRoute, getUserSettings);
router.put("/settings", protectRoute, updateUserSettings);

// Search routes
router.get("/search", protectRoute, searchUsers);

// Block user route
router.patch("/:id/block", protectRoute, blockUser);

export default router;
