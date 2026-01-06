import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
	addListeningActivity,
	getListeningHistory,
	getListeningStats,
	getRecentActivity,
	updateListeningActivity,
	clearListeningHistory
} from "../controller/listeningHistory.controller.js";

const router = Router();

// All routes require authentication
router.use(protectRoute);

// Listening history management
router.post("/", addListeningActivity);
router.get("/", getListeningHistory);
router.get("/stats", getListeningStats);
router.get("/recent", getRecentActivity);
router.put("/:entryId", updateListeningActivity);
router.delete("/", clearListeningHistory);

export default router;
