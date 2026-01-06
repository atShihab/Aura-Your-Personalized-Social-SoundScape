import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { useChatStore } from "@/stores/useChatStore";

import { SignedIn, useUser } from "@clerk/clerk-react";
import { HomeIcon, Library, MessageCircle, Plus, Search, Clock, Mic, User, Crown, Settings, Heart, Music, X, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useFavoritesSync } from "@/hooks/useFavoritesSync";
import { motion } from "framer-motion";
import CreatePlaylistModal from "@/components/playlist/CreatePlaylistModal";

const LeftSidebar = () => {
	const { albums, fetchAlbums, isLoading: albumsLoading, getLibraryAlbums, libraryAlbums } = useMusicStore();
	const { isArtist, checkArtistStatus } = useAuthStore();
	const { totalUnreadCount, fetchUnreadCounts } = useChatStore();
	const { 
		playlists, 
		likedPlaylists,
		likedSongsPlaylist, 
		getPlaylists, 
		getLikedPlaylists,
		initializeLikedSongsPlaylist, 
		getLikedSongsPlaylist,
		isLoading: playlistsLoading 
	} = usePlaylistStore();
	const { favorites, getFavorites, isLoading: favoritesLoading } = useFavoritesStore();

	const { user } = useUser();
	const [activeFilter, setActiveFilter] = useState('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [showSearch, setShowSearch] = useState(false);
	const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);

	// Use the custom hook for real-time favorites synchronization
	useFavoritesSync();

	useEffect(() => {
		console.log("🔍 LeftSidebar: Initializing data fetch");
		const initializeData = async () => {
			try {
				await Promise.all([
					fetchAlbums(),
					getPlaylists(),
					getLikedPlaylists(),
					initializeLikedSongsPlaylist(),
					getLikedSongsPlaylist(),
					getFavorites('song'),
					getLibraryAlbums(),
					fetchUnreadCounts()
				]);
				console.log("✅ LeftSidebar: Data initialization completed");
			} catch (error) {
				console.error("❌ LeftSidebar: Error initializing data:", error);
			}
		};
		
		initializeData();
		console.log("🎤 LeftSidebar: Checking artist status...");
		checkArtistStatus();
	}, [fetchAlbums, getPlaylists, getLikedPlaylists, initializeLikedSongsPlaylist, getLikedSongsPlaylist, getFavorites, getLibraryAlbums, checkArtistStatus]);

	console.log({ albums, isArtist });

	const filters = [
		{ id: 'all', label: 'All', icon: null },
		{ id: 'playlists', label: 'Playlists', icon: null },
		{ id: 'albums', label: 'Albums', icon: null }
	];

	// Combine created and liked playlists, removing duplicates
	const allPlaylists = [...playlists, ...likedPlaylists].filter((playlist, index, self) => 
		index === self.findIndex(p => p._id === playlist._id)
	);

	// Filter playlists based on active filter and search query
	const filteredPlaylists = allPlaylists.filter(playlist => {
		const matchesSearch = (playlist.name?.toLowerCase() || '').includes((searchQuery || '').toLowerCase()) ||
			(playlist.description?.toLowerCase() || '').includes((searchQuery || '').toLowerCase());
		
		if (activeFilter === 'all') {
			return matchesSearch;
		} else if (activeFilter === 'playlists') {
			return matchesSearch;
		}
		return false;
	});

	// Filter albums based on active filter and search query (only user's library albums)
	const filteredAlbums = libraryAlbums.filter(album => {
		const matchesSearch = (album.title?.toLowerCase() || '').includes((searchQuery || '').toLowerCase()) ||
			(album.artist?.toLowerCase() || '').includes((searchQuery || '').toLowerCase());
		
		if (activeFilter === 'all') {
			return matchesSearch;
		} else if (activeFilter === 'albums') {
			return matchesSearch;
		}
		return false;
	});

	// Filter liked songs playlist based on search query
	const shouldShowLikedSongs = activeFilter === 'all' || activeFilter === 'playlists';
	const likedSongsMatchesSearch = !searchQuery || 
		'Liked Songs'.toLowerCase().includes((searchQuery || '').toLowerCase());

	// Check if we should show liked songs (either from playlist or favorites)
	const hasLikedSongs = (likedSongsPlaylist?.songCount || 0) > 0 || favorites.filter(f => f.type === 'song').length > 0;
	const likedSongsCount = likedSongsPlaylist?.songCount || favorites.filter(f => f.type === 'song').length;

	return (
		<div className='h-full flex flex-col gap-1 sm:gap-2'>
			{/* Navigation menu */}
			<div className='rounded-lg bg-zinc-900 p-2 sm:p-3 md:p-4'>
				{/* Aura Logo and Brand */}
				<Link to="/home" className='flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-zinc-800 hover:opacity-80 transition-opacity'>
					<img 
						src='/aura.svg' 
						className='size-8 sm:size-9 md:size-10' 
						alt='AURA MUSIC logo'
						onError={(e) => {
							console.warn('Aura logo not found');
						}}
					/>
					<span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent text-glow-gradient">
						AURA
					</span>
				</Link>

				<div className='space-y-1 sm:space-y-2'>
					<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
						<Link
							to={"/home"}
							className={cn(
								buttonVariants({
									variant: "ghost",
									className: "w-full justify-start text-white hover:bg-zinc-800 text-sm sm:text-base",
								})
							)}
						>
							<HomeIcon className='mr-1 sm:mr-2 size-4 sm:size-5' />
							<span className='hidden md:inline'>Home</span>
						</Link>
					</motion.div>

					<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
						<Link
							to={"/home/search"}
							className={cn(
								buttonVariants({
									variant: "ghost",
									className: "w-full justify-start text-white hover:bg-zinc-800 text-sm sm:text-base",
								})
							)}
						>
							<Search className='mr-1 sm:mr-2 size-4 sm:size-5' />
							<span className='hidden md:inline'>Search</span>
						</Link>
					</motion.div>

					<SignedIn>
						<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
							<Link
								to={"/home/chat"}
								className={cn(
									buttonVariants({
										variant: "ghost",
										className: "w-full justify-start text-white hover:bg-zinc-800 text-sm sm:text-base relative",
									})
								)}
							>
								<MessageCircle className='mr-1 sm:mr-2 size-4 sm:size-5' />
								<span className='hidden md:inline'>Messages</span>
								{totalUnreadCount > 0 && (
									<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
										{totalUnreadCount > 99 ? '99+' : totalUnreadCount}
									</span>
								)}
							</Link>
						</motion.div>

						{isArtist && (
							<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
								<Link
									to={"/artist-dashboard"}
									className={cn(
										buttonVariants({
											variant: "ghost",
											className: "w-full justify-start text-purple-300 hover:bg-purple-500/20 text-sm sm:text-base",
										})
									)}
								>
									<Mic className='mr-1 sm:mr-2 size-4 sm:size-5' />
									<span className='hidden md:inline'>Artist Dashboard</span>
								</Link>
							</motion.div>
						)}
					</SignedIn>

					{/* Profile and Settings buttons */}
					<div className='pt-1 sm:pt-2 border-t border-zinc-800'>
						<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
							<Link
								to={user ? `/home/profile/${user.id}` : "/home/profile"}
								className={cn(
									buttonVariants({
										variant: "ghost",
										className: "w-full justify-start text-white hover:bg-zinc-800 text-sm sm:text-base",
									})
								)}
							>
								<User className='mr-1 sm:mr-2 size-4 sm:size-5' />
								<span className='hidden md:inline'>Profile</span>
							</Link>
						</motion.div>

						{/* Settings and Premium links - HIDDEN FOR NOW */}
						{/* <Link
							to={"/home/settings"}
							className={cn(
								buttonVariants({
									variant: "ghost",
									className: "w-full justify-start text-white hover:bg-zinc-800",
								})
							)}
						>
							<Settings className='mr-2 size-5' />
							<span className='hidden md:inline'>Settings</span>
						</Link>

						<Link
							to={"/premium"}
							className={cn(
								buttonVariants({
									variant: "ghost",
									className: "w-full justify-start text-white hover:bg-zinc-800",
								})
							)}
						>
							<Crown className='mr-2 size-5' />
							<span className='hidden md:inline'>Premium</span>
						</Link> */}

						<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
							<Link
								to={"/artist/signup"}
								className={cn(
									buttonVariants({
										variant: "ghost",
										className: "w-full justify-start text-white hover:bg-zinc-800 text-sm sm:text-base",
									})
								)}
							>
								<Mic className='mr-1 sm:mr-2 size-4 sm:size-5' />
								<span className='hidden md:inline'>Join as Artist</span>
							</Link>
						</motion.div>
					</div>
				</div>
			</div>

			{/* Library section */}
			<div className='flex-1 rounded-lg bg-zinc-900 p-2 sm:p-3 md:p-4 flex flex-col min-h-0'>
				<div className='flex items-center justify-between mb-2 sm:mb-3 md:mb-4'>
					<div className='flex items-center text-white px-1 sm:px-2'>
						<Library className='size-4 sm:size-5 mr-1 sm:mr-2' />
						<span className='font-semibold text-sm sm:text-base'>Your Library</span>
					</div>
					<div className='flex items-center gap-1 sm:gap-2'>
						<SignedIn>
							<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
								<button
									onClick={() => setShowCreatePlaylistModal(true)}
									className='p-1 hover:bg-zinc-800 rounded-full transition-colors'
									title="Create Playlist"
								>
									<Plus className='size-3 sm:size-4 text-zinc-400 hover:text-white' />
								</button>
							</motion.div>
						</SignedIn>
						<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
							<Link to="/library" className='p-1 hover:bg-zinc-800 rounded-full transition-colors'>
								<ChevronRight className='size-3 sm:size-4 text-zinc-400' />
							</Link>
						</motion.div>
					</div>
				</div>

				{/* Filter buttons */}
				<div className='flex gap-1 sm:gap-2 mb-2 sm:mb-3 md:mb-4'>
					{filters.map((filter) => (
						<motion.button
							key={filter.id}
							onClick={() => setActiveFilter(filter.id)}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className={cn(
								'px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium transition-colors',
								activeFilter === filter.id
									? 'bg-white text-black'
									: 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
							)}
						>
							{filter.label}
						</motion.button>
					))}
				</div>

				{/* Search and Recents */}
				<div className='flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3 md:mb-4'>
					{showSearch ? (
						<div className='flex items-center gap-1 sm:gap-2 flex-1'>
							<Search className='size-3 sm:size-4 text-zinc-400' />
							<Input
								placeholder="Search in library..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="bg-zinc-800/90 border-zinc-600 text-white placeholder:text-zinc-400 text-xs h-7 sm:h-8 focus:bg-zinc-800 focus:border-zinc-500"
							/>
							<motion.button
								onClick={() => {
									setShowSearch(false);
									setSearchQuery('');
								}}
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								className='p-1 hover:bg-zinc-800 rounded-full transition-colors'
							>
								<X className='size-3 sm:size-4 text-zinc-400' />
							</motion.button>
						</div>
					) : (
						<>
							<motion.button 
								onClick={() => setShowSearch(true)}
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								className='p-1 sm:p-2 hover:bg-zinc-800 rounded-full transition-colors'
							>
								<Search className='size-3 sm:size-4 text-zinc-400' />
							</motion.button>
							<div className='flex items-center gap-1 sm:gap-2 text-zinc-400'>
								<Clock className='size-3 sm:size-4' />
								<span className='text-xs sm:text-sm'>Recents</span>
							</div>
						</>
					)}
				</div>

				{/* Library Content */}
				<ScrollArea className='flex-1 min-h-0'>
					<div className='space-y-1 sm:space-y-2 pb-4 sm:pb-8'>
						{playlistsLoading ? (
							<PlaylistSkeleton />
						) : (
							<>
								{/* Liked Songs Playlist - Show if we have liked songs or if it's a playlist */}
								{hasLikedSongs && shouldShowLikedSongs && likedSongsMatchesSearch && (
									<motion.div
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<Link
											to="/liked-songs"
											className='p-1.5 sm:p-2 hover:bg-zinc-800 rounded-md flex items-center gap-2 sm:gap-3 group cursor-pointer'
										>
											<div className='size-8 sm:size-10 md:size-12 rounded-md bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0'>
												<Heart className='size-4 sm:size-5 md:size-6 text-white fill-white' />
											</div>
											<div className='flex-1 min-w-0 hidden md:block'>
												<p className='font-medium truncate text-sm sm:text-base'>Liked Songs</p>
												<p className='text-xs sm:text-sm text-zinc-400 truncate'>Playlist • {likedSongsCount} songs</p>
											</div>
										</Link>
									</motion.div>
								)}

								{/* Other Playlists */}
								{filteredPlaylists.map((playlist) => (
									<motion.div
										key={playlist._id}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<Link
											to="/library"
											className='p-1.5 sm:p-2 hover:bg-zinc-800 rounded-md flex items-center gap-2 sm:gap-3 group cursor-pointer'
										>
											{playlist.imageUrl ? (
												<img
													src={playlist.imageUrl}
													alt={playlist.name}
													className='size-8 sm:size-10 md:size-12 rounded-md flex-shrink-0 object-cover'
												/>
											) : (
												<div className='size-8 sm:size-10 md:size-12 rounded-md bg-zinc-700 flex items-center justify-center flex-shrink-0'>
													<Music className='size-4 sm:size-5 md:size-6 text-zinc-400' />
												</div>
											)}
											<div className='flex-1 min-w-0 hidden md:block'>
												<p className='font-medium truncate text-sm sm:text-base'>{playlist.name}</p>
												<p className='text-xs sm:text-sm text-zinc-400 truncate'>Playlist • {playlist.songCount} songs</p>
											</div>
										</Link>
									</motion.div>
								))}

								{/* Albums */}
								{filteredAlbums.map((album) => (
									<motion.div
										key={album._id}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<Link
											to={`/album/${album._id}`}
											className='p-1.5 sm:p-2 hover:bg-zinc-800 rounded-md flex items-center gap-2 sm:gap-3 group cursor-pointer'
										>
											<img
												src={album.imageUrl}
												alt={album.title}
												className='size-8 sm:size-10 md:size-12 rounded-md flex-shrink-0 object-cover'
											/>
											<div className='flex-1 min-w-0 hidden md:block'>
												<p className='font-medium truncate text-sm sm:text-base'>{album.title}</p>
												<p className='text-xs sm:text-sm text-zinc-400 truncate'>Album • {album.artist}</p>
											</div>
										</Link>
									</motion.div>
								))}



								{/* No results message */}
								{searchQuery && filteredPlaylists.length === 0 && filteredAlbums.length === 0 && !hasLikedSongs && (
									<div className='text-center py-2 sm:py-4'>
										<p className='text-zinc-400 text-xs sm:text-sm'>No results found</p>
									</div>
								)}


							</>
						)}
					</div>
				</ScrollArea>
			</div>

			{/* Create Playlist Modal */}
			<CreatePlaylistModal
				isOpen={showCreatePlaylistModal}
				onClose={() => {
					setShowCreatePlaylistModal(false);
					// Refresh playlists after creating a new one
					getPlaylists();
				}}
			/>
		</div>
	);
};
export default LeftSidebar;
