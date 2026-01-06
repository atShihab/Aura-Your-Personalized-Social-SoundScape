import { create } from 'zustand';
import { axiosInstance } from '@/lib/axios';
import toast from 'react-hot-toast';

interface FollowedUser {
	_id: string;
	fullName: string;
	imageUrl: string;
	handle?: string;
	isArtist?: boolean;
	artistName?: string;
	isVerified?: boolean;
}

interface FollowStore {
	// State
	following: FollowedUser[];
	followers: FollowedUser[];
	isLoading: boolean;
	
	// Actions
	followArtist: (artistId: string) => Promise<void>;
	unfollowArtist: (artistId: string) => Promise<void>;
	checkFollowStatus: (artistId: string) => Promise<boolean>;
	getFollowers: (artistId: string) => Promise<void>;
	getFollowing: () => Promise<void>;
}

export const useFollowStore = create<FollowStore>((set, get) => ({
	// Initial state
	following: [],
	followers: [],
	isLoading: false,

	// Follow artist
	followArtist: async (artistId: string) => {
		try {
			set({ isLoading: true });
			await axiosInstance.post(`/follows/${artistId}`);
			toast.success('Successfully followed artist!');
			
			// Refresh following list
			await get().getFollowing();
		} catch (error: any) {
			console.error('Error following artist:', error);
			toast.error(error.response?.data?.message || 'Failed to follow artist');
		} finally {
			set({ isLoading: false });
		}
	},

	// Unfollow artist
	unfollowArtist: async (artistId: string) => {
		try {
			set({ isLoading: true });
			await axiosInstance.delete(`/follows/${artistId}`);
			toast.success('Successfully unfollowed artist');
			
			// Refresh following list
			await get().getFollowing();
		} catch (error: any) {
			console.error('Error unfollowing artist:', error);
			toast.error(error.response?.data?.message || 'Failed to unfollow artist');
		} finally {
			set({ isLoading: false });
		}
	},

	// Check follow status
	checkFollowStatus: async (artistId: string) => {
		try {
			const response = await axiosInstance.get(`/follows/status/${artistId}`);
			return response.data.isFollowing;
		} catch (error: any) {
			console.error('Error checking follow status:', error);
			return false;
		}
	},

	// Get followers (for artists)
	getFollowers: async (artistId: string) => {
		try {
			set({ isLoading: true });
			const response = await axiosInstance.get(`/follows/followers/${artistId}`);
			set({ followers: response.data.followers });
		} catch (error: any) {
			console.error('Error getting followers:', error);
		} finally {
			set({ isLoading: false });
		}
	},

	// Get following list
	getFollowing: async () => {
		try {
			set({ isLoading: true });
			const response = await axiosInstance.get('/follows/following');
			set({ following: response.data.following });
		} catch (error: any) {
			console.error('Error getting following list:', error);
		} finally {
			set({ isLoading: false });
		}
	},
}));
