import { clerkClient } from "@clerk/express";

export const protectRoute = async (req, res, next) => {
	console.log("=== PROTECT ROUTE DEBUG ===");
	console.log("Request URL:", req.url);
	console.log("Request method:", req.method);
	console.log("Auth user ID:", req.auth?.userId);
	console.log("Auth object:", req.auth);
	
	if (!req.auth.userId) {
		console.log("❌ No user ID in auth");
		return res.status(401).json({ message: "Unauthorized - you must be logged in" });
	}
	
	console.log("✅ User authenticated, proceeding...");
	next();
};

export const requireAdmin = async (req, res, next) => {
	try {
		console.log("=== ADMIN MIDDLEWARE DEBUG ===");
		console.log("User ID:", req.auth.userId);
		
		const currentUser = await clerkClient.users.getUser(req.auth.userId);
		const userEmail = currentUser.primaryEmailAddress?.emailAddress;
		console.log("Current user email:", userEmail);
		console.log("User details:", {
			id: currentUser.id,
			firstName: currentUser.firstName,
			lastName: currentUser.lastName,
			email: userEmail
		});
		
		// List of admin emails (can be extended)
		const adminEmails = [
			process.env.ADMIN_EMAIL,
			'jakariasadif@gmail.com'
		].filter(Boolean); // Remove any undefined/null values
		
		// Also check for ADMIN_EMAILS environment variable (comma-separated)
		if (process.env.ADMIN_EMAILS) {
			const additionalAdmins = process.env.ADMIN_EMAILS.split(',').map(email => email.trim());
			adminEmails.push(...additionalAdmins);
		}
		
		console.log("Admin emails:", adminEmails);
		
		const isAdmin = userEmail && adminEmails.includes(userEmail.toLowerCase());
		console.log("Is admin:", isAdmin);

		if (!isAdmin) {
			console.log("❌ User is not admin");
			return res.status(403).json({ message: "Unauthorized - you must be an admin" });
		}

		console.log("✅ User is admin, proceeding...");
		next();
	} catch (error) {
		console.error("❌ Error in requireAdmin middleware:", error);
		next(error);
	}
};
