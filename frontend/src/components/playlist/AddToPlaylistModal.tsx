import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Music, Plus, Search } from 'lucide-react';
import { usePlaylistStore } from '@/stores/usePlaylistStore';
import { toast } from 'react-hot-toast';
import CreatePlaylistModal from './CreatePlaylistModal';

interface Song {
	_id: string;
	title: string;
	artist: string;
	imageUrl?: string;
	audioUrl?: string;
	duration?: number;
	genre?: string;
	albumId?: string;
}

interface AddToPlaylistModalProps {
	isOpen: boolean;
	onClose: () => void;
	song: Song | null;
}

const AddToPlaylistModal = ({ isOpen, onClose, song }: AddToPlaylistModalProps) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
	const [isLoading, setIsLoading] = useState(false);
	const [showCreateModal, setShowCreateModal] = useState(false);
	
	const { playlists, getPlaylists, addSongToPlaylist } = usePlaylistStore();

	useEffect(() => {
		if (isOpen) {
			console.log('🔄 Opening AddToPlaylistModal, fetching playlists...');
			getPlaylists();
		}
	}, [isOpen, getPlaylists]);

	useEffect(() => {
		console.log('📋 Available playlists:', playlists.length);
		console.log('🎵 Song to add:', song);
	}, [playlists, song]);

	// Filter playlists based on search query
	const filteredPlaylists = playlists.filter(playlist =>
		playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		playlist.description?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleAddToPlaylist = async () => {
		if (!song || !selectedPlaylistId) {
			toast.error('Please select a playlist');
			return;
		}

		// Validate song has required fields
		if (!song._id || !song.title || !song.artist) {
			toast.error('Invalid song data. Please try again.');
			return;
		}

		console.log('🔄 Adding song to playlist:', { song, selectedPlaylistId });
		setIsLoading(true);

		try {
			await addSongToPlaylist(selectedPlaylistId, song);
			toast.success(`Added "${song.title}" to playlist`);
			onClose();
		} catch (error: any) {
			console.error('Error adding song to playlist:', error);
			// Show more specific error message
			const errorMessage = error.response?.data?.message || error.message || 'Failed to add song to playlist';
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		if (!isLoading) {
			setSearchQuery('');
			setSelectedPlaylistId('');
			onClose();
		}
	};

	const handleCreatePlaylist = () => {
		setShowCreateModal(true);
	};

	const handleCreatePlaylistClose = () => {
		setShowCreateModal(false);
		// Refresh playlists after creating a new one
		getPlaylists();
	};

	if (!song) return null;

	return (
		<>
			<Dialog open={isOpen} onOpenChange={handleClose}>
				<DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800">
					<DialogHeader>
						<DialogTitle className="text-white">Add to Playlist</DialogTitle>
						<DialogDescription className="text-zinc-400">
							Choose a playlist to add "{song.title}" by {song.artist}
						</DialogDescription>
					</DialogHeader>
					
					<div className="space-y-4">
						{/* Song Preview */}
						<div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
							<img 
								src={song.imageUrl || "https://via.placeholder.com/48x48/374151/FFFFFF?text=🎵"} 
								alt={song.title}
								className="w-12 h-12 rounded object-cover"
							/>
							<div className="flex-1 min-w-0">
								<p className="text-white font-medium truncate">{song.title}</p>
								<p className="text-zinc-400 text-sm truncate">{song.artist}</p>
							</div>
						</div>

						{/* Search Playlists */}
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search your playlists..."
								className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
							/>
						</div>

						{/* Create New Playlist Button */}
						<Button
							onClick={handleCreatePlaylist}
							variant="outline"
							className="w-full border-zinc-700 text-white hover:bg-zinc-800"
						>
							<Plus className="w-4 h-4 mr-2" />
							Create New Playlist
						</Button>

						{/* Playlists List */}
						<div className="space-y-2">
							<h3 className="text-white font-medium">Your Playlists</h3>
							<ScrollArea className="h-64">
								{filteredPlaylists.length === 0 ? (
									<div className="text-center py-8 text-zinc-500">
										<Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
										<p>No playlists found</p>
										<p className="text-sm">Create a new playlist to get started</p>
									</div>
								) : (
									<div className="space-y-2">
										{filteredPlaylists.map((playlist) => (
											<div
												key={playlist._id}
												onClick={() => setSelectedPlaylistId(playlist._id)}
												className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
													selectedPlaylistId === playlist._id
														? 'bg-green-500/20 border border-green-500/50'
														: 'bg-zinc-800 hover:bg-zinc-700 border border-transparent'
												}`}
											>
												<div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center flex-shrink-0">
													<Music className="w-6 h-6 text-zinc-400" />
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-white font-medium truncate">{playlist.name}</p>
													<p className="text-zinc-400 text-sm">
														{playlist.songCount} song{playlist.songCount !== 1 ? 's' : ''}
														{playlist.description && ` • ${playlist.description}`}
													</p>
												</div>
												{selectedPlaylistId === playlist._id && (
													<div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0" />
												)}
											</div>
										))}
									</div>
								)}
							</ScrollArea>
						</div>
					</div>
					
					<DialogFooter>
						<Button
							variant="outline"
							onClick={handleClose}
							disabled={isLoading}
							className="border-zinc-700 text-white hover:bg-zinc-800"
						>
							Cancel
						</Button>
						<Button
							onClick={handleAddToPlaylist}
							disabled={isLoading || !selectedPlaylistId}
							className="bg-green-500 hover:bg-green-600 text-black"
						>
							{isLoading ? 'Adding...' : 'Add to Playlist'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Create Playlist Modal */}
			<CreatePlaylistModal 
				isOpen={showCreateModal} 
				onClose={handleCreatePlaylistClose} 
			/>
		</>
	);
};

export default AddToPlaylistModal;
