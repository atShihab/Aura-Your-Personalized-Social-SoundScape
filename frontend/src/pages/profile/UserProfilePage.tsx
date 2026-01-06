import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

import { usePlayerStore } from "@/stores/usePlayerStore";
import { useFriendStore } from "@/stores/useFriendStore";
import { useFollowStore } from "@/stores/useFollowStore";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { 
	ArrowLeft, 
	Edit, 
	Heart, 
	Share2, 
	MessageCircle, 
	Users, 
	Headphones, 
	Music,
	Loader2,
	MoreHorizontal,
	UserPlus,
	UserMinus,
	Instagram,
	Twitter,
	Youtube,
	Globe,
	Play,
	TrendingUp,
	Award,
	Clock,
	Star,
	Activity,
	Calendar,
	Target,
	Upload
} from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import FollowersModal from "./components/FollowersModal";
import PlaylistsSection from "./components/PlaylistsSection";
import FavoritesSection from "./components/FavoritesSection";
import { useFavoritesSync } from "@/hooks/useFavoritesSync";
// import ListeningHistorySection from "./components/ListeningHistorySection";
import FriendRequestModal from "@/components/FriendRequestModal";
import SongRequestDialog from "@/pages/artist/components/SongRequestDialog";

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
	friendCount: number;
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
}

