import { Song } from "@/types";
import SectionGridSkeleton from "./SectionGridSkeleton";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import PlayButton from "./PlayButton";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { Play, Heart, Clock, ArrowRight, MoreHorizontal, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AddToPlaylistModal from "@/components/playlist/AddToPlaylistModal";
import { motion } from "framer-motion";
import { getImageUrl, handleImageError } from "@/lib/imageUtils";

type SectionGridProps = {
	title: string;
	songs: Song[];
	isLoading: boolean;
};

const SectionGrid = ({ songs, title, isLoading }: SectionGridProps) => {
	const navigate = useNavigate();
	const { addToFavorites, removeFromFavorites, checkFavoriteStatus } = useFavoritesStore();
	const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
	const [selectedSong, setSelectedSong] = useState<Song | null>(null);
	
	if (isLoading) return <SectionGridSkeleton />;

	const handleSongClick = (song: Song) => {
		if (song.albumId) {
			navigate(`/album/${song.albumId}`);
		}
	};

	const handleFavoriteToggle = async (song: Song) => {
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

	const handleAddToPlaylist = (song: Song) => {
		setSelectedSong(song);
		setShowAddToPlaylistModal(true);
	};

	return (
		<motion.div 
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='mb-4 sm:mb-6 md:mb-8'
		>
			<div className='flex items-center justify-between mb-2 sm:mb-3 md:mb-4'>
				<h2 className='text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white'>{title}</h2>
				<motion.div
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					<Button 
						variant='link' 
						className='text-emerald-400 hover:text-emerald-300 text-xs sm:text-sm'
						onClick={() => navigate(`/search?type=songs&showAll=true`)}
					>
						Show all <ArrowRight className="ml-1 w-3 h-3 sm:w-4 sm:h-4" />
					</Button>
				</motion.div>
			</div>

			<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4'>
				{songs.map((song, index) => (
					<motion.div
						key={song._id}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: index * 0.1 }}
						whileHover={{ y: -5 }}
					>
						<HoverCard>
							<HoverCardTrigger asChild>
								<Card 
									className='bg-zinc-800/40 border-zinc-700 hover:bg-zinc-700/40 transition-all duration-300 group cursor-pointer'
									onClick={() => handleSongClick(song)}
								>
									<CardContent className="p-2 sm:p-3 md:p-4">
										<div className='relative mb-2 sm:mb-3 md:mb-4'>
											<div className='aspect-square rounded-md shadow-lg overflow-hidden bg-zinc-900'>
												<img
													src={getImageUrl(song.imageUrl)}
													alt={song.title}
													onError={(e) => handleImageError(e)}
													className='w-full h-full object-cover transition-transform duration-300 
													group-hover:scale-110'
												/>
												<div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
													<Play className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
												</div>
											</div>
											<PlayButton song={song} />
										</div>
										<div className='space-y-1'>
											<h3 className='font-medium truncate text-xs sm:text-sm md:text-base text-white group-hover:text-emerald-400 transition-colors'>
												{song.title}
											</h3>
											<p className='text-xs sm:text-sm text-zinc-400 truncate'>{song.artist}</p>
											{song.duration && (
												<div className='flex items-center text-xs text-zinc-500'>
													<Clock className='w-3 h-3 mr-1' />
													{song.duration}
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							</HoverCardTrigger>
							<HoverCardContent className="w-72 sm:w-80 bg-zinc-800 border-zinc-700">
								<div className="flex justify-between space-x-4">
									<img
										src={getImageUrl(song.imageUrl)}
										alt={song.title}
										onError={(e) => handleImageError(e)}
										className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
									/>
									<div className="space-y-1 flex-1">
										<h4 className="text-sm font-semibold text-white">{song.title}</h4>
										<p className="text-xs text-zinc-400">{song.artist}</p>
										{song.album && (
											<p className="text-xs text-zinc-500">{song.album}</p>
										)}
										{song.duration && (
											<div className="flex items-center text-xs text-zinc-500">
												<Clock className="w-3 h-3 mr-1" />
												{song.duration}
											</div>
										)}
									</div>
								</div>
								<div className="flex items-center justify-between pt-4">
									<Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
										<Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
										Play Now
									</Button>
									<div className="flex space-x-2">
										<Button 
											size="sm" 
											variant="outline" 
											className="border-zinc-600 text-zinc-400 hover:bg-zinc-700"
											onClick={(e) => {
												e.stopPropagation();
												handleFavoriteToggle(song);
											}}
										>
											<Heart className="w-3 h-3 sm:w-4 sm:h-4" />
										</Button>
										<Button 
											size="sm" 
											variant="outline" 
											className="border-zinc-600 text-zinc-400 hover:bg-zinc-700"
											onClick={(e) => {
												e.stopPropagation();
												handleAddToPlaylist(song);
											}}
										>
											<Plus className="w-3 h-3 sm:w-4 sm:h-4" />
										</Button>
									</div>
								</div>
							</HoverCardContent>
						</HoverCard>
					</motion.div>
				))}
			</div>

			{/* Add to Playlist Modal */}
			<AddToPlaylistModal
				isOpen={showAddToPlaylistModal}
				onClose={() => setShowAddToPlaylistModal(false)}
				song={selectedSong}
			/>
		</motion.div>
	);
};

export default SectionGrid;
