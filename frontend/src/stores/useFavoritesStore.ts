import { create } from 'zustand';
import { axiosInstance } from '@/lib/axios';
import toast from 'react-hot-toast';
import { usePlaylistStore } from './usePlaylistStore';
import { favoritesEvents } from '@/lib/favoritesEvents';

interface FavoriteItem {
	_id: string;
	type: 'song' | 'album' | 'artist';
	itemId: string;
	title: string;
	artist?: string;
	imageUrl?: string;
	metadata?: any;
	addedAt: string;
}

interface FavoriteStats {
	totalFavorites: number;
	songs: number;
	albums: number;
	artists: number;
}

interface FavoritesStore {
	// State
	favorites: FavoriteItem[];
	stats: FavoriteStats | null;
	isLoading: boolean;
	error: string | null;

	// Actions
	addToFavorites: (type: 'song' | 'album' | 'artist', itemId: string, title: string, artist?: string, imageUrl?: string, metadata?: any) => Promise<void>;
	removeFromFavorites: (itemId: string) => Promise<void>;
	checkFavoriteStatus: (itemId: string) => Promise<boolean>;
	getFavorites: (type?: 'song' | 'album' | 'artist', limit?: number, page?: number) => Promise<void>;
	getFavoriteStats: () => Promise<void>;
	getFavoriteCount: (itemId: string) => Promise<number>;
	clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
	// Initial state
	favorites: [],
	stats: null,
	isLoading: false,
	error: null,

	// Add item to favorites
	addToFavorites: async (type, itemId, title, artist, imageUrl, metadata) => {
		try {
			set({ isLoading: true, error: null });
			
			console.log("🔍 Adding to favorites:", { type, itemId, title, artist });
			
			const response = await axiosInstance.post('/favorites', {
				type,
				itemId,
				title,
				artist,
				imageUrl,
				metadata
			});

			// Add to local state
			const newFavorite: FavoriteItem = {
				_id: response.data.favorite._id,
				type,
				itemId,
				title,
				artist,
				imageUrl,
				metadata,
				addedAt: response.data.favorite.createdAt
			};

			set(state => ({
				favorites: [newFavorite, ...state.favorites],
				isLoading: false
			}));

			// Emit event to notify other components
			favoritesEvents.emit();

			// If it's a song, also add to liked songs playlist
			if (type === 'song') {
				try {
					const songData = {
						_id: itemId,
						title,
						artist: artist || '',
						imageUrl: imageUrl || '',
						audioUrl: metadata?.audioUrl || '',
						duration: metadata?.duration || 0,
						genre: metadata?.genre || '',
						albumId: metadata?.albumId || null
					};
					
					// Add to liked songs playlist
					const playlistStore = usePlaylistStore.getState();
					await playlistStore.addToLikedSongs(songData);
					console.log('✅ Song added to Liked Songs playlist');
					
					// Force refresh the liked songs playlist to ensure UI updates
					setTimeout(() => {
						playlistStore.getLikedSongsPlaylist();
						// Emit event again to ensure all components are updated
						favoritesEvents.emit();
					}, 100);
				} catch (error) {
					console.error('❌ Error adding song to Liked Songs playlist:', error);
				}
			}

			// Update stats
			await get().getFavoriteStats();
			
			toast.success('Added to favorites!');
		} catch (error: any) {
			set({ 
				error: error.response?.data?.message || 'Failed to add to favorites',
				isLoading: false 
			});
			toast.error(error.response?.data?.message || 'Failed to add to favorites');
		}
	},

	// Remove item from favorites
	removeFromFavorites: async (itemId) => {
		try {
			set({ isLoading: true, error: null });
			
			console.log("🔍 Removing favorite with itemId:", itemId);
			await axiosInstance.delete(`/favorites/${itemId}`);

			// Get the favorite item before removing it to check if it's a song
			const favoriteToRemove = get().favorites.find(fav => fav.itemId === itemId);

			// Remove from local state
			set(state => ({
				favorites: state.favorites.filter(fav => fav.itemId !== itemId),
				isLoading: false
			}));

			// Emit event to notify other components
			favoritesEvents.emit();

			// If it was a song, also remove from liked songs playlist
			if (favoriteToRemove && favoriteToRemove.type === 'song') {
				try {
					const playlistStore = usePlaylistStore.getState();
					await playlistStore.removeFromLikedSongs(itemId);
					console.log('✅ Song removed from Liked Songs playlist');
					
					// Force refresh the liked songs playlist to ensure UI updates
					setTimeout(() => {
						playlistStore.getLikedSongsPlaylist();
						// Emit event again to ensure all components are updated
						favoritesEvents.emit();
					}, 100);
				} catch (error) {
					console.error('❌ Error removing song from Liked Songs playlist:', error);
				}
			}

			// Update stats
			await get().getFavoriteStats();
			
			toast.success('Removed from favorites');
		} catch (error: any) {
			set({ 
				error: error.response?.data?.message || 'Failed to remove from favorites',
				isLoading: false 
			});
			toast.error(error.response?.data?.message || 'Failed to remove from favorites');
		}
	},

	// Check if item is favorited
	checkFavoriteStatus: async (itemId) => {
		try {
			const response = await axiosInstance.get(`/favorites/status/${itemId}`);
			return response.data.isFavorited;
		} catch (error: any) {
			console.error('Error checking favorite status:', error);
			return false;
		}
	},

	// Get user's favorites
	getFavorites: async (type, limit = 20, page = 1) => {
		try {
			set({ isLoading: true, error: null });
			
			const params = new URLSearchParams();
			if (type) params.append('type', type);
			if (limit) params.append('limit', limit.toString());
			if (page) params.append('page', page.toString());

			console.log("🔍 Fetching favorites with params:", params.toString());
			const response = await axiosInstance.get(`/favorites?${params}`);
			
			console.log("🔍 Favorites response:", response.data);
			
			set({
				favorites: response.data.favorites,
				isLoading: false
			});
		} catch (error: any) {
			set({ 
				error: error.response?.data?.message || 'Failed to fetch favorites',
				isLoading: false 
			});
		}
	},

	// Get favorite stats
	getFavoriteStats: async () => {
		try {
			const response = await axiosInstance.get('/favorites/stats');
			set({ stats: response.data.stats });
		} catch (error: any) {
			console.error('Error fetching favorite stats:', error);
		}
	},

	// Get favorite count for an item
	getFavoriteCount: async (itemId) => {
		try {
			const response = await axiosInstance.get(`/favorites/count/${itemId}`);
			return response.data.count;
		} catch (error: any) {
			console.error('Error fetching favorite count:', error);
			return 0;
		}
	},

	// Clear favorites
	clearFavorites: () => {
		console.log("🔍 Clearing favorites");
		set({
			favorites: [],
			stats: null,
			error: null,
			isLoading: false
		});
	}
}));
