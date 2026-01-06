import { useEffect, useRef } from 'react';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import { usePlaylistStore } from '@/stores/usePlaylistStore';
import { favoritesEvents } from '@/lib/favoritesEvents';

export const useFavoritesSync = () => {
	const { favorites, getFavorites } = useFavoritesStore();
	const { getLikedSongsPlaylist, likedSongsPlaylist } = usePlaylistStore();
	const lastFavoritesCount = useRef(0);
	const lastLikedSongsCount = useRef(0);

	useEffect(() => {
		// Load initial data
		getFavorites();
		getLikedSongsPlaylist();
	}, [getFavorites, getLikedSongsPlaylist]);

	useEffect(() => {
		// Check if favorites count has changed
		if (favorites.length !== lastFavoritesCount.current) {
			console.log('🔄 Favorites changed, refreshing liked songs playlist...');
			lastFavoritesCount.current = favorites.length;
			
			// Refresh liked songs playlist when favorites change
			getLikedSongsPlaylist();
		}
	}, [favorites, getLikedSongsPlaylist]);

	useEffect(() => {
		// Check if liked songs playlist count has changed
		const currentLikedSongsCount = likedSongsPlaylist?.songCount || 0;
		if (currentLikedSongsCount !== lastLikedSongsCount.current) {
			console.log('🔄 Liked songs playlist changed, refreshing favorites...');
			lastLikedSongsCount.current = currentLikedSongsCount;
			
			// Refresh favorites when liked songs playlist changes
			getFavorites();
		}
	}, [likedSongsPlaylist?.songCount, getFavorites]);

	// Listen for favorites change events
	useEffect(() => {
		const unsubscribe = favoritesEvents.subscribe(() => {
			console.log('🔄 Favorites event received, refreshing liked songs playlist...');
			// Immediate refresh
			getLikedSongsPlaylist();
			// Also refresh favorites to ensure consistency
			getFavorites();
		});

		return unsubscribe;
	}, [getLikedSongsPlaylist, getFavorites]);

	// Set up periodic refresh to ensure sync (fallback)
	useEffect(() => {
		const interval = setInterval(() => {
			getLikedSongsPlaylist();
		}, 10000); // Refresh every 10 seconds as fallback

		return () => clearInterval(interval);
	}, [getLikedSongsPlaylist]);
};
