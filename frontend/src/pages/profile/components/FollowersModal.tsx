import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, UserPlus, UserMinus } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

interface User {
	_id: string;
	clerkId: string;
	fullName: string;
	imageUrl: string;
	handle?: string;
	isArtist?: boolean;
}

interface FollowersModalProps {
	isOpen: boolean;
	onClose: () => void;
	userId: string;
	userName: string;
	followersCount: number;
	followingCount: number;
}

const FollowersModal = ({ 
	isOpen, 
	onClose, 
	userId, 
	userName, 
	followersCount, 
	followingCount 
}: FollowersModalProps) => {
	const [activeTab, setActiveTab] = useState("followers");
	const [followers, setFollowers] = useState<User[]>([]);
	const [following, setFollowing] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (isOpen) {
			fetchFollowers();
			fetchFollowing();
		}
	}, [isOpen, userId]);

	const fetchFollowers = async () => {
		setIsLoading(true);
		try {
			const response = await axiosInstance.get(`/users/${userId}/followers`);
			setFollowers(response.data.followers);
		} catch (error) {
			console.error("Error fetching followers:", error);
			// Mock data for now
			setFollowers([
				{
					_id: "1",
					clerkId: "user_1",
					fullName: "John Doe",
					imageUrl: "https://example.com/avatar1.jpg",
					handle: "johndoe"
				},
				{
					_id: "2",
					clerkId: "user_2",
					fullName: "Jane Smith",
					imageUrl: "https://example.com/avatar2.jpg",
					handle: "janesmith"
				}
			]);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchFollowing = async () => {
		try {
			const response = await axiosInstance.get(`/users/${userId}/following`);
			setFollowing(response.data.following);
		} catch (error) {
			console.error("Error fetching following:", error);
			// Mock data for now
			setFollowing([
				{
					_id: "3",
					clerkId: "user_3",
					fullName: "Bob Johnson",
					imageUrl: "https://example.com/avatar3.jpg",
					handle: "bobjohnson"
				}
			]);
		}
	};

	const handleFollow = async (targetUserId: string) => {
		try {
			await axiosInstance.post(`/users/${targetUserId}/follow`);
			toast.success("Followed successfully");
			// Refresh the lists
			fetchFollowers();
			fetchFollowing();
		} catch (error) {
			console.error("Error following user:", error);
			toast.error("Failed to follow user");
		}
	};

	const handleUnfollow = async (targetUserId: string) => {
		try {
			await axiosInstance.delete(`/users/${targetUserId}/follow`);
			toast.success("Unfollowed successfully");
			// Refresh the lists
			fetchFollowers();
			fetchFollowing();
		} catch (error) {
			console.error("Error unfollowing user:", error);
			toast.error("Failed to unfollow user");
		}
	};

	const renderUserList = (users: User[], type: "followers" | "following") => {
		if (isLoading) {
			return (
				<div className="flex items-center justify-center py-8">
					<Loader2 className="size-6 animate-spin text-emerald-500" />
				</div>
			);
		}

		if (users.length === 0) {
			return (
				<div className="text-center py-8">
					<p className="text-zinc-500">
						{type === "followers" 
							? "No followers yet" 
							: "Not following anyone yet"
						}
					</p>
				</div>
			);
		}

		return (
			<div className="space-y-3">
				{users.map((user) => (
					<div key={user._id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
						<div className="flex items-center gap-3">
							<Avatar className="w-10 h-10">
								<AvatarImage src={user.imageUrl} alt={user.fullName} />
								<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">
									{user.fullName.charAt(0)}
								</AvatarFallback>
							</Avatar>
							<div>
								<div className="text-white font-medium">{user.fullName}</div>
								{user.handle && (
									<div className="text-zinc-400 text-sm">@{user.handle}</div>
								)}
							</div>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleFollow(user.clerkId)}
							className="flex items-center gap-1"
						>
							<UserPlus className="size-3" />
							Follow
						</Button>
					</div>
				))}
			</div>
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-md bg-zinc-900 border-zinc-700">
				<DialogHeader>
					<DialogTitle className="text-white">
						{userName}'s Connections
					</DialogTitle>
				</DialogHeader>
				
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full grid-cols-2 bg-zinc-800/50">
						<TabsTrigger value="followers" className="text-zinc-300">
							Followers ({followersCount})
						</TabsTrigger>
						<TabsTrigger value="following" className="text-zinc-300">
							Following ({followingCount})
						</TabsTrigger>
					</TabsList>
					
					<TabsContent value="followers" className="mt-4">
						{renderUserList(followers, "followers")}
					</TabsContent>
					
					<TabsContent value="following" className="mt-4">
						{renderUserList(following, "following")}
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
};

export default FollowersModal;
