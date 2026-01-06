import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { usePlaylistStore } from '@/stores/usePlaylistStore';
import { useMusicStore } from '@/stores/useMusicStore';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import { useListeningHistoryStore } from '@/stores/useListeningHistoryStore';
import { useFavoritesSync } from '@/hooks/useFavoritesSync';
import { 
	ChevronLeft, 
	ChevronRight, 
	Library, 
	Plus, 
	Search, 
	Clock, 
	List, 
	Heart, 
	Play, 
	Music,
	Disc3,
	X,
	Loader2,
	Radio,
	Edit,
	Trash2,
	Trash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import MobileNav from '@/components/MobileNav';

import CreatePlaylistModal from '@/components/playlist/CreatePlaylistModal';

const LibraryPage = () => {
	const navigate = useNavigate();
	const [activeFilter, setActiveFilter] = useState<'all' | 'playlists' | 'albums' | 'liked-songs' | 'recently-played'>('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [sortBy, setSortBy] = useState<'recents' | 'alphabetical'>('recents');
	const [showSearch, setShowSearch] = useState(false);
	const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
	const [showActionDialog, setShowActionDialog] = useState(false);
	const [selectedItem, setSelectedItem] = useState<any>(null);
	const [selectedItemType, setSelectedItemType] = useState<'playlist' | 'album' | 'song' | 'liked-songs'>('playlist');
	
	const { 
		playlists, 
		likedPlaylists,
		likedSongsPlaylist, 
		getPlaylists, 
		getLikedPlaylists,
		initializeLikedSongsPlaylist,
		deletePlaylist,
		isLoading: playlistsLoading 
	} = usePlaylistStore();
	
	const { albums, fetchAlbums, isLoading: albumsLoading, getLibraryAlbums, libraryAlbums } = useMusicStore();
	const { playAlbum } = usePlayerStore();
	const { favorites, getFavorites, isLoading: favoritesLoading } = useFavoritesStore();
	const { history, recentActivity, getListeningHistory, getRecentActivity, clearListeningHistory, isLoading: historyLoading } = useListeningHistoryStore();

	// Use the custom hook for real-time favorites synchronization
	useFavoritesSync();

	useEffect(() => {
		console.log("🔍 LibraryPage: Initializing data fetch");
		const initializeData = async () => {
			try {
				await Promise.all([
					getPlaylists(),
					getLikedPlaylists(),
					initializeLikedSongsPlaylist(),
					getLibraryAlbums(),
					getFavorites('song'),
					getListeningHistory(50),
					getRecentActivity(50)
				]);
				console.log("✅ LibraryPage: Data initialization completed");
			} catch (error) {
				console.error("❌ LibraryPage: Error initializing data:", error);
			}
		};
		
		initializeData();
	}, [getPlaylists, getLikedPlaylists, initializeLikedSongsPlaylist, getLibraryAlbums, getFavorites, getListeningHistory, getRecentActivity]);

	// Combine created playlists and liked playlists, removing duplicates
	const allPlaylists = [...playlists];
	likedPlaylists.forEach(likedPlaylist => {
		if (!allPlaylists.find(p => p._id === likedPlaylist._id)) {
			allPlaylists.push(likedPlaylist);
		}
	});

	// Filter and sort playlists
	const filteredPlaylists = allPlaylists
		.filter(playlist => 
			(playlist.name?.toLowerCase() || '').includes((searchQuery || '').toLowerCase()) ||
			(playlist.description?.toLowerCase() || '').includes((searchQuery || '').toLowerCase())
		)
		.sort((a, b) => {
			if (sortBy === 'recents') {
				return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
			}
			return (a.name || '').localeCompare(b.name || '');
		});

	// Filter and sort albums (only user's library albums)
	const filteredAlbums = libraryAlbums
		.filter(album => 
			(album.title?.toLowerCase() || '').includes((searchQuery || '').toLowerCase()) ||
			(album.artist?.toLowerCase() || '').includes((searchQuery || '').toLowerCase())
		)
		.sort((a, b) => {
			if (sortBy === 'recents') {
				return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
			}
			return (a.title || '').localeCompare(b.title || '');
		});

	// Filter and sort liked songs
	console.log("🔍 LibraryPage: Current favorites:", favorites);
	const filteredLikedSongs = favorites
		.filter(fav => fav.type === 'song')
		.filter(fav => 
			(fav.title?.toLowerCase() || '').includes((searchQuery || '').toLowerCase()) ||
			(fav.artist?.toLowerCase() || '').includes((searchQuery || '').toLowerCase())
		)
		.sort((a, b) => {
			if (sortBy === 'recents') {
				return new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime();
			}
			return (a.title || '').localeCompare(b.title || '');
		});
	console.log("🔍 LibraryPage: Filtered liked songs:", filteredLikedSongs);

	// Debug logging
	useEffect(() => {
		console.log("🔍 LibraryPage: Current state:", {
			playlists: playlists.length,
			likedSongsPlaylist: likedSongsPlaylist ? {
				id: likedSongsPlaylist._id,
				songCount: likedSongsPlaylist.songCount,
				songs: likedSongsPlaylist.songs?.length || 0
			} : null,
			favorites: favorites.length,
			libraryAlbums: libraryAlbums.length,
			history: history.length,
			playlistsLoading,
			albumsLoading,
			favoritesLoading,
			historyLoading
		});
	}, [playlists, likedSongsPlaylist, favorites, libraryAlbums, history, playlistsLoading, albumsLoading, favoritesLoading, historyLoading]);

	// Filter and sort recently played
	const filteredRecentlyPlayed = recentActivity
		.filter(entry => 
			(entry.songTitle?.toLowerCase() || '').includes((searchQuery || '').toLowerCase()) ||
			(entry.artistName?.toLowerCase() || '').includes((searchQuery || '').toLowerCase())
		)
		.sort((a, b) => {
			if (sortBy === 'recents') {
				return new Date(b.playedAt || 0).getTime() - new Date(a.playedAt || 0).getTime();
			}
			return (a.songTitle || '').localeCompare(b.songTitle || '');
		});

	const handlePlayPlaylist = (playlist: any) => {
		if (playlist.songs && playlist.songs.length > 0) {
			playAlbum(playlist.songs);
		}
	};

	const handlePlayAlbum = (album: any) => {
		if (album.songs && album.songs.length > 0) {
			playAlbum(album.songs);
		}
	};

	const handlePlaySong = (song: any) => {
		// Convert to Song format and play
		// Handle different data structures: favorites vs recently played
		const songData = {
			_id: song._id || song.itemId || song.songId,
			title: song.title || song.songTitle,
			artist: song.artist || song.artistName,
			imageUrl: song.imageUrl,
			audioUrl: song.audioUrl || song.metadata?.audioUrl,
			duration: song.duration || song.metadata?.duration || 0,
			genre: song.genre || song.metadata?.genre || '',
			albumId: song.albumId || song.metadata?.albumId || null
		};
		console.log('🔍 Playing song:', songData);
		playAlbum([songData]);
	};

	const handleSongClick = (song: any) => {
		// Navigate to album page if albumId exists, otherwise just play the song
		// Handle different data structures: favorites vs recently played
		const albumId = song.albumId || song.metadata?.albumId;
		console.log('🔍 Song click data:', { song, albumId });
		
		if (albumId) {
			navigate(`/album/${albumId}`);
		} else {
			// If no album, just play the song
			handlePlaySong(song);
		}
	};

	const handleClearHistory = async () => {
		try {
			await clearListeningHistory();
			toast.success('Recently played history cleared');
		} catch (error) {
			console.error('Error clearing history:', error);
			toast.error('Failed to clear history');
		}
	};

	const handleLongPress = (item: any, type: 'playlist' | 'album' | 'song' | 'liked-songs') => {
		setSelectedItem(item);
		setSelectedItemType(type);
		setShowActionDialog(true);
	};

	const handleAction = (action: string) => {
		if (!selectedItem) return;

		switch (action) {
			case 'play':
				if (selectedItemType === 'playlist') {
					handlePlayPlaylist(selectedItem);
				} else if (selectedItemType === 'album') {
					handlePlayAlbum(selectedItem);
				} else if (selectedItemType === 'song') {
					handlePlaySong(selectedItem);
				} else if (selectedItemType === 'liked-songs') {
					if (likedSongsPlaylist) {
						handlePlayPlaylist(likedSongsPlaylist);
					}
				}
				break;
			case 'view':
				if (selectedItemType === 'playlist') {
					navigate(`/playlist/${selectedItem._id}`);
				} else if (selectedItemType === 'album') {
					navigate(`/album/${selectedItem._id}`);
				} else if (selectedItemType === 'liked-songs') {
					navigate('/liked-songs');
				}
				break;
			case 'delete':
				if (selectedItemType === 'playlist') {
					deletePlaylist(selectedItem._id);
					toast.success('Playlist deleted successfully');
				}
				break;
		}
		setShowActionDialog(false);
		setSelectedItem(null);
	};

	const formatDuration = (minutes: number) => {
		if (!minutes || minutes <= 0) return "0:00";
		const mins = Math.floor(minutes);
		const secs = Math.round((minutes - mins) * 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const getLikedSongsImage = () => {
		return (
			<div className="w-12 h-12 rounded-md bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
				<Heart className="w-6 h-6 text-white fill-white" />
			</div>
		);
	};

	const getPlaylistImage = (playlist: any) => {
		if (playlist.imageUrl) {
			return (
				<img 
					src={playlist.imageUrl} 
					alt={playlist.name}
					className="w-12 h-12 rounded-md object-cover"
				/>
			);
		}
		
		if (playlist.songs && playlist.songs.length > 0) {
			const songImages = playlist.songs
				.slice(0, 4)
				.map((song: any) => song.imageUrl)
				.filter(Boolean);
			
			if (songImages.length > 0) {
				return (
					<div className="w-12 h-12 rounded-md grid grid-cols-2 gap-0.5 overflow-hidden">
						{songImages.slice(0, 4).map((image: string, index: number) => (
							<img 
								key={index}
								src={image} 
								alt=""
								className="w-full h-full object-cover"
							/>
						))}
					</div>
				);
			}
		}
		
		return (
			<div className="w-12 h-12 rounded-md bg-zinc-700 flex items-center justify-center">
				<Music className="w-6 h-6 text-zinc-400" />
			</div>
		);
	};

	const renderContent = () => {
		// Show loading state if any data is still loading
		if (playlistsLoading || albumsLoading || favoritesLoading || historyLoading) {
			return (
				<div className="flex items-center justify-center py-12">
					<div className="text-center">
						<Loader2 className="size-8 text-emerald-500 animate-spin mx-auto mb-4" />
						<p className="text-zinc-400">Loading your library...</p>
					</div>
				</div>
			);
		}

		if (activeFilter === 'all') {
			return (
				<>
					{/* Liked Songs */}
					{(likedSongsPlaylist || filteredLikedSongs.length > 0) && (
						<motion.div 
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
							className="p-3 hover:bg-zinc-800/50 rounded-md group cursor-pointer touch-button"
							onClick={() => navigate('/liked-songs')}
							onTouchStart={() => {
								const timer = setTimeout(() => {
									handleLongPress(likedSongsPlaylist || { _id: 'liked-songs', name: 'Liked Songs' }, 'liked-songs');
								}, 500);
								(document as any).longPressTimer = timer;
							}}
							onTouchEnd={() => {
								if ((document as any).longPressTimer) {
									clearTimeout((document as any).longPressTimer);
									(document as any).longPressTimer = null;
								}
							}}
						>
							<div className="flex items-center gap-3">
								{getLikedSongsImage()}
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<p className="font-medium text-white truncate text-sm sm:text-base">Liked Songs</p>
										<Badge variant="secondary" className="bg-green-500 text-white text-xs">
											<Heart className="w-3 h-3 mr-1" />
											Playlist
										</Badge>
									</div>
									<p className="text-xs sm:text-sm text-zinc-400 truncate">
										{likedSongsPlaylist?.songCount || filteredLikedSongs.length} songs
									</p>
								</div>
								<div className="flex items-center gap-2">
									<Button
										variant="ghost"
										size="icon"
										onClick={(e) => {
											e.stopPropagation();
											if (likedSongsPlaylist) {
												handlePlayPlaylist(likedSongsPlaylist);
											} else if (filteredLikedSongs.length > 0) {
												// Play liked songs from favorites
												const songsToPlay = filteredLikedSongs.map(fav => ({
													_id: fav.itemId,
													title: fav.title,
													artist: fav.artist || '',
													imageUrl: fav.imageUrl || '',
													audioUrl: fav.metadata?.audioUrl || '',
													duration: fav.metadata?.duration || 0,
													genre: fav.metadata?.genre || '',
													albumId: fav.metadata?.albumId || null
												}));
												playAlbum(songsToPlay);
											}
										}}
										className="text-white hover:bg-white/20 touch-button"
									>
										<Play className="w-4 h-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={(e) => {
											e.stopPropagation();
											navigate('/liked-songs');
										}}
										className="text-zinc-400 hover:text-white touch-button"
									>
										<Heart className="w-4 h-4" />
									</Button>
								</div>
							</div>
						</motion.div>
					)}

					{/* Playlists */}
					{filteredPlaylists.slice(0, 5).map((playlist, index) => (
						<motion.div 
							key={playlist._id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: index * 0.1 }}
							className="p-3 hover:bg-zinc-800/50 rounded-md group cursor-pointer touch-button"
							onClick={() => navigate(`/playlist/${playlist._id}`)}
						>
							<div className="flex items-center gap-3">
								{getPlaylistImage(playlist)}
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<p className="font-medium text-white truncate text-sm sm:text-base">{playlist.name}</p>
										<Badge variant="secondary" className="bg-blue-500 text-white text-xs">
											<Radio className="w-3 h-3 mr-1" />
											Playlist
										</Badge>
									</div>
									<p className="text-xs sm:text-sm text-zinc-400 truncate">
										{playlist.songCount} song{playlist.songCount !== 1 ? 's' : ''}
										{playlist.description && ` • ${playlist.description}`}
									</p>
								</div>
								<div className="flex items-center gap-2 ">
									<Button
										variant="ghost"
										size="icon"
										onClick={(e) => {
											e.stopPropagation();
											handlePlayPlaylist(playlist);
										}}
										className="text-white hover:bg-white/20 touch-button"
									>
										<Play className="w-4 h-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={(e) => {
											e.stopPropagation();
											navigate(`/playlist/${playlist._id}`);
										}}
										className="text-zinc-400 hover:text-white touch-button"
									>
										<Radio className="w-4 h-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={(e) => {
											e.stopPropagation();
											deletePlaylist(playlist._id);
											toast.success('Playlist deleted successfully');
										}}
										className="text-red-400 hover:text-red-300 touch-button"
									>
										<Trash2 className="w-4 h-4" />
									</Button>
								</div>
							</div>
						</motion.div>
					))}

					{/* Albums */}
					{filteredAlbums.slice(0, 5).map((album, index) => (
						<Link key={album._id} to={`/album/${album._id}`}>
							<motion.div 
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: (index + 5) * 0.1 }}
								className="p-3 hover:bg-zinc-800/50 rounded-md group cursor-pointer touch-button"
							>
								<div className="flex items-center gap-3">
									<img 
										src={album.imageUrl} 
										alt={album.title}
										className="w-10 h-10 sm:w-12 sm:h-12 rounded-md object-cover"
									/>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<p className="font-medium text-white truncate text-sm sm:text-base">{album.title}</p>
											<Badge variant="secondary" className="bg-emerald-500 text-white text-xs">
												Album
											</Badge>
										</div>
										<p className="text-xs sm:text-sm text-zinc-400 truncate">
											{album.artist}
										</p>
									</div>
									<div className="flex items-center gap-2 ">
										<Button
											variant="ghost"
											size="icon"
											onClick={(e) => {
												e.stopPropagation();
												handlePlayAlbum(album);
											}}
											className="text-white hover:bg-white/20 touch-button"
										>
											<Play className="w-4 h-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={(e) => {
												e.stopPropagation();
												navigate(`/album/${album._id}`);
											}}
											className="text-zinc-400 hover:text-white touch-button"
										>
											<Music className="w-4 h-4" />
										</Button>
									</div>
								</div>
							</motion.div>
						</Link>
					))}
				</>
			);
		}

		if (activeFilter === 'playlists') {
			return (
				<>
					{/* Liked Songs Playlist */}
					{likedSongsPlaylist && (
						<motion.div 
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
							className="p-3 hover:bg-zinc-800/50 rounded-md group cursor-pointer touch-button"
							onClick={() => navigate('/liked-songs')}
						>
							<div className="flex items-center gap-3">
								{getLikedSongsImage()}
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<p className="font-medium text-white truncate">Liked Songs</p>
										<Badge variant="secondary" className="bg-green-500 text-white text-xs">
											<Heart className="w-3 h-3 mr-1" />
											Playlist
										</Badge>
									</div>
									<p className="text-sm text-zinc-400 truncate">
										{likedSongsPlaylist.songCount} songs
									</p>
								</div>
								<div className="flex items-center gap-2 ">
									<Button
										variant="ghost"
										size="icon"
										onClick={(e) => {
											e.stopPropagation();
											handlePlayPlaylist(likedSongsPlaylist);
										}}
										className="text-white hover:bg-white/20"
									>
										<Play className="w-4 h-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={(e) => {
											e.stopPropagation();
											navigate('/liked-songs');
										}}
										className="text-zinc-400 hover:text-white touch-button"
									>
										<Heart className="w-4 h-4" />
									</Button>
								</div>
							</div>
						</motion.div>
					)}

					{/* Other Playlists */}
					{playlistsLoading ? (
						<div className="space-y-2">
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="p-3 animate-pulse">
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 bg-zinc-700 rounded-md" />
										<div className="flex-1">
											<div className="h-4 bg-zinc-700 rounded mb-2" />
											<div className="h-3 bg-zinc-700 rounded w-24" />
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						filteredPlaylists.map((playlist, index) => (
							<motion.div 
								key={playlist._id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: index * 0.1 }}
								className="p-3 hover:bg-zinc-800/50 rounded-md group cursor-pointer touch-button"
								onClick={() => navigate(`/playlist/${playlist._id}`)}
							>
								<div className="flex items-center gap-3">
									{getPlaylistImage(playlist)}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<p className="font-medium text-white truncate text-sm sm:text-base">{playlist.name}</p>
											<Badge variant="secondary" className="bg-blue-500 text-white text-xs">
												<Radio className="w-3 h-3 mr-1" />
												Playlist
											</Badge>
										</div>
										<p className="text-xs sm:text-sm text-zinc-400 truncate">
											{playlist.songCount} song{playlist.songCount !== 1 ? 's' : ''}
											{playlist.description && ` • ${playlist.description}`}
										</p>
									</div>
									<div className="flex items-center gap-2 ">
										<Button
											variant="ghost"
											size="icon"
											onClick={(e) => {
												e.stopPropagation();
												handlePlayPlaylist(playlist);
											}}
											className="text-white hover:bg-white/20 touch-button"
										>
											<Play className="w-4 h-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={(e) => {
												e.stopPropagation();
												navigate(`/playlist/${playlist._id}`);
											}}
											className="text-zinc-400 hover:text-white touch-button"
										>
											<Radio className="w-4 h-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={(e) => {
												e.stopPropagation();
												deletePlaylist(playlist._id);
												toast.success('Playlist deleted successfully');
											}}
											className="text-red-400 hover:text-red-300 touch-button"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
								</div>
							</div>
						</motion.div>
					))
				)}
				</>
			);
		}

		if (activeFilter === 'albums') {
			return (
				<>
					{albumsLoading ? (
						<div className="space-y-2">
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="p-3 animate-pulse">
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 bg-zinc-700 rounded-md" />
										<div className="flex-1">
											<div className="h-4 bg-zinc-700 rounded mb-2" />
											<div className="h-3 bg-zinc-700 rounded w-24" />
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						filteredAlbums.map((album, index) => (
							<Link key={album._id} to={`/album/${album._id}`}>
								<motion.div 
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: index * 0.1 }}
									className="p-3 hover:bg-zinc-800/50 rounded-md group cursor-pointer touch-button"
								>
									<div className="flex items-center gap-3">
										<img 
											src={album.imageUrl} 
											alt={album.title}
											className="w-12 h-12 rounded-md object-cover"
										/>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2">
												<p className="font-medium text-white truncate">{album.title}</p>
												<Badge variant="secondary" className="bg-emerald-500 text-white text-xs">
													Album
												</Badge>
											</div>
											<p className="text-sm text-zinc-400 truncate">
												{album.artist}
											</p>
										</div>
										<div className="flex items-center gap-2 ">
											<Button
												variant="ghost"
												size="icon"
												onClick={(e) => {
													e.stopPropagation();
													handlePlayAlbum(album);
												}}
												className="text-white hover:bg-white/20"
											>
												<Play className="w-4 h-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={(e) => {
													e.stopPropagation();
													navigate(`/album/${album._id}`);
												}}
												className="text-zinc-400 hover:text-white touch-button"
											>
												<Music className="w-4 h-4" />
											</Button>
										</div>
									</div>
								</motion.div>
							</Link>
						))
					)}
				</>
			);
		}

		if (activeFilter === 'liked-songs') {
			return (
				<>
					{favoritesLoading ? (
						<div className="space-y-2">
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="p-3 animate-pulse">
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 bg-zinc-700 rounded-md" />
										<div className="flex-1">
											<div className="h-4 bg-zinc-700 rounded mb-2" />
											<div className="h-3 bg-zinc-700 rounded w-24" />
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						filteredLikedSongs.map((song, index) => (
							<motion.div 
								key={song._id} 
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: index * 0.1 }}
								className="p-3 hover:bg-zinc-800/50 rounded-md group cursor-pointer touch-button" 
								onClick={() => handleSongClick(song)}
							>
								<div className="flex items-center gap-3">
									{song.imageUrl ? (
										<img 
											src={song.imageUrl} 
											alt={song.title}
											className="w-12 h-12 rounded-md object-cover"
										/>
									) : (
										<div className="w-12 h-12 rounded-md bg-zinc-700 flex items-center justify-center">
											<Music className="w-6 h-6 text-zinc-400" />
										</div>
									)}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<p className="font-medium text-white truncate">{song.title}</p>
											<Badge variant="secondary" className="bg-red-500 text-white text-xs">
												<Heart className="w-3 h-3 mr-1" />
												Liked
											</Badge>
										</div>
										<p className="text-sm text-zinc-400 truncate">
											{song.artist}
										</p>
									</div>
									<div className="flex items-center gap-2 ">
										<Button
											variant="ghost"
											size="icon"
											onClick={(e) => {
												e.stopPropagation();
												handlePlaySong(song);
											}}
											className="text-white hover:bg-white/20"
										>
											<Play className="w-4 h-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={(e) => {
												e.stopPropagation();
												// Add to playlist functionality can be added here
											}}
											className="text-zinc-400 hover:text-white touch-button"
										>
											<Plus className="w-4 h-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={(e) => {
												e.stopPropagation();
												// Remove from liked songs functionality can be added here
											}}
											className="text-red-400 hover:text-red-300 touch-button"
										>
											<Heart className="w-4 h-4" />
										</Button>
									</div>
								</div>
							</motion.div>
						))
					)}
				</>
			);
		}

		if (activeFilter === 'recently-played') {
			return (
				<>
					{/* Clear History Button */}
					{!historyLoading && filteredRecentlyPlayed.length > 0 && (
						<div className="flex justify-end mb-4">
							<Button
								variant="outline"
								size="sm"
								onClick={handleClearHistory}
								className="text-zinc-400 hover:text-white border-zinc-700 hover:border-zinc-600"
							>
								<Trash className="w-4 h-4 mr-2" />
								Clear History
							</Button>
						</div>
					)}
					
					{historyLoading ? (
						<div className="space-y-2">
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="p-3 animate-pulse">
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 bg-zinc-700 rounded-md" />
										<div className="flex-1">
											<div className="h-4 bg-zinc-700 rounded mb-2" />
											<div className="h-3 bg-zinc-700 rounded w-24" />
										</div>
									</div>
								</div>
							))}
						</div>
					) : filteredRecentlyPlayed.length === 0 ? (
						<div className="text-center py-12">
							<Clock className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-zinc-300 mb-2">No recently played songs</h3>
							<p className="text-zinc-500">Start playing some music to see your listening history here.</p>
						</div>
					) : (
						filteredRecentlyPlayed.map((entry, index) => (
							<motion.div 
								key={entry._id} 
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: index * 0.1 }}
								className="p-3 hover:bg-zinc-800/50 rounded-md group cursor-pointer touch-button" 
								onClick={() => handleSongClick(entry)}
							>
								<div className="flex items-center gap-3">
									{entry.imageUrl ? (
										<img 
											src={entry.imageUrl} 
											alt={entry.songTitle}
											className="w-12 h-12 rounded-md object-cover"
										/>
									) : (
										<div className="w-12 h-12 rounded-md bg-zinc-700 flex items-center justify-center">
											<Music className="w-6 h-6 text-zinc-400" />
										</div>
									)}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<p className="font-medium text-white truncate">{entry.songTitle}</p>
											<Badge variant="secondary" className="bg-blue-500 text-white text-xs">
												<Clock className="w-3 h-3 mr-1" />
												Recent
											</Badge>
										</div>
										<p className="text-sm text-zinc-400 truncate">
											{entry.artistName}
										</p>
									</div>
								</div>
							</motion.div>
						))
					)}
				</>
			);
		}

		return null;
	};

	return (
		<div className="h-full bg-black text-white">
			{/* Mobile Header */}
			<div className="md:hidden sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-zinc-800">
				<div className="flex items-center gap-3 p-3 sm:p-4">
					<MobileNav />
					<h1 className="text-lg sm:text-xl font-bold text-white">Your Library</h1>
				</div>
			</div>

			<motion.div 
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="p-3 sm:p-4 md:p-6"
			>

				{/* Header */}
				<div className="flex items-center justify-between mb-4 sm:mb-6">
					<div className="flex items-center gap-2 sm:gap-3">
						<div className="w-6 h-6 sm:w-8 sm:h-8 bg-zinc-800 rounded flex items-center justify-center">
							<Library className="w-4 h-4 sm:w-5 sm:h-5" />
						</div>
						<h1 className="text-xl sm:text-2xl font-bold">Your Library</h1>
					</div>
					<div className="flex items-center gap-2">
						<Button 
							variant="ghost" 
							size="icon" 
							onClick={() => setShowCreatePlaylistModal(true)}
							className="text-zinc-400 hover:text-white touch-button"
							title="Create Playlist"
						>
							<Plus className="w-4 h-4 sm:w-5 sm:h-5" />
						</Button>
						<Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white touch-button">
							<List className="w-4 h-4 sm:w-5 sm:h-5" />
						</Button>
					</div>
				</div>

			{/* Filter Tabs */}
			<div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto scrollbar-hide">
				<Button
					variant={activeFilter === 'all' ? 'default' : 'ghost'}
					onClick={() => setActiveFilter('all')}
					className={cn(
						'rounded-full whitespace-nowrap text-sm touch-button',
						activeFilter === 'all' 
							? 'bg-white text-black hover:bg-white' 
							: 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
					)}
				>
					All
				</Button>
				<Button
					variant={activeFilter === 'playlists' ? 'default' : 'ghost'}
					onClick={() => setActiveFilter('playlists')}
					className={cn(
						'rounded-full whitespace-nowrap text-sm touch-button',
						activeFilter === 'playlists' 
							? 'bg-white text-black hover:bg-white' 
							: 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
					)}
				>
					<span className="hidden sm:inline">Playlists</span>
					<span className="sm:hidden">Lists</span>
				</Button>
				<Button
					variant={activeFilter === 'albums' ? 'default' : 'ghost'}
					onClick={() => setActiveFilter('albums')}
					className={cn(
						'rounded-full whitespace-nowrap text-sm touch-button',
						activeFilter === 'albums' 
							? 'bg-white text-black hover:bg-white' 
							: 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
					)}
				>
					Albums
				</Button>
				<Button
					variant={activeFilter === 'liked-songs' ? 'default' : 'ghost'}
					onClick={() => setActiveFilter('liked-songs')}
					className={cn(
						'rounded-full whitespace-nowrap text-sm touch-button',
						activeFilter === 'liked-songs' 
							? 'bg-white text-black hover:bg-white' 
							: 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
					)}
				>
					<Heart className="w-4 h-4 mr-1" />
					<span className="hidden sm:inline">Liked Songs</span>
					<span className="sm:hidden">Liked</span>
				</Button>
				<Button
					variant={activeFilter === 'recently-played' ? 'default' : 'ghost'}
					onClick={() => setActiveFilter('recently-played')}
					className={cn(
						'rounded-full whitespace-nowrap text-sm touch-button',
						activeFilter === 'recently-played' 
							? 'bg-white text-black hover:bg-white' 
							: 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
					)}
				>
					<Clock className="w-4 h-4 mr-1" />
					<span className="hidden sm:inline">Recently Played</span>
					<span className="sm:hidden">Recent</span>
				</Button>
			</div>

			{/* Search and Sort */}
			<div className="flex items-center justify-between mb-4 sm:mb-6">
				{showSearch ? (
					<div className="flex items-center gap-2 flex-1">
						<Search className="w-4 h-4 text-zinc-400" />
						<Input
							placeholder="Search in library..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 flex-1 mobile-input"
						/>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => {
								setShowSearch(false);
								setSearchQuery('');
							}}
							className="text-zinc-400 hover:text-white touch-button"
						>
							<X className="w-4 h-4" />
						</Button>
					</div>
				) : (
					<Button 
						variant="ghost" 
						size="icon" 
						onClick={() => setShowSearch(true)}
						className="text-zinc-400 hover:text-white touch-button"
					>
						<Search className="w-4 h-4 sm:w-5 sm:h-5" />
					</Button>
				)}
				<div className="flex items-center gap-2 text-zinc-400">
					<Clock className="w-4 h-4" />
					<span className="text-xs sm:text-sm">{sortBy === 'recents' ? 'Recents' : 'Alphabetical'}</span>
					<Button 
						variant="ghost" 
						size="icon" 
						onClick={() => setSortBy(sortBy === 'recents' ? 'alphabetical' : 'recents')}
						className="text-zinc-400 hover:text-white touch-button"
					>
						<List className="w-4 h-4" />
					</Button>
				</div>
			</div>

				{/* Content */}
				<ScrollArea className="h-[calc(100vh-350px)] sm:h-[calc(100vh-370px)]">
					<motion.div 
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3 }}
						className="space-y-2 pb-8"
					>
						{renderContent()}
					</motion.div>
				</ScrollArea>
			</motion.div>


			{/* Debug info - remove in production */}
			{process.env.NODE_ENV === 'development' && (
				<div className="mt-4 p-3 sm:p-4 bg-zinc-800 rounded-lg border border-zinc-700">
					<h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Debug Information</h3>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
						<div>
							<p className="text-zinc-400">Playlists:</p>
							<p className="text-white">{playlists.length}</p>
						</div>
						<div>
							<p className="text-zinc-400">Liked Songs:</p>
							<p className="text-white">{likedSongsPlaylist?.songCount || 0}</p>
						</div>
						<div>
							<p className="text-zinc-400">Favorites:</p>
							<p className="text-white">{favorites.length}</p>
						</div>
						<div>
							<p className="text-zinc-400">Library Albums:</p>
							<p className="text-white">{libraryAlbums.length}</p>
						</div>
						<div>
							<p className="text-zinc-400">History:</p>
							<p className="text-white">{history.length}</p>
						</div>
						<div>
							<p className="text-zinc-400">Loading States:</p>
							<p className="text-white">
								{playlistsLoading ? 'P' : ''}
								{albumsLoading ? 'A' : ''}
								{favoritesLoading ? 'F' : ''}
								{historyLoading ? 'H' : ''}
								{!playlistsLoading && !albumsLoading && !favoritesLoading && !historyLoading ? 'None' : ''}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Create Playlist Modal */}
			<CreatePlaylistModal
				isOpen={showCreatePlaylistModal}
				onClose={() => setShowCreatePlaylistModal(false)}
			/>

			{/* Action Dialog */}
			<Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
				<DialogContent className="bg-zinc-900 border-zinc-800 text-white">
					<DialogHeader>
						<DialogTitle className="text-white">
							{selectedItem?.name || selectedItem?.title || 'Item Actions'}
						</DialogTitle>
					</DialogHeader>
					<div className="space-y-3">
						<Button
							onClick={() => handleAction('play')}
							className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
						>
							<Play className="w-4 h-4 mr-2" />
							Play
						</Button>
						<Button
							onClick={() => handleAction('view')}
							variant="outline"
							className="w-full border-zinc-700 text-white hover:bg-zinc-800"
						>
							<Music className="w-4 h-4 mr-2" />
							View
						</Button>
						{selectedItemType === 'playlist' && (
							<Button
								onClick={() => handleAction('delete')}
								variant="destructive"
								className="w-full"
							>
								<Trash2 className="w-4 h-4 mr-2" />
								Delete
							</Button>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default LibraryPage;
