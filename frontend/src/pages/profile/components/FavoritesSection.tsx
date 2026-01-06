import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, Music, Disc, User, Play, Clock } from 'lucide-react';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import { usePlayerStore } from '@/stores/usePlayerStore';

interface FavoritesSectionProps {
	userId: string;
}

const FavoritesSection = ({ userId }: FavoritesSectionProps) => {
	const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'albums' | 'artists'>('all');
	const { favorites, isLoading, getFavorites, removeFromFavorites } = useFavoritesStore();
	const { playAlbum } = usePlayerStore();

	useEffect(() => {
		getFavorites();
	}, [getFavorites]);

	const handlePlaySong = (song: any) => {
		// Find the song in favorites and play it
		const songFavorites = favorites.filter(fav => fav.type === 'song');
		const songIndex = songFavorites.findIndex(fav => fav.itemId === song.itemId);
		if (songIndex !== -1) {
			// Convert favorites to song format for player
			const songs = songFavorites.map(fav => ({
				_id: fav.itemId,
				title: fav.title,
				artist: fav.artist || '',
				imageUrl: fav.imageUrl || '',
				audioUrl: fav.metadata?.audioUrl || '',
				duration: fav.metadata?.duration || 0,
				genre: fav.metadata?.genre || '',
				albumId: fav.metadata?.albumId || null,
				createdAt: fav.addedAt,
				updatedAt: fav.addedAt
			}));
			playAlbum(songs, songIndex);
		}
	};

	const handleRemoveFavorite = async (itemId: string) => {
		await removeFromFavorites(itemId);
	};

	const formatDuration = (minutes: number) => {
		if (!minutes || minutes <= 0) return "0:00";
		const mins = Math.floor(minutes);
		const secs = Math.round((minutes - mins) * 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<Card className="bg-zinc-900/50 border-zinc-800">
			<CardHeader>
				<CardTitle className="text-white flex items-center gap-2">
					<Heart className="w-5 h-5 text-emerald-500" />
					Favorites
				</CardTitle>
				<CardDescription className="text-zinc-400">
					Your favorite songs, albums, and artists
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
					<TabsList className="grid w-full grid-cols-4 bg-zinc-800">
						<TabsTrigger value="all" className="text-xs">All</TabsTrigger>
						<TabsTrigger value="songs" className="text-xs">Songs</TabsTrigger>
						<TabsTrigger value="albums" className="text-xs">Albums</TabsTrigger>
						<TabsTrigger value="artists" className="text-xs">Artists</TabsTrigger>
					</TabsList>
					
					<TabsContent value="all" className="mt-4">
						<ScrollArea className="h-64">
							<div className="space-y-2">
								{isLoading ? (
									<div className="text-center py-8 text-zinc-400">
										<p>Loading favorites...</p>
									</div>
								) : favorites.length === 0 ? (
									<div className="text-center py-8 text-zinc-400">
										<Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
										<p>No favorites yet</p>
										<p className="text-sm">Start adding your favorite music!</p>
									</div>
								) : (
									favorites.map((favorite) => (
										<div key={favorite._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50">
											<img 
												src={favorite.imageUrl || '/placeholder-album.jpg'} 
												alt={favorite.title}
												className="w-10 h-10 rounded object-cover"
											/>
											<div className="flex-1 min-w-0">
												<p className="text-white font-medium truncate">{favorite.title}</p>
												<p className="text-zinc-400 text-sm truncate">{favorite.artist}</p>
											</div>
											<Badge variant="outline" className="text-xs">
												{favorite.type}
											</Badge>
											<Button
												onClick={() => handleRemoveFavorite(favorite.itemId)}
												variant="ghost"
												size="sm"
												className="text-zinc-400 hover:text-red-500"
											>
												<Heart className="w-4 h-4 fill-red-500 text-red-500" />
											</Button>
										</div>
									))
								)}
							</div>
						</ScrollArea>
					</TabsContent>
					
					<TabsContent value="songs" className="mt-4">
						<ScrollArea className="h-64">
							<div className="space-y-2">
								{isLoading ? (
									<div className="text-center py-8 text-zinc-400">
										<p>Loading songs...</p>
									</div>
								) : (() => {
									const songFavorites = favorites.filter(fav => fav.type === 'song');
									return songFavorites.length === 0 ? (
										<div className="text-center py-8 text-zinc-400">
											<Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
											<p>No favorite songs yet</p>
										</div>
									) : (
										songFavorites.map((favorite) => (
											<div key={favorite._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 group cursor-pointer" onClick={() => handlePlaySong(favorite)}>
												<img 
													src={favorite.imageUrl || '/placeholder-album.jpg'} 
													alt={favorite.title}
													className="w-10 h-10 rounded object-cover"
												/>
												<div className="flex-1 min-w-0">
													<p className="text-white font-medium truncate">{favorite.title}</p>
													<p className="text-zinc-400 text-sm truncate">{favorite.artist}</p>
												</div>
												{favorite.metadata?.duration && (
													<div className="flex items-center text-zinc-500 text-xs">
														<Clock className="w-3 h-3 mr-1" />
														{formatDuration(favorite.metadata.duration)}
													</div>
												)}
												<Button
													onClick={(e) => {
														e.stopPropagation();
														handleRemoveFavorite(favorite.itemId);
													}}
													variant="ghost"
													size="sm"
													className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
												>
													<Heart className="w-4 h-4 fill-red-500 text-red-500" />
												</Button>
											</div>
										))
									);
								})()}
							</div>
						</ScrollArea>
					</TabsContent>
					
					<TabsContent value="albums" className="mt-4">
						<ScrollArea className="h-64">
							<div className="space-y-2">
								{isLoading ? (
									<div className="text-center py-8 text-zinc-400">
										<p>Loading albums...</p>
									</div>
								) : (() => {
									const albumFavorites = favorites.filter(fav => fav.type === 'album');
									return albumFavorites.length === 0 ? (
										<div className="text-center py-8 text-zinc-400">
											<Disc className="w-12 h-12 mx-auto mb-4 opacity-50" />
											<p>No favorite albums yet</p>
										</div>
									) : (
										albumFavorites.map((favorite) => (
											<div key={favorite._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50">
												<img 
													src={favorite.imageUrl || '/placeholder-album.jpg'} 
													alt={favorite.title}
													className="w-10 h-10 rounded object-cover"
												/>
												<div className="flex-1 min-w-0">
													<p className="text-white font-medium truncate">{favorite.title}</p>
													<p className="text-zinc-400 text-sm truncate">{favorite.artist}</p>
												</div>
												<Button
													onClick={() => handleRemoveFavorite(favorite.itemId)}
													variant="ghost"
													size="sm"
													className="text-zinc-400 hover:text-red-500"
												>
													<Heart className="w-4 h-4 fill-red-500 text-red-500" />
												</Button>
											</div>
										))
									);
								})()}
							</div>
						</ScrollArea>
					</TabsContent>
					
					<TabsContent value="artists" className="mt-4">
						<ScrollArea className="h-64">
							<div className="space-y-2">
								{isLoading ? (
									<div className="text-center py-8 text-zinc-400">
										<p>Loading artists...</p>
									</div>
								) : (() => {
									const artistFavorites = favorites.filter(fav => fav.type === 'artist');
									return artistFavorites.length === 0 ? (
										<div className="text-center py-8 text-zinc-400">
											<User className="w-12 h-12 mx-auto mb-4 opacity-50" />
											<p>No favorite artists yet</p>
										</div>
									) : (
										artistFavorites.map((favorite) => (
											<div key={favorite._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50">
												<img 
													src={favorite.imageUrl || '/placeholder-album.jpg'} 
													alt={favorite.title}
													className="w-10 h-10 rounded object-cover"
												/>
												<div className="flex-1 min-w-0">
													<p className="text-white font-medium truncate">{favorite.title}</p>
													<p className="text-zinc-400 text-sm truncate">{favorite.artist}</p>
												</div>
												<Button
													onClick={() => handleRemoveFavorite(favorite.itemId)}
													variant="ghost"
													size="sm"
													className="text-zinc-400 hover:text-red-500"
												>
													<Heart className="w-4 h-4 fill-red-500 text-red-500" />
												</Button>
											</div>
										))
									);
								})()}
							</div>
						</ScrollArea>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
};

export default FavoritesSection;
