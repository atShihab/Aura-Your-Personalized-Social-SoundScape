import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
	sendFriendRequest,
	acceptFriendRequest,
	rejectFriendRequest,
	cancelFriendRequest,
	removeFriend,
	getFriendRequests,
	getSentFriendRequests,
	getFriendsList,
	checkFriendshipStatus
} from "../controller/friend.controller.js";

const router = Router();

// Friend request routes
router.post("/request/:receiverId", protectRoute, sendFriendRequest);
router.put("/request/:requestId/accept", protectRoute, acceptFriendRequest);
router.put("/request/:requestId/reject", protectRoute, rejectFriendRequest);
router.delete("/request/:requestId", protectRoute, cancelFriendRequest);

// Friendship routes
router.delete("/:friendId", protectRoute, removeFriend);
router.get("/requests", protectRoute, getFriendRequests);
router.get("/requests/sent", protectRoute, getSentFriendRequests);
router.get("/list", protectRoute, getFriendsList);
router.get("/status/:userId", protectRoute, checkFriendshipStatus);

export default router;
