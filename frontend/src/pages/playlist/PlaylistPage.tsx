import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
	Play, 
	Pause, 
	Shuffle, 
	Repeat, 
	Heart, 
	MoreHorizontal, 
	Clock,
	ArrowLeft,
	Music,
	Edit,
	Trash2,
	Share2,
	Plus
} from 'lucide-react';
import { usePlaylistStore } from '@/stores/usePlaylistStore';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import { toast } from 'react-hot-toast';
import AddSongToPlaylistModal from '@/components/playlist/AddSongToPlaylistModal';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import MobileNav from '@/components/MobileNav';
import { getImageUrl, handleImageError } from '@/lib/imageUtils';

const PlaylistPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [isHovered, setIsHovered] = useState<string | null>(null);
	const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
	const [showRenameModal, setShowRenameModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [newPlaylistName, setNewPlaylistName] = useState('');
	const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
	const [isRenaming, setIsRenaming] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [isPlaylistLiked, setIsPlaylistLiked] = useState(false);
	
	const { getPlaylistById, updatePlaylist, deletePlaylist, removeSongFromPlaylist, checkPlaylistLikeStatus, likePlaylist, unlikePlaylist } = usePlaylistStore();
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
	const { addToFavorites, removeFromFavorites, checkFavoriteStatus } = useFavoritesStore();
	
	const [playlist, setPlaylist] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [songFavoriteStatus, setSongFavoriteStatus] = useState<Record<string, boolean>>({});

	useEffect(() => {
		if (id) {
			loadPlaylist();
		}
	}, [id]);

	useEffect(() => {
		// Check favorite status for all songs when playlist loads
		if (playlist?.songs) {
			checkAllFavoriteStatus();
		}
	}, [playlist]);

	const loadPlaylist = async () => {
		try {
			setIsLoading(true);
			const playlistData = await getPlaylistById(id!);
			if (playlistData) {
				setPlaylist(playlistData);
				// Set the like status from the backend response
				if (playlistData.isLiked !== undefined) {
					setIsPlaylistLiked(playlistData.isLiked);
				}
			} else {
				toast.error('Playlist not found');
				navigate('/library');
			}
		} catch (error) {
			console.error('Error loading playlist:', error);
			toast.error('Failed to load playlist');
			navigate('/library');
		} finally {
			setIsLoading(false);
		}
	};

	const checkAllFavoriteStatus = async () => {
		const statuses: Record<string, boolean> = {};
		for (const song of playlist.songs) {
			statuses[song._id] = await checkFavoriteStatus(song._id);
		}
		setSongFavoriteStatus(statuses);
	};

	const handlePlay = () => {
		if (playlist?.songs && playlist.songs.length > 0) {
			// Check if we're already playing this playlist
			const isCurrentPlaylist = currentSong && playlist.songs.some((song: any) => song._id === currentSong._id);
			
			if (isCurrentPlaylist && isPlaying) {
				// If we're playing this playlist, toggle pause
				togglePlay();
			} else {
				// Start playing the playlist
				playAlbum(playlist.songs);
			}
		} else {
			toast.error("This playlist is empty");
		}
	};

	const handlePlaylistLikeToggle = async () => {
		if (!playlist) return;
		
		try {
			if (isPlaylistLiked) {
				await unlikePlaylist(playlist._id);
				setIsPlaylistLiked(false);
				toast.success('Removed from library');
			} else {
				await likePlaylist(playlist._id);
				setIsPlaylistLiked(true);
				toast.success('Added to library');
			}
		} catch (error) {
			console.error('Error toggling playlist like:', error);
			toast.error('Failed to update library');
		}
	};

	const handlePlaySong = (song: any, index: number): void => {
		if (playlist?.songs) {
			// Start playing from the selected song
			const songsFromIndex = playlist.songs.slice(index);
			playAlbum(songsFromIndex);
		}
	};

	const handleFavoriteToggle = async (song: any) => {
		try {
			const isCurrentlyFavorited = songFavoriteStatus[song._id];
			
			if (isCurrentlyFavorited) {
				await removeFromFavorites(song._id);
				setSongFavoriteStatus(prev => ({ ...prev, [song._id]: false }));
				toast.success(`Removed ${song.title} from favorites`);
			} else {
				await addToFavorites('song', song._id, song.title, song.artist, song.imageUrl, {
					audioUrl: song.audioUrl,
					duration: song.duration,
					genre: song.genre,
					albumId: song.albumId
				});
				setSongFavoriteStatus(prev => ({ ...prev, [song._id]: true }));
				toast.success(`Added ${song.title} to favorites!`);
			}
		} catch (error) {
			console.error('Error toggling favorite:', error);
			toast.error('Failed to update favorite status');
		}
	};

	const handleRemoveSong = async (songId: string) => {
		if (!playlist.isOwnPlaylist) {
			toast.error('You can only remove songs from your own playlists');
			return;
		}

		try {
			await removeSongFromPlaylist(playlist._id, songId);
			// Update local state
			setPlaylist((prev: any) => ({
				...prev,
				songs: prev.songs.filter((song: any) => song._id !== songId),
				songCount: prev.songCount - 1
			}));
			toast.success('Song removed from playlist');
		} catch (error) {
			console.error('Error removing song:', error);
			toast.error('Failed to remove song from playlist');
		}
	};



	const handleShare = () => {
		if (navigator.share) {
			navigator.share({
				title: playlist?.name,
				text: `Check out ${playlist?.name} playlist`,
				url: window.location.href,
			});
		} else {
			// Fallback: copy to clipboard
			navigator.clipboard.writeText(window.location.href);
			toast.success('Playlist link copied to clipboard!');
		}
	};

	const handleDeletePlaylist = async () => {
		if (window.confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) {
			try {
				await deletePlaylist(playlist._id);
				toast.success('Playlist deleted successfully');
				navigate('/library');
			} catch (error) {
				console.error('Error deleting playlist:', error);
				toast.error('Failed to delete playlist');
			}
		}
	};

	const handleRenamePlaylist = async () => {
		if (!newPlaylistName.trim()) {
			toast.error('Please enter a playlist name');
			return;
		}

		setIsRenaming(true);
		try {
			await updatePlaylist(playlist._id, { name: newPlaylistName.trim() });
			setPlaylist((prev: any) => ({ ...prev, name: newPlaylistName.trim() }));
			toast.success('Playlist renamed successfully');
			setShowRenameModal(false);
			setNewPlaylistName('');
		} catch (error) {
			console.error('Error renaming playlist:', error);
			toast.error('Failed to rename playlist');
		} finally {
			setIsRenaming(false);
		}
	};

	const openRenameModal = () => {
		setNewPlaylistName(playlist.name);
		setShowRenameModal(true);
	};

	const openEditModal = () => {
		setNewPlaylistName(playlist.name);
		setNewPlaylistDescription(playlist.description || '');
		setShowEditModal(true);
	};

	const handleEditPlaylist = async () => {
		if (!newPlaylistName.trim()) {
			toast.error('Please enter a playlist name');
			return;
		}

		setIsEditing(true);
		try {
			await updatePlaylist(playlist._id, { 
				name: newPlaylistName.trim(),
				description: newPlaylistDescription.trim()
			});
			setPlaylist((prev: any) => ({ 
				...prev, 
				name: newPlaylistName.trim(),
				description: newPlaylistDescription.trim()
			}));
			toast.success('Playlist updated successfully');
			setShowEditModal(false);
			setNewPlaylistName('');
			setNewPlaylistDescription('');
		} catch (error) {
			console.error('Error updating playlist:', error);
			toast.error('Failed to update playlist');
		} finally {
			setIsEditing(false);
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

	const calculateTotalDuration = () => {
		return playlist?.songs?.reduce((total: number, song: any) => total + (song.duration || 0), 0) || 0;
	};

	if (isLoading) {
		return (
			<div className="h-full bg-black text-white">
				{/* Mobile Header */}
				<div className="md:hidden sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-zinc-800">
					<div className="flex items-center gap-3 p-3 sm:p-4">
						<MobileNav />
						<h1 className="text-lg sm:text-xl font-bold text-white">Loading...</h1>
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

	if (!playlist) {
		return (
			<div className="h-full bg-black text-white p-6">
				<div className="flex items-center gap-4 mb-6">
					<Button 
						variant="ghost" 
						size="icon" 
						onClick={() => navigate(-1)}
						className="text-white hover:bg-white/20"
					>
						<ArrowLeft className="w-6 h-6" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold">Playlist Not Found</h1>
						<p className="text-zinc-400">The playlist you're looking for doesn't exist</p>
					</div>
				</div>
			</div>
		);
	}

	const isCurrentPlaylist = currentSong && playlist.songs.some((song: any) => song._id === currentSong._id);

	return (
		<div className="h-full bg-black text-white">
			{/* Mobile Header */}
			<div className="md:hidden sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-zinc-800">
				<div className="flex items-center gap-3 p-3 sm:p-4">
					<MobileNav />
					<h1 className="text-lg sm:text-xl font-bold text-white truncate">{playlist.name}</h1>
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
						<h1 className="text-xl sm:text-2xl font-bold">{playlist.name}</h1>
						<p className="text-zinc-400 text-sm sm:text-base">
							{playlist.songCount} song{playlist.songCount !== 1 ? 's' : ''} • {formatDuration(calculateTotalDuration())}
						</p>
					</div>
				</div>

				{/* Album Art and Info */}
				<div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 mb-6 sm:mb-8">
					<div className="w-32 h-32 sm:w-48 sm:h-48 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
						{playlist.imageUrl ? (
							<img 
								src={getImageUrl(playlist.imageUrl)} 
								alt={playlist.name}
								onError={(e) => handleImageError(e)}
								className="w-full h-full object-cover rounded-lg"
							/>
						) : (
							<Music className="w-16 h-16 sm:w-24 sm:h-24 text-white" />
						)}
					</div>
					<div className="flex-1 text-center sm:text-left">
						<div className="mb-3 sm:mb-4">
							<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">{playlist.name}</h2>
							{playlist.description && (
								<p className="text-zinc-400 mb-2 text-sm sm:text-base">{playlist.description}</p>
							)}
							<div className="flex items-center justify-center sm:justify-start gap-2">
								<span className="text-zinc-500 text-sm sm:text-base">Created by {playlist.creatorName}</span>
								{!playlist.isPublic && (
									<Badge variant="outline" className="text-xs">
										Private
									</Badge>
								)}
							</div>
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
							
							{/* Add to Library button - only show for playlists not owned by user */}
							{playlist && !playlist.isOwnPlaylist && (
								<Button 
									onClick={handlePlaylistLikeToggle}
									variant="outline"
									className={`border-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full w-full sm:w-auto transition-all duration-200 ${
										isPlaylistLiked 
											? 'border-red-500 text-red-500 hover:bg-red-500/10' 
											: 'border-white/30 text-white hover:bg-white/10'
									}`}
								>
									<Heart className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${isPlaylistLiked ? 'fill-current' : ''}`} />
									{isPlaylistLiked ? 'Remove from Library' : 'Add to Library'}
								</Button>
							)}
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
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button 
											variant="ghost" 
											size="icon" 
											className="text-white hover:bg-white/20"
										>
											<MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="bg-zinc-900 border-zinc-800">
										<DropdownMenuItem
											onClick={handleShare}
											className="text-white hover:bg-zinc-800"
										>
											<Share2 className="w-4 h-4 mr-2" />
											Share Playlist
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={openRenameModal}
											className="text-white hover:bg-zinc-800"
										>
											<Edit className="w-4 h-4 mr-2" />
											Rename Playlist
										</DropdownMenuItem>
										{playlist.isOwnPlaylist && (
											<DropdownMenuItem
												onClick={openEditModal}
												className="text-white hover:bg-zinc-800"
											>
												<Edit className="w-4 h-4 mr-2" />
												Edit Playlist Details
											</DropdownMenuItem>
										)}
										<DropdownMenuSeparator className="bg-zinc-700" />
										<DropdownMenuItem
											onClick={handleDeletePlaylist}
											className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
										>
											<Trash2 className="w-4 h-4 mr-2" />
											Delete Playlist
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					</div>
				</div>

				{/* Songs List */}
				<div className="space-y-1">
					{/* Header with Add Song Button */}
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 border-b border-zinc-800">
						<div className="hidden sm:flex items-center gap-4 text-zinc-400 text-sm w-full">
							<div className="w-8 text-center">#</div>
							<div className="flex-1">Title</div>
							<div className="w-32">Album</div>
							<div className="w-32">Date Added</div>
							<div className="w-16 text-center">
								<Clock className="w-4 h-4" />
							</div>
						</div>
						{/* Only show Add Song button if user owns the playlist */}
						{playlist.isOwnPlaylist && (
							<Button
								onClick={() => setShowAddToPlaylistModal(true)}
								variant="outline"
								size="sm"
								className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white w-full sm:w-auto"
							>
								<Plus className="w-4 h-4 mr-2" />
								Add Song
							</Button>
						)}
					</div>

					{/* Songs */}
					{playlist.songs.length === 0 ? (
						<div className="text-center py-8 sm:py-12">
							<Music className="w-12 h-12 sm:w-16 sm:h-16 text-zinc-500 mx-auto mb-3 sm:mb-4" />
							<p className="text-zinc-500 text-sm sm:text-base">This playlist is empty</p>
							<p className="text-zinc-600 text-xs sm:text-sm">Add some songs to get started</p>
						</div>
					) : (
						playlist.songs.map((song: any, index: number) => {
							const isCurrentSong = currentSong?._id === song._id;
							const isPlayingCurrent = isCurrentSong && isPlaying;
							const isFavorited = songFavoriteStatus[song._id];

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
											src={getImageUrl(song.imageUrl)} 
											alt={song.title}
											onError={(e) => handleImageError(e)}
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
										{song.albumId || 'Unknown Album'}
									</div>

									<div className="hidden sm:block w-32 text-zinc-400 text-sm">
										{formatDate(song.addedAt || new Date().toISOString())}
									</div>

									<div className="flex items-center gap-1 sm:gap-2 w-12 sm:w-20">
										<div className="text-zinc-400 text-xs sm:text-sm">
											{formatDuration(song.duration || 0)}
										</div>
										{/* Delete button - only show for playlist owners */}
										{playlist.isOwnPlaylist && (
											<Button
												variant="ghost"
												size="sm"
												onClick={(e) => {
													e.stopPropagation();
													handleRemoveSong(song._id);
												}}
												className="text-red-400 hover:text-red-300 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity p-1 sm:p-2"
												title="Remove from playlist"
											>
												<Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
											</Button>
										)}
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="sm"
													className="text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 sm:p-2"
													onClick={(e) => e.stopPropagation()}
												>
													<MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent className="bg-zinc-900 border-zinc-800">
												<DropdownMenuItem
													onClick={(e) => {
														e.stopPropagation();
														handleFavoriteToggle(song);
													}}
													className="text-white hover:bg-zinc-800"
												>
													<Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
													{isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
												</DropdownMenuItem>
												{/* Only show remove option if user owns the playlist */}
												{playlist.isOwnPlaylist && (
													<>
														<DropdownMenuSeparator className="bg-zinc-700" />
														<DropdownMenuItem
															onClick={(e) => {
																e.stopPropagation();
																handleRemoveSong(song._id);
															}}
															className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
														>
															<Trash2 className="w-4 h-4 mr-2" />
															Remove from Playlist
														</DropdownMenuItem>
													</>
												)}
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</motion.div>
							);
						})
					)}
				</div>
			</motion.div>

			{/* Add Song to Playlist Modal */}
			<AddSongToPlaylistModal
				isOpen={showAddToPlaylistModal}
				onClose={() => setShowAddToPlaylistModal(false)}
				playlistId={playlist?._id || ''}
				playlistName={playlist?.name || ''}
			/>

			{/* Edit Playlist Modal */}
			<Dialog open={showEditModal} onOpenChange={setShowEditModal}>
				<DialogContent className="bg-zinc-900 border-zinc-800 text-white">
					<DialogHeader>
						<DialogTitle className="text-white">Edit Playlist Details</DialogTitle>
						<DialogDescription className="text-zinc-400">
							Update your playlist name and description
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<label htmlFor="playlist-name" className="text-sm font-medium text-white">
								Playlist Name
							</label>
							<Input
								id="playlist-name"
								value={newPlaylistName}
								onChange={(e) => setNewPlaylistName(e.target.value)}
								placeholder="Enter playlist name"
								className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
								disabled={isEditing}
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="playlist-description" className="text-sm font-medium text-white">
								Description
							</label>
							<textarea
								id="playlist-description"
								value={newPlaylistDescription}
								onChange={(e) => setNewPlaylistDescription(e.target.value)}
								placeholder="Enter playlist description (optional)"
								rows={4}
								className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none disabled:opacity-50"
								disabled={isEditing}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setShowEditModal(false);
								setNewPlaylistName('');
								setNewPlaylistDescription('');
							}}
							disabled={isEditing}
							className="border-zinc-700 text-white hover:bg-zinc-800"
						>
							Cancel
						</Button>
						<Button
							onClick={handleEditPlaylist}
							disabled={isEditing || !newPlaylistName.trim()}
							className="bg-green-500 hover:bg-green-600 text-black"
						>
							{isEditing ? 'Saving...' : 'Save Changes'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Rename Playlist Modal */}
			<Dialog open={showRenameModal} onOpenChange={setShowRenameModal}>
				<DialogContent className="sm:max-w-[400px] bg-zinc-900 border-zinc-800">
					<DialogHeader>
						<DialogTitle className="text-white">Rename Playlist</DialogTitle>
						<DialogDescription className="text-zinc-400">
							Enter a new name for your playlist
						</DialogDescription>
					</DialogHeader>
					
					<div className="space-y-4">
						<Input
							value={newPlaylistName}
							onChange={(e) => setNewPlaylistName(e.target.value)}
							placeholder="Enter playlist name"
							className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
							maxLength={100}
						/>
					</div>
					
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowRenameModal(false)}
							disabled={isRenaming}
							className="border-zinc-700 text-white hover:bg-zinc-800"
						>
							Cancel
						</Button>
						<Button
							onClick={handleRenamePlaylist}
							disabled={isRenaming || !newPlaylistName.trim()}
							className="bg-green-500 hover:bg-green-600 text-black"
						>
							{isRenaming ? 'Renaming...' : 'Rename'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>


		</div>
	);
};

export default PlaylistPage;
