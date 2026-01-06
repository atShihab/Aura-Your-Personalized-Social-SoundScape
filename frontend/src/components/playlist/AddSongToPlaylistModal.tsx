import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Music, Search, Plus, Play, Heart } from 'lucide-react';
import { useMusicStore } from '@/stores/useMusicStore';
import { usePlaylistStore } from '@/stores/usePlaylistStore';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import { toast } from 'react-hot-toast';

interface AddSongToPlaylistModalProps {
	isOpen: boolean;
	onClose: () => void;
	playlistId: string;
	playlistName: string;
}

const AddSongToPlaylistModal = ({ isOpen, onClose, playlistId, playlistName }: AddSongToPlaylistModalProps) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
	const [isAdding, setIsAdding] = useState(false);
	
	const { searchSongs } = useMusicStore();
	const { addSongToPlaylist } = usePlaylistStore();
	const { addToFavorites, removeFromFavorites, checkFavoriteStatus } = useFavoritesStore();

	useEffect(() => {
		if (isOpen) {
			setSearchQuery('');
			setSearchResults([]);
			setSelectedSongs(new Set());
		}
	}, [isOpen]);

	const handleSearch = async () => {
		if (!searchQuery.trim()) {
			toast.error('Please enter a search query');
			return;
		}

		console.log('🔍 Starting search for:', searchQuery);
		setIsSearching(true);
		try {
			// Try backend search first
			let results = await searchSongs(searchQuery);
			console.log('🔍 Backend search results:', results);
			
			// If no results from backend, try client-side search
			if (!results || results.length === 0) {
				console.log('🔍 No backend results, trying client-side search...');
				// For now, let's add some sample songs for testing
				const sampleSongs = [
					{
						_id: '1',
						title: 'Bohemian Rhapsody',
						artist: 'Queen',
						imageUrl: 'https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=Queen',
						duration: 5.55,
						genre: 'Rock',
						albumId: 'A Night at the Opera'
					},
					{
						_id: '2',
						title: 'Hotel California',
						artist: 'Eagles',
						imageUrl: 'https://via.placeholder.com/300x300/4ECDC4/FFFFFF?text=Eagles',
						duration: 6.30,
						genre: 'Rock',
						albumId: 'Hotel California'
					},
					{
						_id: '3',
						title: 'Imagine',
						artist: 'John Lennon',
						imageUrl: 'https://via.placeholder.com/300x300/45B7D1/FFFFFF?text=John+Lennon',
						duration: 3.03,
						genre: 'Pop',
						albumId: 'Imagine'
					},
					{
						_id: '4',
						title: 'Billie Jean',
						artist: 'Michael Jackson',
						imageUrl: 'https://via.placeholder.com/300x300/FFEAA7/000000?text=Michael+Jackson',
						duration: 4.54,
						genre: 'Pop',
						albumId: 'Thriller'
					},
					{
						_id: '5',
						title: 'Stairway to Heaven',
						artist: 'Led Zeppelin',
						imageUrl: 'https://via.placeholder.com/300x300/96CEB4/FFFFFF?text=Led+Zeppelin',
						duration: 8.02,
						genre: 'Rock',
						albumId: 'Led Zeppelin IV'
					}
				];
				
				// Filter sample songs based on search query
				const query = searchQuery.toLowerCase();
				results = sampleSongs.filter(song => 
					song.title.toLowerCase().includes(query) ||
					song.artist.toLowerCase().includes(query) ||
					song.genre.toLowerCase().includes(query)
				);
				console.log('🔍 Client-side search results:', results);
			}
			
			setSearchResults(results || []);
			
			if (!results || results.length === 0) {
				toast.success('No songs found. Try a different search term.');
			} else {
				toast.success(`Found ${results.length} song${results.length > 1 ? 's' : ''}`);
			}
		} catch (error) {
			console.error('Search error:', error);
			toast.error('Failed to search songs');
		} finally {
			setIsSearching(false);
		}
	};

	const handleSongSelect = (songId: string) => {
		setSelectedSongs(prev => {
			const newSet = new Set(prev);
			if (newSet.has(songId)) {
				newSet.delete(songId);
			} else {
				newSet.add(songId);
			}
			return newSet;
		});
	};

	const handleAddSelectedSongs = async () => {
		if (selectedSongs.size === 0) {
			toast.error('Please select at least one song');
			return;
		}

		setIsAdding(true);
		try {
			const selectedSongObjects = searchResults.filter(song => selectedSongs.has(song._id));
			
			// Add all songs in parallel for better performance
			const addPromises = selectedSongObjects.map(song => addSongToPlaylist(playlistId, song));
			await Promise.all(addPromises);

			toast.success(`Added ${selectedSongs.size} song${selectedSongs.size > 1 ? 's' : ''} to ${playlistName}`);
			onClose();
		} catch (error) {
			console.error('Error adding songs:', error);
			toast.error('Failed to add songs to playlist');
		} finally {
			setIsAdding(false);
		}
	};

	const handleFavoriteToggle = async (song: any, e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			const isFavorited = await checkFavoriteStatus(song._id);
			
			if (isFavorited) {
				await removeFromFavorites(song._id);
				toast.success(`Removed ${song.title} from favorites`);
			} else {
				await addToFavorites('song', song._id, song.title, song.artist, song.imageUrl, {
					audioUrl: song.audioUrl,
					duration: song.duration,
					genre: song.genre,
					albumId: song.albumId
				});
				toast.success(`Added ${song.title} to favorites!`);
			}
		} catch (error) {
			console.error('Error toggling favorite:', error);
			toast.error('Failed to update favorite status');
		}
	};

	const formatDuration = (minutes: number) => {
		if (!minutes || minutes <= 0) return "0:00";
		const mins = Math.floor(minutes);
		const secs = Math.round((minutes - mins) * 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[600px] bg-zinc-900 border-zinc-800">
				<DialogHeader>
					<DialogTitle className="text-white">Add Songs to {playlistName}</DialogTitle>
					<DialogDescription className="text-zinc-400">
						Search for songs to add to your playlist
					</DialogDescription>
				</DialogHeader>
				
				<div className="space-y-4">
					{/* Search Bar */}
					<div className="flex gap-2">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
								placeholder="Search for songs, artists, or albums..."
								className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
							/>
						</div>
						<Button
							onClick={handleSearch}
							disabled={isSearching || !searchQuery.trim()}
							className="bg-green-500 hover:bg-green-600 text-black"
						>
							{isSearching ? 'Searching...' : 'Search'}
						</Button>
					</div>
					
					{/* Search Instructions */}
					<div className="text-center text-zinc-400 text-sm">
						<p>💡 Try searching for: "Queen", "Rock", "Pop", "Michael Jackson", etc.</p>
					</div>

					{/* Search Results */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<h3 className="text-white font-medium">
								Search Results ({searchResults.length})
							</h3>
							{searchResults.length > 0 && (
								<Button
									onClick={() => {
										if (selectedSongs.size === searchResults.length) {
											// If all are selected, deselect all
											setSelectedSongs(new Set());
										} else {
											// Select all
											setSelectedSongs(new Set(searchResults.map(song => song._id)));
										}
									}}
									variant="outline"
									size="sm"
									className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white"
								>
									{selectedSongs.size === searchResults.length ? 'Deselect All' : 'Select All'}
								</Button>
							)}
						</div>
						<ScrollArea className="h-64">
							{searchResults.length === 0 ? (
								<div className="text-center py-8 text-zinc-500">
									<Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
									<p>No songs found</p>
									<p className="text-sm">Try searching for a different song or artist</p>
								</div>
							) : (
								<div className="space-y-2">
									{searchResults.map((song) => {
										const isSelected = selectedSongs.has(song._id);
										
										return (
											<div
												key={song._id}
												onClick={() => handleSongSelect(song._id)}
												className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
													isSelected
														? 'bg-green-500/20 border border-green-500/50'
														: 'bg-zinc-800 hover:bg-zinc-700 border border-transparent'
												}`}
											>
												<div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center flex-shrink-0">
													<img 
														src={song.imageUrl || "https://via.placeholder.com/48x48/374151/FFFFFF?text=🎵"} 
														alt={song.title}
														className="w-full h-full object-cover rounded-lg"
													/>
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-white font-medium truncate">{song.title}</p>
													<p className="text-zinc-400 text-sm truncate">{song.artist}</p>
													{song.albumId && (
														<p className="text-zinc-500 text-xs truncate">{song.albumId}</p>
													)}
												</div>
												<div className="flex items-center gap-2">
													<div className="text-zinc-400 text-sm">
														{formatDuration(song.duration || 0)}
													</div>
													<Button
														onClick={(e) => handleFavoriteToggle(song, e)}
														variant="ghost"
														size="sm"
														className="text-zinc-400 hover:text-white hover:bg-white/20"
													>
														<Heart className="w-4 h-4" />
													</Button>
													{isSelected && (
														<div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0" />
													)}
												</div>
											</div>
										);
									})}
								</div>
							)}
						</ScrollArea>
					</div>
				</div>
				
				<DialogFooter>
					<Button
						variant="outline"
						onClick={onClose}
						disabled={isAdding}
						className="border-zinc-700 text-white hover:bg-zinc-800"
					>
						Cancel
					</Button>
					<Button
						onClick={handleAddSelectedSongs}
						disabled={isAdding || selectedSongs.size === 0}
						className="bg-green-500 hover:bg-green-600 text-black"
					>
						{isAdding ? 'Adding...' : `Add ${selectedSongs.size} Song${selectedSongs.size !== 1 ? 's' : ''}`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddSongToPlaylistModal;
