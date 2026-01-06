/**
 * Fisher-Yates shuffle algorithm for properly shuffling arrays
 * More random and unbiased compared to Array.sort(() => Math.random() - 0.5)
 * @param array The array to shuffle
 * @returns A new shuffled array
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

