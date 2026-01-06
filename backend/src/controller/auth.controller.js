import { User } from "../models/user.model.js";
import { NotificationService } from "../lib/notificationService.js";

export const authCallback = async (req, res, next) => {
	try {
		const { id, firstName, lastName, imageUrl } = req.body;

		console.log("🔄 Auth callback received:", { id, firstName, lastName, imageUrl });

		// check if user already exists
		const user = await User.findOne({ clerkId: id });

		if (!user) {
			// Create new user
			const fullName = `${firstName || ""} ${lastName || ""}`.trim();
			console.log("👤 Creating new user with fullName:", fullName);
			
			const newUser = await User.create({
				clerkId: id,
				fullName: fullName || "Anonymous User",
				imageUrl: imageUrl || "https://via.placeholder.com/150?text=U",
			});
			
			console.log("✅ New user created:", newUser);

			// Send welcome email notification
			if (newUser.emailPreferences?.account?.signupVerification) {
				const notificationData = {
					clerkUserId: newUser.clerkId,
					userName: newUser.fullName,
					verificationLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email`
				};

				await NotificationService.sendListenerNotification('signup_verification', notificationData);
			}
		} else {
			// Update existing user if needed
			const fullName = `${firstName || ""} ${lastName || ""}`.trim();
			if (fullName && fullName !== user.fullName) {
				console.log("🔄 Updating existing user fullName:", user.fullName, "->", fullName);
				user.fullName = fullName;
				if (imageUrl) user.imageUrl = imageUrl;
				await user.save();
			}
			console.log("✅ Existing user found:", user);
		}

		res.status(200).json({ success: true, message: "User synced successfully" });
	} catch (error) {
		console.log("❌ Error in auth callback", error);
		next(error);
	}
};

export const handleWebhook = async (req, res, next) => {
	try {
		const { type, data } = req.body;
		console.log("📡 Webhook received:", { type, userId: data?.id });

		if (type === "user.deleted") {
			const userId = data.id;
			console.log("🗑️ User deletion webhook for:", userId);
			
			// Remove user from database
			const deletedUser = await User.findOneAndDelete({ clerkId: userId });
			if (deletedUser) {
				console.log("✅ User deleted from database via webhook:", deletedUser.fullName);
			}
			
			// Remove user from socket data if they're connected
			if (req.io) {
				req.io.emit("user_deleted", userId);
				console.log("📡 Emitted user_deleted event via webhook for:", userId);
			}
		}

		res.status(200).json({ success: true, message: "Webhook processed" });
	} catch (error) {
		console.error("❌ Error processing webhook:", error);
		next(error);
	}
};
