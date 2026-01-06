import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
	followArtist,
	unfollowArtist,
	checkFollowStatus,
	getFollowers,
	getFollowing
} from "../controller/follow.controller.js";

const router = Router();

// Follow routes
router.post("/:artistId", protectRoute, followArtist);
router.delete("/:artistId", protectRoute, unfollowArtist);
router.get("/status/:artistId", protectRoute, checkFollowStatus);
router.get("/followers/:artistId", protectRoute, getFollowers);
router.get("/following", protectRoute, getFollowing);

export default router;
