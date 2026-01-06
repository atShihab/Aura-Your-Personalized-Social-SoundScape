import { create } from 'zustand';
import { axiosInstance } from '@/lib/axios';
import toast from 'react-hot-toast';

interface Friend {
	_id: string;
	clerkId: string;
	fullName: string;
	imageUrl: string;
	handle?: string;
	isArtist?: boolean;
	artistName?: string;
	isVerified?: boolean;
}

interface FriendRequest {
	_id: string;
	senderId: string;
	receiverId: string;
	status: 'pending' | 'accepted' | 'rejected';
	message?: string;
	createdAt: string;
	sender?: Friend;
	receiver?: Friend;
}

interface FriendStore {
	// State
	friends: Friend[];
	friendRequests: FriendRequest[];
	sentRequests: FriendRequest[];
	isLoading: boolean;
	
	// Actions
	sendFriendRequest: (receiverId: string, message?: string) => Promise<void>;
	acceptFriendRequest: (requestId: string) => Promise<void>;
	rejectFriendRequest: (requestId: string) => Promise<void>;
	cancelFriendRequest: (requestId: string) => Promise<void>;
	removeFriend: (friendId: string) => Promise<void>;
	getFriendRequests: () => Promise<void>;
	getSentFriendRequests: () => Promise<void>;
	getFriendsList: () => Promise<void>;
	checkFriendshipStatus: (userId: string) => Promise<{
		status: 'none' | 'friends' | 'request_sent' | 'request_received';
		requestId?: string;
	}>;
}

export const useFriendStore = create<FriendStore>((set, get) => ({
	// Initial state
	friends: [],
	friendRequests: [],
	sentRequests: [],
	isLoading: false,

	// Send friend request
	sendFriendRequest: async (receiverId: string, message?: string) => {
		try {
			set({ isLoading: true });
			await axiosInstance.post(`/friends/request/${receiverId}`, { message });
			toast.success('Friend request sent!');
			
			// Refresh sent requests
			await get().getSentFriendRequests();
			
			// Also refresh friend requests to update the receiver's view
			await get().getFriendRequests();
		} catch (error: any) {
			console.error('Error sending friend request:', error);
			toast.error(error.response?.data?.message || 'Failed to send friend request');
		} finally {
			set({ isLoading: false });
		}
	},

	// Accept friend request
	acceptFriendRequest: async (requestId: string) => {
		try {
			set({ isLoading: true });
			await axiosInstance.put(`/friends/request/${requestId}/accept`);
			toast.success('Friend request accepted!');
			
			// Refresh all data to update all views
			await Promise.all([
				get().getFriendRequests(),
				get().getFriendsList(),
				get().getSentFriendRequests()
			]);
		} catch (error: any) {
			console.error('Error accepting friend request:', error);
			toast.error(error.response?.data?.message || 'Failed to accept friend request');
		} finally {
			set({ isLoading: false });
		}
	},

	// Reject friend request
	rejectFriendRequest: async (requestId: string) => {
		try {
			set({ isLoading: true });
			await axiosInstance.put(`/friends/request/${requestId}/reject`);
			toast.success('Friend request rejected!');
			
			// Refresh friend requests
			await get().getFriendRequests();
			
			// Also refresh sent requests to ensure consistency
			await get().getSentFriendRequests();
		} catch (error: any) {
			console.error('Error rejecting friend request:', error);
			toast.error(error.response?.data?.message || 'Failed to reject friend request');
		} finally {
			set({ isLoading: false });
		}
	},

	// Cancel friend request
	cancelFriendRequest: async (requestId: string) => {
		try {
			set({ isLoading: true });
			await axiosInstance.delete(`/friends/request/${requestId}`);
			toast.success('Friend request cancelled!');
			
			// Refresh sent requests
			await get().getSentFriendRequests();
			
			// Also refresh friend requests to ensure consistency
			await get().getFriendRequests();
		} catch (error: any) {
			console.error('Error cancelling friend request:', error);
			toast.error(error.response?.data?.message || 'Failed to cancel friend request');
		} finally {
			set({ isLoading: false });
		}
	},

	// Remove friend
	removeFriend: async (friendId: string) => {
		try {
			set({ isLoading: true });
			await axiosInstance.delete(`/friends/${friendId}`);
			toast.success('Friend removed!');
			
			// Refresh friends list
			await get().getFriendsList();
			
			// Also refresh other data to ensure consistency
			await Promise.all([
				get().getFriendRequests(),
				get().getSentFriendRequests()
			]);
		} catch (error: any) {
			console.error('Error removing friend:', error);
			toast.error(error.response?.data?.message || 'Failed to remove friend');
		} finally {
			set({ isLoading: false });
		}
	},

	// Get friend requests
	getFriendRequests: async () => {
		try {
			set({ isLoading: true });
			const response = await axiosInstance.get('/friends/requests');
			set({ friendRequests: response.data.friendRequests });
		} catch (error: any) {
			console.error('Error getting friend requests:', error);
		} finally {
			set({ isLoading: false });
		}
	},

	// Get sent friend requests
	getSentFriendRequests: async () => {
		try {
			set({ isLoading: true });
			const response = await axiosInstance.get('/friends/requests/sent');
			set({ sentRequests: response.data.sentRequests });
		} catch (error: any) {
			console.error('Error getting sent friend requests:', error);
		} finally {
			set({ isLoading: false });
		}
	},

	// Get friends list
	getFriendsList: async () => {
		try {
			set({ isLoading: true });
			const response = await axiosInstance.get('/friends/list');
			console.log("🔗 Friend store - Received friends data:", response.data.friends);
			set({ friends: response.data.friends });
		} catch (error: any) {
			console.error('Error getting friends list:', error);
		} finally {
			set({ isLoading: false });
		}
	},

	// Check friendship status
	checkFriendshipStatus: async (userId: string) => {
		try {
			const response = await axiosInstance.get(`/friends/status/${userId}`);
			return response.data;
		} catch (error: any) {
			console.error('Error checking friendship status:', error);
			return { status: 'none' as const };
		}
	},
}));
