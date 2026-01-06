import { create } from 'zustand';
import { axiosInstance } from '@/lib/axios';

interface ListeningEntry {
	_id: string;
	songId: string;
	songTitle: string;
	artistName: string;
	artistId?: string;
	albumId?: string;
	albumTitle?: string;
	imageUrl?: string;
	duration: number;
	playedAt: string;
	completed: boolean;
	playCount: number;
	metadata?: any;
}

interface ListeningStats {
	totalListeningTime: number;
	totalSessions: number;
	uniqueSongs: number;
	uniqueArtists: number;
	topSongs: Array<{
		_id: string;
		count: number;
		totalTime: number;
	}>;
	topArtists: Array<{
		_id: string;
		artistName: string;
		count: number;
		totalTime: number;
	}>;
	period: string;
}

interface ListeningHistoryStore {
	// State
	history: ListeningEntry[];
	stats: ListeningStats | null;
	recentActivity: ListeningEntry[];
	isLoading: boolean;
	error: string | null;

	// Actions
	addListeningActivity: (data: {
		songId: string;
		songTitle: string;
		artistName: string;
		artistId?: string;
		albumId?: string;
		albumTitle?: string;
		imageUrl?: string;
		duration: number;
		completed?: boolean;
		playCount?: number;
		metadata?: any;
	}) => Promise<void>;
	getListeningHistory: (limit?: number, page?: number, songId?: string, artistId?: string) => Promise<void>;
	getListeningStats: (period?: 'all' | 'week' | 'month' | 'year') => Promise<void>;
	getRecentActivity: (limit?: number) => Promise<void>;
	updateListeningActivity: (entryId: string, data: { completed?: boolean; playCount?: number }) => Promise<void>;
	clearListeningHistory: () => Promise<void>;
	clearHistory: () => void;
}

export const useListeningHistoryStore = create<ListeningHistoryStore>((set, get) => ({
	// Initial state
	history: [],
	stats: null,
	recentActivity: [],
	isLoading: false,
	error: null,

	// Add listening activity
	addListeningActivity: async (data) => {
		try {
			await axiosInstance.post('/listening-history', data);
			
			// Refresh recent activity to get updated data from backend
			await get().getRecentActivity();

			// Update stats
			await get().getListeningStats();
		} catch (error: any) {
			console.error('Error adding listening activity:', error);
		}
	},

	// Get listening history
	getListeningHistory: async (limit = 20, page = 1, songId, artistId) => {
		try {
			set({ isLoading: true, error: null });
			
			const params = new URLSearchParams();
			if (limit) params.append('limit', limit.toString());
			if (page) params.append('page', page.toString());
			if (songId) params.append('songId', songId);
			if (artistId) params.append('artistId', artistId);

			const response = await axiosInstance.get(`/listening-history?${params}`);
			
			set({
				history: response.data.history,
				isLoading: false
			});
		} catch (error: any) {
			set({ 
				error: error.response?.data?.message || 'Failed to fetch listening history',
				isLoading: false 
			});
		}
	},

	// Get listening statistics
	getListeningStats: async (period = 'all') => {
		try {
			const response = await axiosInstance.get(`/listening-history/stats?period=${period}`);
			set({ stats: response.data.stats });
		} catch (error: any) {
			console.error('Error fetching listening stats:', error);
		}
	},

	// Get recent activity
	getRecentActivity: async (limit = 10) => {
		try {
			const response = await axiosInstance.get(`/listening-history/recent?limit=${limit}`);
			set({ recentActivity: response.data.recentActivity });
		} catch (error: any) {
			console.error('Error fetching recent activity:', error);
		}
	},

	// Update listening activity
	updateListeningActivity: async (entryId, data) => {
		try {
			await axiosInstance.put(`/listening-history/${entryId}`, data);
			
			// Update local state
			set(state => ({
				history: state.history.map(entry => 
					entry._id === entryId ? { ...entry, ...data } : entry
				),
				recentActivity: state.recentActivity.map(entry => 
					entry._id === entryId ? { ...entry, ...data } : entry
				)
			}));
		} catch (error: any) {
			console.error('Error updating listening activity:', error);
		}
	},

	// Clear listening history
	clearListeningHistory: async () => {
		try {
			await axiosInstance.delete('/listening-history');
			set({
				history: [],
				recentActivity: [],
				stats: null
			});
		} catch (error: any) {
			console.error('Error clearing listening history:', error);
		}
	},

	// Clear local history
	clearHistory: () => {
		set({
			history: [],
			recentActivity: [],
			stats: null,
			error: null
		});
	}
}));
