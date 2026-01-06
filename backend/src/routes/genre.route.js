import express from "express";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import {
	getAllGenres,
	getGenreById,
	createGenre,
	updateGenre,
	deleteGenre,
	searchGenres,
	getGenreStats,
	getPopularGenres,
	getGenresByMood,
	updateGenreStats
} from "../controller/genre.controller.js";

const router = express.Router();

// Public routes
router.get("/", getAllGenres);
router.get("/popular", getPopularGenres);
router.get("/mood/:mood", getGenresByMood);
router.get("/search", searchGenres);
router.get("/:id", getGenreById);
router.get("/:id/stats", getGenreStats);

// Protected routes (admin only)
router.post("/", protectRoute, requireAdmin, createGenre);
router.put("/:id", protectRoute, requireAdmin, updateGenre);
router.delete("/:id", protectRoute, requireAdmin, deleteGenre);
router.post("/update-stats", protectRoute, requireAdmin, updateGenreStats);

export default router;
