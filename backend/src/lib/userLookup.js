import { User } from "../models/user.model.js";
import mongoose from "mongoose";

/**
 * Find user by clerkId, _id, or handle (username)
 * @param {string} identifier - The identifier to search for
 * @returns {Promise<Object|null>} - The user object or null if not found
 */
export const findUserByIdentifier = async (identifier) => {
	// First, try to find by handle (username) as it's most user-friendly
	let user = await User.findOne({ handle: identifier });
	
	// If not found by handle, try to find by clerkId
	if (!user) {
		user = await User.findOne({ clerkId: identifier });
	}
	
	// If still not found, check if identifier is a valid ObjectId before using findById
	if (!user && mongoose.Types.ObjectId.isValid(identifier)) {
		user = await User.findById(identifier);
	}
	
	return user;
};
