import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
	Play, 
	Pause, 
	MoreHorizontal, 
	Edit, 
	Trash2, 
	Music, 
	Clock,
	Heart,
	Share2
} from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { usePlaylistStore } from '@/stores/usePlaylistStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PlaylistSong {
	_id: string;
	title: string;
	artist: string;
	imageUrl: string;
	audioUrl: string;
	duration: number;
	genre: string;
	albumId?: string;
	addedAt: string;
}

interface Playlist {
	_id: string;
	name: string;
	description?: string;
	imageUrl?: string;
	isPublic: boolean;
	isCollaborative: boolean;
	songCount: number;
	songs: PlaylistSong[];
	createdAt: string;
	updatedAt: string;
	userId: string;
}

interface PlaylistCardProps {
	playlist: Playlist;
	onEdit?: (playlist: Playlist) => void;
	onDelete?: (playlistId: string) => void;
	showActions?: boolean;
}

const PlaylistCard = ({ playlist, onEdit, onDelete, showActions = true }: PlaylistCardProps) => {
	const [isHovered, setIsHovered] = useState(false);
	const navigate = useNavigate();
	const { currentSong, isPlaying, playAlbum } = usePlayerStore();
	const { deletePlaylist } = usePlaylistStore();

	// Check if this playlist is currently playing
	const isCurrentPlaylist = currentSong && playlist.songs.some(song => song._id === currentSong._id);
	const isPlayingCurrent = isCurrentPlaylist && isPlaying;

	const handlePlay = () => {
		if (playlist.songs.length === 0) {
			toast.error('This playlist is empty');
			return;
		}

		if (isCurrentPlaylist && isPlaying) {
			// If we're playing this playlist, toggle pause
			// This would need to be implemented in the player store
			toast.success('Pause functionality will be implemented');
		} else {
			// Start playing the playlist
			playAlbum(playlist.songs as any);
		}
	};

	const handleEdit = () => {
		if (onEdit) {
			onEdit(playlist);
		}
	};

	const handleDelete = async () => {
		if (onDelete) {
			onDelete(playlist._id);
		} else {
			// Default delete behavior
			try {
				await deletePlaylist(playlist._id);
				toast.success('Playlist deleted successfully');
			} catch (error) {
				console.error('Error deleting playlist:', error);
			}
		}
	};

	const handleShare = () => {
		const url = `${window.location.origin}/playlist/${playlist._id}`;
		navigator.clipboard.writeText(url);
		toast.success('Playlist link copied to clipboard!');
	};

	const formatDuration = (minutes: number) => {
		if (!minutes || minutes <= 0) return "0:00";
		const mins = Math.floor(minutes);
		const secs = Math.round((minutes - mins) * 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const calculateTotalDuration = () => {
		return playlist.songs.reduce((total, song) => total + (song.duration || 0), 0);
	};

	return (
		<Card 
			className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/70 transition-all duration-200 cursor-pointer group"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={() => navigate(`/playlist/${playlist._id}`)}
		>
			<CardContent className="p-4">
				<div className="flex items-start gap-4">
					{/* Cover Image */}
					<div className="relative w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
						{playlist.imageUrl ? (
							<img 
								src={playlist.imageUrl} 
								alt={playlist.name}
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center">
								<Music className="w-8 h-8 text-zinc-500" />
							</div>
						)}
						
						{/* Play Button Overlay */}
						<div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
							isHovered ? 'opacity-100' : 'opacity-0'
						}`}>
							<Button
								size="sm"
								onClick={(e) => {
									e.stopPropagation();
									handlePlay();
								}}
								className="w-8 h-8 p-0 bg-green-500 hover:bg-green-600"
							>
								{isPlayingCurrent ? (
									<Pause className="w-4 h-4" />
								) : (
									<Play className="w-4 h-4 ml-0.5" />
								)}
							</Button>
						</div>
					</div>

					{/* Playlist Info */}
					<div className="flex-1 min-w-0">
						<div className="flex items-start justify-between gap-2">
							<div className="flex-1 min-w-0">
								<h3 className="text-white font-semibold truncate">{playlist.name}</h3>
								{playlist.description && (
									<p className="text-zinc-400 text-sm truncate mt-1">
										{playlist.description}
									</p>
								)}
								<div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
									<span>{playlist.songCount} song{playlist.songCount !== 1 ? 's' : ''}</span>
									<span>•</span>
									<span>{formatDuration(calculateTotalDuration())}</span>
									{!playlist.isPublic && (
										<>
											<span>•</span>
											<Badge variant="outline" className="text-xs">
												Private
											</Badge>
										</>
									)}
								</div>
							</div>

							{/* Actions */}
							{showActions && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											onClick={(e) => e.stopPropagation()}
											className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-white hover:bg-zinc-800"
										>
											<MoreHorizontal className="w-4 h-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="bg-zinc-900 border-zinc-800">
										<DropdownMenuItem
											onClick={(e) => {
												e.stopPropagation();
												handlePlay();
											}}
											className="text-white hover:bg-zinc-800"
										>
											<Play className="w-4 h-4 mr-2" />
											{isPlayingCurrent ? 'Pause' : 'Play'}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={(e) => {
												e.stopPropagation();
												handleEdit();
											}}
											className="text-white hover:bg-zinc-800"
										>
											<Edit className="w-4 h-4 mr-2" />
											Edit Playlist
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={(e) => {
												e.stopPropagation();
												handleShare();
											}}
											className="text-white hover:bg-zinc-800"
										>
											<Share2 className="w-4 h-4 mr-2" />
											Share Playlist
										</DropdownMenuItem>
										<DropdownMenuSeparator className="bg-zinc-700" />
										<DropdownMenuItem
											onClick={(e) => {
												e.stopPropagation();
												handleDelete();
											}}
											className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
										>
											<Trash2 className="w-4 h-4 mr-2" />
											Delete Playlist
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default PlaylistCard;

