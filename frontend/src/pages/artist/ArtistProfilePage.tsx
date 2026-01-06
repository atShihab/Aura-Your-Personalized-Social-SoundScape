import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useParams, useNavigate } from "react-router-dom";
import { useFollowStore } from "@/stores/useFollowStore";
import { 
	Heart, 
	Share2, 
	MessageCircle, 
	Play, 
	Pause, 
	Users, 
	Headphones, 
	Calendar,
	Instagram,
	Twitter,
	Youtube,
	Globe,
	Music,
	Loader2,
	ArrowLeft
} from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

interface Artist {
	_id: string;
	clerkId: string;
	artistName: string;
	genre: string;
	bio: string;
	imageUrl: string;
	isVerified: boolean;
	verificationDate?: string;
	followers: number;
	following: number;
	totalPlays: number;
	monthlyListeners: number;
	socialMedia: {
		instagram?: string;
		twitter?: string;
		youtube?: string;
		tiktok?: string;
		website?: string;
	};
	createdAt: string;
}

interface Song {
	_id: string;
	title: string;
	artist: string;
	imageUrl: string;
	audioUrl: string;
	duration: number;
	plays: number;
}

const ArtistProfilePage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { followArtist, unfollowArtist, checkFollowStatus: checkFollowStatusFromStore } = useFollowStore();
	const [artist, setArtist] = useState<Artist | null>(null);
	const [songs, setSongs] = useState<Song[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isFollowing, setIsFollowing] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (id) {
			fetchArtistProfile();
			fetchArtistSongs();
			checkFollowStatus();
		}
	}, [id]);

	const checkFollowStatus = async () => {
		if (id) {
			const followStatus = await checkFollowStatusFromStore(id);
			setIsFollowing(followStatus);
		}
	};

	const fetchArtistProfile = async () => {
		try {
			const response = await axiosInstance.get(`/artists/${id}`);
			setArtist(response.data.artist);
			setIsFollowing(response.data.isFollowing);
		} catch (err: any) {
			console.error("Error fetching artist profile:", err);
			setError(err.response?.data?.message || "Failed to fetch artist profile");
		} finally {
			setIsLoading(false);
		}
	};

	const fetchArtistSongs = async () => {
		try {
			// This would need to be implemented in your backend
			// For now, we'll use mock data
			const mockSongs: Song[] = [
				{
					_id: "1",
					title: "Sample Song 1",
					artist: artist?.artistName || "Artist",
					imageUrl: artist?.imageUrl || "",
					audioUrl: "/songs/1.mp3",
					duration: 180,
					plays: 1500
				},
				{
					_id: "2",
					title: "Sample Song 2",
					artist: artist?.artistName || "Artist",
					imageUrl: artist?.imageUrl || "",
					audioUrl: "/songs/2.mp3",
					duration: 210,
					plays: 1200
				}
			];
			setSongs(mockSongs);
		} catch (err: any) {
			console.error("Error fetching artist songs:", err);
		}
	};

	const handleFollow = async () => {
		try {
			if (isFollowing) {
				await unfollowArtist(id!);
				setIsFollowing(false);
				setArtist(prev => prev ? { ...prev, followers: prev.followers - 1 } : null);
			} else {
				await followArtist(id!);
				setIsFollowing(true);
				setArtist(prev => prev ? { ...prev, followers: prev.followers + 1 } : null);
			}
		} catch (err: any) {
			console.error("Error following/unfollowing:", err);
			toast.error("Failed to update follow status");
		}
	};

	const handleShare = () => {
		if (navigator.share) {
			navigator.share({
				title: `${artist?.artistName} on Aura`,
				url: window.location.href,
			});
		} else {
			navigator.clipboard.writeText(window.location.href);
			toast.success("Profile link copied to clipboard!");
		}
	};

	const formatNumber = (num: number) => {
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1) + 'M';
		} else if (num >= 1000) {
			return (num / 1000).toFixed(1) + 'K';
		}
		return num.toString();
	};

	const formatDuration = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
				<Card className="w-full max-w-md bg-zinc-800/50 border-zinc-700 shadow-2xl">
					<CardContent className="text-center pt-6">
						<Loader2 className="size-12 text-blue-500 animate-spin mx-auto mb-4" />
						<h3 className="text-white text-xl font-bold mb-2">Loading Artist Profile</h3>
						<p className="text-zinc-400 text-sm">Please wait...</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error || !artist) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
				<Card className="w-full max-w-md bg-zinc-800/50 border-zinc-700 shadow-2xl">
					<CardContent className="text-center pt-6">
						<Music className="size-12 text-red-500 mx-auto mb-4" />
						<h3 className="text-white text-xl font-bold mb-2">Artist Not Found</h3>
						<p className="text-zinc-400 text-sm mb-4">{error || "This artist profile doesn't exist"}</p>
						<Button onClick={() => navigate("/")} className="w-full">
							Go Home
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
			{/* Back Button */}
			<div className="p-4">
				<Button
					variant="ghost"
					onClick={() => navigate(-1)}
					className="text-zinc-400 hover:text-white hover:bg-zinc-800/50"
				>
					<ArrowLeft className="size-4 mr-2" />
					Back
				</Button>
			</div>

			<div className="max-w-6xl mx-auto px-4 pb-8">
				{/* Artist Header */}
				<div className="relative mb-8">
					{/* Cover Image Placeholder */}
					<div className="w-full h-64 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mb-6"></div>
					
					{/* Artist Info */}
					<div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-20 md:-mt-16">
						{/* Profile Image */}
						<div className="relative">
							<Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-zinc-900 shadow-2xl">
								<AvatarImage src={artist.imageUrl} alt={artist.artistName} />
								<AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-blue-500 to-purple-600">
									{artist.artistName.charAt(0)}
								</AvatarFallback>
							</Avatar>
							
							{/* Verification Badge */}
							{artist.isVerified && (
								<div className="absolute -bottom-2 -right-2">
									<VerifiedBadge size="lg" />
								</div>
							)}
						</div>

						{/* Artist Details */}
						<div className="flex-1 text-white">
							<div className="flex items-center gap-3 mb-2">
								<h1 className="text-4xl md:text-5xl font-bold">{artist.artistName}</h1>
							</div>
							
							<p className="text-zinc-300 text-lg mb-4">{artist.genre} • {artist.bio}</p>
							
							{/* Stats */}
							<div className="flex flex-wrap gap-6 mb-6">
								<div className="text-center">
									<div className="text-2xl font-bold text-white">{formatNumber(artist.followers)}</div>
									<div className="text-zinc-400 text-sm">Followers</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-white">{formatNumber(artist.totalPlays)}</div>
									<div className="text-zinc-400 text-sm">Total Plays</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-white">{formatNumber(artist.monthlyListeners)}</div>
									<div className="text-zinc-400 text-sm">Monthly Listeners</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex flex-wrap gap-3">
								<Button
									onClick={handleFollow}
									className={`px-8 py-3 rounded-full font-semibold ${
										isFollowing 
											? 'bg-zinc-700 hover:bg-zinc-600 text-white' 
											: 'bg-blue-600 hover:bg-blue-700 text-white'
									}`}
								>
									<Heart className={`size-5 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
									{isFollowing ? 'Following' : 'Follow'}
								</Button>
								
								<Button
									variant="outline"
									onClick={handleShare}
									className="px-6 py-3 rounded-full border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white"
								>
									<Share2 className="size-5 mr-2" />
									Share
								</Button>
								
								<Button
									onClick={() => navigate(`/chat/${artist?.clerkId}`)}
									variant="outline"
									className="px-6 py-3 rounded-full border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white"
								>
									<MessageCircle className="size-5 mr-2" />
									Message
								</Button>
							</div>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-8">
						{/* About */}
						<Card className="bg-zinc-800/50 border-zinc-700 shadow-2xl">
							<CardHeader>
								<CardTitle className="text-white text-xl">About</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-zinc-300 leading-relaxed">{artist.bio}</p>
								<div className="mt-4 flex items-center gap-2 text-zinc-400 text-sm">
									<Calendar className="size-4" />
									<span>Joined {new Date(artist.createdAt).toLocaleDateString()}</span>
								</div>
							</CardContent>
						</Card>

						{/* Popular Songs */}
						<Card className="bg-zinc-800/50 border-zinc-700 shadow-2xl">
							<CardHeader>
								<CardTitle className="text-white text-xl">Popular Songs</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{songs.map((song, index) => (
										<div
											key={song._id}
											className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-700/50 transition-colors cursor-pointer group"
											onClick={() => {
												// Navigate to album page if song has albumId
												if ((song as any).albumId) {
													navigate(`/album/${(song as any).albumId}`);
												}
											}}
										>
											<div className="w-12 h-12 bg-zinc-700 rounded-lg overflow-hidden">
												<img
													src={song.imageUrl}
													alt={song.title}
													className="w-full h-full object-cover"
												/>
											</div>
											
											<div className="flex-1 min-w-0">
												<div className="text-white font-medium truncate">{song.title}</div>
												<div className="text-zinc-400 text-sm">{formatDuration(song.duration)}</div>
											</div>
											
											<div className="flex items-center gap-3">
												<div className="text-zinc-400 text-sm">
													{formatNumber(song.plays)} plays
												</div>
												<button 
													className="p-2 rounded-full bg-zinc-700 hover:bg-zinc-600 transition-colors opacity-0 group-hover:opacity-100"
													onClick={(e) => {
														e.stopPropagation();
														// Add play functionality here
													}}
												>
													<Play className="size-4 text-white" />
												</button>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Social Media */}
						<Card className="bg-zinc-800/50 border-zinc-700 shadow-2xl">
							<CardHeader>
								<CardTitle className="text-white text-lg">Social Media</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{artist.socialMedia.instagram && (
									<a
										href={artist.socialMedia.instagram}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-700/50 transition-colors text-zinc-300 hover:text-white"
									>
										<Instagram className="size-5 text-pink-500" />
										<span>Instagram</span>
									</a>
								)}
								
								{artist.socialMedia.twitter && (
									<a
										href={artist.socialMedia.twitter}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-700/50 transition-colors text-zinc-300 hover:text-white"
									>
										<Twitter className="size-5 text-blue-400" />
										<span>Twitter</span>
									</a>
								)}
								
								{artist.socialMedia.youtube && (
									<a
										href={artist.socialMedia.youtube}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-700/50 transition-colors text-zinc-300 hover:text-white"
									>
										<Youtube className="size-5 text-red-500" />
										<span>YouTube</span>
									</a>
								)}
								
								{artist.socialMedia.website && (
									<a
										href={artist.socialMedia.website}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-700/50 transition-colors text-zinc-300 hover:text-white"
									>
										<Globe className="size-5 text-blue-500" />
										<span>Website</span>
									</a>
								)}
								
								{!artist.socialMedia.instagram && !artist.socialMedia.twitter && 
								 !artist.socialMedia.youtube && !artist.socialMedia.website && (
									<p className="text-zinc-500 text-sm text-center py-4">
										No social media links available
									</p>
								)}
							</CardContent>
						</Card>

						{/* Similar Artists */}
						<Card className="bg-zinc-800/50 border-zinc-700 shadow-2xl">
							<CardHeader>
								<CardTitle className="text-white text-lg">Similar Artists</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-zinc-500 text-sm text-center py-4">
									Similar artists will appear here
								</p>
							</CardContent>
						</Card>

						{/* Recent Activity */}
						<Card className="bg-zinc-800/50 border-zinc-700 shadow-2xl">
							<CardHeader>
								<CardTitle className="text-white text-lg">Recent Activity</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-zinc-500 text-sm text-center py-4">
									Recent activity will appear here
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ArtistProfilePage;
