import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useChatStore } from '@/stores/useChatStore';
import { motion, AnimatePresence } from 'framer-motion';
// Simple date formatting function to avoid dependency issues
const formatTimeAgo = (date: Date): string => {
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
	
	if (diffInSeconds < 60) return 'Just now';
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
	if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
	return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
};

const NotificationButton = () => {
	const [isOpen, setIsOpen] = useState(false);
	const {
		notifications,
		unreadCount,
		isLoading,
		fetchNotifications,
		markAsRead,
		markAllAsRead,
		deleteNotification,
		getUnreadCount,
		handleNotificationClick,
		addNotification,
		updateUnreadCount
	} = useNotificationStore();

	const { socket, isConnected } = useChatStore();

	useEffect(() => {
		// Fetch initial notifications and unread count
		fetchNotifications(1, 10);
		getUnreadCount();
	}, [fetchNotifications, getUnreadCount]);

	// Set up real-time notification listeners
	useEffect(() => {
		console.log('🔔 Setting up notification listeners. Socket:', !!socket, 'Connected:', isConnected);
		
		if (socket && isConnected) {
			// Listen for new notifications
			socket.on('new_notification', (notification) => {
				console.log('🔔 New notification received:', notification);
				addNotification(notification);
			});

			// Listen for notification count updates
			socket.on('notification_count_update', ({ count }) => {
				console.log('🔢 Notification count updated:', count);
				updateUnreadCount(count);
			});

			// Add general socket event listeners for debugging
			socket.on('connect', () => {
				console.log('🔌 Socket connected in notification component');
			});

			socket.on('disconnect', () => {
				console.log('🔌 Socket disconnected in notification component');
			});

			return () => {
				socket.off('new_notification');
				socket.off('notification_count_update');
				socket.off('connect');
				socket.off('disconnect');
			};
		}
	}, [socket, isConnected, addNotification, updateUnreadCount]);

	const handleNotificationClickLocal = (notification: any) => {
		handleNotificationClick(notification);
		setIsOpen(false);
	};

	const handleMarkAllRead = async () => {
		await markAllAsRead();
	};

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case 'friend_request':
				return '👥';
			case 'friend_request_accepted':
				return '✅';
			case 'artist_approved':
				return '🎤';
			case 'new_message':
				return '💬';
			default:
				return '🔔';
		}
	};

	const getNotificationColor = (type: string) => {
		switch (type) {
			case 'friend_request':
				return 'text-blue-400';
			case 'friend_request_accepted':
				return 'text-green-400';
			case 'artist_approved':
				return 'text-purple-400';
			case 'new_message':
				return 'text-orange-400';
			default:
				return 'text-zinc-400';
		}
	};

	return (
		<div className="relative">
			<motion.div
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
			>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setIsOpen(!isOpen)}
					className="relative h-9 w-9 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-all duration-300"
				>
					<Bell className="h-4 w-4 text-zinc-400" />
					{unreadCount > 0 && (
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							className="absolute -top-1 -right-1"
						>
							<Badge 
								variant="destructive" 
								className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold"
							>
								{unreadCount > 99 ? '99+' : unreadCount}
							</Badge>
						</motion.div>
					)}
				</Button>
			</motion.div>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -10, scale: 0.95 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="absolute top-full right-0 mt-2 z-50 w-80"
					>
						<Card className="bg-zinc-800/95 border-zinc-700 backdrop-blur-md shadow-xl">
							<CardContent className="p-0">
								{/* Header */}
								<div className="flex items-center justify-between p-4 border-b border-zinc-700">
									<h3 className="text-lg font-semibold text-white">Notifications</h3>
									<div className="flex items-center gap-2">
										{unreadCount > 0 && (
											<Button
												variant="ghost"
												size="sm"
												onClick={handleMarkAllRead}
												className="text-xs text-zinc-400 hover:text-white"
											>
												<Check className="h-3 w-3 mr-1" />
												Mark all read
											</Button>
										)}
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setIsOpen(false)}
											className="h-6 w-6 text-zinc-400 hover:text-white"
										>
											<X className="h-3 w-3" />
										</Button>
									</div>
								</div>

								{/* Notifications List */}
								<ScrollArea className="h-96">
									{isLoading ? (
										<div className="p-4 text-center">
											<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto"></div>
											<p className="text-zinc-400 text-sm mt-2">Loading notifications...</p>
										</div>
									) : notifications.length === 0 ? (
										<div className="p-8 text-center">
											<Bell className="h-12 w-12 text-zinc-500 mx-auto mb-3" />
											<p className="text-zinc-400 text-sm">No notifications yet</p>
											<p className="text-zinc-500 text-xs mt-1">We'll notify you when something happens</p>
										</div>
									) : (
										<div className="space-y-1">
											{notifications.map((notification) => (
												<motion.div
													key={notification._id}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													className={`p-3 hover:bg-zinc-700/50 transition-colors cursor-pointer border-l-2 ${
														notification.isRead 
															? 'border-transparent' 
															: 'border-emerald-500'
													}`}
													onClick={() => handleNotificationClickLocal(notification)}
												>
													<div className="flex items-start gap-3">
														<div className="flex-shrink-0">
															{notification.senderImage ? (
																<Avatar className="h-8 w-8">
																	<AvatarImage src={notification.senderImage} />
																	<AvatarFallback className="text-xs">
																		{notification.senderName?.[0] || '?'}
																	</AvatarFallback>
																</Avatar>
															) : (
																<div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center">
																	<span className="text-sm">
																		{getNotificationIcon(notification.type)}
																	</span>
																</div>
															)}
														</div>
														
														<div className="flex-1 min-w-0">
															<div className="flex items-start justify-between">
																<div className="flex-1">
																	<h4 className={`text-sm font-medium ${
																		notification.isRead ? 'text-zinc-300' : 'text-white'
																	}`}>
																		{notification.title}
																	</h4>
																	<p className="text-xs text-zinc-400 mt-1 line-clamp-2">
																		{notification.message}
																	</p>
																	<p className="text-xs text-zinc-500 mt-1">
																		{formatTimeAgo(new Date(notification.createdAt))}
																	</p>
																</div>
																
																<div className="flex items-center gap-1 ml-2">
																	{!notification.isRead && (
																		<div className="h-2 w-2 rounded-full bg-emerald-500"></div>
																	)}
																	<Button
																		variant="ghost"
																		size="icon"
																		onClick={(e) => {
																			e.stopPropagation();
																			deleteNotification(notification._id);
																		}}
																		className="h-6 w-6 text-zinc-500 hover:text-red-400"
																	>
																		<Trash2 className="h-3 w-3" />
																	</Button>
																</div>
															</div>
														</div>
													</div>
												</motion.div>
											))}
										</div>
									)}
								</ScrollArea>

								{/* Footer */}
								{notifications.length > 0 && (
									<div className="p-3 border-t border-zinc-700">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => {
												// Navigate to full notifications page
												window.location.href = '/notifications';
											}}
											className="w-full text-zinc-400 hover:text-white"
										>
											View all notifications
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default NotificationButton;
