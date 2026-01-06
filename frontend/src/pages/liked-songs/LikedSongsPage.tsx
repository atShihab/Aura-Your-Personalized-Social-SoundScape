import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
	Play, 
	Pause, 
	Shuffle, 
	Repeat, 
	Heart, 
	MoreHorizontal, 
	Clock,
	ArrowLeft,
	Music
} from "lucide-react";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { useFavoritesSync } from "@/hooks/useFavoritesSync";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import MobileNav from "@/components/MobileNav";

const LikedSongsPage = () => {
	const navigate = useNavigate();
	const { likedSongsPlaylist, getLikedSongsPlaylist, isLoading } = usePlaylistStore();

	const { 
		currentSong, 
		isPlaying, 
		playAlbum, 
		togglePlay, 
		toggleShuffle, 
		toggleRepeat,
		isShuffled,
		repeatMode
	} = usePlayerStore();
	const { removeFromFavorites } = useFavoritesStore();
	const [isHovered, setIsHovered] = useState<string | null>(null);

	// Use the custom hook for real-time favorites synchronization
	useFavoritesSync();

	const handlePlay = () => {
		if (likedSongsPlaylist?.songs && likedSongsPlaylist.songs.length > 0) {
			// Check if we're already playing this playlist
			const isCurrentPlaylist = currentSong && likedSongsPlaylist.songs.some(song => song._id === currentSong._id);
			
			if (isCurrentPlaylist && isPlaying) {
				// If we're playing this playlist, toggle pause
				togglePlay();
			} else {
				// Start playing the playlist
				playAlbum(likedSongsPlaylist.songs as any);
			}
		} else {
			toast.error("No songs in your Liked Songs playlist");
		}
	};

	const handlePlaySong = (song: any, index: number) => {
		if (likedSongsPlaylist?.songs) {
			// Start playing from the selected song
			const songsFromIndex = likedSongsPlaylist.songs.slice(index);
			playAlbum(songsFromIndex as any);
		}
	};

	const handleUnfavorite = async (songId: string) => {
		try {
			await removeFromFavorites(songId);
			// Refresh the liked songs playlist to get updated data
			await getLikedSongsPlaylist();
			toast.success("Song removed from Liked Songs");
		} catch (error) {
			console.error("Error removing from favorites:", error);
			toast.error("Failed to remove song from Liked Songs");
		}
	};

	const formatDuration = (minutes: number) => {
		if (!minutes || minutes <= 0) return "0:00";
		const mins = Math.floor(minutes);
		const secs = Math.round((minutes - mins) * 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { 
			year: 'numeric', 
			month: 'short', 
			day: 'numeric' 
		});
	};

	if (isLoading) {
		return (
			<div className="h-full bg-black text-white">
				{/* Mobile Header */}
				<div className="md:hidden sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-zinc-800">
					<div className="flex items-center gap-3 p-3 sm:p-4">
						<MobileNav />
						<h1 className="text-lg sm:text-xl font-bold text-white">Liked Songs</h1>
					</div>
				</div>

				<div className="p-3 sm:p-4 md:p-6">
					<div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
						<Button 
							variant="ghost" 
							size="icon" 
							onClick={() => navigate(-1)}
							className="text-white hover:bg-white/20 hidden md:flex"
						>
							<ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
						</Button>
						<div className="animate-pulse">
							<div className="h-6 sm:h-8 bg-zinc-700 rounded w-32 sm:w-48 mb-2" />
							<div className="h-3 sm:h-4 bg-zinc-700 rounded w-24 sm:w-32" />
						</div>
					</div>
					<div className="animate-pulse space-y-2">
						{Array.from({ length: 10 }).map((_, i) => (
							<div key={i} className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3">
								<div className="w-6 h-6 sm:w-8 sm:h-8 bg-zinc-700 rounded" />
								<div className="flex-1">
									<div className="h-3 sm:h-4 bg-zinc-700 rounded w-32 sm:w-48 mb-2" />
									<div className="h-2 sm:h-3 bg-zinc-700 rounded w-24 sm:w-32" />
								</div>
								<div className="w-8 sm:w-12 h-2 sm:h-3 bg-zinc-700 rounded" />
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (!likedSongsPlaylist) {
		return (
			<div className="h-full bg-black text-white">
				{/* Mobile Header */}
				<div className="md:hidden sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-zinc-800">
					<div className="flex items-center gap-3 p-3 sm:p-4">
						<MobileNav />
						<h1 className="text-lg sm:text-xl font-bold text-white">Liked Songs</h1>
					</div>
				</div>

				<div className="p-3 sm:p-4 md:p-6">
					<div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
						<Button 
							variant="ghost" 
							size="icon" 
							onClick={() => navigate(-1)}
							className="text-white hover:bg-white/20 hidden md:flex"
						>
							<ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
						</Button>
						<div>
							<h1 className="text-xl sm:text-2xl font-bold">Liked Songs</h1>
							<p className="text-zinc-400 text-sm sm:text-base">No liked songs yet</p>
						</div>
					</div>
					<div className="text-center py-8 sm:py-12">
						<Heart className="w-12 h-12 sm:w-16 sm:h-16 text-zinc-500 mx-auto mb-3 sm:mb-4" />
						<p className="text-zinc-500 text-sm sm:text-base">Start liking songs to see them here</p>
					</div>
				</div>
			</div>
		);
	}

	const isCurrentPlaylist = currentSong && likedSongsPlaylist.songs.some(song => song._id === currentSong._id);

	return (
		<div className="h-full bg-black text-white">
			{/* Mobile Header */}
			<div className="md:hidden sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-zinc-800">
				<div className="flex items-center gap-3 p-3 sm:p-4">
					<MobileNav />
					<h1 className="text-lg sm:text-xl font-bold text-white">Liked Songs</h1>
				</div>
			</div>

			<motion.div 
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="p-3 sm:p-4 md:p-6"
			>
				{/* Header */}
				<div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
					<Button 
						variant="ghost" 
						size="icon" 
						onClick={() => navigate(-1)}
						className="text-white hover:bg-white/20 hidden md:flex"
					>
						<ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
					</Button>
					<div className="flex-1">
						<h1 className="text-xl sm:text-2xl font-bold">Liked Songs</h1>
						<p className="text-zinc-400 text-sm sm:text-base">
							{likedSongsPlaylist.songCount} song{likedSongsPlaylist.songCount !== 1 ? 's' : ''}
						</p>
					</div>
				</div>

				{/* Album Art and Info */}
				<div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 mb-6 sm:mb-8">
					<div className="w-32 h-32 sm:w-48 sm:h-48 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
						<Heart className="w-16 h-16 sm:w-24 sm:h-24 text-white fill-white" />
					</div>
					<div className="flex-1 text-center sm:text-left">
						<div className="mb-3 sm:mb-4">
							<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Liked Songs</h2>
							<p className="text-zinc-400 text-sm sm:text-base">Your favorite songs collection</p>
						</div>
						<div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
							<Button 
								onClick={handlePlay}
								className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 sm:px-8 py-2 sm:py-3 rounded-full w-full sm:w-auto"
							>
								{isCurrentPlaylist && isPlaying ? (
									<>
										<Pause className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
										Pause
									</>
								) : (
									<>
										<Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
										Play
									</>
								)}
							</Button>
							<div className="flex items-center gap-2 sm:gap-4">
								<Button 
									variant="ghost" 
									size="icon" 
									onClick={toggleShuffle}
									className={`text-white hover:bg-white/20 ${isShuffled ? 'text-green-500' : ''}`}
								>
									<Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
								</Button>
								<Button 
									variant="ghost" 
									size="icon" 
									onClick={toggleRepeat}
									className={`text-white hover:bg-white/20 ${repeatMode !== 'off' ? 'text-green-500' : ''}`}
								>
									<Repeat className={`w-4 h-4 sm:w-5 sm:h-5 ${repeatMode === 'one' ? 'text-green-500' : ''}`} />
								</Button>
								<Button 
									variant="ghost" 
									size="icon" 
									className="text-white hover:bg-white/20"
								>
									<MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* Songs List */}
				<div className="space-y-1">
					{/* Header - Hidden on Mobile */}
					<div className="hidden sm:flex items-center gap-4 p-3 text-zinc-400 text-sm border-b border-zinc-800">
						<div className="w-8 text-center">#</div>
						<div className="flex-1">Title</div>
						<div className="w-32">Album</div>
						<div className="w-32">Date Added</div>
						<div className="w-16 text-center">
							<Clock className="w-4 h-4" />
						</div>
					</div>

					{/* Songs */}
					{likedSongsPlaylist.songs.length === 0 ? (
						<div className="text-center py-8 sm:py-12">
							<Music className="w-12 h-12 sm:w-16 sm:h-16 text-zinc-500 mx-auto mb-3 sm:mb-4" />
							<p className="text-zinc-500 text-sm sm:text-base">No liked songs yet</p>
							<p className="text-zinc-600 text-xs sm:text-sm">Start liking songs to see them here</p>
						</div>
					) : (
						likedSongsPlaylist.songs.map((song: any, index: number) => {
							const isCurrentSong = currentSong?._id === song._id;
							const isPlayingCurrent = isCurrentSong && isPlaying;

							return (
								<motion.div
									key={song._id}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.3, delay: index * 0.05 }}
									className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 hover:bg-zinc-800/50 rounded-md group cursor-pointer"
									onMouseEnter={() => setIsHovered(song._id)}
									onMouseLeave={() => setIsHovered(null)}
									onClick={() => handlePlaySong(song, index)}
								>
									<div className="w-6 sm:w-8 text-center text-zinc-400 text-xs sm:text-sm">
										{isHovered === song._id ? (
											<Play className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
										) : isCurrentSong ? (
											<div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full" />
										) : (
											index + 1
										)}
									</div>
									
									<div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
										<img 
											src={song.imageUrl || "https://via.placeholder.com/40x40/374151/FFFFFF?text=🎵"} 
											alt={song.title}
											className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover flex-shrink-0"
										/>
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<p className={`font-medium text-sm sm:text-base truncate ${isCurrentSong ? 'text-green-500' : 'text-white'}`}>
													{song.title}
												</p>
												{isCurrentSong && isPlaying && (
													<div className="w-1 h-1 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
												)}
											</div>
											<p className="text-xs sm:text-sm text-zinc-400 truncate">{song.artist}</p>
										</div>
									</div>

									<div className="hidden sm:block w-32 text-zinc-400 text-sm truncate">
										{song.albumId?.title || 'Unknown Album'}
									</div>

									<div className="hidden sm:block w-32 text-zinc-400 text-sm">
										{formatDate(song.addedAt || new Date().toISOString())}
									</div>

									<div className="flex items-center gap-1 sm:gap-2 w-12 sm:w-16">
										<div className="text-zinc-400 text-xs sm:text-sm">
											{formatDuration(song.duration || 0)}
										</div>
										<Button
											variant="ghost"
											size="icon"
											onClick={(e) => {
												e.stopPropagation();
												handleUnfavorite(song._id);
											}}
											className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-white hover:bg-white/20 p-1 sm:p-2"
										>
											<Heart className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
										</Button>
									</div>
								</motion.div>
							);
						})
					)}
				</div>
			</motion.div>
		</div>
	);
};

export default LikedSongsPage;
