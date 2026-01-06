import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useFriendStore } from '@/stores/useFriendStore';
import { 
	Users, 
	UserMinus, 
	MessageCircle, 
	Loader2,
	Search,
	X
} from 'lucide-react';
import { navigateToProfile } from '@/lib/profileUrl';
import VerifiedBadge from '@/components/ui/VerifiedBadge';

const FriendsList = () => {
	const { 
		friends, 
		getFriendsList,
		removeFriend,
		isLoading 
	} = useFriendStore();
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState('');
	const [filteredFriends, setFilteredFriends] = useState<any[]>([]);

	useEffect(() => {
		getFriendsList();
	}, [getFriendsList]);

	// Filter friends based on search query
	useEffect(() => {
		if (!searchQuery.trim()) {
			setFilteredFriends(friends);
		} else {
			const filtered = friends.filter(friend => {
				const searchLower = searchQuery.toLowerCase();
				return (
					friend.fullName?.toLowerCase().includes(searchLower) ||
					friend.artistName?.toLowerCase().includes(searchLower) ||
					friend.handle?.toLowerCase().includes(searchLower)
				);
			});
			setFilteredFriends(filtered);
		}
	}, [friends, searchQuery]);

	const handleUserClick = (user: any) => {
		if (!user) return;
		console.log("🔗 FriendsList - Navigating to profile:", user);
		navigateToProfile(navigate, user);
	};

	const handleRemoveFriend = async (friendId: string) => {
		await removeFriend(friendId);
	};

	const clearSearch = () => {
		setSearchQuery('');
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

	return (
		<Card className="bg-zinc-800/50 border-zinc-700">
			<CardHeader className="pb-3">
				<CardTitle className="text-white text-lg flex items-center gap-2">
					<Users className="size-5" />
					Friends ({filteredFriends.length})
				</CardTitle>
				<CardDescription className="text-zinc-400">
					Your friends list
				</CardDescription>
			</CardHeader>
			
			<CardContent>
				{/* Search Bar */}
				<div className="relative mb-4">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 size-4" />
					<Input
						type="text"
						placeholder="Search friends by name, artist name, or username..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10 pr-10 bg-zinc-800/50 border-zinc-600 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500"
					/>
					{searchQuery && (
						<Button
							size="sm"
							variant="ghost"
							onClick={clearSearch}
							className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-zinc-400 hover:text-white hover:bg-zinc-700"
						>
							<X className="size-3" />
						</Button>
					)}
				</div>

				<ScrollArea className="h-64">
					{filteredFriends.length === 0 ? (
						<div className="text-center py-8">
							{searchQuery ? (
								<>
									<Search className="size-12 text-zinc-500 mx-auto mb-3" />
									<p className="text-zinc-400 text-sm">No friends found</p>
									<p className="text-zinc-500 text-xs mt-1">
										Try adjusting your search terms
									</p>
								</>
							) : (
								<>
									<Users className="size-12 text-zinc-500 mx-auto mb-3" />
									<p className="text-zinc-400 text-sm">No friends yet</p>
									<p className="text-zinc-500 text-xs mt-1">
										Start connecting with other users!
									</p>
								</>
							)}
						</div>
					) : (
						<div className="space-y-3">
							{filteredFriends.map((friend) => (
								<div
									key={friend._id}
									className="flex items-center gap-3 p-3 bg-zinc-700/30 rounded-lg group"
								>
									<Avatar 
										className="w-10 h-10 cursor-pointer"
										onClick={() => handleUserClick(friend)}
									>
										<AvatarImage 
											src={friend.imageUrl} 
											alt={friend.fullName} 
										/>
										<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">
											{friend.fullName.charAt(0)}
										</AvatarFallback>
									</Avatar>
									
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<h4 
												className="text-white font-medium truncate cursor-pointer hover:text-blue-400"
												onClick={() => handleUserClick(friend)}
											>
												{friend.isArtist ? friend.artistName : friend.fullName}
											</h4>
											{friend.isVerified && <VerifiedBadge size="sm" />}
											{friend.isArtist && (
												<Badge variant="secondary" className="text-xs">
													Artist
												</Badge>
											)}
										</div>
										{friend.handle && (
											<p className="text-zinc-400 text-xs">@{friend.handle}</p>
										)}
									</div>
									
									<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										<Button
											size="sm"
											variant="outline"
											onClick={() => navigate(`/chat/${friend.clerkId}`)}
											className="border-zinc-600 text-zinc-400 hover:bg-zinc-600 hover:text-white"
										>
											<MessageCircle className="size-3" />
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleRemoveFriend(friend._id)}
											className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
										>
											<UserMinus className="size-3" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</ScrollArea>
			</CardContent>
		</Card>
	);
};

export default FriendsList;
