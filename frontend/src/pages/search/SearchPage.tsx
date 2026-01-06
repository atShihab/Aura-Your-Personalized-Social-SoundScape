import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import SearchSuggestions from "@/components/SearchSuggestions";
import { useSearch } from "@/hooks/useSearch";
import { useChatStore } from "@/stores/useChatStore";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { setChatStoreUsers } from "@/lib/searchService";
import { 
	Search, 
	X, 
	Play, 
	Heart, 
	MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl, handleImageError } from "@/lib/imageUtils";

const SearchPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const query = searchParams.get('q') || '';
	const showAll = searchParams.get('showAll') === 'true';
	const { users } = useChatStore();
	const { addToFavorites, removeFromFavorites, checkFavoriteStatus } = useFavoritesStore();
	const { playAlbum } = usePlayerStore();
	const { fetchSongs, songs, isLoading: songsLoading } = useMusicStore();
	const [allSongs, setAllSongs] = useState<any[]>([]);
	const [isLoadingAllSongs, setIsLoadingAllSongs] = useState(false);
	
	const {
		query: searchQuery,
		setQuery,
		searchResults,
		suggestions,
		isSearching,
		isLoadingSuggestions,
		showSuggestions,
		setShowSuggestions,
		performSearch,
		performRealtimeSearch,
		handleSuggestionClick,
		clearSearch,
		clearRecentSearches
	} = useSearch();

	// Update chat store users in search service for fallback
	useEffect(() => {
		setChatStoreUsers(users);
	}, [users]);

	const searchInputRef = useRef<HTMLInputElement>(null);

	// Function to handle album play
	const handlePlayAlbum = (album: any) => {
		if (album.songs && album.songs.length > 0) {
			playAlbum(album.songs);
		}
	};

	// Fetch all songs when showAll is true
	useEffect(() => {
		if (showAll) {
			setIsLoadingAllSongs(true);
			fetchSongs().then(() => {
				setIsLoadingAllSongs(false);
			}).catch((error) => {
				console.error('Error fetching all songs:', error);
				setIsLoadingAllSongs(false);
			});
		}
	}, [showAll, fetchSongs]);

	// Update allSongs when songs change
	useEffect(() => {
		if (showAll && songs.length > 0) {
			setAllSongs(songs);
		}
	}, [showAll, songs]);

	// Update search input when query changes
	useEffect(() => {
		if (query && query !== searchQuery && !showAll) {
			setQuery(query);
			performSearch(query);
		}
	}, [query, searchQuery, performSearch, showAll]);

	// Focus search input on mount
	useEffect(() => {
		if (searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, []);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setQuery(value);
		setShowSuggestions(value.length > 0);
		
		// Update URL and perform real-time search
		if (value.trim()) {
			setSearchParams({ q: value.trim() });
			performRealtimeSearch(value.trim());
		} else {
			setShowSuggestions(false);
			// Clear search params but stay on search page
			setSearchParams({});
		}
	};

	const handleClearSearch = () => {
		setQuery('');
		setShowSuggestions(false);
		setSearchParams({});
	};

	const handleFilterChange = (filter: string) => {
		// Simplified filter handling
		console.log('Filter changed to:', filter);
	};

	const handleSortChange = (sort: string) => {
		// Simplified sort handling
		console.log('Sort changed to:', sort);
	};

	const handleFavoriteToggle = async (song: any) => {
		try {
			const isFavorited = await checkFavoriteStatus(song._id);
			
			if (isFavorited) {
				await removeFromFavorites(song._id);
			} else {
				await addToFavorites('song', song._id, song.title, song.artist, song.imageUrl, {
					audioUrl: song.audioUrl,
					duration: song.duration,
					genre: song.genre,
					albumId: song.albumId
				});
			}
		} catch (error) {
			console.error('Error toggling favorite:', error);
		}
	};

	// Utility functions
	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const formatNumber = (num: number) => {
		if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
		if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
		return num.toString();
	};

	// Skeleton components
	const SongSkeleton = () => (
		<div className="flex items-center gap-3 p-3 rounded-lg">
			<Skeleton className="w-10 h-10 rounded" />
			<div className="flex-1 space-y-2">
				<Skeleton className="h-4 w-3/4" />
				<Skeleton className="h-3 w-1/2" />
			</div>
			<Skeleton className="w-8 h-8 rounded-full" />
		</div>
	);

	const AlbumSkeleton = () => (
		<div className="space-y-3">
			<Skeleton className="w-full aspect-square rounded-md" />
			<Skeleton className="h-4 w-3/4" />
			<Skeleton className="h-3 w-1/2" />
		</div>
	);

	if (!query) {
		return (
			<TooltipProvider>
				<main className="rounded-md overflow-hidden h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
					{/* Compact Search Header */}
					<motion.div 
						initial={{ y: -20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.3 }}
						className="sticky top-0 bg-zinc-900/95 backdrop-blur-md z-10 border-b border-zinc-800"
					>
						<div className="p-3 sm:p-4">
							<div className="relative max-w-sm sm:max-w-lg mx-auto">
								<motion.div 
									className="relative bg-zinc-800 rounded-full border border-zinc-700 transition-all duration-300 ease-in-out focus-within:bg-zinc-700 focus-within:border-white/50 focus-within:ring-2 focus-within:ring-white/20"
									whileHover={{ scale: 1.02 }}
									transition={{ duration: 0.2 }}
								>
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400 transition-colors duration-200" />
									<Input
										ref={searchInputRef}
										type="text"
										value={searchQuery}
										onChange={handleSearchChange}
										placeholder="Search for songs, artists, albums..."
										className="pl-10 pr-10 bg-transparent border-0 text-white placeholder:text-zinc-400 focus:ring-0 focus:border-0 transition-all duration-200 text-sm sm:text-base"
										onFocus={() => setShowSuggestions(searchQuery.length > 0)}
									/>
									<AnimatePresence>
										{searchQuery && (
											<motion.button 
												initial={{ opacity: 0, scale: 0.8 }}
												animate={{ opacity: 1, scale: 1 }}
												exit={{ opacity: 0, scale: 0.8 }}
												transition={{ duration: 0.2 }}
												onClick={handleClearSearch}
												className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-zinc-600 rounded-full transition-all duration-200 hover:scale-110"
											>
												<X className="w-3 h-3 text-zinc-400 hover:text-white transition-colors duration-200" />
											</motion.button>
										)}
									</AnimatePresence>
								</motion.div>
							</div>

							{/* Search Suggestions */}
							<AnimatePresence>
								{showSuggestions && (
									<motion.div 
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										transition={{ duration: 0.2 }}
										className="mt-3 sm:mt-4 max-w-sm sm:max-w-lg mx-auto"
									>
										<SearchSuggestions
											suggestions={suggestions}
											isLoading={isLoadingSuggestions}
											onSuggestionClick={handleSuggestionClick}
											onClearRecent={clearRecentSearches}
											showClearButton={true}
										/>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</motion.div>

					{/* Empty State */}
					<motion.div 
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="flex items-center justify-center h-full px-3 sm:px-4"
					>
						<div className="text-center">
							<Search className="w-12 h-12 sm:w-16 sm:h-16 text-zinc-400 mx-auto mb-3 sm:mb-4" />
							<h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Search for music</h2>
							<p className="text-zinc-400 mb-4 sm:mb-6 text-sm sm:text-base">Find your favorite songs, artists, and albums</p>
							
							{/* Quick Search Categories */}
							<div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-xs sm:max-w-md mx-auto">
								{['Pop', 'Rock', 'Hip-Hop', 'Electronic'].map((category, index) => (
									<motion.div
										key={category}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
									>
										<Button
											variant="outline"
											onClick={() => handleSuggestionClick({ id: category, text: category, type: 'suggestion' })}
											className="bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-700 text-xs sm:text-sm"
										>
											{category}
										</Button>
									</motion.div>
								))}
							</div>
						</div>
					</motion.div>
				</main>
			</TooltipProvider>
		);
	}

	return (
		<TooltipProvider>
			<main className="rounded-md overflow-hidden h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
				{/* Compact Search Header */}
				<motion.div 
					initial={{ y: -20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.3 }}
					className="sticky top-0 bg-zinc-900/95 backdrop-blur-md z-10 border-b border-zinc-800"
				>
					<div className="p-3 sm:p-4">
						<div className="relative max-w-sm sm:max-w-lg mx-auto">
							<motion.div 
								className="relative bg-zinc-800 rounded-full border border-zinc-700 transition-all duration-300 ease-in-out focus-within:bg-zinc-700 focus-within:border-white/50 focus-within:ring-2 focus-within:ring-white/20"
								whileHover={{ scale: 1.02 }}
								transition={{ duration: 0.2 }}
							>
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400 transition-colors duration-200" />
								<Input
									ref={searchInputRef}
									type="text"
									value={searchQuery}
									onChange={handleSearchChange}
									placeholder="Search for songs, artists, albums..."
									className="pl-10 pr-10 bg-transparent border-0 text-white placeholder:text-zinc-400 focus:ring-0 focus:border-0 transition-all duration-200 text-sm sm:text-base"
									onFocus={() => setShowSuggestions(searchQuery.length > 0)}
								/>
								<AnimatePresence>
									{searchQuery && (
										<motion.button 
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.8 }}
											transition={{ duration: 0.2 }}
											onClick={handleClearSearch}
											className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-zinc-600 rounded-full transition-all duration-200 hover:scale-110"
										>
											<X className="w-3 h-3 text-zinc-400 hover:text-white transition-colors duration-200" />
										</motion.button>
									)}
								</AnimatePresence>
							</motion.div>
						</div>

						{/* Search Suggestions */}
						<AnimatePresence>
							{showSuggestions && (
								<motion.div 
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.2 }}
									className="mt-3 sm:mt-4 max-w-sm sm:max-w-lg mx-auto"
								>
									<SearchSuggestions
										suggestions={suggestions}
										isLoading={isLoadingSuggestions}
										onSuggestionClick={handleSuggestionClick}
										onClearRecent={clearRecentSearches}
										showClearButton={true}
									/>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</motion.div>

				{/* Compact Search Results */}
				<ScrollArea className="h-[calc(100vh-180px)]">
					<motion.div 
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="p-3 sm:p-4 max-w-4xl mx-auto space-y-4 sm:space-y-6"
					>
						{/* Show All Songs Section */}
						{showAll && (
							<motion.div 
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3 }}
								className="space-y-3 sm:space-y-4"
							>
								<h2 className="text-lg sm:text-xl font-bold text-white">All Songs</h2>
								{isLoadingAllSongs ? (
									<div className="space-y-2">
										{[1, 2, 3, 4, 5].map((i) => (
											<SongSkeleton key={i} />
										))}
									</div>
								) : allSongs.length > 0 ? (
									<div className="space-y-1 sm:space-y-2">
										{allSongs.map((song: any, index: number) => (
											<motion.div
												key={song._id || index}
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ duration: 0.3, delay: index * 0.05 }}
												className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-zinc-800/50 cursor-pointer group"
												onClick={() => {
													if (song.albumId) {
														navigate(`/album/${song.albumId}`);
													}
												}}
											>
												<img
													src={getImageUrl(song.imageUrl)}
													alt={song.title}
													onError={(e) => handleImageError(e)}
													className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0"
												/>
												<div className="flex-1 min-w-0">
													<h3 className="font-medium text-white truncate text-sm sm:text-base">{song.title}</h3>
													<p className="text-xs sm:text-sm text-zinc-400 truncate">{song.artist}</p>
												</div>
												<div className="flex items-center gap-1 sm:gap-2">
													<Tooltip>
														<TooltipTrigger asChild>
															<button 
																className="p-1 sm:p-2 hover:bg-zinc-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
																onClick={(e) => {
																	e.stopPropagation();
																	handleFavoriteToggle(song);
																}}
															>
																<Heart className="w-4 h-4 text-zinc-400 hover:text-red-500" />
															</button>
														</TooltipTrigger>
														<TooltipContent>Add to favorites</TooltipContent>
													</Tooltip>
													<button 
														className="p-1 sm:p-2 hover:bg-zinc-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
														onClick={(e) => {
															e.stopPropagation();
															playAlbum([song], 0);
														}}
													>
														<Play className="w-4 h-4 text-white" />
													</button>
												</div>
											</motion.div>
										))}
									</div>
								) : (
									<div className="text-center py-8 text-zinc-400">
										<p>No songs found</p>
									</div>
								)}
							</motion.div>
						)}

						{/* Loading State */}
						{isSearching && !showAll && (
							<div className="space-y-4">
								<h2 className="text-xl font-bold text-white">Searching...</h2>
								<div className="space-y-2">
									{[1, 2, 3].map((i) => (
										<SongSkeleton key={i} />
									))}
								</div>
							</div>
						)}

						{/* Songs Section */}
						{!isSearching && !showAll && searchResults.songs.length > 0 && (
							<motion.div 
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3 }}
								className="space-y-3 sm:space-y-4"
							>
								<h2 className="text-lg sm:text-xl font-bold text-white">Songs</h2>
								<div className="space-y-1 sm:space-y-2">
									{searchResults.songs.slice(0, 5).map((song: any, index: number) => (
										<motion.div
											key={song._id || index}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ duration: 0.3, delay: index * 0.1 }}
											className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-zinc-800/50 cursor-pointer group"
											onClick={() => {
												if (song.albumId) {
													navigate(`/album/${song.albumId}`);
												}
											}}
										>
											<img
												src={getImageUrl(song.imageUrl)}
												alt={song.title}
												onError={(e) => handleImageError(e)}
												className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0"
											/>
											<div className="flex-1 min-w-0">
												<h3 className="font-medium text-white truncate text-sm sm:text-base">{song.title}</h3>
												<p className="text-xs sm:text-sm text-zinc-400 truncate">{song.artist}</p>
											</div>
											<div className="flex items-center gap-1 sm:gap-2">
												<Tooltip>
													<TooltipTrigger asChild>
														<button 
															className="p-1 sm:p-2 hover:bg-zinc-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
															onClick={(e) => {
																e.stopPropagation();
																handleFavoriteToggle(song);
															}}
														>
															<Heart className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
														</button>
													</TooltipTrigger>
													<TooltipContent>
														<p>Add to favorites</p>
													</TooltipContent>
												</Tooltip>
												<Tooltip>
													<TooltipTrigger asChild>
														<button 
															className="p-1 sm:p-2 hover:bg-zinc-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
															onClick={(e) => {
																e.stopPropagation();
																// Add play functionality here
															}}
														>
															<Play className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
														</button>
													</TooltipTrigger>
													<TooltipContent>
														<p>Play song</p>
													</TooltipContent>
												</Tooltip>
												<span className="text-xs sm:text-sm text-zinc-400">
													{formatDuration(song.duration || 346)}
												</span>
											</div>
										</motion.div>
									))}
								</div>
							</motion.div>
						)}

						{/* Albums Section */}
						{!isSearching && searchResults.albums.length > 0 && (
							<motion.div 
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: 0.1 }}
								className="space-y-3 sm:space-y-4"
							>
								<h2 className="text-lg sm:text-xl font-bold text-white">Albums</h2>
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
									{searchResults.albums.slice(0, 8).map((album: any, index: number) => (
										<motion.div
											key={album._id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.3, delay: index * 0.1 }}
											whileHover={{ y: -5 }}
										>
											<Card className="bg-zinc-800/40 border-zinc-700 hover:bg-zinc-700/40 transition-all group cursor-pointer">
												<CardContent className="p-2 sm:p-3">
													<div className="relative mb-2 sm:mb-3">
														<div className="aspect-square rounded-md shadow-lg overflow-hidden">
															<img
																src={getImageUrl(album.imageUrl)}
																alt={album.title}
																onError={(e) => handleImageError(e)}
																className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
															/>
														</div>
														<Tooltip>
															<TooltipTrigger asChild>
																<button className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-green-500 hover:bg-green-400 p-1 sm:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
																	<Play className="w-3 h-3 sm:w-4 sm:h-4 text-black fill-black" />
																</button>
															</TooltipTrigger>
															<TooltipContent>
																<p>Play album</p>
															</TooltipContent>
														</Tooltip>
													</div>
													<h3 className="font-medium mb-1 truncate text-xs sm:text-sm">{album.title}</h3>
													<p className="text-xs text-zinc-400 truncate">{album.artist}</p>
												</CardContent>
											</Card>
										</motion.div>
									))}
								</div>
							</motion.div>
						)}

						{/* No Results */}
						{!isSearching && Object.values(searchResults).every((arr: any[]) => arr.length === 0) && (
							<motion.div 
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3 }}
								className="text-center py-8 sm:py-12 px-3 sm:px-4"
							>
								<Search className="w-12 h-12 sm:w-16 sm:h-16 text-zinc-400 mx-auto mb-3 sm:mb-4" />
								<h3 className="text-lg sm:text-xl font-bold text-white mb-2">No results found for "{query}"</h3>
								<p className="text-zinc-400 mb-4 sm:mb-6 text-sm sm:text-base">Try searching for something else</p>
								
								{/* Suggested Searches */}
								<div className="max-w-sm sm:max-w-md mx-auto">
									<h4 className="text-xs sm:text-sm font-medium text-zinc-300 mb-2 sm:mb-3">Try these searches:</h4>
									<div className="flex flex-wrap gap-2 justify-center">
										{suggestions.slice(0, 4).map((suggestion, index) => (
											<motion.div
												key={suggestion.id}
												initial={{ opacity: 0, scale: 0.8 }}
												animate={{ opacity: 1, scale: 1 }}
												transition={{ duration: 0.3, delay: index * 0.1 }}
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
											>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleSuggestionClick(suggestion)}
													className="bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-700 text-xs sm:text-sm"
												>
													{suggestion.text}
												</Button>
											</motion.div>
										))}
									</div>
								</div>
							</motion.div>
						)}
					</motion.div>
				</ScrollArea>
			</main>
		</TooltipProvider>
	);
};

export default SearchPage;
