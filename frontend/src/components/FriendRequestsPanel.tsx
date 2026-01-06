import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFriendStore } from '@/stores/useFriendStore';
import { 
	Check, 
	X, 
	Users,
	Loader2,
	MessageCircle
} from 'lucide-react';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import { useNavigate } from 'react-router-dom';

const FriendRequestsPanel = () => {
	const { 
		friendRequests, 
		sentRequests, 
		getFriendRequests, 
		getSentFriendRequests,
		acceptFriendRequest,
		rejectFriendRequest,
		cancelFriendRequest,
		isLoading 
	} = useFriendStore();
	const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
	const navigate = useNavigate();

	// Debug logging
	useEffect(() => {
		console.log("🔍 FriendRequestsPanel - Received friend requests:", friendRequests);
		console.log("🔍 FriendRequestsPanel - Sent requests:", sentRequests);
	}, [friendRequests, sentRequests]);

	useEffect(() => {
		getFriendRequests();
		getSentFriendRequests();
	}, [getFriendRequests, getSentFriendRequests]);

	const handleAccept = async (requestId: string) => {
		await acceptFriendRequest(requestId);
	};

	const handleReject = async (requestId: string) => {
		await rejectFriendRequest(requestId);
	};

	const handleCancel = async (requestId: string) => {
		await cancelFriendRequest(requestId);
	};

	const handleUserClick = (clerkId: string) => {
		console.log("🔗 FriendRequestsPanel - Navigating to profile:", clerkId);
		navigate(`/profile/${clerkId}`);
	};

	if (isLoading) {
		return (
			<Card className="bg-zinc-800/50 border-zinc-700">
				<CardContent className="p-6">
					<div className="flex items-center justify-center">
						<Loader2 className="size-6 animate-spin text-blue-500" />
					</div>
				</CardContent>
			</Card>
		);
	}

	const receivedCount = friendRequests.length;
	const sentCount = sentRequests.length;

	return (
		<Card className="bg-zinc-800/50 border-zinc-700">
			<CardHeader className="pb-3">
				<CardTitle className="text-white text-lg flex items-center gap-2">
					<Users className="size-5" />
					Friend Requests
				</CardTitle>
				<CardDescription className="text-zinc-400">
					Manage your friend requests
				</CardDescription>
			</CardHeader>
			
			<CardContent className="space-y-4">
				{/* Tabs */}
				<div className="flex gap-1 bg-zinc-700/30 rounded-lg p-1">
					<button
						onClick={() => setActiveTab('received')}
						className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
							activeTab === 'received'
								? 'bg-blue-600 text-white'
								: 'text-zinc-400 hover:text-white'
						}`}
					>
						Received ({receivedCount})
					</button>
					<button
						onClick={() => setActiveTab('sent')}
						className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
							activeTab === 'sent'
								? 'bg-blue-600 text-white'
								: 'text-zinc-400 hover:text-white'
						}`}
					>
						Sent ({sentCount})
					</button>
				</div>

				{/* Content */}
				<ScrollArea className="h-64">
					{activeTab === 'received' ? (
						<div className="space-y-3">
							{friendRequests.length === 0 ? (
								<div className="text-center py-8">
									<Users className="size-12 text-zinc-500 mx-auto mb-3" />
									<p className="text-zinc-400 text-sm">No friend requests</p>
								</div>
							) : (
								friendRequests.map((request) => (
									<div
										key={request._id}
										className="flex items-center gap-3 p-3 bg-zinc-700/30 rounded-lg"
									>
										<Avatar 
											className="w-10 h-10 cursor-pointer"
											onClick={() => handleUserClick(request.sender?.clerkId || request.senderId)}
										>
											<AvatarImage 
												src={request.sender?.imageUrl} 
												alt={request.sender?.fullName} 
											/>
											<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">
												{request.sender?.fullName?.charAt(0)}
											</AvatarFallback>
										</Avatar>
										
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2">
																							<h4 
												className="text-white font-medium truncate cursor-pointer hover:text-blue-400"
												onClick={() => handleUserClick(request.sender?.clerkId || request.senderId)}
											>
													{request.sender?.isArtist ? request.sender.artistName : request.sender?.fullName}
												</h4>
												{request.sender?.isVerified && <VerifiedBadge size="sm" />}
												{request.sender?.isArtist && (
													<Badge variant="secondary" className="text-xs">
														Artist
													</Badge>
												)}
											</div>
											{request.sender?.handle && (
												<p className="text-zinc-400 text-xs">@{request.sender.handle}</p>
											)}
											{request.message && (
												<p className="text-zinc-300 text-xs mt-1">"{request.message}"</p>
											)}
										</div>
										
										<div className="flex gap-1">
											<Button
												size="sm"
												onClick={() => handleAccept(request._id)}
												className="bg-green-600 hover:bg-green-700"
											>
												<Check className="size-3" />
											</Button>
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleReject(request._id)}
												className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
											>
												<X className="size-3" />
											</Button>
										</div>
									</div>
								))
							)}
						</div>
					) : (
						<div className="space-y-3">
							{sentRequests.length === 0 ? (
								<div className="text-center py-8">
									<MessageCircle className="size-12 text-zinc-500 mx-auto mb-3" />
									<p className="text-zinc-400 text-sm">No sent requests</p>
								</div>
							) : (
								sentRequests.map((request) => (
									<div
										key={request._id}
										className="flex items-center gap-3 p-3 bg-zinc-700/30 rounded-lg"
									>
										<Avatar 
											className="w-10 h-10 cursor-pointer"
											onClick={() => handleUserClick(request.receiver?.clerkId || request.receiverId)}
										>
											<AvatarImage 
												src={request.receiver?.imageUrl} 
												alt={request.receiver?.fullName} 
											/>
											<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">
												{request.receiver?.fullName?.charAt(0)}
											</AvatarFallback>
										</Avatar>
										
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2">
												<h4 
													className="text-white font-medium truncate cursor-pointer hover:text-blue-400"
													onClick={() => handleUserClick(request.receiver?.clerkId || request.receiverId)}
												>
													{request.receiver?.isArtist ? request.receiver.artistName : request.receiver?.fullName}
												</h4>
												{request.receiver?.isVerified && <VerifiedBadge size="sm" />}
												{request.receiver?.isArtist && (
													<Badge variant="secondary" className="text-xs">
														Artist
													</Badge>
												)}
											</div>
											{request.receiver?.handle && (
												<p className="text-zinc-400 text-xs">@{request.receiver.handle}</p>
											)}
											{request.message && (
												<p className="text-zinc-300 text-xs mt-1">"{request.message}"</p>
											)}
										</div>
										
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleCancel(request._id)}
											className="border-zinc-600 text-zinc-400 hover:bg-zinc-600 hover:text-white"
										>
											<X className="size-3" />
										</Button>
									</div>
								))
							)}
						</div>
					)}
				</ScrollArea>
			</CardContent>
		</Card>
	);
};

export default FriendRequestsPanel;
