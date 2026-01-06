
import { useChatStore } from "@/stores/useChatStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UsersList from "./components/UsersList";
import ChatHeader from "./components/ChatHeader";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import MessageInput from "./components/MessageInput";
import MessageReactions from "./components/MessageReactions";
import MessageStatus from "./components/MessageStatus";
import TypingIndicator from "./components/TypingIndicator";
import MessageContextMenu from "./components/MessageContextMenu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
	ChevronDown, 
	Image as ImageIcon, 
	Music, 
	Play, 
	Users,
	Heart,
	Share2,
	MessageCircle,
	Check,
	X
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";



const formatMessageTime = (date: string) => {
	const messageDate = new Date(date);
	return messageDate.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
};

const ChatPage = () => {
	const { user } = useUser();
	const { userId } = useParams();
	const navigate = useNavigate();
	const { messages, selectedUser, fetchMessages, deleteMessage, editMessage, isLoading, error, userActivities, initSocket, disconnectSocket, users, setSelectedUser, markMessagesAsRead, fetchUnreadCounts } = useChatStore();
	
	console.log("🔍 ChatPage Debug - User:", user);
	console.log("🔍 ChatPage Debug - IsLoading:", isLoading);
	console.log("🔍 ChatPage Debug - Error:", error);
	console.log("🔍 ChatPage Debug - SelectedUser:", selectedUser);
	const { currentSong, setCurrentSong, play } = usePlayerStore();
	const { songs } = useMusicStore();
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const [showScrollButton, setShowScrollButton] = useState(false);
	const [showOnlineUsers, setShowOnlineUsers] = useState(false);
	const [messageReactions, setMessageReactions] = useState<{[key: string]: any[]}>({});
	const [typingUsers, setTypingUsers] = useState<Array<{id: string, name: string, avatar?: string}>>([]);
	const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
	const [editingContent, setEditingContent] = useState<string>("");
	const [replyingToMessageId, setReplyingToMessageId] = useState<string | null>(null);

	useEffect(() => {
		if (user) {
			fetchUnreadCounts();
			initSocket(user.id);
		}
		
		return () => {
			disconnectSocket();
		};
	}, [fetchUnreadCounts, user, initSocket, disconnectSocket]);

	useEffect(() => {
		if (selectedUser) {
			fetchMessages(selectedUser.clerkId);
			// Mark messages as read when user is selected
			markMessagesAsRead(selectedUser.clerkId);
		}
	}, [selectedUser, fetchMessages, markMessagesAsRead]);

	// Handle userId parameter from URL
	useEffect(() => {
		if (userId && users.length > 0) {
			const targetUser = users.find(u => u.clerkId === userId);
			if (targetUser && (!selectedUser || selectedUser.clerkId !== userId)) {
				setSelectedUser(targetUser);
			}
		}
	}, [userId, users, selectedUser, setSelectedUser]);

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages]);

	// Handle scroll events to show/hide scroll button
	useEffect(() => {
		const handleScroll = () => {
			if (scrollAreaRef.current) {
				const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
				const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
				setShowScrollButton(!isNearBottom);
			}
		};

		const scrollElement = scrollAreaRef.current;
		if (scrollElement) {
			scrollElement.addEventListener('scroll', handleScroll);
			return () => scrollElement.removeEventListener('scroll', handleScroll);
		}
	}, []);

	const scrollToBottom = () => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	};

	// Group messages by date for better organization
	const messageGroups = useMemo(() => {
		const groups: { [key: string]: any[] } = {};
		
		messages.forEach(message => {
			const date = new Date(message.createdAt).toDateString();
			if (!groups[date]) {
				groups[date] = [];
			}
			groups[date].push(message);
		});
		
		return groups;
	}, [messages]);

	// Handle message reactions
	const handleReactionAdd = useCallback((messageId: string, emoji: string) => {
		setMessageReactions(prev => {
			const current = prev[messageId] || [];
			const existingReaction = current.find(r => r.emoji === emoji);
			
			if (existingReaction) {
				if (!existingReaction.hasReacted) {
					existingReaction.count++;
					existingReaction.hasReacted = true;
					existingReaction.users.push(user?.firstName || "You");
				}
			} else {
				current.push({
					emoji,
					count: 1,
					users: [user?.firstName || "You"],
					hasReacted: true
				});
			}
					
		return { ...prev, [messageId]: [...current] };
	});
}, [user]);

