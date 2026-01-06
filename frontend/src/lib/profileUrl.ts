/**
 * Generate a profile URL using username if available, otherwise fallback to clerkId
 * @param user - User object with clerkId and optional handle
 * @returns Profile URL string
 */
export const generateProfileUrl = (user: { clerkId: string; handle?: string }) => {
	if (user.handle) {
		return `/profile/${user.handle}`;
	}
	return `/profile/${user.clerkId}`;
};

/**
 * Navigate to a user's profile using username if available
 * @param navigate - React Router navigate function
 * @param user - User object with clerkId and optional handle
 */
export const navigateToProfile = (
	navigate: (path: string) => void,
	user: { clerkId: string; handle?: string }
) => {
	const url = generateProfileUrl(user);
	navigate(url);
};



