import Topbar from "@/components/Topbar";
import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axios";
import { useListeningHistoryStore } from "@/stores/useListeningHistoryStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import SectionGrid from "./components/SectionGrid";
import PopularArtists from "./components/PopularArtists";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { 
	Music, 
	Play, 
	Heart, 
	Clock, 
	Users, 
	Headphones, 
	Radio,
	Mic,
	ArrowRight,
	Disc3,
	CheckCircle,
	Loader2,
	Trash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl, handleImageError } from "@/lib/imageUtils";
import toast from "react-hot-toast";
import { useUser } from "@clerk/clerk-react";
import { useChatStore } from "@/stores/useChatStore";

const HomePage = () => {
	console.log('🎵 HomePage component rendering...');
	const navigate = useNavigate();
	
	// Helper function to format time ago
	const formatTimeAgo = (date: Date): string => {
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
		
		if (diffInSeconds < 60) return 'Just now';
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
		if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
		if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
		return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
	};
	
	const {
		fetchFeaturedSongs,
		fetchMadeForYouSongs,
		fetchTrendingSongs,
		fetchAlbums,
		isLoading,
		madeForYouSongs = [],
		featuredSongs = [],
		trendingSongs = [],
		albums = [],
	} = useMusicStore();

	const { initializeQueue, playAlbum, setCurrentSong } = usePlayerStore();
	const [activeFilter, setActiveFilter] = useState('all');
	const { user } = useUser();
	const { initSocket, userActivities } = useChatStore();

	// Artists data - will be fetched from API
	const [artists, setArtists] = useState<any[]>([]);
	const [artistsLoading, setArtistsLoading] = useState(false);

	// Recently played data - will be fetched from API
	// Get recently played directly from store for real-time updates
	const { recentActivity, clearListeningHistory, isLoading: historyLoading } = useListeningHistoryStore();
	
	// Initialize socket connection for activity updates
	useEffect(() => {
		if (user) {
			initSocket(user.id);
		}
	}, [user, initSocket]);

	// Function to fetch artists from backend
	const fetchArtists = async () => {
		setArtistsLoading(true);
		try {
			const response = await axiosInstance.get('/artists');
			console.log('🎵 Artists API response:', response.data);
			// Handle both array response and object with artists property
			const artistsData = Array.isArray(response.data) ? response.data : response.data.artists || [];
			console.log('🎵 Processed artists data:', artistsData);
			setArtists(artistsData);
		} catch (error) {
			console.error('Error fetching artists:', error);
			setArtists([]);
		} finally {
			setArtistsLoading(false);
		}
	};


	useEffect(() => {
		try {
			fetchFeaturedSongs();
			fetchMadeForYouSongs();
			fetchTrendingSongs();
			fetchAlbums();
			fetchArtists();
		} catch (error) {
			console.error('Error in initial data fetch:', error);
		}
	}, [fetchFeaturedSongs, fetchMadeForYouSongs, fetchTrendingSongs, fetchAlbums]);

	// Debug: Log artists data changes
	useEffect(() => {
		console.log('🎵 Artists state updated:', artists);
	}, [artists]);

	// Fetch recently played data on mount
	useEffect(() => {
		const listeningStore = useListeningHistoryStore.getState();
		listeningStore.getRecentActivity(10);
	}, []);

	// Debug: Log recent activity data
	useEffect(() => {
		if (recentActivity && recentActivity.length > 0) {
			console.log('🎵 Recent Activity Data:', recentActivity);
			recentActivity.forEach((track, index) => {
				console.log(`🎵 Track ${index}:`, {
					songId: track.songId || track._id,
					songTitle: track.songTitle,
					albumId: track.albumId,
					hasAlbumId: !!track.albumId
				});
			});
		}
	}, [recentActivity]);

	// Also fetch when the component mounts to ensure data is available
	useEffect(() => {
		const fetchData = async () => {
			const listeningStore = useListeningHistoryStore.getState();
			await listeningStore.getRecentActivity(10);
		};
		fetchData();
	}, []);

	useEffect(() => {
		if (madeForYouSongs.length > 0 && featuredSongs.length > 0 && trendingSongs.length > 0) {
			const allSongs = [...featuredSongs, ...madeForYouSongs, ...trendingSongs];
			initializeQueue(allSongs);
		}
	}, [initializeQueue, madeForYouSongs, trendingSongs, featuredSongs]);

	const filters = [
		{ id: 'all', label: 'All', icon: Music },
		{ id: 'music', label: 'Music', icon: Headphones },
		{ id: 'albums', label: 'Albums', icon: Disc3 },
		{ id: 'playlists', label: 'Playlists', icon: Radio },
		{ id: 'artists', label: 'Artists', icon: Mic },
		{ id: 'recently-played', label: 'Recently Played', icon: Clock, loading: historyLoading },
		{ id: 'live', label: 'Live', icon: Users }
	];

	// Function to handle album play
	const handleAlbumPlay = (album: any) => {
		if (album.songs && album.songs.length > 0) {
			playAlbum(album.songs);
		}
	};

	// Function to handle recently played song click (navigate to album)
	const handleRecentlyPlayedSongClick = async (track: any) => {
		console.log('🎵 SONG NAME CLICKED!', track);
		// Navigate to album page if albumId exists, otherwise just play the song
		const albumId = track.albumId;
		console.log('🔍 Recently played song click data:', { track, albumId });
		
		if (albumId) {
			console.log('🎵 Navigating to album:', albumId);
			navigate(`/album/${albumId}`);
		} else {
			console.log('🎵 No album ID, playing song directly');
			// If no album, just play the song
			console.log('🎵 About to call handleRecentlyPlayedSongPlay');
			await handleRecentlyPlayedSongPlay(track);
			console.log('🎵 handleRecentlyPlayedSongPlay completed');
		}
	};

	// Function to handle recently played song play
	const handleRecentlyPlayedSongPlay = async (track: any) => {
		console.log('🎵 PLAY BUTTON CLICKED!', track);
		
		// Check if we have the necessary data to play
		if (!track.songId && !track._id) {
			console.error('🎵 No song ID found in track:', track);
			return;
		}
		
		try {
			// Try to fetch the actual song data to get audioUrl
			const songId = track._id || track.songId;
			console.log('🎵 Fetching song data for ID:', songId);
			
			const response = await axiosInstance.get(`/songs/${songId}`);
			const songData = response.data;
			
			console.log('🔍 Fetched song data:', songData);
			
			// Ensure audioUrl exists
			if (!songData.audioUrl) {
				console.error('🎵 Song data missing audioUrl:', songData);
				toast.error('Song audio file not available');
				return;
			}
			
			// Use playAlbum to properly initialize queue and play
			playAlbum([songData], 0);
		} catch (error: any) {
			console.error('🎵 Error fetching song data:', error);
			
			// If the error is 404, the song might not exist
			if (error.response?.status === 404) {
				toast.error('Song not found');
				return;
			}
			
			// Try to get audioUrl from all possible sources
			const audioUrl = track.audioUrl || track.metadata?.audioUrl || track.song?.audioUrl || '';
			
			if (!audioUrl) {
				console.error('🎵 No audioUrl found in track data:', track);
				toast.error('Song audio file not available. Please try playing from another section.');
				return;
			}
			
			// Fallback: use track data as is
			const songData = {
				_id: track._id || track.songId,
				title: track.songTitle || track.title,
				artist: track.artistName || track.artist,
				imageUrl: track.imageUrl || track.song?.imageUrl || '',
				audioUrl: audioUrl,
				duration: track.duration || track.metadata?.duration || track.song?.duration || 0,
				genre: track.genre || track.metadata?.genre || track.song?.genre || '',
				albumId: track.albumId || track.song?.albumId || null,
				albumTitle: track.albumTitle || track.song?.albumTitle || null,
				artistId: track.artistId || track.song?.artistId || null,
				createdAt: track.createdAt || new Date().toISOString(),
				updatedAt: track.updatedAt || new Date().toISOString()
			};
			
			console.log('🔍 Playing recently played song with fallback data:', songData);
			
			// Use playAlbum to properly initialize queue and play
			playAlbum([songData], 0);
		}
	};

	// Function to clear recently played history
	const handleClearHistory = async () => {
		try {
			await clearListeningHistory();
			console.log('🎵 Recently played history cleared');
		} catch (error) {
			console.error('🎵 Error clearing history:', error);
		}
	};

	// Function to render content based on active filter
	const renderContent = () => {
		try {
			switch (activeFilter) {
				case 'all':
					return (
						<div className='space-y-8'>
							{/* Recently Played Section */}
							{historyLoading ? (
								<div className='mb-8'>
									<div className='flex items-center justify-between mb-6'>
										<h2 className='text-xl md:text-2xl font-bold text-white'>Recently Played</h2>
									</div>
									<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
										{Array.from({ length: 4 }).map((_, i) => (
											<Card key={i} className="bg-zinc-800/50 border-zinc-700 animate-pulse">
												<CardContent className="p-4">
													<div className="w-full h-32 bg-zinc-700 rounded-lg mb-4"></div>
													<div className="space-y-2">
														<div className="h-4 bg-zinc-700 rounded w-3/4"></div>
														<div className="h-3 bg-zinc-700 rounded w-1/2"></div>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							) : recentActivity && recentActivity.length > 0 && (
								<div className='mb-8'>
									<div className='flex items-center justify-between mb-6'>
										<h2 className='text-xl md:text-2xl font-bold text-white'>Recently Played</h2>
										<div className='flex items-center gap-2'>
											<Button 
												variant='outline' 
												size='sm'
												onClick={handleClearHistory}
												className='text-zinc-400 hover:text-white border-zinc-700 hover:border-zinc-600'
											>
												<Trash className="w-4 h-4 mr-2" />
												Clear
											</Button>
											<Button 
												variant='link' 
												className='text-emerald-400 hover:text-emerald-300'
												onClick={() => navigate('/search?q=recently%20played&type=songs')}
											>
												View all <ArrowRight className="ml-1 w-4 h-4" />
											</Button>
										</div>
									</div>
									
									<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
										{recentActivity.map((track: any) => (
											<Card key={track._id || track.songId} className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-300 cursor-pointer group">
												<CardContent className="p-4">
													<div className="relative mb-4" onClick={() => handleRecentlyPlayedSongClick(track)}>
														<img
															src={track.imageUrl || '/default-song-image.jpg'}
															alt={track.songTitle}
															className="w-full h-32 object-cover rounded-lg"
														/>
														<div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
															<Play className="w-8 h-8 text-white" />
														</div>
													</div>
													<div onClick={() => handleRecentlyPlayedSongClick(track)}>
														<h4 className="font-medium text-white mb-2">{track.songTitle}</h4>
														<p className="text-sm text-zinc-400 mb-2">{track.artistName}</p>
													</div>
													<div className="flex items-center justify-between">
														<span className="text-xs text-zinc-500">{formatTimeAgo(new Date(track.playedAt))}</span>
														<Button 
															size="sm" 
															variant="outline" 
															className="border-zinc-600 text-zinc-400 hover:bg-zinc-700"
															onClick={(e) => {
																e.stopPropagation();
																handleRecentlyPlayedSongPlay(track);
															}}
														>
															<Play className="w-4 h-4" />
														</Button>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							)}
							
							<SectionGrid title='Popular Songs and Albums' songs={featuredSongs} isLoading={isLoading} />
							<PopularArtists artists={artists} isLoading={artistsLoading} />
							<SectionGrid title='Made For You' songs={madeForYouSongs} isLoading={isLoading} />
							<SectionGrid title='Trending Now' songs={trendingSongs} isLoading={isLoading} />
						</div>
					);

				case 'music':
					return (
						<div className='space-y-8'>
							{/* Recently Played Section */}
							{historyLoading ? (
								<div className='mb-8'>
									<div className='flex items-center justify-between mb-6'>
										<h2 className='text-xl md:text-2xl font-bold text-white'>Recently Played</h2>
									</div>
									<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
										{Array.from({ length: 4 }).map((_, i) => (
											<Card key={i} className="bg-zinc-800/50 border-zinc-700 animate-pulse">
												<CardContent className="p-4">
													<div className="w-full h-32 bg-zinc-700 rounded-lg mb-4"></div>
													<div className="space-y-2">
														<div className="h-4 bg-zinc-700 rounded w-3/4"></div>
														<div className="h-3 bg-zinc-700 rounded w-1/2"></div>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							) : recentActivity && recentActivity.length > 0 && (
								<div className='mb-8'>
									<div className='flex items-center justify-between mb-6'>
										<h2 className='text-xl md:text-2xl font-bold text-white'>Recently Played</h2>
										<div className='flex items-center gap-2'>
											<Button 
												variant='outline' 
												size='sm'
												onClick={handleClearHistory}
												className='text-zinc-400 hover:text-white border-zinc-700 hover:border-zinc-600'
											>
												<Trash className="w-4 h-4 mr-2" />
												Clear
											</Button>
											<Button 
												variant='link' 
												className='text-emerald-400 hover:text-emerald-300'
												onClick={() => navigate('/search?q=recently%20played&type=songs')}
											>
												View all <ArrowRight className="ml-1 w-4 h-4" />
											</Button>
										</div>
									</div>
									
									<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
										{recentActivity.map((track: any) => (
											<Card key={track._id || track.songId} className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-300 cursor-pointer group">
												<CardContent className="p-4">
													<div className="relative mb-4" onClick={() => handleRecentlyPlayedSongClick(track)}>
														<img
															src={track.imageUrl || '/default-song-image.jpg'}
															alt={track.songTitle}
															className="w-full h-32 object-cover rounded-lg"
														/>
														<div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
															<Play className="w-8 h-8 text-white" />
														</div>
													</div>
													<div onClick={() => handleRecentlyPlayedSongClick(track)}>
														<h4 className="text-sm font-medium text-white mb-2">{track.songTitle}</h4>
														<p className="text-xs text-zinc-400 mb-2">{track.artistName}</p>
													</div>
													<div className="flex items-center justify-between">
														<span className="text-xs text-zinc-500">{formatTimeAgo(new Date(track.playedAt))}</span>
														<Button 
															size="sm" 
															variant="outline" 
															className="border-zinc-700 hover:bg-zinc-700"
															onClick={(e) => {
																e.stopPropagation();
																handleRecentlyPlayedSongPlay(track);
															}}
														>
															<Play className="w-4 h-4" />
														</Button>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							)}
							
							<SectionGrid title='Popular Songs and Albums' songs={featuredSongs} isLoading={isLoading} />
							<SectionGrid title='Made For You' songs={madeForYouSongs} isLoading={isLoading} />
							<SectionGrid title='Trending Now' songs={trendingSongs} isLoading={isLoading} />
						</div>
					);

				case 'albums':
					return (
						<div className='space-y-8'>
							{/* Albums Header */}
							<div className='mb-8'>
								<h2 className='text-xl md:text-2xl font-bold text-white mb-4'>Featured Albums</h2>
								<p className='text-zinc-400'>Discover amazing albums and their tracks</p>
							</div>
							
							{/* Albums Grid */}
							{isLoading ? (
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
									{Array.from({ length: 6 }).map((_, i) => (
										<Card key={i} className="bg-zinc-800/50 border-zinc-700 animate-pulse">
											<CardContent className="p-4">
												<div className="w-full h-32 bg-zinc-700 rounded-lg mb-4"></div>
												<div className="space-y-2">
													<div className="h-4 bg-zinc-700 rounded w-3/4"></div>
													<div className="h-3 bg-zinc-700 rounded w-1/2"></div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							) : albums && albums.length > 0 ? (
								<>
									<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
										{albums.map((album) => (
											<Link key={album._id} to={`/album/${album._id}`}>
												<Card className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-300 cursor-pointer group">
													<CardContent className="p-4">
														<div className="relative mb-4">
															<img
																src={getImageUrl(album.imageUrl)}
																alt={album.title}
																onError={(e) => handleImageError(e)}
																className="w-full h-32 object-cover rounded-lg"
															/>
															<div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
																<Play className="w-8 h-8 text-white" />
															</div>
														</div>
														<h4 className="font-medium text-white mb-2">{album.title}</h4>
														<p className="text-sm text-zinc-400 mb-2">{album.artist}</p>
														<div className="flex items-center justify-between">
															<span className="text-xs text-zinc-500">{album.songs?.length || 0} songs</span>
															<Button 
																size="sm" 
																variant="outline" 
																className="border-zinc-600 text-zinc-400 hover:bg-zinc-700"
																onClick={(e) => {
																	e.preventDefault();
																	handleAlbumPlay(album);
																}}
															>
																<Play className="w-4 h-4" />
															</Button>
														</div>
													</CardContent>
												</Card>
											</Link>
										))}
									</div>
								</>
							) : (
								<div className='text-center py-12'>
									<Disc3 className='w-16 h-16 text-zinc-500 mx-auto mb-4' />
									<p className='text-zinc-500 text-lg'>No albums available</p>
									<p className='text-zinc-600 text-sm'>Check back later for featured albums</p>
								</div>
							)}
						</div>
					);

				case 'playlists':
					return (
						<div className='space-y-8'>
							<div className='text-center py-12'>
								<Radio className='w-16 h-16 text-zinc-500 mx-auto mb-4' />
								<p className='text-zinc-500 text-lg'>Playlists coming soon</p>
								<p className='text-zinc-600 text-sm'>Stay tuned for curated playlists</p>
							</div>
						</div>
					);

				case 'artists':
					return (
						<div className='space-y-8'>
							{/* Artists Header */}
							<div className='mb-8'>
								<h2 className='text-xl md:text-2xl font-bold text-white mb-4'>Featured Artists</h2>
								<p className='text-zinc-400'>Discover amazing artists and their latest music</p>
							</div>
							
							{/* Artists Grid */}
							{artistsLoading ? (
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
									{Array.from({ length: 6 }).map((_, i) => (
										<Card key={i} className="bg-zinc-800/50 border-zinc-700 animate-pulse">
											<CardContent className="p-6 text-center">
												<div className="w-24 h-24 bg-zinc-700 rounded-full mx-auto mb-4"></div>
												<div className="space-y-2">
													<div className="h-4 bg-zinc-700 rounded w-3/4 mx-auto"></div>
													<div className="h-3 bg-zinc-700 rounded w-1/2 mx-auto"></div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							) : artists && artists.length > 0 ? (
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
									{artists.map((artist) => (
										<Card key={artist._id} className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-300 cursor-pointer group">
											<CardContent className="p-6 text-center">
												<div className="relative mb-4">
													<Avatar className="w-24 h-24 mx-auto border-4 border-zinc-700 group-hover:border-emerald-500 transition-all duration-300">
														<AvatarImage src={artist.imageUrl} alt={artist.artistName || artist.fullName} />
														<AvatarFallback className="bg-gradient-to-br from-emerald-500 to-blue-600 text-white text-2xl font-semibold">
															{(artist.artistName || artist.fullName)[0]}
														</AvatarFallback>
													</Avatar>
													{artist.isVerified && (
														<div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2 shadow-lg">
															<CheckCircle className="w-4 h-4 text-white" />
														</div>
													)}
												</div>
												<h3 className="text-lg font-semibold text-white mb-2">{artist.artistName || artist.fullName}</h3>
												{artist.genre && (
													<Badge variant="secondary" className="mb-3">{artist.genre}</Badge>
												)}
												{artist.followers && (
													<p className="text-sm text-zinc-400 mb-4">
														{artist.followers > 1000000 
															? `${(artist.followers / 1000000).toFixed(1)}M` 
															: artist.followers > 1000 
															? `${(artist.followers / 1000).toFixed(1)}K` 
															: artist.followers
														} followers
													</p>
												)}
												<div className="flex gap-2 justify-center">
													<Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
														<Heart className="w-4 h-4 mr-2" />
														Follow
													</Button>
													<Button size="sm" variant="outline" className="border-zinc-600 text-zinc-400 hover:bg-zinc-700">
														<Play className="w-4 h-4" />
													</Button>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<div className='text-center py-12'>
									<Mic className='w-16 h-16 text-zinc-500 mx-auto mb-4' />
									<p className='text-zinc-500 text-lg'>No artists available</p>
									<p className='text-zinc-600 text-sm'>Check back later for featured artists</p>
								</div>
							)}
							
							{/* Artist Categories */}
							<div className='mt-12 mb-8'>
								<h3 className='text-lg font-semibold text-white mb-4'>Browse by Genre</h3>
								<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
									{['Pop', 'Hip Hop', 'R&B', 'Rock', 'Electronic', 'Country', 'Jazz', 'Classical'].map((genre) => (
										<Card key={genre} className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-300 cursor-pointer group">
											<CardContent className="p-4 text-center">
												<h4 className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{genre}</h4>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						</div>
					);

				case 'recently-played':
					return (
						<div className='space-y-8'>
							{/* Recently Played Header */}
							<div className='mb-8'>
								<div className='flex items-center justify-between mb-4'>
									<div>
										<h2 className='text-xl md:text-2xl font-bold text-white'>Recently Played</h2>
										<p className='text-zinc-400'>Your listening history and recently played tracks</p>
									</div>
									{recentActivity && recentActivity.length > 0 && (
										<Button 
											variant='outline' 
											size='sm'
											onClick={handleClearHistory}
											className='text-zinc-400 hover:text-white border-zinc-700 hover:border-zinc-600'
										>
											<Trash className="w-4 h-4 mr-2" />
											Clear History
										</Button>
									)}
								</div>
							</div>
							
							{/* Recently Played Grid */}
							{historyLoading ? (
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
									{Array.from({ length: 8 }).map((_, i) => (
										<Card key={i} className="bg-zinc-800/50 border-zinc-700 animate-pulse">
											<CardContent className="p-4">
												<div className="w-full h-32 bg-zinc-700 rounded-lg mb-4"></div>
												<div className="space-y-2">
													<div className="h-4 bg-zinc-700 rounded w-3/4"></div>
													<div className="h-3 bg-zinc-700 rounded w-1/2"></div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							) : recentActivity && recentActivity.length > 0 ? (
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
									{recentActivity.map((track: any) => (
										<Card key={track._id} className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-300 cursor-pointer group">
											<CardContent className="p-4">
												<div className="relative mb-4" onClick={() => handleRecentlyPlayedSongClick(track)}>
													<img
														src={track.imageUrl || '/default-song-image.jpg'}
														alt={track.songTitle}
														className="w-full h-32 object-cover rounded-lg"
													/>
													<div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
														<Play className="w-8 h-8 text-white" />
													</div>
												</div>
												<div onClick={() => handleRecentlyPlayedSongClick(track)}>
													<h4 className="font-medium text-white mb-2">{track.songTitle}</h4>
													<p className="text-sm text-zinc-400 mb-2">{track.artistName}</p>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-xs text-zinc-500">{formatTimeAgo(new Date(track.playedAt))}</span>
													<Button 
														size="sm" 
														variant="outline" 
														className="border-zinc-600 text-zinc-400 hover:bg-zinc-700"
														onClick={(e) => {
															e.stopPropagation();
															handleRecentlyPlayedSongPlay(track);
														}}
													>
														<Play className="w-4 h-4" />
													</Button>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<div className='text-center py-12'>
									<Clock className='w-16 h-16 text-zinc-500 mx-auto mb-4' />
									<p className='text-zinc-500 text-lg'>No recently played tracks</p>
									<p className='text-zinc-600 text-sm'>Start playing some music to see your history</p>
								</div>
							)}
						</div>
					);

				case 'live':
					return (
						<div className='space-y-8'>
							<div className='text-center py-12'>
								<Users className='w-16 h-16 text-zinc-500 mx-auto mb-4' />
								<p className='text-zinc-500 text-lg'>Live content coming soon</p>
								<p className='text-zinc-600 text-sm'>Stay tuned for live concerts and events</p>
							</div>
						</div>
					);

				default:
					return (
						<div className='space-y-8'>
							<SectionGrid title='Popular Songs and Albums' songs={featuredSongs} isLoading={isLoading} />
							<PopularArtists artists={artists} isLoading={artistsLoading} />
							<SectionGrid title='Made For You' songs={madeForYouSongs} isLoading={isLoading} />
							<SectionGrid title='Trending Now' songs={trendingSongs} isLoading={isLoading} />
						</div>
					);
			}
		} catch (error) {
			console.error('Error rendering content:', error);
			return (
				<div className='text-center py-12'>
					<Music className='w-16 h-16 text-zinc-500 mx-auto mb-4' />
					<p className='text-zinc-500 text-lg'>Something went wrong</p>
					<p className='text-zinc-600 text-sm'>Please refresh the page</p>
				</div>
			);
		}
	};

	try {
		// Show loading state if no data is loaded yet
		if (isLoading && artistsLoading && (!featuredSongs || featuredSongs.length === 0) && (!madeForYouSongs || madeForYouSongs.length === 0) && (!trendingSongs || trendingSongs.length === 0)) {
			return (
				<main className='rounded-md overflow-hidden h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900'>
					<Topbar />
					<ScrollArea className='h-[calc(100vh-180px)]'>
						<div className='p-3 sm:p-4 md:p-6 lg:p-8'>
							<div className='text-center py-12'>
								<Music className='w-16 h-16 text-zinc-500 mx-auto mb-4 animate-pulse' />
								<p className='text-zinc-500 text-lg'>Loading your music world...</p>
								<p className='text-zinc-600 text-sm'>Please wait while we fetch your content</p>
							</div>
						</div>
					</ScrollArea>
				</main>
			);
		}

		return (
			<main className='rounded-md overflow-hidden h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900'>
				<Topbar />
				<ScrollArea className='h-[calc(100vh-180px)]'>
					<motion.div 
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className='p-3 sm:p-4 md:p-6 lg:p-8'
					>
						{/* Welcome Section */}
						<motion.div 
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.3 }}
							className='mb-4 sm:mb-6 md:mb-8'
						>
							<h1 className='text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white leading-tight'>
								Welcome to your music world 🎵
							</h1>
						</motion.div>

						{/* Filter buttons */}
						<motion.div 
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.4 }}
							className='flex gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8 overflow-x-auto pb-2 scrollbar-hide'
						>
							{filters.map((filter, index) => {
								const Icon = filter.icon;
								return (
									<motion.div
										key={filter.id}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
									>
										<Button
											variant={activeFilter === filter.id ? "default" : "outline"}
											disabled={filter.loading}
											className={`whitespace-nowrap px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full transition-all text-xs sm:text-sm ${
												activeFilter === filter.id 
													? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
													: 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white'
											} ${filter.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
											onClick={() => setActiveFilter(filter.id)}
										>
											<Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
											<span className="hidden sm:inline">{filter.label}</span>
											<span className="sm:hidden">{filter.label.split(' ')[0]}</span>
											{filter.loading && <Loader2 className="w-3 h-3 ml-1 sm:ml-2 animate-spin" />}
										</Button>
									</motion.div>
								);
							})}
						</motion.div>

						{/* Render content based on active filter */}
						<AnimatePresence mode="wait">
							<motion.div
								key={activeFilter}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.3 }}
							>
								{renderContent()}
							</motion.div>
						</AnimatePresence>
					</motion.div>
				</ScrollArea>
			</main>
		);
	} catch (error) {
		console.error('Critical error in HomePage:', error);
		return (
			<div className='min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center'>
				<div className='text-center'>
					<Music className='w-16 h-16 text-zinc-500 mx-auto mb-4' />
					<p className='text-zinc-500 text-lg'>Something went wrong</p>
					<p className='text-zinc-600 text-sm'>Please refresh the page</p>
					<Button 
						onClick={() => window.location.reload()} 
						className='mt-4 bg-emerald-600 hover:bg-emerald-700'
					>
						Refresh Page
					</Button>
				</div>
			</div>
		);
	}
};

export default HomePage;