const handleReactionRemove = useCallback((messageId: string, emoji: string) => {
		setMessageReactions(prev => {
			const current = prev[messageId] || [];
			const reactionIndex = current.findIndex(r => r.emoji === emoji);
			
			if (reactionIndex !== -1) {
				const reaction = current[reactionIndex];
				if (reaction.hasReacted) {
					reaction.count--;
					reaction.hasReacted = false;
					reaction.users = reaction.users.filter((u: string) => u !== (user?.firstName || "You"));
					
					if (reaction.count === 0) {
						current.splice(reactionIndex, 1);
					}
				}
			}
					
		return { ...prev, [messageId]: [...current] };
	});
}, [user]);

	// Real typing indicator from websocket
	useEffect(() => {
		if (selectedUser) {
			// Check if the selected user is typing
			const activity = userActivities.get(selectedUser.clerkId);
			if (activity === "typing...") {
				setTypingUsers([{
					id: selectedUser.clerkId,
					name: selectedUser.fullName,
					avatar: selectedUser.imageUrl
				}]);
			} else {
				setTypingUsers([]);
			}
		} else {
			setTypingUsers([]);
		}
	}, [selectedUser, userActivities]);

	// Message actions
	const handleMessageReply = (messageId: string) => {
		setReplyingToMessageId(messageId);
	};

	const handleMessageEdit = (messageId: string) => {
		const message = messages.find(m => m._id === messageId);
		if (message?.content) {
			setEditingMessageId(messageId);
			setEditingContent(message.content);
		}
	};

	const handleSaveEdit = async (messageId: string) => {
		if (!editingContent.trim()) {
			toast.error("Message cannot be empty");
			return;
		}

		try {
			await editMessage(messageId, editingContent.trim());
			setEditingMessageId(null);
			setEditingContent("");
		} catch (error) {
			console.error('Error editing message:', error);
		}
	};

	const handleCancelEdit = () => {
		setEditingMessageId(null);
		setEditingContent("");
	};

	const handleMessageDelete = async (messageId: string) => {
		if (window.confirm("Are you sure you want to delete this message?")) {
			try {
				await deleteMessage(messageId);
			} catch (error) {
				console.error('Error deleting message:', error);
			}
		}
	};

	const handleMessageCopy = (messageId: string) => {
		const message = messages.find(m => m._id === messageId);
		if (message?.content) {
			navigator.clipboard.writeText(message.content);
			toast.success("Message copied to clipboard");
		}
	};

	const handleMessagePin = async (messageId: string) => {
		try {
			// In a real app, this would call an API to pin/unpin the message
			const message = messages.find(m => m._id === messageId);
			if (message) {
				// Toggle pin status
				const newPinStatus = !message.isPinned;
				
				toast.success(newPinStatus ? "Message pinned" : "Message unpinned");
				
				// TODO: Call API to update pin status on server
				// await pinMessage(messageId, newPinStatus);
			}
		} catch (error) {
			console.error('Error pinning message:', error);
			toast.error("Failed to pin message");
		}
	};

	const handleMessageForward = (messageId: string) => {
		const message = messages.find(m => m._id === messageId);
		if (message) {
			// For now, copy the message content and show a toast
			// In a real app, this would open a forward dialog to select recipients
			if (message.content) {
				navigator.clipboard.writeText(message.content);
				toast.success("Message copied to clipboard. Forward functionality coming soon!");
			} else if (message.imageUrl) {
				toast.success("Image message. Forward functionality coming soon!");
			} else if (message.playlistData) {
				toast.success("Playlist message. Forward functionality coming soon!");
			}
		}
	};

	const handleMessageShare = (messageId: string) => {
		const message = messages.find(m => m._id === messageId);
		if (message) {
			// For now, copy the message content and show a toast
			// In a real app, this would open a share dialog with various options
			if (message.content) {
				navigator.clipboard.writeText(message.content);
				toast.success("Message copied to clipboard. Share functionality coming soon!");
			} else if (message.imageUrl) {
				toast.success("Image message. Share functionality coming soon!");
			} else if (message.playlistData) {
				toast.success("Playlist message. Share functionality coming soon!");
			}
		}
	};



	return (
		<div className="h-full bg-black text-zinc-200 overflow-hidden">
			<div className="flex h-full relative w-full min-h-0">
				{/* Left sidebar - Users List */}
				<div
					className={cn(
						"relative border-r border-white/10 bg-zinc-900/50 h-full transition-all duration-300 min-h-0 flex-shrink-0",
						selectedUser 
							? "hidden md:flex md:w-64 lg:w-72" 
							: "flex w-full md:w-64 lg:w-72"
					)}
				>
					<UsersList
						showOnlineUsers={showOnlineUsers}
						setShowOnlineUsers={setShowOnlineUsers}
					/>
				</div>

				{/* Main chat area */}
				<div className={cn(
					"relative flex flex-col min-w-0 h-full flex-1",
					selectedUser 
						? "" 
						: "hidden md:flex"
				)}>
					{selectedUser ? (
						<>
							{/* Chat Header */}
							<div className="flex-shrink-0 border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-10 pt-2">
								<ChatHeader />
							</div>

							{/* Messages Area */}
							<div className="flex-1 flex flex-col overflow-hidden min-h-0">
								{error && (
									<div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 m-4 rounded-lg flex-shrink-0">
										<p className="text-sm">Error: {error}</p>
									</div>
								)}
								
								<ScrollArea
									ref={scrollAreaRef}
									className="flex-1 px-3 py-4 sm:px-4 sm:py-6 md:px-6 min-h-0"
								>
									{isLoading ? (
										<div className="flex items-center justify-center h-full">
											<div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent"></div>
										</div>
									) : (
									<div className="space-y-6">
										
										{Object.entries(messageGroups).map(
											([date, dateMessages]) => (
												<div key={date} className="space-y-4">
													{/* Date separator */}
													<div className="flex justify-center">
														<Badge
															variant="secondary"
															className="bg-zinc-800/80 text-zinc-300 border-zinc-600"
														>
															{new Date(date).toDateString() ===
															new Date().toDateString()
																? "Today"
																: new Date(date).toLocaleDateString(
																		"en-US",
																		{
																			weekday: "long",
																			month: "long",
																			day: "numeric",
																		}
																  )}
														</Badge>
													</div>

													{/* Messages */}
													<div className="space-y-2 sm:space-y-3">
														{dateMessages.map((message, index) => {
															const isOwnMessage =
																message.senderId === user?.id;
															const showAvatar =
																index === 0 ||
																dateMessages[index - 1]
																	?.senderId !== message.senderId;

															return (
																<div
																	key={message._id}
																	className={cn(
																		"flex items-end gap-2 sm:gap-3 group animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
																		isOwnMessage
																			? "flex-row-reverse"
																			: ""
																	)}
																>
																	{/* Avatar */}
																	{showAvatar && (
																		<Avatar className="size-8 sm:size-10 flex-shrink-0">
																			<AvatarImage
																				src={
																					isOwnMessage
																						? user?.imageUrl ||
																						  ""
																						: selectedUser.imageUrl
																				}
																			/>
																			<AvatarFallback className="bg-zinc-700 text-zinc-300 text-xs sm:text-sm">
																				{isOwnMessage
																					? user?.firstName?.charAt(
																							0
																					  ) || "U"
																					: selectedUser.fullName?.charAt(
																							0
																					  ) || "U"}
																			</AvatarFallback>
																		</Avatar>
																	)}

																	{/* Message Bubble */}
																	<div
																		className={cn(
																			"relative group flex-1",
																			"max-w-[90%] xs:max-w-[85%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[65%] xl:max-w-[60%]",
																			!showAvatar &&
																				(isOwnMessage
																					? "mr-10 sm:mr-13"
																					: "ml-10 sm:ml-13")
																		)}
																	>
																		{/* Message Content */}
																		<div
																			className={cn(
																				"rounded-2xl shadow-lg transition-all duration-200 backdrop-blur-sm group/message",
																				"px-3 py-2 sm:px-4 sm:py-3 relative",
																				isOwnMessage
																					? "bg-gradient-to-br from-green-600 to-green-700 text-white rounded-br-md border border-green-500/20 hover:shadow-green-500/20 hover:shadow-xl"
																					: "bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-100 rounded-bl-md border border-zinc-700/50 hover:shadow-zinc-500/20 hover:shadow-xl"
																			)}
																		>
																			{/* Text */}
																			{message.content && (
																				<div>
																					{editingMessageId === message._id ? (
																						<div className="space-y-2">
																							<Textarea
																								value={editingContent}
																								onChange={(e) => setEditingContent(e.target.value)}
																								className="min-h-[60px] bg-black/20 border-white/20 text-zinc-100 text-xs sm:text-sm"
																								placeholder="Edit your message..."
																							/>
																							<div className="flex gap-2 justify-end">
																								<Button
																									size="sm"
																									variant="ghost"
																									onClick={handleCancelEdit}
																									className="h-7 px-3 text-xs"
																								>
																									<X className="w-3 h-3 mr-1" />
																									Cancel
																								</Button>
																								<Button
																									size="sm"
																									onClick={() => handleSaveEdit(message._id)}
																									className="h-7 px-3 bg-green-600 hover:bg-green-700 text-xs"
																								>
																									<Check className="w-3 h-3 mr-1" />
																									Save
																								</Button>
																							</div>
																						</div>
																					) : (
																						<div>
																							<p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
																								{message.content}
																							</p>
																							{message.isEdited && (
																								<p className="text-xs text-zinc-500 mt-1 italic">
																									(edited)
																								</p>
																							)}
																						</div>
																					)}
																				</div>
																			)}

																			{/* Image */}
																			{message.imageUrl && (
																				<div className="mt-2 sm:mt-3">
																					<img
																						src={
																							message.imageUrl
																						}
																						alt="Message image"
																						className="max-w-full max-h-48 sm:max-h-64 md:max-h-80 rounded-lg object-cover shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200"
																						onClick={() =>
																							window.open(
																								message.imageUrl,
																								"_blank"
																							)
																						}
																					/>
																				</div>
																			)}

																			{/* Playlist */}
																			{message.playlistData && (
																				<div 
																					className="mt-2 sm:mt-3 bg-zinc-900/50 rounded-lg p-2 sm:p-3 border border-white/10 cursor-pointer hover:bg-zinc-800/50 transition-colors duration-200"
																					onClick={() => navigate(`/playlist/${message.playlistData.playlistId}`)}
																				>
																					<div className="flex items-center gap-2 sm:gap-3">
																						<img
																							src={
																								message
																									.playlistData
																									.playlistImage
																							}
																							alt={
																								message
																									.playlistData
																									.playlistName
																							}
																							className="w-10 h-10 sm:w-12 sm:h-12 rounded-md object-cover flex-shrink-0"
																						/>
																						<div className="flex-1 min-w-0">
																							<h4 className="font-medium text-xs sm:text-sm truncate">
																								{
																									message
																										.playlistData
																										.playlistName
																								}
																							</h4>
																							<p className="text-xs text-zinc-400 flex items-center gap-1 sm:gap-2">
																								<Music className="w-3 h-3 flex-shrink-0" />
																								<span className="truncate">
																									{
																										message
																											.playlistData
																											.songCount
																									}{" "}
																									songs
																								</span>
																							</p>
																						</div>
																						<Button
																							size="sm"
																							className="bg-green-600 hover:bg-green-700 h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0"
																							onClick={(e) => {
																								e.stopPropagation();
																								navigate(`/playlist/${message.playlistData.playlistId}`);
																							}}
																						>
																							<Play className="w-3 h-3 sm:w-4 sm:h-4" />
																						</Button>
																					</div>
																				</div>
																			)}

																			{/* Song */}
																			{message.songData && (
																				<div 
																					className="mt-2 sm:mt-3 bg-zinc-900/50 rounded-lg p-2 sm:p-3 border border-white/10 cursor-pointer hover:bg-zinc-800/50 transition-colors duration-200"
																				>
																					<div className="flex items-center gap-2 sm:gap-3">
																						<img
																							src={message.songData.songImage}
																							alt={message.songData.songTitle}
																							className="w-10 h-10 sm:w-12 sm:h-12 rounded-md object-cover flex-shrink-0"
																						/>
																						<div className="flex-1 min-w-0">
																							<h4 className="font-medium text-xs sm:text-sm truncate">
																								{message.songData.songTitle}
																							</h4>
																							<p className="text-xs text-zinc-400 truncate">
																								{message.songData.songArtist}
																							</p>
																						</div>
																						<Button
																							size="sm"
																							className="bg-green-600 hover:bg-green-700 h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0"
																							onClick={(e) => {
																								e.stopPropagation();
																								const song = songs.find((s) => s._id === message.songData.songId);
																								if (song) {
																									setCurrentSong(song);
																									play();
																								} else {
																									toast.error("Song not found in library");
																								}
																							}}
																						>
																							<Play className="w-3 h-3 sm:w-4 sm:h-4" />
																						</Button>
																					</div>
																				</div>
																			)}

																			{/* Time & Status */}
																			<div
																				className={cn(
																					"flex items-center justify-between gap-1 sm:gap-2 mt-1 sm:mt-2 text-xs",
																					isOwnMessage
																						? "text-green-100/80"
																						: "text-zinc-400"
																				)}
																			>
																				<div className="flex items-center gap-2">
																					<span className="text-xs">
																						{formatMessageTime(
																							message.createdAt
																						)}
																					</span>
																					{message.isEdited && (
																						<span className="text-xs text-zinc-500">
																							• edited
																						</span>
																					)}
																					{message.isPinned && (
																						<span className="text-xs text-yellow-500">
																							📌
																						</span>
																					)}
																				</div>
																				{isOwnMessage && (
																					<MessageStatus
																						status="read"
																						compact={true}
																					/>
																				)}
																			</div>

																			{/* Reactions */}
																			<MessageReactions
																				messageId={
																					message._id
																				}
																				reactions={
																					messageReactions[
																						message._id
																					] || []
																				}
																				onReactionAdd={
																					handleReactionAdd
																				}
																				onReactionRemove={
																					handleReactionRemove
																				}
																				compact={true}
																			/>
																		</div>

																		{/* Message Actions - Mobile & Desktop */}
																		{editingMessageId !== message._id && (
																			<div className="flex items-center justify-between mt-2 opacity-0 group-hover/message:opacity-100 transition-opacity duration-200">
																				{/* Left side - Reactions */}
																				<div className="flex items-center gap-1">
																					<Button
																						size="sm"
																						variant="ghost"
																						className="h-6 w-6 p-0 hover:bg-zinc-600/50 hover:scale-110 transition-all duration-200"
																						onClick={() =>
																							handleReactionAdd(
																								message._id,
																								"👍"
																							)
																						}
																						title="Add reaction"
																					>
																						<Heart className="w-3 h-3" />
																					</Button>
																					<Button
																						size="sm"
																						variant="ghost"
																						className="h-6 w-6 p-0 hover:bg-zinc-600/50 hover:scale-110 transition-all duration-200"
																						onClick={() =>
																							handleMessageShare(
																								message._id
																							)
																						}
																						title="Share message"
																					>
																						<Share2 className="w-3 h-3" />
																					</Button>
																				</div>

																				{/* Right side - More options */}
																				<MessageContextMenu
																					messageId={message._id}
																					isOwnMessage={isOwnMessage}
																					onReply={handleMessageReply}
																					onEdit={handleMessageEdit}
																					onDelete={handleMessageDelete}
																					onCopy={handleMessageCopy}
																					onPin={handleMessagePin}
																					onForward={handleMessageForward}
																					onReact={() =>
																						handleReactionAdd(
																							message._id,
																							"👍"
																						)
																					}
																					onShare={handleMessageShare}
																					compact={true}
																				/>
																			</div>
																		)}
																	</div>
																</div>
															);
														})}
													</div>
												</div>
											)
										)}

										{/* Typing Indicator - will show when users are actually typing */}
										{typingUsers.length > 0 && (
											<TypingIndicator users={typingUsers} />
										)}

										<div ref={messagesEndRef} />
									</div>
									)}
								</ScrollArea>

								{/* Scroll to bottom button */}
								{showScrollButton && (
									<Button
										onClick={scrollToBottom}
										size="sm"
										className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-zinc-800/90 hover:bg-zinc-700/90 text-white rounded-full p-2 shadow-lg backdrop-blur-sm border border-zinc-600/50 transition-all duration-200 z-20"
									>
										<ChevronDown className="w-4 h-4" />
									</Button>
								)}
							</div>

							{/* Message Input */}
							<div className="flex-shrink-0 border-t border-white/10 bg-black/20 backdrop-blur-sm">
								<MessageInput
									replyingToMessageId={replyingToMessageId}
									onCancelReply={() => setReplyingToMessageId(null)}
								/>
							</div>
						</>
					) : (
						<div className="flex-1 flex items-center justify-center">
							<div className="text-center">
								<MessageCircle className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
								<h3 className="text-xl font-semibold text-zinc-300 mb-2">No conversation selected</h3>
								<p className="text-zinc-500">Choose a conversation from the sidebar to start chatting</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ChatPage;

const NoConversationPlaceholder = () => (
	<div className="flex flex-col items-center justify-center h-full space-y-6 bg-gradient-to-br from-zinc-900/50 to-zinc-800/50 backdrop-blur-sm">
		<div className="relative">
			<div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-500 rounded-full flex items-center justify-center animate-pulse">
				<MessageCircle className="w-10 h-10 text-white" />
			</div>
			<div className="absolute -bottom-1 -right-1 w-6 h-6 bg-zinc-700 rounded-full border-2 border-zinc-900 flex items-center justify-center">
				<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
			</div>
		</div>
		<div className="text-center space-y-2">
			<h3 className="text-zinc-300 text-xl font-semibold">No conversation selected</h3>
			<p className="text-zinc-500 text-sm max-w-md">
				Choose a friend from the list to start sharing music and chatting
			</p>
		</div>
		<div className="flex items-center gap-4 text-zinc-600">
			<div className="flex items-center gap-2">
				<ImageIcon className="w-4 h-4" />
				<span className="text-xs">Share images</span>
			</div>
			<div className="flex items-center gap-2">
				<Music className="w-4 h-4" />
				<span className="text-xs">Share playlists</span>
			</div>
			<div className="flex items-center gap-2">
				<Users className="w-4 h-4" />
				<span className="text-xs">Real-time chat</span>
			</div>
		</div>
	</div>
);
