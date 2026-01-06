import { Router } from "express";
import { sendMessage, getMessages, deleteMessage, editMessage, getConversations, deleteConversation, pinConversation, unpinConversation, archiveConversation, muteConversation, markMessagesAsRead, getUnreadCount, getTotalUnreadCount } from "../controller/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute);

router.post("/", sendMessage);
router.get("/conversations", getConversations);
router.get("/:userId", getMessages);
router.put("/:messageId", editMessage);
router.delete("/:messageId", deleteMessage);
router.delete("/conversation/:userId", deleteConversation);
router.patch("/conversations/:userId/pin", pinConversation);
router.patch("/conversations/:userId/unpin", unpinConversation);
router.patch("/conversations/:userId/archive", archiveConversation);
router.patch("/conversations/:userId/mute", muteConversation);
router.patch("/conversations/:userId/read", markMessagesAsRead);
router.get("/unread-count/:userId", getUnreadCount);
router.get("/unread-count", getTotalUnreadCount);

export default router;
