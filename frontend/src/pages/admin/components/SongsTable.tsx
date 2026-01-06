import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMusicStore } from "@/stores/useMusicStore";
import { Calendar, Trash2 } from "lucide-react";
import { useMemo } from "react";
import EditSongDialog from "./EditSongDialog";
import { motion } from "framer-motion";

interface SongsTableProps {
	searchQuery?: string;
}

const SongsTable = ({ searchQuery = "" }: SongsTableProps) => {
	const { songs, isLoading, error, deleteSong } = useMusicStore();

	// Filter songs based on search query
	const filteredSongs = useMemo(() => {
		if (!searchQuery.trim()) return songs;
		
		const query = searchQuery.toLowerCase();
		return songs.filter(song => 
			song.title.toLowerCase().includes(query) ||
			song.artist.toLowerCase().includes(query) ||
			song.genre.toLowerCase().includes(query) ||
			(song.featuredArtist && song.featuredArtist.toLowerCase().includes(query))
		);
	}, [songs, searchQuery]);

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='text-zinc-400'>Loading songs...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='text-red-400'>{error}</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Desktop Table View */}
			<div className="hidden md:block">
				<Table>
					<TableHeader>
						<TableRow className='hover:bg-zinc-800/50'>
							<TableHead className='w-[50px]'></TableHead>
							<TableHead>Title</TableHead>
							<TableHead>Artist</TableHead>
							<TableHead>Release Date</TableHead>
							<TableHead className='text-right'>Actions</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{filteredSongs.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="text-center py-8 text-zinc-400">
									{searchQuery ? `No songs found matching "${searchQuery}"` : "No songs available"}
								</TableCell>
							</TableRow>
						) : (
							filteredSongs.map((song, index) => (
								<motion.tr
									key={song._id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: index * 0.05 }}
									className='hover:bg-zinc-800/50'
								>
									<TableCell>
										<img src={song.imageUrl} alt={song.title} className='size-10 rounded object-cover' />
									</TableCell>
									<TableCell className='font-medium'>{song.title}</TableCell>
									<TableCell>{song.artist}</TableCell>
									<TableCell>
										<span className='inline-flex items-center gap-1 text-zinc-400'>
											<Calendar className='h-4 w-4' />
											{song.releaseDate ? new Date(song.releaseDate).toISOString().split("T")[0] : song.createdAt.split("T")[0]}
										</span>
									</TableCell>

									<TableCell className='text-right'>
										<div className='flex gap-2 justify-end'>
											<EditSongDialog song={song} />
											<Button
												variant={"ghost"}
												size={"sm"}
												className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
												onClick={() => deleteSong(song._id)}
											>
												<Trash2 className='size-4' />
											</Button>
										</div>
									</TableCell>
								</motion.tr>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Mobile Card View */}
			<div className="md:hidden space-y-3">
				{filteredSongs.length === 0 ? (
					<div className="text-center py-8 text-zinc-400">
						{searchQuery ? `No songs found matching "${searchQuery}"` : "No songs available"}
					</div>
				) : (
					filteredSongs.map((song, index) => (
						<motion.div
							key={song._id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: index * 0.05 }}
							className="bg-zinc-800/50 rounded-lg p-3 hover:bg-zinc-700/50 transition-colors"
						>
							<div className="flex items-center gap-3">
								<img 
									src={song.imageUrl} 
									alt={song.title} 
									className='w-12 h-12 rounded object-cover flex-shrink-0' 
								/>
								<div className="flex-1 min-w-0">
									<h3 className="font-medium text-white truncate text-sm">{song.title}</h3>
									<p className="text-zinc-400 text-xs truncate">{song.artist}</p>
									<div className="flex items-center gap-1 text-zinc-500 text-xs mt-1">
										<Calendar className='h-3 w-3' />
										{song.releaseDate ? new Date(song.releaseDate).toISOString().split("T")[0] : song.createdAt.split("T")[0]}
									</div>
								</div>
								<div className="flex items-center gap-2">
									<EditSongDialog song={song} />
									<Button
										variant="ghost"
										size="sm"
										onClick={() => deleteSong(song._id)}
										className="text-red-400 hover:text-red-300 hover:bg-red-400/10 touch-button"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</motion.div>
					))
				)}
			</div>
		</div>
	);
};
export default SongsTable;
