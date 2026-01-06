import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Shuffle, Heart, Share2, Plus, Clock, ArrowLeft } from 'lucide-react';
import { fisherYatesShuffle } from '@/lib/shuffle';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMusicStore } from '@/stores/useMusicStore';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import { axiosInstance } from '@/lib/axios';
import { motion } from 'framer-motion';
import MobileNav from '@/components/MobileNav';
import { getImageUrl, handleImageError } from '@/lib/imageUtils';

const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
	// Create a temporary notification
	const notification = document.createElement('div');
	notification.className = `fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${
		type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
	}`;
	notification.textContent = message;
	document.body.appendChild(notification);
	setTimeout(() => {
		if (document.body.contains(notification)) {
			document.body.removeChild(notification);
		}
	}, 3000);
};

export const formatDuration = (minutes: number) => {
	if (!minutes || minutes <= 0) return "0:00";
	const mins = Math.floor(minutes);
	const secs = Math.round((minutes - mins) * 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const formatAlbumDuration = (totalMinutes: number) => {
	if (!totalMinutes || totalMinutes <= 0) return "0m";
	const hours = Math.floor(totalMinutes / 60);
	const minutes = Math.floor(totalMinutes % 60);
	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	}
	return `${minutes}m`;
};

const AlbumPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { fetchAlbumById, currentAlbum, isLoading, error, getLibraryAlbums } = useMusicStore();
	const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();
	const { addToFavorites, removeFromFavorites, checkFavoriteStatus } = useFavoritesStore();
	const [songFavoriteStatus, setSongFavoriteStatus] = useState<Record<string, boolean>>({});
	const [isAlbumInLibrary, setIsAlbumInLibrary] = useState(false);
	const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

	console.log("AlbumPage render:", { 
		id, 
		currentAlbum, 
		isLoading, 
		error,
		isAlbumInLibrary 
	});

	useEffect(() => {
		if (id) {
			fetchAlbumById(id);
			checkAlbumLibraryStatus(id);
		}
	}, [id, fetchAlbumById]);

	useEffect(() => {
		if (currentAlbum?.songs) {
			checkAllSongFavorites();
		}
	}, [currentAlbum]);

	const checkAllSongFavorites = async () => {
		if (!currentAlbum?.songs) return;
		
		const statuses: Record<string, boolean> = {};
		for (const song of currentAlbum.songs) {
			try {
				const isFavorited = await checkFavoriteStatus(song._id);
				statuses[song._id] = isFavorited;
			} catch (error) {
				console.error('Error checking favorite status for song:', song._id, error);
				statuses[song._id] = false;
			}
		}
		setSongFavoriteStatus(statuses);
	};

	const checkAlbumLibraryStatus = async (albumId: string) => {
		try {
			const response = await axiosInstance.get(`/albums/${albumId}/library`);
			setIsAlbumInLibrary(response.data.isInLibrary);
		} catch (error) {
			console.error('Error checking album library status:', error);
			setIsAlbumInLibrary(false);
		}
	};

	const handleAlbumLibraryToggle = async () => {
		if (!currentAlbum || isLoadingLibrary) return;
		
		setIsLoadingLibrary(true);
		try {
			if (isAlbumInLibrary) {
				await axiosInstance.delete(`/albums/${currentAlbum._id}/library`);
				setIsAlbumInLibrary(false);
				showNotification('Album removed from library');
			} else {
				await axiosInstance.post(`/albums/${currentAlbum._id}/library`);
				setIsAlbumInLibrary(true);
				showNotification('Album added to library!');
			}
			// Refresh library albums to update the library page
			await getLibraryAlbums();
		} catch (error: any) {
			console.error('Error toggling album library status:', error);
			showNotification(error.response?.data?.message || 'Failed to update library', 'error');
		} finally {
			setIsLoadingLibrary(false);
		}
	};

	const handleShufflePlay = () => {
		if (!currentAlbum?.songs || currentAlbum.songs.length === 0) {
			showNotification('No songs available to play', 'error');
			return;
		}
		
		// Create a properly shuffled copy using Fisher-Yates algorithm
		const shuffledSongs = fisherYatesShuffle(currentAlbum.songs);
		
		playAlbum(shuffledSongs);
		showNotification(`Playing ${currentAlbum.title} on shuffle`);
	};

	const handlePlayAlbum = () => {
		if (!currentAlbum?.songs || currentAlbum.songs.length === 0) {
			showNotification('No songs available to play', 'error');
			return;
		}

		// Check if we're already playing this album
		const isCurrentAlbum = currentSong && currentAlbum.songs.some(song => song._id === currentSong._id);
		
		if (isCurrentAlbum && isPlaying) {
			// If we're playing this album, toggle pause
			togglePlay();
		} else {
			// Start playing the album from the beginning
			playAlbum(currentAlbum.songs);
			showNotification(`Playing ${currentAlbum.title}`);
		}
	};

	const handlePlaySong = (index: number) => {
		if (!currentAlbum?.songs) return;
		
		// Start playing from the selected song
		const songsFromIndex = currentAlbum.songs.slice(index);
		playAlbum(songsFromIndex);
	};


	const handleShare = () => {
		if (navigator.share) {
			navigator.share({
				title: currentAlbum?.title,
				text: `Check out ${currentAlbum?.title} by ${currentAlbum?.artist}`,
				url: window.location.href,
			});
		} else {
			// Fallback: copy to clipboard
			navigator.clipboard.writeText(window.location.href);
			// Create a temporary notification
			const notification = document.createElement('div');
			notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
			notification.textContent = 'Link copied to clipboard!';
			document.body.appendChild(notification);
			setTimeout(() => {
				document.body.removeChild(notification);
			}, 3000);
		}
	};

	const handleAddToPlaylist = () => {
		// TODO: Implement add to playlist functionality
		console.log("Add album to playlist:", currentAlbum?.title);
		showNotification(`Added ${currentAlbum?.title} to playlist!`);
	};

	const handleLikeAlbum = () => {
		// TODO: Implement like album functionality
		console.log("Like album:", currentAlbum?.title);
		showNotification(`Liked ${currentAlbum?.title}!`);
	};

	const handleSongLike = async (song: any) => {
		try {
			const isCurrentlyFavorited = songFavoriteStatus[song._id];
			
			if (isCurrentlyFavorited) {
				await removeFromFavorites(song._id);
				setSongFavoriteStatus(prev => ({ ...prev, [song._id]: false }));
				showNotification(`Removed ${song.title} from favorites`);
			} else {
				await addToFavorites('song', song._id, song.title, song.artist, song.imageUrl, {
					audioUrl: song.audioUrl,
					duration: song.duration,
					genre: song.genre,
					albumId: song.albumId
				});
				setSongFavoriteStatus(prev => ({ ...prev, [song._id]: true }));
				showNotification(`Added ${song.title} to favorites!`);
			}
		} catch (error) {
			console.error('Error toggling song favorite:', error);
			showNotification('Failed to update favorite status', 'error');
		}
	};

	// Show loading state
	if (isLoading) {
		return (
			<div className='h-full flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4'></div>
					<p className='text-zinc-400'>Loading album...</p>
				</div>
			</div>
		);
	}

	// Show error state
	if (error) {
		return (
			<div className='h-full flex items-center justify-center'>
				<div className='text-center'>
					<p className='text-red-400 text-lg mb-4'>Failed to load album</p>
					<p className='text-zinc-400 mb-4'>{error}</p>
					<Button 
						onClick={() => id && fetchAlbumById(id)}
						variant='outline'
						className='text-white border-white/20 hover:bg-white/10'
					>
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	// Show empty state
	if (!currentAlbum) {
		return (
			<div className='h-full flex items-center justify-center'>
				<div className='text-center'>
					<p className='text-zinc-400 text-lg'>Album not found</p>
				</div>
			</div>
		);
	}

	return (
		<div className='h-full'>
			{/* Mobile Header */}
			<div className="md:hidden sticky top-0 z-50 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800">
				<div className="flex items-center gap-3 p-3 sm:p-4">
					<MobileNav />
					<h1 className="text-lg sm:text-xl font-bold text-white truncate">{currentAlbum?.title}</h1>
				</div>
			</div>

			<ScrollArea className='h-full rounded-md'>
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					{/* Back Button - Desktop Only */}
					<div className="hidden md:block p-4">
						<Button
							variant="ghost"
							onClick={() => navigate(-1)}
							className="text-zinc-400 hover:text-white hover:bg-zinc-800/50"
						>
							<ArrowLeft className="size-4 mr-2" />
							Back
						</Button>
					</div>

					{/* Main Content */}
					<div className='relative min-h-full'>
						{/* bg gradient */}
						<div
							className='absolute inset-0 bg-gradient-to-b from-[#5038a0]/80 via-zinc-900/80
						 to-zinc-900 pointer-events-none'
							aria-hidden='true'
						/>

						{/* Content */}
						<div className='relative z-10'>
							<div className='flex flex-col sm:flex-row p-3 sm:p-4 md:p-6 gap-4 sm:gap-6 pb-4 sm:pb-6 md:pb-8'>
								<img
									src={getImageUrl(currentAlbum?.imageUrl)}
									alt={currentAlbum?.title}
									onError={(e) => handleImageError(e)}
									className='w-32 h-32 sm:w-48 sm:h-48 md:w-[240px] md:h-[240px] shadow-xl rounded mx-auto sm:mx-0'
								/>
								<div className='flex flex-col justify-end text-center sm:text-left'>
									<p className='text-xs sm:text-sm font-medium'>Album</p>
									<h1 className='text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold my-1 sm:my-2 md:my-4'>{currentAlbum?.title}</h1>
									<div className='flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm text-zinc-100'>
										<span className='font-medium text-white'>{currentAlbum?.artist}</span>
										<span className='hidden sm:inline'>•</span>
										<span>{currentAlbum?.songCount || currentAlbum?.songs.length} songs</span>
										<span className='hidden sm:inline'>•</span>
										<span>{currentAlbum?.releaseYear}</span>
										{currentAlbum?.totalDuration && (
											<>
												<span className='hidden sm:inline'>•</span>
												<span>{formatAlbumDuration(currentAlbum.totalDuration)}</span>
											</>
										)}
										{currentAlbum?.totalPlays && currentAlbum.totalPlays > 0 && (
											<>
												<span className='hidden sm:inline'>•</span>
												<span>{currentAlbum.totalPlays.toLocaleString()} plays</span>
											</>
										)}
									</div>
								</div>
							</div>

							{/* play button */}
							<div className='px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-4'>
								<Button
									onClick={handlePlayAlbum}
									size='icon'
									className='w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-500 hover:bg-green-400 
	                hover:scale-105 transition-all'
								>
									{isPlaying && currentAlbum?.songs.some((song) => song._id === currentSong?._id) ? (
										<Pause className='h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-black' />
									) : (
										<Play className='h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-black' />
									)}
								</Button>
								
								{/* Action buttons */}
								<div className='flex items-center gap-2 flex-wrap justify-center sm:justify-start'>
									<Button
										onClick={() => {
											if (!currentAlbum?.songs || currentAlbum.songs.length === 0) {
												showNotification('No songs available to play', 'error');
												return;
											}
											
											// Create a properly shuffled copy using Fisher-Yates algorithm
											const shuffledSongs = fisherYatesShuffle(currentAlbum.songs);
											playAlbum(shuffledSongs);
											showNotification(`Playing ${currentAlbum.title} on shuffle`);
										}}
										variant='outline'
										size='sm'
										className='text-white border-white/20 hover:bg-white/10 text-xs sm:text-sm'
									>
										<Shuffle className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
										<span className='hidden xs:inline'>Shuffle</span>
									</Button>
									
									<Button
										onClick={handleAlbumLibraryToggle}
										disabled={isLoadingLibrary}
										variant='outline'
										size='sm'
										className='text-white border-white/20 hover:bg-white/10 text-xs sm:text-sm'
									>
										<Heart 
											className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isAlbumInLibrary ? 'fill-red-500 text-red-500' : ''}`} 
										/>
										<span className='hidden xs:inline'>
											{isLoadingLibrary ? 'Loading...' : (isAlbumInLibrary ? 'Remove from Library' : 'Add to Library')}
										</span>
									</Button>
									
									<Button
										onClick={handleShare}
										variant='outline'
										size='sm'
										className='text-white border-white/20 hover:bg-white/10 text-xs sm:text-sm'
									>
										<Share2 className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
										<span className='hidden xs:inline'>Share</span>
									</Button>
								</div>
							</div>

							{/* Table Section */}
							<div className='bg-black/20 backdrop-blur-sm'>
								{/* table header - Hidden on Mobile */}
								<div
									className='hidden sm:grid grid-cols-[16px_4fr_2fr_1fr_auto] gap-2 sm:gap-4 px-4 sm:px-10 py-2 text-xs sm:text-sm 
	            text-zinc-400 border-b border-white/5'
								>
									<div>#</div>
									<div>Title</div>
									<div>Released Date</div>
									<div>
										<Clock className='h-3 w-3 sm:h-4 sm:w-4' />
									</div>
									<div></div>
								</div>

								{/* songs list */}
								<div className='px-2 sm:px-6'>
									<div className='space-y-1 sm:space-y-2 py-3 sm:py-4'>
										{currentAlbum?.songs.map((song, index) => {
											const isCurrentSong = currentSong?._id === song._id;
											return (
												<motion.div
													key={song._id}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ duration: 0.3, delay: index * 0.05 }}
													onClick={() => handlePlaySong(index)}
													className={`flex sm:grid sm:grid-cols-[16px_4fr_2fr_1fr_auto] gap-2 sm:gap-4 px-2 sm:px-4 py-2 text-xs sm:text-sm 
	                      text-zinc-400 hover:bg-white/5 rounded-md group cursor-pointer items-center
	                      `}
												>
													<div className='flex items-center justify-center w-6 sm:w-auto'>
														{isCurrentSong && isPlaying ? (
															<div className='size-3 sm:size-4 text-green-500'>♫</div>
														) : (
															<span className='group-hover:hidden text-xs sm:text-sm'>{index + 1}</span>
														)}
														{!isCurrentSong && (
															<Play className='h-3 w-3 sm:h-4 sm:w-4 hidden group-hover:block' />
														)}
													</div>

													<div className='flex items-center gap-2 sm:gap-3 flex-1 min-w-0'>
														<img 
															src={getImageUrl(song.imageUrl)} 
															alt={song.title} 
															onError={(e) => handleImageError(e)}
															className='size-6 sm:size-8 md:size-10 flex-shrink-0 rounded object-cover' 
														/>

														<div className='min-w-0 flex-1'>
															<div className={`font-medium text-white truncate text-xs sm:text-sm`}>{song.title}</div>
															<div className='truncate text-xs sm:text-sm'>{song.artist}</div>
														</div>
													</div>
													<div className='hidden sm:flex items-center text-xs sm:text-sm'>
														{song.releaseDate ? 
															new Date(song.releaseDate).toLocaleDateString() : 
															new Date(song.createdAt).toLocaleDateString()
														}
													</div>
													<div className='flex items-center text-xs sm:text-sm'>{formatDuration(song.duration)}</div>
													<div className='flex items-center justify-center'>
														<Button
															onClick={(e) => {
																e.stopPropagation();
																handleSongLike(song);
															}}
															variant='ghost'
															size='sm'
															className='p-1 h-auto text-zinc-400 hover:text-red-500 hover:bg-transparent'
														>
															<Heart 
																className={`h-3 w-3 sm:h-4 sm:w-4 ${songFavoriteStatus[song._id] ? 'fill-red-500 text-red-500' : ''}`} 
															/>
														</Button>
													</div>
												</motion.div>
											);
										})}
									</div>
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			</ScrollArea>
		</div>
	);
};
export default AlbumPage;
