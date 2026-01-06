import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume1, VolumeX, Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const formatTime = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const PlaybackControls = () => {
	const { currentSong, isPlaying, togglePlay, playNext, playPrevious, toggleShuffle, toggleRepeat, isShuffled, repeatMode } = usePlayerStore();
	const { addToFavorites, removeFromFavorites, checkFavoriteStatus } = useFavoritesStore();
	const navigate = useNavigate();

	const [volume, setVolume] = useState(75);
	const [isMuted, setIsMuted] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [isFavorited, setIsFavorited] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		// Try to get audio element from ref first, then fallback to querySelector
		let audio = audioRef.current;
		if (!audio) {
			audio = document.querySelector("audio") as HTMLAudioElement;
			if (audio) {
				audioRef.current = audio;
			}
		}

		if (!audio) {
			console.warn('🎵 Audio element not found');
			return;
		}

		const updateTime = () => {
			if (audio && !isNaN(audio.currentTime)) {
				setCurrentTime(audio.currentTime);
			}
		};
		
		const updateDuration = () => {
			if (audio && !isNaN(audio.duration) && audio.duration > 0) {
				setDuration(audio.duration);
			}
		};

		audio.addEventListener("timeupdate", updateTime);
		audio.addEventListener("loadedmetadata", updateDuration);
		audio.addEventListener("loadeddata", updateDuration);
		audio.addEventListener("canplay", updateDuration);

		const handleEnded = () => {
			usePlayerStore.setState({ isPlaying: false });
		};

		audio.addEventListener("ended", handleEnded);

		return () => {
			if (audio) {
				audio.removeEventListener("timeupdate", updateTime);
				audio.removeEventListener("loadedmetadata", updateDuration);
				audio.removeEventListener("loadeddata", updateDuration);
				audio.removeEventListener("canplay", updateDuration);
				audio.removeEventListener("ended", handleEnded);
			}
		};
	}, [currentSong]);

	const handleSeek = (value: number[]) => {
		const audio = audioRef.current || document.querySelector("audio");
		if (audio && !isNaN(value[0])) {
			audio.currentTime = value[0];
			setCurrentTime(value[0]);
		}
	};

	const handleVolumeChange = (value: number[]) => {
		const newVolume = value[0];
		setVolume(newVolume);
		if (audioRef.current) {
			audioRef.current.volume = newVolume / 100;
		}
		// Unmute if volume is increased from 0
		if (newVolume > 0 && isMuted) {
			setIsMuted(false);
		}
	};

	const handleMuteToggle = () => {
		if (audioRef.current) {
			if (isMuted) {
				// Unmute
				audioRef.current.volume = volume / 100;
				setIsMuted(false);
			} else {
				// Mute
				audioRef.current.volume = 0;
				setIsMuted(true);
			}
		}
	};

	// Get repeat icon based on mode
	const getRepeatIcon = () => {
		switch (repeatMode) {
			case 'one':
				return <Repeat className='h-4 w-4' style={{ color: '#1db954' }} />;
			case 'all':
				return <Repeat className='h-4 w-4' style={{ color: '#1db954' }} />;
			default:
				return <Repeat className='h-4 w-4' />;
		}
	};

	const handleRepeatClick = () => {
		console.log('🔁 Repeat button clicked - Current song:', currentSong?.title);
		console.log('🔁 Repeat button clicked - Current repeat mode:', repeatMode);
		toggleRepeat();
	};

	// Check favorite status when song changes
	useEffect(() => {
		if (currentSong) {
			checkFavoriteStatus(currentSong._id).then(setIsFavorited);
		}
	}, [currentSong, checkFavoriteStatus]);

	// Force re-render when repeat mode changes
	useEffect(() => {
		console.log('🔄 Repeat mode changed to:', repeatMode);
	}, [repeatMode]);

	const handleSongClick = () => {
		if (currentSong?.albumId) {
			navigate(`/album/${currentSong.albumId}`);
		}
	};

	const handleArtistClick = () => {
		if (currentSong?.artist) {
			// Navigate to search with the artist name to find their profile
			// This will show search results including the artist
			navigate(`/search?q=${encodeURIComponent(currentSong.artist)}`);
		}
	};

	const handleFavoriteClick = async () => {
		if (!currentSong) return;

		try {
			if (isFavorited) {
				await removeFromFavorites(currentSong._id);
				setIsFavorited(false);
			} else {
				await addToFavorites('song', currentSong._id, currentSong.title, currentSong.artist, currentSong.imageUrl, {
					audioUrl: currentSong.audioUrl,
					duration: currentSong.duration,
					genre: currentSong.genre,
					albumId: currentSong.albumId
				});
				setIsFavorited(true);
			}
		} catch (error) {
			console.error('Error toggling favorite:', error);
		}
	};

	return (
		<footer className='h-20 sm:h-24 bg-zinc-900 border-t border-zinc-800 px-2 sm:px-4'>
			<div className='flex justify-between items-center h-full max-w-[1800px] mx-auto'>
				{/* currently playing song */}
				<div className='hidden sm:flex items-center gap-4 min-w-[180px] w-[30%]'>
					{currentSong && (
						<>
							<img
								src={currentSong.imageUrl}
								alt={currentSong.title}
								className='w-14 h-14 object-cover rounded-md'
							/>
							<div className='flex-1 min-w-0'>
								<div 
									className='font-medium truncate hover:underline cursor-pointer text-white'
									onClick={handleSongClick}
								>
									{currentSong.title}
								</div>
								<div 
									className='text-sm text-zinc-400 truncate hover:underline cursor-pointer'
									onClick={handleArtistClick}
								>
									{currentSong.artist}
								</div>
							</div>
							<Button
								size='icon'
								variant='ghost'
								className='hover:text-red-500 text-zinc-400'
								onClick={handleFavoriteClick}
							>
								<Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
							</Button>
						</>
					)}
				</div>

				{/* Mobile song info */}
				<div className='sm:hidden flex items-center gap-2 flex-1 min-w-0'>
					{currentSong && (
						<>
							<img
								src={currentSong.imageUrl}
								alt={currentSong.title}
								className='w-10 h-10 object-cover rounded-md'
							/>
							<div className='flex-1 min-w-0'>
								<div 
									className='font-medium truncate text-sm cursor-pointer'
									onClick={handleSongClick}
								>
									{currentSong.title}
								</div>
								<div 
									className='text-xs text-zinc-400 truncate cursor-pointer'
									onClick={handleArtistClick}
								>
									{currentSong.artist}
								</div>
							</div>
							<Button
								size='icon'
								variant='ghost'
								className='hover:text-red-500 text-zinc-400 p-1'
								onClick={handleFavoriteClick}
							>
								<Heart className={`h-3 w-3 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
							</Button>
						</>
					)}
				</div>

				{/* player controls*/}
				<div className='flex flex-col items-center gap-2 flex-1 max-w-full sm:max-w-[45%]'>
					<div className='flex items-center gap-2 sm:gap-4 md:gap-6'>
						{/* Shuffle Button */}
						<Button
							size='icon'
							variant='ghost'
							className='hidden sm:inline-flex hover:text-white text-zinc-400'
							onClick={toggleShuffle}
							disabled={!currentSong}
						>
							<Shuffle className={`h-4 w-4 ${isShuffled ? 'text-green-500' : ''}`} />
						</Button>

						{/* Previous Button */}
						<Button
							size='icon'
							variant='ghost'
							className='hover:text-white text-zinc-400'
							onClick={playPrevious}
							disabled={!currentSong}
						>
							<SkipBack className='h-4 w-4' />
						</Button>

						{/* Play/Pause Button */}
						<Button
							size='icon'
							className='bg-white hover:bg-white/80 text-black rounded-full h-8 w-8 sm:h-10 sm:w-10'
							onClick={togglePlay}
							disabled={!currentSong}
						>
							{isPlaying ? <Pause className='h-4 w-4 sm:h-5 sm:w-5' /> : <Play className='h-4 w-4 sm:h-5 sm:w-5' />}
						</Button>

						{/* Next Button */}
						<Button
							size='icon'
							variant='ghost'
							className='hover:text-white text-zinc-400'
							onClick={playNext}
							disabled={!currentSong}
						>
							<SkipForward className='h-4 w-4' />
						</Button>

						{/* Repeat Button */}
						<Button
							size='icon'
							variant='ghost'
							className='hidden sm:inline-flex hover:text-white text-zinc-400'
							onClick={handleRepeatClick}
							disabled={!currentSong}
						>
							{getRepeatIcon()}
						</Button>
					</div>

					{/* Progress bar - hidden on mobile */}
					<div className='hidden sm:flex items-center gap-2 w-full'>
						<div className='text-xs text-zinc-400'>{formatTime(currentTime)}</div>
						<Slider
							value={[currentTime]}
							max={duration || 100}
							step={1}
							className='w-full hover:cursor-grab active:cursor-grabbing'
							onValueChange={handleSeek}
						/>
						<div className='text-xs text-zinc-400'>{formatTime(duration)}</div>
					</div>

					{/* Mobile progress bar */}
					<div className='sm:hidden flex items-center gap-2 w-full'>
						<Slider
							value={[currentTime]}
							max={duration || 100}
							step={1}
							className='w-full hover:cursor-grab active:cursor-grabbing'
							onValueChange={handleSeek}
						/>
					</div>
				</div>

				{/* volume controls */}
				<div className='hidden sm:flex items-center gap-4 min-w-[180px] w-[30%] justify-end'>
					<div className='flex items-center gap-2'>
						<Button 
							size='icon' 
							variant='ghost' 
							className='hover:text-white text-zinc-400'
							onClick={handleMuteToggle}
						>
							{isMuted ? <VolumeX className='h-4 w-4' /> : <Volume1 className='h-4 w-4' />}
						</Button>

						<Slider
							value={[isMuted ? 0 : volume]}
							max={100}
							step={1}
							className='w-24 hover:cursor-grab active:cursor-grabbing'
							onValueChange={handleVolumeChange}
						/>
					</div>
				</div>
			</div>
		</footer>
	);
};
