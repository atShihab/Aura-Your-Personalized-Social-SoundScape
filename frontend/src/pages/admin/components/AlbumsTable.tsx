import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMusicStore } from "@/stores/useMusicStore";
import { Calendar, Music, Trash2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import EditAlbumDialog from "./EditAlbumDialog";
import { motion } from "framer-motion";

interface AlbumsTableProps {
	searchQuery?: string;
}

const AlbumsTable = ({ searchQuery = "" }: AlbumsTableProps) => {
	const { albums, deleteAlbum, fetchAlbums } = useMusicStore();

	// Filter albums based on search query
	const filteredAlbums = useMemo(() => {
		if (!searchQuery.trim()) return albums;
		
		const query = searchQuery.toLowerCase();
		return albums.filter(album => 
			album?.title?.toLowerCase().includes(query) ||
			album?.artist?.toLowerCase().includes(query) ||
			album?.genre?.toLowerCase().includes(query)
		);
	}, [albums, searchQuery]);

	useEffect(() => {
		fetchAlbums();
	}, [fetchAlbums]);

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
							<TableHead>Release Year</TableHead>
							<TableHead>Songs</TableHead>
							<TableHead className='text-right'>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredAlbums.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="text-center py-8 text-zinc-400">
									{searchQuery ? `No albums found matching "${searchQuery}"` : "No albums available"}
								</TableCell>
							</TableRow>
						) : (
							filteredAlbums.map((album, index) => (
								<motion.tr
									key={album?._id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: index * 0.05 }}
									className='hover:bg-zinc-800/50'
								>
									<TableCell>
										<img src={album?.imageUrl} alt={album?.title || 'Album'} className='w-10 h-10 rounded object-cover' />
									</TableCell>
									<TableCell className='font-medium'>{album?.title || 'Unknown Title'}</TableCell>
									<TableCell>{album?.artist || 'Unknown Artist'}</TableCell>
									<TableCell>
										<span className='inline-flex items-center gap-1 text-zinc-400'>
											<Calendar className='h-4 w-4' />
											{album?.releaseYear || 'Unknown Year'}
										</span>
									</TableCell>
									<TableCell>
										<span className='inline-flex items-center gap-1 text-zinc-400'>
											<Music className='h-4 w-4' />
											{album.songs?.length || album.songCount || 0} songs
										</span>
									</TableCell>
									<TableCell className='text-right'>
										<div className='flex gap-2 justify-end'>
											<EditAlbumDialog album={album} />
											<Button
												variant='ghost'
												size='sm'
												onClick={async () => {
													console.log("🗑️ Delete album button clicked for:", album?._id);
													try {
														if (album?._id) {
															await deleteAlbum(album._id);
														}
													} catch (error) {
														console.error("❌ Error in delete album button handler:", error);
													}
												}}
												className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
											>
												<Trash2 className='h-4 w-4' />
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
				{filteredAlbums.length === 0 ? (
					<div className="text-center py-8 text-zinc-400">
						{searchQuery ? `No albums found matching "${searchQuery}"` : "No albums available"}
					</div>
				) : (
					filteredAlbums.map((album, index) => (
						<motion.div
							key={album?._id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: index * 0.05 }}
							className="bg-zinc-800/50 rounded-lg p-3 hover:bg-zinc-700/50 transition-colors"
						>
							<div className="flex items-center gap-3">
								<img 
									src={album?.imageUrl} 
									alt={album?.title || 'Album'} 
									className='w-12 h-12 rounded object-cover flex-shrink-0' 
								/>
								<div className="flex-1 min-w-0">
									<h3 className="font-medium text-white truncate text-sm">{album?.title || 'Unknown Title'}</h3>
									<p className="text-zinc-400 text-xs truncate">{album?.artist || 'Unknown Artist'}</p>
									<div className="flex items-center gap-3 text-zinc-500 text-xs mt-1">
										<div className="flex items-center gap-1">
											<Calendar className='h-3 w-3' />
											{album?.releaseYear || 'Unknown Year'}
										</div>
										<div className="flex items-center gap-1">
											<Music className='h-3 w-3' />
											{album.songs?.length || album.songCount || 0} songs
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<EditAlbumDialog album={album} />
									<Button
										variant="ghost"
										size="sm"
										onClick={async () => {
											console.log("🗑️ Delete album button clicked for:", album?._id);
											try {
												if (album?._id) {
													await deleteAlbum(album._id);
												}
											} catch (error) {
												console.error("❌ Error in delete album button handler:", error);
											}
										}}
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
export default AlbumsTable;
