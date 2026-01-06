import { Router } from "express";
import {
  createSongLegacy,
  getAllSongs,
  getFeaturedSongs,
  getMadeForYouSongs,
  getTrendingSongs,
  searchSongs,
  getSongById,
} from "../controller/song.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = Router();

router.post("/", protectRoute, requireAdmin, upload.single("song"), createSongLegacy);
router.get("/", getAllSongs); // Make this public for reading
router.get("/featured", getFeaturedSongs);
router.get("/made-for-you", getMadeForYouSongs);
router.get("/trending", getTrendingSongs);
router.get("/search", searchSongs);
router.get("/:id", getSongById); // Get single song by ID - must be after other routes

export default router;