const UserProfilePage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user: currentUser } = useUser();
	const { currentSong, isPlaying, togglePlay } = usePlayerStore();
	const { followArtist, unfollowArtist, checkFollowStatus } = useFollowStore();
	const { checkFriendshipStatus, sentRequests, friendRequests } = useFriendStore();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [stats, setStats] = useState<ProfileStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isFollowing, setIsFollowing] = useState(false);
	const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'friends' | 'request_sent' | 'request_received'>('none');
	const [isOwnProfile, setIsOwnProfile] = useState(false);
	const [error, setError] = useState("");
	const [showFollowersModal, setShowFollowersModal] = useState(false);
	const [showFriendRequestModal, setShowFriendRequestModal] = useState(false);

	// Use the custom hook for real-time favorites synchronization
	useFavoritesSync();

	useEffect(() => {
		if (id) {
			fetchUserProfile();
			fetchProfileStats();
			checkStatuses();
		}
	}, [id]);

	// Watch for changes in friend store to automatically refresh friendship status
	useEffect(() => {
		if (id && currentUser) {
			checkStatuses();
		}
	}, [sentRequests, friendRequests, id, currentUser]);

	const checkStatuses = async () => {
		if (id && currentUser) {
			// Check follow status (only for artists)
			const followStatus = await checkFollowStatus(id);
			setIsFollowing(followStatus);

			// Check friendship status
			const friendshipResult = await checkFriendshipStatus(id);
			setFriendshipStatus(friendshipResult.status);
		}
	};

	useEffect(() => {
		// Check if this is the current user's profile
		if (currentUser && profile) {
			setIsOwnProfile(currentUser.id === profile.clerkId);
		}
	}, [currentUser, profile]);

	const fetchUserProfile = async () => {
		try {
			console.log("🔍 Fetching profile for user ID:", id);
			console.log("🌐 API URL:", `${axiosInstance.defaults.baseURL}/users/profile/${id}`);
			
			const response = await axiosInstance.get(`/users/profile/${id}`);
			console.log("✅ Profile response:", response.data);
			console.log("👤 User data:", response.data.user);
			
			setProfile(response.data.user);
			setIsFollowing(response.data.isFollowing);
		} catch (err: any) {
			console.error("❌ Error fetching user profile:", err);
			console.error("❌ Error details:", err.response?.data);
			setError(err.response?.data?.message || "Failed to fetch user profile");
		} finally {
			setIsLoading(false);
		}
	};

	const fetchProfileStats = async () => {
		try {
			const response = await axiosInstance.get(`/users/${id}/stats`);
			setStats(response.data);
		} catch (err: any) {
			console.error("Error fetching profile stats:", err);
			// Use mock data for now
			setStats({
				totalListeningTime: 0,
				topGenres: [],
				recentActivity: "No recent activity"
			});
		}
	};

	const handleFollow = async () => {
		if (!currentUser) {
			toast.error("Please sign in to follow artists");
			return;
		}

		if (!profile?.isArtist) {
			toast.error("You can only follow artists");
			return;
		}

		try {
			if (isFollowing) {
				await unfollowArtist(id!);
				setIsFollowing(false);
				setProfile(prev => prev ? { ...prev, followers: prev.followers - 1 } : null);
			} else {
				await followArtist(id!);
				setIsFollowing(true);
				setProfile(prev => prev ? { ...prev, followers: prev.followers + 1 } : null);
			}
		} catch (err: any) {
			console.error("Error following/unfollowing:", err);
			toast.error("Failed to update follow status");
		}
	};

	const handleShare = () => {
		const profileUrl = `${window.location.origin}/profile/${id}`;
		if (navigator.share) {
			navigator.share({
				title: `${profile?.fullName}'s Profile`,
				text: `Check out ${profile?.fullName}'s music profile on Aura!`,
				url: profileUrl
			});
		} else {
			navigator.clipboard.writeText(profileUrl);
			toast.success("Profile link copied to clipboard!");
		}
	};

	const handleEditProfile = () => {
		navigate("/profile/edit");
	};

	if (isLoading) {
		return (
			<div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="size-12 text-emerald-500 animate-spin mx-auto mb-4" />
					<h3 className="text-white text-xl font-bold mb-2">Loading Profile</h3>
					<p className="text-zinc-400">Please wait...</p>
				</div>
			</div>
		);
	}

	if (error || !profile) {
		return (
			<div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
				<div className="text-center">
					<h3 className="text-white text-xl font-bold mb-2">Profile Not Found</h3>
					<p className="text-zinc-400 text-sm mb-4">{error || "This profile doesn't exist"}</p>
					<Button onClick={() => navigate(-1)} variant="outline">
						<ArrowLeft className="size-4 mr-2" />
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	return (
		<main className="rounded-md overflow-hidden h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 relative">
			{/* Animated Background Pattern */}
			<div className="absolute inset-0 opacity-5">
				<div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-blue-500/20 to-purple-500/20 animate-pulse"></div>
				<div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-bounce"></div>
				<div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
			</div>

			{/* Back Button */}
			<div className="relative p-3 sm:p-4 md:p-6">
				<Button
					variant="ghost"
					onClick={() => navigate(-1)}
					className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 backdrop-blur-sm transition-all duration-300 group"
				>
					<ArrowLeft className="size-4 mr-2 group-hover:-translate-x-1 transition-transform" />
					Back
				</Button>
			</div>

			<ScrollArea className="h-[calc(100vh-180px)] relative">
				<div className="p-3 sm:p-4 md:p-6">
				{/* Enhanced Profile Header */}
				<div className="relative mb-8">
					{/* Profile Info */}
					<div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
						{/* Enhanced Profile Image */}
						<div className="relative group">
							<div className="relative">
								<Avatar className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 border-4 border-zinc-900 shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-emerald-500/25">
									<AvatarImage src={profile.imageUrl} alt={profile.fullName} className="object-cover" />
									<AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600">
										{profile.fullName.charAt(0)}
									</AvatarFallback>
								</Avatar>
								
								{/* Glowing ring effect */}
								<div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
							</div>
							
							{/* Artist Badge */}
							{profile.isArtist && (
								<div className="absolute -bottom-3 -right-3 animate-pulse">
									<Badge className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-3 py-1.5 text-xs font-medium shadow-lg border border-emerald-400/30">
										<Music className="size-3 mr-1" />
										Artist
									</Badge>
								</div>
							)}
							
							{/* Verification Badge */}
							{profile.isVerified && (
								<div className="absolute -top-3 -right-3 animate-bounce">
									<VerifiedBadge size="md" />
								</div>
							)}
						</div>

						{/* Enhanced Profile Details */}
						<div className="flex-1 text-white space-y-4">
							<div className="space-y-3">
								<div className="flex-1">
									<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 flex items-center gap-3 bg-gradient-to-r from-white via-emerald-100 to-blue-100 bg-clip-text text-transparent">
										{profile.fullName}
										{profile.isVerified && (
											<VerifiedBadge size="sm" />
										)}
									</h1>
									{profile.handle && (
										<p className="text-emerald-400 text-lg md:text-xl font-medium mb-3 flex items-center gap-2">
											<span className="bg-emerald-500/20 px-3 py-1 rounded-full text-sm">@{profile.handle}</span>
										</p>
									)}
									{profile.bio && (
										<p className="text-zinc-300 text-base mb-4 max-w-2xl leading-relaxed">
											{profile.bio}
										</p>
									)}
									{profile.favoriteGenres && profile.favoriteGenres.length > 0 && (
										<div className="flex flex-wrap gap-2 mb-4">
											{profile.favoriteGenres.slice(0, 5).map((genre, index) => (
												<Badge 
													key={index} 
													className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 text-sm font-medium hover:scale-105 transition-transform cursor-pointer"
												>
													<Music className="size-3 mr-1" />
													{genre}
												</Badge>
											))}
											{profile.favoriteGenres.length > 5 && (
												<Badge className="bg-zinc-800/50 border border-zinc-600 text-zinc-400 px-3 py-1 text-sm hover:bg-zinc-700/50 transition-colors cursor-pointer">
													+{profile.favoriteGenres.length - 5} more
												</Badge>
											)}
										</div>
									)}

									{/* Enhanced Social Media Links */}
									{profile.socialMedia && Object.values(profile.socialMedia).some(link => link) && (
										<div className="flex flex-wrap gap-3 mb-4">
											{profile.socialMedia.instagram && (
												<a 
													href={profile.socialMedia.instagram} 
													target="_blank" 
													rel="noopener noreferrer"
													className="p-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-lg text-pink-400 hover:text-pink-300 hover:bg-pink-500/30 transition-all duration-300 hover:scale-110 group"
												>
													<Instagram className="size-5 group-hover:rotate-12 transition-transform" />
												</a>
											)}
											{profile.socialMedia.twitter && (
												<a 
													href={profile.socialMedia.twitter} 
													target="_blank" 
													rel="noopener noreferrer"
													className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/30 transition-all duration-300 hover:scale-110 group"
												>
													<Twitter className="size-5 group-hover:rotate-12 transition-transform" />
												</a>
											)}
											{profile.socialMedia.youtube && (
												<a 
													href={profile.socialMedia.youtube} 
													target="_blank" 
													rel="noopener noreferrer"
													className="p-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/30 transition-all duration-300 hover:scale-110 group"
												>
													<Youtube className="size-5 group-hover:rotate-12 transition-transform" />
												</a>
											)}
											{profile.socialMedia.website && (
												<a 
													href={profile.socialMedia.website} 
													target="_blank" 
													rel="noopener noreferrer"
													className="p-2 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/30 transition-all duration-300 hover:scale-110 group"
												>
													<Globe className="size-5 group-hover:rotate-12 transition-transform" />
												</a>
											)}
										</div>
									)}
								</div>
							</div>

							{/* Enhanced Stats */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
								{profile.isArtist ? (
									<>
										<button 
											onClick={() => setShowFollowersModal(true)}
											className="group p-4 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all duration-300 hover:scale-105 cursor-pointer"
										>
											<div className="text-2xl md:text-3xl font-bold text-white group-hover:text-emerald-300 transition-colors">{profile.followers}</div>
											<div className="text-emerald-400 text-sm font-medium">Followers</div>
											<div className="w-full bg-emerald-500/20 rounded-full h-1 mt-2">
												<div className="bg-emerald-500 h-1 rounded-full transition-all duration-500" style={{ width: `${Math.min(profile.followers / 100, 100)}%` }}></div>
											</div>
										</button>
										<button 
											onClick={() => setShowFollowersModal(true)}
											className="group p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all duration-300 hover:scale-105 cursor-pointer"
										>
											<div className="text-2xl md:text-3xl font-bold text-white group-hover:text-blue-300 transition-colors">{profile.following}</div>
											<div className="text-blue-400 text-sm font-medium">Following</div>
											<div className="w-full bg-blue-500/20 rounded-full h-1 mt-2">
												<div className="bg-blue-500 h-1 rounded-full transition-all duration-500" style={{ width: `${Math.min(profile.following / 50, 100)}%` }}></div>
											</div>
										</button>
									</>
								) : (
									<button className="group p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-all duration-300 hover:scale-105 cursor-pointer">
										<div className="text-2xl md:text-3xl font-bold text-white group-hover:text-purple-300 transition-colors">{profile.friendCount}</div>
										<div className="text-purple-400 text-sm font-medium">Friends</div>
										<div className="w-full bg-purple-500/20 rounded-full h-1 mt-2">
											<div className="bg-purple-500 h-1 rounded-full transition-all duration-500" style={{ width: `${Math.min(profile.friendCount / 20, 100)}%` }}></div>
										</div>
									</button>
								)}
								{stats && (
									<button className="group p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl hover:bg-orange-500/20 transition-all duration-300 hover:scale-105 cursor-pointer">
										<div className="text-2xl md:text-3xl font-bold text-white group-hover:text-orange-300 transition-colors">
											{Math.round(stats.totalListeningTime / 60)}h
										</div>
										<div className="text-orange-400 text-sm font-medium">Listening Time</div>
										<div className="w-full bg-orange-500/20 rounded-full h-1 mt-2">
											<div className="bg-orange-500 h-1 rounded-full transition-all duration-500" style={{ width: `${Math.min((stats.totalListeningTime / 60) / 10, 100)}%` }}></div>
										</div>
									</button>
								)}
								<div className="group p-4 bg-gradient-to-br from-zinc-500/10 to-zinc-600/10 border border-zinc-500/20 rounded-xl hover:bg-zinc-500/20 transition-all duration-300 hover:scale-105 cursor-pointer">
									<div className="text-2xl md:text-3xl font-bold text-white group-hover:text-zinc-300 transition-colors">
										{new Date(profile.createdAt).getFullYear()}
									</div>
									<div className="text-zinc-400 text-sm font-medium">Member Since</div>
									<div className="w-full bg-zinc-500/20 rounded-full h-1 mt-2">
										<div className="bg-zinc-500 h-1 rounded-full transition-all duration-500" style={{ width: `${((new Date().getFullYear() - new Date(profile.createdAt).getFullYear()) / 10) * 100}%` }}></div>
									</div>
								</div>
							</div>

							{/* Enhanced Action Buttons */}
							<div className="flex flex-wrap gap-3">
								{!isOwnProfile && (
									<>
										{/* Follow button (only for artists) */}
										{profile.isArtist && (
											<Button
												onClick={handleFollow}
												variant={isFollowing ? "outline" : "default"}
												size="default"
												className={`flex items-center gap-2 px-6 py-2.5 font-medium transition-all duration-300 hover:scale-105 ${
													isFollowing 
														? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300" 
														: "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg hover:shadow-emerald-500/25"
												}`}
											>
												{isFollowing ? <UserMinus className="size-4" /> : <UserPlus className="size-4" />}
												{isFollowing ? "Unfollow" : "Follow"}
											</Button>
										)}

										{/* Friend request button (for all users) */}
										{!profile.isArtist && friendshipStatus === 'none' && (
											<Button
												onClick={() => setShowFriendRequestModal(true)}
												variant="default"
												size="default"
												className="flex items-center gap-2 px-6 py-2.5 font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
											>
												<UserPlus className="size-4" />
												Add Friend
											</Button>
										)}

										{/* Friend request status buttons */}
										{!profile.isArtist && friendshipStatus === 'request_sent' && (
											<Button
												variant="outline"
												size="default"
												className="flex items-center gap-2 px-6 py-2.5 font-medium bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all duration-300"
												disabled
											>
												<MessageCircle className="size-4" />
												Request Sent
											</Button>
										)}

										{!profile.isArtist && friendshipStatus === 'request_received' && (
											<Button
												variant="outline"
												size="default"
												className="flex items-center gap-2 px-6 py-2.5 font-medium bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20 transition-all duration-300"
												disabled
											>
												<MessageCircle className="size-4" />
												Request Received
											</Button>
										)}

										{!profile.isArtist && friendshipStatus === 'friends' && (
											<Button
												variant="outline"
												size="default"
												className="flex items-center gap-2 px-6 py-2.5 font-medium bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all duration-300"
												disabled
											>
												<UserPlus className="size-4" />
												Friends
											</Button>
										)}
									</>
								)}
								
								{isOwnProfile && (
									<>
										<Button
											onClick={handleEditProfile}
											variant="outline"
											size="default"
											className="flex items-center gap-2 px-6 py-2.5 font-medium bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-300 hover:scale-105"
										>
											<Edit className="size-4" />
											Edit Profile
										</Button>
										
										{/* Upload Song button - Only for verified artists */}
										{profile.isArtist && profile.isVerified && (
											<SongRequestDialog
												type="upload"
												trigger={
													<Button
														variant="default"
														size="default"
														className="flex items-center gap-2 px-6 py-2.5 font-medium bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
													>
														<Upload className="size-4" />
														Upload Song
													</Button>
												}
											/>
										)}
									</>
								)}

								<Button
									onClick={handleShare}
									variant="outline"
									size="default"
									className="flex items-center gap-2 px-6 py-2.5 font-medium bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:text-green-300 transition-all duration-300 hover:scale-105"
								>
									<Share2 className="size-4" />
									Share
								</Button>

								{!isOwnProfile && (
									<Button
										onClick={() => navigate(`/chat/${profile?.clerkId}`)}
										variant="outline"
										size="default"
										className="flex items-center gap-2 px-6 py-2.5 font-medium bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 transition-all duration-300 hover:scale-105"
									>
										<MessageCircle className="size-4" />
										Message
									</Button>
								)}

								<Button 
									variant="ghost" 
									size="default"
									className="flex items-center gap-2 px-6 py-2.5 font-medium bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-white transition-all duration-300 hover:scale-105"
								>
									<MoreHorizontal className="size-4" />
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* Enhanced Profile Content Tabs */}
				<Tabs defaultValue="overview" className="w-full">
					<TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-zinc-800/50 to-zinc-700/50 backdrop-blur-sm border border-zinc-600/30 mb-6 rounded-xl p-1">
						<TabsTrigger value="overview" className="text-zinc-300 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-emerald-500/30 rounded-lg transition-all duration-300">
							<Activity className="size-4 mr-2" />
							Overview
						</TabsTrigger>
						<TabsTrigger value="music" className="text-zinc-300 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-purple-500/30 rounded-lg transition-all duration-300">
							<Music className="size-4 mr-2" />
							Music
						</TabsTrigger>
						<TabsTrigger value="activity" className="text-zinc-300 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-red-500/20 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-orange-500/30 rounded-lg transition-all duration-300">
							<Clock className="size-4 mr-2" />
							Activity
						</TabsTrigger>
						<TabsTrigger value="stats" className="text-zinc-300 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-blue-500/30 rounded-lg transition-all duration-300">
							<TrendingUp className="size-4 mr-2" />
							Stats
						</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="mt-6">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							{/* Enhanced Currently Listening */}
							{currentSong && isPlaying && (
								<Card className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 cursor-pointer hover:bg-emerald-500/20 transition-all duration-300 hover:scale-105 group" onClick={togglePlay}>
									<CardHeader className="pb-3">
										<CardTitle className="text-emerald-300 flex items-center gap-2 text-sm font-semibold">
											<Headphones className="size-4 group-hover:animate-pulse" />
											Currently Listening
										</CardTitle>
									</CardHeader>
									<CardContent className="pt-0">
										<div className="flex items-center gap-4">
											<div className="relative">
												<img 
													src={currentSong.imageUrl || "https://via.placeholder.com/60x60/374151/FFFFFF?text=🎵"} 
													alt={currentSong.title}
													className="w-12 h-12 rounded-lg object-cover group-hover:scale-110 transition-transform duration-300"
												/>
												<div className="absolute inset-0 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors"></div>
											</div>
											<div className="flex-1 min-w-0">
												<div className="text-white font-semibold text-sm truncate group-hover:text-emerald-300 transition-colors">
													{currentSong.title}
												</div>
												<div className="text-emerald-400 text-xs truncate">
													{currentSong.artist}
												</div>
												<div className="mt-2">
													<div className="w-full bg-zinc-700/50 rounded-full h-1.5">
														<div 
															className="bg-gradient-to-r from-emerald-500 to-blue-500 h-1.5 rounded-full transition-all duration-500 animate-pulse"
															style={{ width: "45%" }}
														></div>
													</div>
													<div className="text-emerald-500 text-xs mt-1 font-medium">
														Now playing
													</div>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							)}

							{/* Enhanced Not Currently Listening */}
							{(!currentSong || !isPlaying) && (
								<Card className="bg-gradient-to-br from-zinc-800/50 to-zinc-700/50 border border-zinc-600/30 hover:bg-zinc-700/50 transition-all duration-300">
									<CardHeader className="pb-3">
										<CardTitle className="text-zinc-300 flex items-center gap-2 text-sm font-semibold">
											<Headphones className="size-4" />
											Currently Listening
										</CardTitle>
									</CardHeader>
									<CardContent className="pt-0">
										<div className="text-center py-6">
											<div className="w-16 h-16 bg-gradient-to-br from-zinc-600 to-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
												<Headphones className="size-8 text-zinc-400" />
											</div>
											<div className="text-zinc-400 text-sm mb-4 font-medium">
												{isOwnProfile ? "You're not listening to anything" : "Not currently listening"}
											</div>
											{isOwnProfile && currentSong && (
												<Button 
													variant="outline" 
													size="default"
													onClick={togglePlay}
													className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all duration-300"
												>
													<Play className="size-4" />
													Resume
												</Button>
											)}
										</div>
									</CardContent>
								</Card>
							)}

							{/* Enhanced Recent Activity */}
							<Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 hover:bg-orange-500/20 transition-all duration-300 hover:scale-105">
								<CardHeader className="pb-3">
									<CardTitle className="text-orange-300 flex items-center gap-2 text-sm font-semibold">
										<Activity className="size-4" />
										Recent Activity
									</CardTitle>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="flex items-center gap-3">
										<div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
										<p className="text-orange-200 text-sm font-medium">
											{stats?.recentActivity || "No recent activity"}
										</p>
									</div>
								</CardContent>
							</Card>

							{/* Enhanced Quick Stats */}
							<Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-all duration-300 hover:scale-105">
								<CardHeader className="pb-3">
									<CardTitle className="text-blue-300 flex items-center gap-2 text-sm font-semibold">
										<TrendingUp className="size-4" />
										Quick Stats
									</CardTitle>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="space-y-4">
										<div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
											<span className="text-blue-300 text-sm font-medium">Top Genre</span>
											<span className="text-white text-sm font-semibold">
												{stats?.topGenres?.[0] || "None"}
											</span>
										</div>
										<div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
											<span className="text-purple-300 text-sm font-medium">This Week</span>
											<span className="text-white text-sm font-semibold">
												{Math.round((stats?.totalListeningTime || 0) / 60)}h
											</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="music" className="mt-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{/* Enhanced Playlists */}
							<div className="md:col-span-2 lg:col-span-1">
								<div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-1">
									<PlaylistsSection userId={id || ""} />
								</div>
							</div>

							{/* Enhanced Favorites */}
							<div className="md:col-span-2 lg:col-span-1">
								<div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-xl p-1">
									<FavoritesSection userId={id || ""} />
								</div>
							</div>

							{/* Enhanced Recently Added */}
							<Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all duration-300 hover:scale-105">
								<CardHeader className="pb-3">
									<CardTitle className="text-cyan-300 flex items-center gap-2 text-sm font-semibold">
										<Star className="size-4" />
										Recently Added
									</CardTitle>
									<CardDescription className="text-cyan-200 text-xs">
										Latest additions to your library
									</CardDescription>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="text-center py-8">
										<div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
											<Star className="size-8 text-cyan-400" />
										</div>
										<p className="text-cyan-300 text-sm font-medium">
											Recently added songs will appear here
										</p>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="activity" className="mt-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{/* Enhanced Listening History */}
							<Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 hover:bg-orange-500/20 transition-all duration-300 hover:scale-105">
								<CardHeader className="pb-3">
									<CardTitle className="text-orange-300 flex items-center gap-2 text-sm font-semibold">
										<Clock className="size-4" />
										Listening History
									</CardTitle>
									<CardDescription className="text-orange-200 text-xs">
										Recent songs and albums
									</CardDescription>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="space-y-4">
										<div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-all duration-300 cursor-pointer group">
											<div className="relative">
												<img 
													src="https://via.placeholder.com/40x40/374151/FFFFFF?text=🎵" 
													alt="Song" 
													className="w-10 h-10 rounded-lg group-hover:scale-110 transition-transform duration-300"
												/>
												<div className="absolute inset-0 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors"></div>
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-white text-sm font-semibold truncate group-hover:text-orange-300 transition-colors">Bohemian Rhapsody</p>
												<p className="text-orange-300 text-xs truncate">Queen</p>
											</div>
											<span className="text-orange-400 text-xs font-medium">2h ago</span>
										</div>
										<div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-all duration-300 cursor-pointer group">
											<div className="relative">
												<img 
													src="https://via.placeholder.com/40x40/374151/FFFFFF?text=🎵" 
													alt="Song" 
													className="w-10 h-10 rounded-lg group-hover:scale-110 transition-transform duration-300"
												/>
												<div className="absolute inset-0 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors"></div>
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-white text-sm font-semibold truncate group-hover:text-orange-300 transition-colors">Hotel California</p>
												<p className="text-orange-300 text-xs truncate">Eagles</p>
											</div>
											<span className="text-orange-400 text-xs font-medium">5h ago</span>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Enhanced Recent Activity */}
							<Card className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all duration-300 hover:scale-105">
								<CardHeader className="pb-3">
									<CardTitle className="text-emerald-300 flex items-center gap-2 text-sm font-semibold">
										<Activity className="size-4" />
										Recent Activity
									</CardTitle>
									<CardDescription className="text-emerald-200 text-xs">
										Your recent actions
									</CardDescription>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="space-y-4">
										<div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-lg">
											<div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
											<div className="flex-1">
												<p className="text-white text-sm font-medium">Liked "Bohemian Rhapsody"</p>
												<p className="text-emerald-300 text-xs">2 hours ago</p>
											</div>
										</div>
										<div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg">
											<div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
											<div className="flex-1">
												<p className="text-white text-sm font-medium">Added to playlist</p>
												<p className="text-blue-300 text-xs">Yesterday</p>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Enhanced Listening Streak */}
							<Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-all duration-300 hover:scale-105">
								<CardHeader className="pb-3">
									<CardTitle className="text-purple-300 flex items-center gap-2 text-sm font-semibold">
										<Target className="size-4" />
										Listening Streak
									</CardTitle>
									<CardDescription className="text-purple-200 text-xs">
										Your daily listening habit
									</CardDescription>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="text-center py-4">
										<div className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">7</div>
										<div className="text-purple-300 text-sm font-medium">days in a row</div>
										<div className="w-full bg-purple-500/20 rounded-full h-2 mt-4">
											<div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500" style={{ width: "70%" }}></div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="stats" className="mt-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{/* Enhanced Listening Statistics */}
							<Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-all duration-300 hover:scale-105 h-full">
								<CardHeader className="pb-3">
									<CardTitle className="text-blue-300 flex items-center gap-2 text-sm font-semibold">
										<TrendingUp className="size-4" />
										Listening Statistics
									</CardTitle>
									<CardDescription className="text-blue-200 text-xs">
										Your music listening insights
									</CardDescription>
								</CardHeader>
								<CardContent className="pt-0 flex-1">
									<div className="space-y-6 h-full">
										<div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
											<div className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
												{Math.round((stats?.totalListeningTime || 0) / 60)}h
											</div>
											<div className="text-blue-300 text-sm font-medium">Total Listening</div>
											<div className="w-full bg-blue-500/20 rounded-full h-2 mt-4">
												<div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min((stats?.totalListeningTime || 0) / 600, 100)}%` }}></div>
											</div>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div className="text-center p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
												<div className="text-2xl font-bold text-white">
													{stats?.topGenres?.length || 0}
												</div>
												<div className="text-cyan-300 text-xs font-medium">Genres</div>
											</div>
											<div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
												<div className="text-2xl font-bold text-white">
													{profile.followers}
												</div>
												<div className="text-blue-300 text-xs font-medium">Followers</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Enhanced Weekly Overview */}
							<Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-all duration-300 hover:scale-105 h-full">
								<CardHeader className="pb-3">
									<CardTitle className="text-purple-300 flex items-center gap-2 text-sm font-semibold">
										<Calendar className="size-4" />
										Weekly Overview
									</CardTitle>
									<CardDescription className="text-purple-200 text-xs">
										This week's listening habits
									</CardDescription>
								</CardHeader>
								<CardContent className="pt-0 flex-1">
									<div className="space-y-6 h-full">
										<div className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
											<div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
												<span className="text-white text-lg font-bold">P</span>
											</div>
											<div className="flex-1">
												<div className="text-white text-lg font-semibold">Pop</div>
												<div className="text-purple-300 text-sm">Most played genre</div>
											</div>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div className="text-center p-4 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-lg border border-pink-500/20">
												<div className="text-2xl font-bold text-white">127</div>
												<div className="text-pink-300 text-xs font-medium">Songs</div>
											</div>
											<div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
												<div className="text-2xl font-bold text-white">2.3h</div>
												<div className="text-purple-300 text-xs font-medium">Daily avg</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Enhanced Achievements */}
							<Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all duration-300 hover:scale-105 h-full">
								<CardHeader className="pb-3">
									<CardTitle className="text-emerald-300 flex items-center gap-2 text-sm font-semibold">
										<Award className="size-4" />
										Achievements
									</CardTitle>
									<CardDescription className="text-emerald-200 text-xs">
										Your music milestones
									</CardDescription>
								</CardHeader>
								<CardContent className="pt-0 flex-1">
									<div className="space-y-4 h-full">
										<div className="flex items-center gap-4 p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-all duration-300 cursor-pointer group">
											<div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
												<span className="text-white text-lg font-bold">✓</span>
											</div>
											<div>
												<div className="text-white text-sm font-semibold">First Song</div>
												<div className="text-emerald-400 text-xs font-medium">Unlocked</div>
											</div>
										</div>
										<div className="flex items-center gap-4 p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-all duration-300 cursor-pointer group">
											<div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
												<span className="text-white text-lg font-bold">✓</span>
											</div>
											<div>
												<div className="text-white text-sm font-semibold">10 Hours</div>
												<div className="text-emerald-400 text-xs font-medium">Unlocked</div>
											</div>
										</div>
										<div className="flex items-center gap-4 p-4 bg-gradient-to-br from-zinc-600/10 to-zinc-700/10 rounded-lg border border-zinc-600/20">
											<div className="w-10 h-10 bg-gradient-to-br from-zinc-600 to-zinc-700 rounded-full flex items-center justify-center">
												<span className="text-zinc-400 text-lg font-bold">?</span>
											</div>
											<div>
												<div className="text-zinc-400 text-sm font-semibold">100 Hours</div>
												<div className="text-zinc-500 text-xs font-medium">Locked</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>
				</Tabs>
				</div>
			</ScrollArea>

			{/* Followers Modal */}
			<FollowersModal
				isOpen={showFollowersModal}
				onClose={() => setShowFollowersModal(false)}
				userId={id || ""}
				userName={profile.fullName}
				followersCount={profile.followers}
				followingCount={profile.following}
			/>

			{/* Friend Request Modal */}
			<FriendRequestModal
				isOpen={showFriendRequestModal}
				onClose={() => setShowFriendRequestModal(false)}
				userId={id || ""}
				userName={profile.fullName}
				userImage={profile.imageUrl}
				userHandle={profile.handle}
				isArtist={profile.isArtist}
				artistName={profile.artistName}
				isVerified={profile.isVerified}
				onStatusChange={checkStatuses}
			/>
		</main>
	);
};

export default UserProfilePage;
