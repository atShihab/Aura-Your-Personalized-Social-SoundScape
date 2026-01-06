import { create } from 'zustand';
import { axiosInstance } from '@/lib/axios';

interface UserProfile {
	_id: string;
	clerkId: string;
	fullName: string;
	imageUrl: string;
	handle?: string;
	bio?: string;
	favoriteGenres?: string[];
	followers: number;
	following: number;
	isArtist?: boolean;
	artistName?: string;
	genre?: string;
	isVerified?: boolean;
	socialMedia?: {
		instagram?: string;
		twitter?: string;
		youtube?: string;
		tiktok?: string;
		website?: string;
	};
	createdAt: string;
}

interface ProfileStats {
	totalListeningTime: number;
	topGenres: string[];
	recentActivity: string;
	currentlyListening?: {
		songTitle: string;
		artistName: string;
		imageUrl: string;
	};
}

interface Playlist {
	_id: string;
	name: string;
	description?: string;
	imageUrl?: string;
	isPublic: boolean;
	isCollaborative: boolean;
	songCount: number;
	createdAt: string;
}

interface Favorite {
	_id: string;
	type: 'song' | 'album' | 'artist';
	title: string;
	artist?: string;
	imageUrl?: string;
	addedAt: string;
}

interface ListeningHistory {
	_id: string;
	songTitle: string;
	artistName: string;
	imageUrl: string;
	playedAt: string;
	duration: number;
}

interface ProfileStore {
	// State
	profile: UserProfile | null;
	stats: ProfileStats | null;
	playlists: Playlist[];
	favorites: Favorite[];
	listeningHistory: ListeningHistory[];
	isLoading: boolean;
	error: string | null;
	isFollowing: boolean;

	// Actions
	fetchProfile: (userId: string) => Promise<void>;
	fetchProfileStats: (userId: string) => Promise<void>;
	fetchPlaylists: (userId: string) => Promise<void>;
	fetchFavorites: (userId: string) => Promise<void>;
	fetchListeningHistory: (userId: string) => Promise<void>;
	updateProfile: (userId: string, data: Partial<UserProfile>) => Promise<void>;
	followUser: (userId: string) => Promise<void>;
	unfollowUser: (userId: string) => Promise<void>;
	clearProfile: () => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
	// Initial state
	profile: null,
	stats: null,
	playlists: [],
	favorites: [],
	listeningHistory: [],
	isLoading: false,
	error: null,
	isFollowing: false,

	// Actions
	fetchProfile: async (userId: string) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/users/profile/${userId}`);
			set({
				profile: response.data.user,
				isFollowing: response.data.isFollowing,
				isLoading: false
			});
		} catch (error: any) {
			set({
				error: error.response?.data?.message || 'Failed to fetch profile',
				isLoading: false
			});
		}
	},

	fetchProfileStats: async (userId: string) => {
		try {
			const response = await axiosInstance.get(`/users/${userId}/stats`);
			set({ stats: response.data });
		} catch (error: any) {
			console.error('Error fetching profile stats:', error);
			// Use mock data for now
			set({
				stats: {
					totalListeningTime: 0,
					topGenres: [],
					recentActivity: 'No recent activity'
				}
			});
		}
	},

	fetchPlaylists: async (userId: string) => {
		try {
			const response = await axiosInstance.get(`/users/${userId}/playlists`);
			set({ playlists: response.data.playlists });
		} catch (error: any) {
			console.error('Error fetching playlists:', error);
			set({ playlists: [] });
		}
	},

	fetchFavorites: async (userId: string) => {
		try {
			const response = await axiosInstance.get(`/users/${userId}/favorites`);
			set({ favorites: response.data.favorites });
		} catch (error: any) {
			console.error('Error fetching favorites:', error);
			set({ favorites: [] });
		}
	},

	fetchListeningHistory: async (userId: string) => {
		try {
			const response = await axiosInstance.get(`/users/${userId}/listening-history`);
			set({ listeningHistory: response.data.history });
		} catch (error: any) {
			console.error('Error fetching listening history:', error);
			set({ listeningHistory: [] });
		}
	},

	updateProfile: async (userId: string, data: Partial<UserProfile>) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.put(`/users/profile`, data);
			set({
				profile: response.data.user,
				isLoading: false
			});
		} catch (error: any) {
			set({
				error: error.response?.data?.message || 'Failed to update profile',
				isLoading: false
			});
		}
	},

	followUser: async (userId: string) => {
		try {
			await axiosInstance.post(`/users/${userId}/follow`);
			const { profile } = get();
			if (profile) {
				set({
					isFollowing: true,
					profile: { ...profile, followers: profile.followers + 1 }
				});
			}
		} catch (error: any) {
			set({
				error: error.response?.data?.message || 'Failed to follow user'
			});
		}
	},

	unfollowUser: async (userId: string) => {
		try {
			await axiosInstance.delete(`/users/${userId}/follow`);
			const { profile } = get();
			if (profile) {
				set({
					isFollowing: false,
					profile: { ...profile, followers: profile.followers - 1 }
				});
			}
		} catch (error: any) {
			set({
				error: error.response?.data?.message || 'Failed to unfollow user'
			});
		}
	},

	clearProfile: () => {
		set({
			profile: null,
			stats: null,
			playlists: [],
			favorites: [],
			listeningHistory: [],
			isLoading: false,
			error: null,
			isFollowing: false
		});
	},

	setLoading: (loading: boolean) => {
		set({ isLoading: loading });
	},

	setError: (error: string | null) => {
		set({ error });
	}
}));
