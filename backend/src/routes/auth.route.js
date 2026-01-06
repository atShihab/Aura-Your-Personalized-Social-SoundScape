import { Router } from "express";
import { authCallback, handleWebhook } from "../controller/auth.controller.js";

const router = Router();

router.post("/callback", authCallback);
router.post("/webhook", handleWebhook);

export default router;
