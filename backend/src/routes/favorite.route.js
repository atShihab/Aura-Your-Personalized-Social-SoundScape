import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
	addToFavorites,
	removeFromFavorites,
	getFavorites,
	checkFavoriteStatus,
	getFavoriteCount,
	getFavoriteStats
} from "../controller/favorite.controller.js";

const router = Router();

// All routes require authentication
router.use(protectRoute);

// Favorite management
router.post("/", addToFavorites);
router.delete("/:itemId", removeFromFavorites);
router.get("/", getFavorites);
router.get("/status/:itemId", checkFavoriteStatus);
router.get("/count/:itemId", getFavoriteCount);
router.get("/stats", getFavoriteStats);

export default router;
