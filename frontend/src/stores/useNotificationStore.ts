import { create } from 'zustand';
import { axiosInstance } from '@/lib/axios';
import toast from 'react-hot-toast';

interface Notification {
	_id: string;
	userId: string;
	type: 'friend_request' | 'friend_request_accepted' | 'friend_request_rejected' | 'artist_approved' | 'artist_rejected' | 'new_follower' | 'new_message' | 'song_uploaded' | 'song_approved' | 'song_rejected' | 'album_uploaded' | 'playlist_shared';
	title: string;
	message: string;
	data: any;
	isRead: boolean;
	readAt?: string;
	actionUrl?: string;
	senderId?: string;
	senderName?: string;
	senderImage?: string;
	createdAt: string;
	updatedAt: string;
}

interface NotificationStore {
	// State
	notifications: Notification[];
	unreadCount: number;
	isLoading: boolean;
	error: string | null;
	
	// Actions
	fetchNotifications: (page?: number, limit?: number, unreadOnly?: boolean) => Promise<void>;
	markAsRead: (notificationId: string) => Promise<void>;
	markAllAsRead: () => Promise<void>;
	deleteNotification: (notificationId: string) => Promise<void>;
	getUnreadCount: () => Promise<void>;
	handleNotificationClick: (notification: Notification) => void;
	addNotification: (notification: Notification) => void;
	updateUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
	// Initial state
	notifications: [],
	unreadCount: 0,
	isLoading: false,
	error: null,

	// Fetch notifications
	fetchNotifications: async (page = 1, limit = 20, unreadOnly = false) => {
		try {
			console.log('🔔 Fetching notifications...', { page, limit, unreadOnly });
			set({ isLoading: true, error: null });
			const params = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
				unreadOnly: unreadOnly.toString()
			});
			
			const response = await axiosInstance.get(`/notifications?${params}`);
			console.log('🔔 Notifications fetched:', response.data);
			set({ 
				notifications: response.data.notifications,
				unreadCount: response.data.unreadCount
			});
		} catch (error: any) {
			console.error('Error fetching notifications:', error);
			set({ error: error.response?.data?.message || 'Failed to fetch notifications' });
		} finally {
			set({ isLoading: false });
		}
	},

	// Mark notification as read
	markAsRead: async (notificationId: string) => {
		try {
			await axiosInstance.put(`/notifications/${notificationId}/read`);
			
			// Update local state
			set((state) => ({
				notifications: state.notifications.map(notification =>
					notification._id === notificationId
						? { ...notification, isRead: true, readAt: new Date().toISOString() }
						: notification
				),
				unreadCount: Math.max(0, state.unreadCount - 1)
			}));
		} catch (error: any) {
			console.error('Error marking notification as read:', error);
			toast.error('Failed to mark notification as read');
		}
	},

	// Mark all notifications as read
	markAllAsRead: async () => {
		try {
			await axiosInstance.put('/notifications/mark-all-read');
			
			// Update local state
			set((state) => ({
				notifications: state.notifications.map(notification => ({
					...notification,
					isRead: true,
					readAt: new Date().toISOString()
				})),
				unreadCount: 0
			}));
			
			toast.success('All notifications marked as read');
		} catch (error: any) {
			console.error('Error marking all notifications as read:', error);
			toast.error('Failed to mark all notifications as read');
		}
	},

	// Delete notification
	deleteNotification: async (notificationId: string) => {
		try {
			await axiosInstance.delete(`/notifications/${notificationId}`);
			
			// Update local state
			set((state) => {
				const notification = state.notifications.find(n => n._id === notificationId);
				return {
					notifications: state.notifications.filter(n => n._id !== notificationId),
					unreadCount: notification && !notification.isRead 
						? Math.max(0, state.unreadCount - 1) 
						: state.unreadCount
				};
			});
			
			toast.success('Notification deleted');
		} catch (error: any) {
			console.error('Error deleting notification:', error);
			toast.error('Failed to delete notification');
		}
	},

	// Get unread count
	getUnreadCount: async () => {
		try {
			console.log('🔔 Getting unread count...');
			const response = await axiosInstance.get('/notifications/unread-count');
			console.log('🔔 Unread count:', response.data.unreadCount);
			set({ unreadCount: response.data.unreadCount });
		} catch (error: any) {
			console.error('Error getting unread count:', error);
		}
	},

	// Handle notification click
	handleNotificationClick: (notification: Notification) => {
		// Mark as read if not already read
		if (!notification.isRead) {
			get().markAsRead(notification._id);
		}

		// Handle different notification types
		switch (notification.type) {
			case 'friend_request':
			case 'friend_request_accepted':
				// Navigate to friends page or show friend requests
				window.location.href = '/friends';
				break;
			case 'artist_approved':
				// Navigate to artist dashboard
				window.location.href = '/artist-dashboard';
				break;
			case 'song_approved':
			case 'song_rejected':
				// Navigate to artist dashboard or song page
				if (notification.data?.songId) {
					window.location.href = `/song/${notification.data.songId}`;
				} else {
					window.location.href = '/artist-dashboard';
				}
				break;
			case 'new_message':
				// Navigate to chat
				if (notification.senderId) {
					window.location.href = `/chat/${notification.senderId}`;
				}
				break;
			default:
				// Use actionUrl if provided
				if (notification.actionUrl) {
					window.location.href = notification.actionUrl;
				}
				break;
		}
	},

	// Add new notification (for real-time updates)
	addNotification: (notification: Notification) => {
		set((state) => ({
			notifications: [notification, ...state.notifications],
			unreadCount: state.unreadCount + 1
		}));
		
		// Show toast notification
		toast.success(notification.title, {
			duration: 4000,
			position: 'top-right',
		});
	},

	// Update unread count (for real-time updates)
	updateUnreadCount: (count: number) => {
		set({ unreadCount: count });
	},
}));
