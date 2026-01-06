import { SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboardIcon, Search, X, Layout, Music, Mic } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useMusicStore } from "@/stores/useMusicStore";
import { useChatStore } from "@/stores/useChatStore";
import MobileNav from "./MobileNav";
import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axios";
import { Button } from "./ui/button";
import { Sheet, SheetContent } from "./ui/sheet";
import { useSidebar } from "@/contexts/SidebarContext";
import { navigateToProfile } from '@/lib/profileUrl';
import { motion, AnimatePresence } from "framer-motion";
import NotificationButton from "./NotificationButton";


const Topbar = () => {
	const { isAdmin, isArtist, checkArtistStatus } = useAuthStore();

	useEffect(() => {
		console.log("🎤 Topbar: Checking artist status...");
		checkArtistStatus();
	}, [checkArtistStatus]);
	const { searchSongs, albums } = useMusicStore();
	const { users } = useChatStore();
	const { toggleBothSidebars } = useSidebar();
	const navigate = useNavigate();
	const [searchInput, setSearchInput] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [showMobileSearch, setShowMobileSearch] = useState(false);
	const [searchResults, setSearchResults] = useState<{
		songs: any[];
		artists: any[];
		albums: any[];
		playlists: any[];
		users: any[];
	}>({
		songs: [],
		artists: [],
		albums: [],
		playlists: [],
		users: []
	});
	console.log({ isAdmin, isArtist });


	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		console.log('🔍 Topbar handleSearchChange called with:', value);
		setSearchInput(value);
		setShowSuggestions(value.length > 0);
		
		// Perform search as you type
		if (value.trim()) {
			console.log('🔍 Calling performSearch with:', value.trim());
			performSearch(value.trim());
		} else {
			console.log('🔍 Clearing search results');
			setShowSuggestions(false);
			setSearchResults({
				songs: [],
				artists: [],
				albums: [],
				playlists: [],
				users: []
			});
		}
	};

	const handleClearSearch = () => {
		setSearchInput('');
		setShowSuggestions(false);
		setSearchResults({
			songs: [],
			artists: [],
			albums: [],
			playlists: [],
			users: []
		});
	};


	const handleUserClick = (user: any) => {
		// Navigate to user profile using username if available
		navigateToProfile(navigate, user);
		setSearchInput('');
		setShowSuggestions(false);
		setSearchResults({
			songs: [],
			artists: [],
			albums: [],
			playlists: [],
			users: []
		});
	};

	const performSearch = async (searchQuery: string) => {
		console.log('🔍 Topbar performSearch called with:', searchQuery);
		try {
			// Search for songs
			console.log('🔍 Searching for songs...');
			const songResults = await searchSongs(searchQuery);
			console.log('🔍 Song results:', songResults);
			
			// Search for artists using API
			let artistResults: any[] = [];
			try {
				console.log('🔍 Searching for artists...');
				const artistResponse = await axiosInstance.get(`/api/artists/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
				artistResults = artistResponse.data?.artists || [];
				console.log('🔍 Artist results:', artistResults);
			} catch (error) {
				console.error('Error searching artists:', error);
			}

			// Search for albums using client-side filtering
			console.log('🔍 Searching for albums...');
			const albumResults = albums.filter(album => 
				(album.title?.toLowerCase() || '').includes((searchQuery || '').toLowerCase()) ||
				(album.artist?.toLowerCase() || '').includes((searchQuery || '').toLowerCase())
			);
			console.log('🔍 Album results:', albumResults);

			// Search for playlists using API
			let playlistResults: any[] = [];
			try {
				console.log('🔍 Searching for playlists...');
				const playlistResponse = await axiosInstance.get(`/api/playlists/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
				playlistResults = playlistResponse.data?.playlists || [];
				console.log('🔍 Playlist results:', playlistResults);
			} catch (error) {
				console.error('Error searching playlists:', error);
			}

			// Search for users/artists by name, username (handle), and artist name
			console.log('🔍 Searching for users...');
			const userResults = users.filter(user => 
				(user.fullName?.toLowerCase() || '').includes((searchQuery || '').toLowerCase()) ||
				(user.handle?.toLowerCase() || '').includes((searchQuery || '').toLowerCase()) ||
				(user.artistName?.toLowerCase() || '').includes((searchQuery || '').toLowerCase())
			);
			console.log('🔍 User results:', userResults);

			const finalResults = {
				songs: songResults || [],
				artists: artistResults,
				albums: albumResults,
				playlists: playlistResults,
				users: userResults
			};
			
			console.log('🔍 Final search results:', finalResults);
			setSearchResults(finalResults);
		} catch (error) {
			console.error('Search error:', error);
		}
	};

	const handleMobileSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchInput.trim()) {
			navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
			setShowMobileSearch(false);
			setSearchInput('');
		}
	};

	return (
		<>
			<motion.div
				initial={{ y: -100, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
				className='flex items-center justify-between p-2 sm:p-3 md:p-4 sticky top-0 bg-zinc-900/75 
      backdrop-blur-md z-10 border-b border-zinc-800'
			>
			{/* Left side */}
			<div className='flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0'>
				<div className='flex gap-1 sm:gap-2 items-center'>
					<MobileNav />
				</div>
				
				{/* Aura Logo - Visible on all screens */}
				<Link to="/home" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
					<img 
						src='/aura.svg' 
						className='size-8 sm:size-9 md:size-10' 
						alt='AURA MUSIC logo'
						onError={(e) => {
							// Fallback if image doesn't load
							console.warn('Aura logo not found, using text fallback');
						}}
					/>
					<span className="hidden sm:inline text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent text-glow-gradient">
						AURA
					</span>
				</Link>
				
				{/* Mobile Search Button */}
				<motion.div
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setShowMobileSearch(true)}
						className="md:hidden h-8 w-8 sm:h-9 sm:w-9"
					>
						<Search className="h-4 w-4 sm:h-5 sm:w-5" />
					</Button>
				</motion.div>
				
				{/* Desktop Search Bar */}
				<div className='hidden md:flex items-center gap-2 lg:gap-3 flex-1 max-w-sm lg:max-w-md'>
					<div className='relative flex-1'>
						<motion.div 
							className='flex items-center bg-zinc-800 rounded-full px-3 py-1.5 transition-all duration-300 ease-in-out hover:bg-zinc-700 focus-within:bg-zinc-700 focus-within:ring-2 focus-within:ring-white/20'
							whileHover={{ scale: 1.02 }}
							transition={{ duration: 0.2 }}
						>
							<Search className='size-4 text-zinc-400 mr-2 transition-colors duration-200' />
							<Input
								type="text"
								value={searchInput}
								onChange={handleSearchChange}
								placeholder="Search for songs, artists, albums..."
								className='bg-transparent border-0 text-white placeholder:text-zinc-400 focus:ring-0 focus:border-0 flex-1 text-sm transition-all duration-200'
							/>
							<AnimatePresence>
								{searchInput && (
									<motion.button 
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.8 }}
										transition={{ duration: 0.2 }}
										onClick={handleClearSearch}
										className='p-1 hover:bg-zinc-600 rounded-full transition-all duration-200 hover:scale-110'
									>
										<X className='w-3 h-3 text-zinc-400 hover:text-white transition-colors duration-200' />
									</motion.button>
								)}
							</AnimatePresence>
						</motion.div>

						{/* Search Results Dropdown */}
						<AnimatePresence>
							{showSuggestions && (
								<motion.div 
									initial={{ opacity: 0, y: -10, scale: 0.95 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: -10, scale: 0.95 }}
									transition={{ duration: 0.2, ease: "easeOut" }}
									className="absolute top-full left-2 lg:left-8 mt-2 z-50 w-72 lg:w-80"
								>
									<Card className="bg-zinc-800/95 border-zinc-700 backdrop-blur-md max-h-96 overflow-y-auto shadow-xl">
									<CardContent className="space-y-4 p-4">
										{/* No Results Message */}
										{searchResults.songs.length === 0 && searchResults.artists.length === 0 && searchResults.albums.length === 0 && searchResults.playlists.length === 0 && searchResults.users.length === 0 && (
											<div className="text-center py-8">
												<p className="text-zinc-400 text-sm">No results found for "{searchInput}"</p>
											</div>
										)}
										{/* Songs Results */}
										{searchResults.songs.length > 0 && (
											<div className="space-y-2">
												<div className="flex items-center gap-2 text-xs text-zinc-500">
													<Music className="w-3 h-3" />
													Songs
												</div>
												<div className="space-y-1">
													{searchResults.songs.slice(0, 3).map((song: any, index: number) => (
														<button
															key={song._id || index}
															onClick={() => {
																if (song.albumId) {
																	navigate(`/album/${song.albumId}`);
																}
																handleClearSearch();
															}}
															className="w-full text-left p-2 rounded-md hover:bg-zinc-700/40 transition-colors flex items-center gap-3 group"
														>
															<img
																src={song.imageUrl || '/cover-images/1.jpg'}
																alt={song.title}
																className="w-7 h-7 rounded object-cover"
															/>
															<div className="flex-1 min-w-0">
																<h4 className="text-sm font-medium text-white truncate">{song.title}</h4>
																<p className="text-xs text-zinc-400 truncate">{song.artist}</p>
															</div>
															<Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/20 px-2 py-0.5">
																Song
															</Badge>
														</button>
													))}
												</div>
											</div>
										)}

										{/* Albums Results */}
										{searchResults.albums.length > 0 && (
											<div className="space-y-2">
												<div className="flex items-center gap-2 text-xs text-zinc-500">
													<Music className="w-3 h-3" />
													Albums
												</div>
												<div className="space-y-1">
													{searchResults.albums.slice(0, 3).map((album: any, index: number) => (
														<button
															key={album._id || index}
															onClick={() => {
																navigate(`/album/${album._id}`);
																handleClearSearch();
															}}
															className="w-full text-left p-2 rounded-md hover:bg-zinc-700/40 transition-colors flex items-center gap-3 group"
														>
															<img
																src={album.imageUrl}
																alt={album.title}
																className="w-7 h-7 rounded object-cover"
															/>
															<div className="flex-1 min-w-0">
																<h4 className="text-sm font-medium text-white truncate">{album.title}</h4>
																<p className="text-xs text-zinc-400 truncate">{album.artist}</p>
															</div>
															<Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20 px-2 py-0.5">
																Album
															</Badge>
														</button>
													))}
												</div>
											</div>
										)}

										{/* Artists Results */}
										{searchResults.artists.length > 0 && (
											<div className="space-y-2">
												<div className="flex items-center gap-2 text-xs text-zinc-500">
													<Music className="w-3 h-3" />
													Artists
												</div>
												<div className="space-y-1">
													{searchResults.artists.slice(0, 3).map((artist: any, index: number) => (
														<button
															key={artist._id || index}
															onClick={() => {
																navigate(`/artist/${artist._id}`);
																handleClearSearch();
															}}
															className="w-full text-left p-2 rounded-md hover:bg-zinc-700/40 transition-colors flex items-center gap-3 group"
														>
															<img
																src={artist.imageUrl || '/cover-images/1.jpg'}
																alt={artist.name}
																className="w-7 h-7 rounded-full object-cover"
															/>
															<div className="flex-1 min-w-0">
																<h4 className="text-sm font-medium text-white truncate">{artist.name}</h4>
																<p className="text-xs text-zinc-400 truncate">Artist</p>
															</div>
															<Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/20 px-2 py-0.5">
																Artist
															</Badge>
														</button>
													))}
												</div>
											</div>
										)}

										{/* Users Results */}
										{searchResults.users.length > 0 && (
											<div className="space-y-2">
												<div className="flex items-center gap-2 text-xs text-zinc-500">
													<Music className="w-3 h-3" />
													Users
												</div>
												<div className="space-y-1">
													{searchResults.users.slice(0, 3).map((user: any, index: number) => (
														<button
															key={user._id || index}
															onClick={() => {
																handleUserClick(user);
															}}
															className="w-full text-left p-2 rounded-md hover:bg-zinc-700/40 transition-colors flex items-center gap-3 group"
														>
															<img
																src={user.imageUrl || '/cover-images/1.jpg'}
																alt={user.fullName}
																className="w-7 h-7 rounded-full object-cover"
															/>
															<div className="flex-1 min-w-0">
																<h4 className="text-sm font-medium text-white truncate">{user.fullName}</h4>
																<p className="text-xs text-zinc-400 truncate">{user.handle ? `@${user.handle}` : 'User'}</p>
															</div>
															<Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-400 border-orange-500/20 px-2 py-0.5">
																User
															</Badge>
														</button>
													))}
												</div>
											</div>
										)}
									</CardContent>
									</Card>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
					
					{/* Sidebar Toggle Button */}
					<motion.div
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						<Button
							onClick={toggleBothSidebars}
							variant="ghost"
							size="icon"
							className="p-2 lg:p-3 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-all duration-300 ease-in-out"
							title="Toggle Sidebars"
						>
							<Layout className="w-8 h-8 lg:w-12 lg:h-12 text-zinc-400" />
						</Button>
					</motion.div>
				</div>
			</div>

			{/* Right side - Buttons and User */}
			<div className='flex items-center gap-1 sm:gap-2 md:gap-4'>
				{isAdmin && (
					<motion.div
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						<Link to={"/home/admin"} className={cn(buttonVariants({ variant: "outline" }), "hidden sm:flex text-xs sm:text-sm")}>
							<LayoutDashboardIcon className='size-3 sm:size-4 mr-1 sm:mr-2' />
							<span className="hidden lg:inline">Admin Dashboard</span>
							<span className="lg:hidden">Admin</span>
						</Link>
					</motion.div>
				)}

				{isArtist && (
					<motion.div
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						<Link to={"/artist-dashboard"} className={cn(buttonVariants({ variant: "outline" }), "hidden sm:flex text-xs sm:text-sm bg-purple-500/20 border-purple-500/50 text-purple-300 hover:bg-purple-500/30")}>
							<Mic className='size-3 sm:size-4 mr-1 sm:mr-2' />
							<span className="hidden lg:inline">Artist Dashboard</span>
							<span className="lg:hidden">Artist</span>
						</Link>
					</motion.div>
				)}

				{/* Notification Button */}
				<NotificationButton />

				<SignedOut>
					<SignInOAuthButtons />
				</SignedOut>

				<motion.div
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					<UserButton />
				</motion.div>
			</div>
		</motion.div>

		{/* Mobile Search Sheet */}
		<Sheet open={showMobileSearch} onOpenChange={setShowMobileSearch}>
			<SheetContent side="top" className="h-auto bg-zinc-900 border-zinc-800">
				<motion.div 
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="p-4"
				>
					<form onSubmit={handleMobileSearchSubmit} className="space-y-4">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
							<Input
								type="text"
								value={searchInput}
								onChange={handleSearchChange}
								placeholder="Search for songs, artists, albums..."
								className="pl-10 pr-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-white/20"
								autoFocus
							/>
							<AnimatePresence>
								{searchInput && (
									<motion.button 
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.8 }}
										transition={{ duration: 0.2 }}
										type="button"
										onClick={handleClearSearch}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-zinc-600 rounded-full"
									>
										<X className="w-3 h-3 text-zinc-400 hover:text-white" />
									</motion.button>
								)}
							</AnimatePresence>
						</div>
						<motion.div
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							<Button type="submit" className="w-full" disabled={!searchInput.trim()}>
								Search
							</Button>
						</motion.div>
					</form>
				</motion.div>
			</SheetContent>
		</Sheet>

		</>
	);
};
export default Topbar;
