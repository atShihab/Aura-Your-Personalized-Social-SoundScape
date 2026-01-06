/**
 * Utility functions for handling images with fallbacks
 */

/**
 * Get a fallback image URL for songs/albums
 * @param index Optional index to select a specific fallback image (1-18)
 * @returns Path to fallback image
 */
export const getFallbackImage = (index?: number): string => {
	const fallbackIndex = index ? ((index - 1) % 18) + 1 : Math.floor(Math.random() * 18) + 1;
	// Use the cover-images from public folder (Vite serves from /public)
	return `/cover-images/${fallbackIndex}.jpg`;
};

/**
 * Get image URL with fallback handling
 * @param imageUrl Original image URL from backend
 * @param fallbackIndex Optional index for fallback selection
 * @returns Image URL or fallback
 */
export const getImageUrl = (imageUrl: string | null | undefined, fallbackIndex?: number): string => {
	if (!imageUrl || imageUrl.trim() === '') {
		return getFallbackImage(fallbackIndex);
	}
	
	// If it's a Cloudinary URL or external URL, return as is
	if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
		return imageUrl;
	}
	
	// If it's a relative path, return as is
	return imageUrl;
};

/**
 * Handle image load errors by replacing with fallback
 * @param event Image error event
 * @param fallbackIndex Optional index for fallback selection
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>, fallbackIndex?: number) => {
	const target = event.currentTarget;
	// Only replace if it's not already a fallback
	if (!target.src.includes('cover-images')) {
		target.src = getFallbackImage(fallbackIndex);
	}
	target.onerror = null; // Prevent infinite loop
};
