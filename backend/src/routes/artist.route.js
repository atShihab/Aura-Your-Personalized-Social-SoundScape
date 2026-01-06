import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import {
        getAllArtists,
        getArtistProfile,
        createOrUpdateArtistProfile,
        submitVerification,
        getVerificationStatus,
        updateVerificationStatus,
        searchArtists,
        searchArtistsAutocomplete,
        uploadSong
} from "../controller/artist.controller.js";

const router = Router();

// Public routes (no authentication required)
router.get("/", getAllArtists);
router.get("/search", searchArtists);
router.get("/autocomplete", searchArtistsAutocomplete);

// Protected routes (authentication required)
router.get("/check", protectRoute, async (req, res) => {
	try {
		// Import User model here to avoid circular imports
		const { User } = await import("../models/user.model.js");
		
		const clerkId = req.auth.userId;
		console.log("🎤 Artist check - Clerk ID:", clerkId);
		
		// Find user in database by Clerk ID
		const user = await User.findOne({ clerkId: clerkId });
		console.log("🎤 Artist check - Found user:", {
			clerkId: user?.clerkId,
			fullName: user?.fullName,
			isArtist: user?.isArtist,
			isVerified: user?.isVerified,
			verificationStatus: user?.verificationStatus
		});
		
		if (!user) {
			console.log("❌ User not found in database");
			return res.json({
				status: "success",
				isArtist: false,
				message: "User not found in database"
			});
		}
		
		// User is considered an artist if they have isArtist: true OR isVerified: true OR verificationStatus: 'approved'
		const isArtist = user.isArtist === true || user.isVerified === true || user.verificationStatus === 'approved';
		
		console.log("🎤 Artist check - Final result:", {
			isArtist: user.isArtist,
			isVerified: user.isVerified,
			verificationStatus: user.verificationStatus,
			finalResult: isArtist
		});
		
		res.json({
			status: "success",
			isArtist: isArtist,
			userId: user.clerkId
		});
	} catch (error) {
		console.error("❌ Artist check error:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to check artist status",
			error: error.message
		});
	}
});
router.post("/profile", protectRoute, createOrUpdateArtistProfile);
router.post("/verify", protectRoute, submitVerification);
router.get("/verification/status", protectRoute, getVerificationStatus);
router.post("/songs", protectRoute, uploadSong);

// Public route for getting artist profile by ID (must be after /check route)
router.get("/:id", getArtistProfile);

// Admin routes (admin authentication required)
router.put("/verification/:userId", protectRoute, requireAdmin, updateVerificationStatus);

export default router;
