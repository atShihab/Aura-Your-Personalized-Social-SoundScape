import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, Music, Users, Lock, Globe } from "lucide-react";
import { axiosInstance } from "@/lib/axios";

interface Playlist {
	_id: string;
	name: string;
	description?: string;
	imageUrl?: string;
	isPublic: boolean;
	isCollaborative: boolean;
	songCount: number;
	createdAt: string;
}

interface PlaylistsSectionProps {
	userId: string;
}

const PlaylistsSection = ({ userId }: PlaylistsSectionProps) => {
	const [playlists, setPlaylists] = useState<Playlist[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchPlaylists();
	}, [userId]);

	const fetchPlaylists = async () => {
		try {
			const response = await axiosInstance.get(`/users/${userId}/playlists`);
			setPlaylists(response.data.playlists);
		} catch (error) {
			console.error("Error fetching playlists:", error);
			// No mock data - show empty state
			setPlaylists([]);
		} finally {
			setIsLoading(false);
		}
	};

	const handlePlayPlaylist = (playlistId: string) => {
		// This would integrate with the music player
		console.log("Playing playlist:", playlistId);
	};

	if (isLoading) {
		return (
			<Card className="bg-zinc-800/50 border-zinc-700">
				<CardHeader className="pb-3">
					<CardTitle className="text-white text-sm">Playlists</CardTitle>
					<CardDescription className="text-zinc-400 text-xs">
						Public playlists
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-0">
					<div className="flex items-center justify-center py-6">
						<Loader2 className="size-5 animate-spin text-emerald-500" />
					</div>
				</CardContent>
			</Card>
		);
	}

	const publicPlaylists = playlists.filter(playlist => playlist.isPublic);

	if (publicPlaylists.length === 0) {
		return (
			<Card className="bg-zinc-800/50 border-zinc-700">
				<CardHeader className="pb-3">
					<CardTitle className="text-white text-sm">Playlists</CardTitle>
					<CardDescription className="text-zinc-400 text-xs">
						Public playlists
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-0">
					<div className="text-center py-6">
						<Music className="size-10 text-zinc-500 mx-auto mb-3" />
						<p className="text-zinc-500 text-sm">No public playlists yet</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="bg-zinc-800/50 border-zinc-700">
			<CardHeader className="pb-3">
				<CardTitle className="text-white text-sm">Playlists</CardTitle>
				<CardDescription className="text-zinc-400 text-xs">
					Public playlists ({publicPlaylists.length})
				</CardDescription>
				<div className="text-xs text-zinc-500">
					Click to play
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="space-y-2">
					{publicPlaylists.map((playlist) => (
						<div key={playlist._id} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-700/50 hover:bg-zinc-700/70 transition-colors">
							<div className="relative">
								<img 
									src={playlist.imageUrl || "https://via.placeholder.com/50x50/374151/FFFFFF?text=🎵"} 
									alt={playlist.name}
									className="w-10 h-10 rounded-md object-cover"
								/>
								<Button
									size="icon"
									className="absolute -bottom-1 -right-1 size-5 bg-emerald-600 hover:bg-emerald-700"
									onClick={() => handlePlayPlaylist(playlist._id)}
								>
									<Play className="size-2.5" />
								</Button>
							</div>
							
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-1.5 mb-0.5">
									<h4 className="text-white font-medium text-sm truncate">{playlist.name}</h4>
									{playlist.isCollaborative && (
										<Badge variant="secondary" className="text-xs px-1 py-0">
											<Users className="size-2.5 mr-0.5" />
											Collab
										</Badge>
									)}
									{playlist.isPublic ? (
										<Globe className="size-2.5 text-zinc-400" />
									) : (
										<Lock className="size-2.5 text-zinc-400" />
									)}
								</div>
								{playlist.description && (
									<p className="text-zinc-400 text-xs truncate">{playlist.description}</p>
								)}
								<p className="text-zinc-500 text-xs">
									{playlist.songCount} songs
								</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
};

export default PlaylistsSection;
