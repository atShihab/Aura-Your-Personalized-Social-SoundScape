import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
	Music, 
	Album, 
	Upload, 
	Edit, 
	Trash2, 
	Plus, 
	BarChart3, 
	Clock, 
	Play,
	Mic,
	TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import MobileNav from "@/components/MobileNav";
import { Link } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import SongRequestDialog from "./components/SongRequestDialog";
import AlbumRequestDialog from "./components/AlbumRequestDialog";

interface SongAnalytics {
	_id: string;
	title: string;
	artist: string;
	playCount: number;
	totalPlayTime: number;
	imageUrl: string;
}

interface Request {
	_id: string;
	type: 'song_upload' | 'song_edit' | 'song_delete' | 'album_create' | 'album_edit' | 'album_delete';
	status: 'pending' | 'approved' | 'rejected';
	title: string;
	description: string;
	createdAt: string;
}

const ArtistDashboardPage = () => {
	const { isArtist, isLoading, checkAdminStatus, checkArtistStatus } = useAuthStore();
	const [analytics, setAnalytics] = useState<SongAnalytics[]>([]);
	const [requests, setRequests] = useState<Request[]>([]);
	const [isLoadingData, setIsLoadingData] = useState(true);

	useEffect(() => {
		checkAdminStatus();
		checkArtistStatus();
		// TODO: Fetch artist analytics and requests
		setTimeout(() => {
			setIsLoadingData(false);
			// Mock data for now
			setAnalytics([
				{
					_id: "1",
					title: "My Song 1",
					artist: "Artist",
					playCount: 1250,
					totalPlayTime: 12500, // in seconds
					imageUrl: "/placeholder-album.jpg"
				},
				{
					_id: "2", 
					title: "My Song 2",
					artist: "Artist",
					playCount: 890,
					totalPlayTime: 8900,
					imageUrl: "/placeholder-album.jpg"
				}
			]);
			setRequests([
				{
					_id: "1",
					type: "song_upload",
					status: "pending",
					title: "New Song Upload",
					description: "Request to upload new song 'Summer Vibes'",
					createdAt: "2024-01-15T10:30:00Z"
				},
				{
					_id: "2",
					type: "album_create",
					status: "approved",
					title: "Album Creation",
					description: "Request to create album 'My First Album'",
					createdAt: "2024-01-14T15:20:00Z"
				}
			]);
		}, 1000);
	}, [checkAdminStatus, checkArtistStatus]);

	if (!isArtist && !isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-zinc-100 flex items-center justify-center">
				<div className="text-center">
					<Mic className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
					<h1 className="text-2xl font-bold mb-2">Artist Access Required</h1>
					<p className="text-zinc-400 mb-4">You need to be an approved artist to access this dashboard.</p>
					<Link to="/">
						<Button>Go Home</Button>
					</Link>
				</div>
			</div>
		);
	}

	const formatTime = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		return `${hours}h ${minutes}m`;
	};

	const getRequestTypeIcon = (type: string) => {
		switch (type) {
			case 'song_upload': return <Upload className="h-4 w-4" />;
			case 'song_edit': return <Edit className="h-4 w-4" />;
			case 'song_delete': return <Trash2 className="h-4 w-4" />;
			case 'album_create': return <Plus className="h-4 w-4" />;
			case 'album_edit': return <Edit className="h-4 w-4" />;
			case 'album_delete': return <Trash2 className="h-4 w-4" />;
			default: return <Music className="h-4 w-4" />;
		}
	};


	const getStatusColor = (status: string) => {
		switch (status) {
			case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
			case 'approved': return 'bg-green-500/20 text-green-300 border-green-500/50';
			case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/50';
			default: return 'bg-zinc-500/20 text-zinc-300 border-zinc-500/50';
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-zinc-100'>
			{/* Mobile Header */}
			<div className="md:hidden sticky top-0 z-50 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800">
				<div className="flex items-center justify-between p-3 sm:p-4">
					<div className="flex items-center gap-3">
						<MobileNav />
						<h1 className="text-lg sm:text-xl font-bold text-white">Artist Dashboard</h1>
					</div>
					<UserButton />
				</div>
			</div>

			<ScrollArea className='h-[calc(100vh-6rem)] md:h-[calc(100vh-6rem)]'>
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className='p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 pb-6 sm:pb-8'
				>
					{/* Desktop Header */}
					<div className="hidden md:block">
						<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
							<div className='flex items-center gap-3'>
								<Link to='/' className='rounded-lg'>
									<img 
										src='/aura.svg' 
										className='size-8 sm:size-10' 
										alt='AURA MUSIC logo'
										onError={(e) => {
											console.warn('Aura logo not found');
										}}
									/>
								</Link>
								<div>
									<h1 className='text-xl sm:text-2xl md:text-3xl font-bold'>Artist Dashboard</h1>
									<p className='text-zinc-400 mt-1 text-sm sm:text-base'>Manage your music and track analytics</p>
								</div>
							</div>
							<div className='flex items-center gap-3'>
								<Link to="/admin">
									<Button variant="outline" className="bg-blue-500/20 border-blue-500/50 text-blue-300 hover:bg-blue-500/30">
										Admin Dashboard
									</Button>
								</Link>
								<UserButton />
							</div>
						</div>
					</div>

					{/* Quick Stats */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						<Card className="bg-zinc-800/50 border-zinc-700">
							<CardContent className="p-4">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-purple-500/20 rounded-lg">
										<Music className="h-5 w-5 text-purple-400" />
									</div>
									<div>
										<p className="text-2xl font-bold">{analytics.length}</p>
										<p className="text-sm text-zinc-400">Total Songs</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="bg-zinc-800/50 border-zinc-700">
							<CardContent className="p-4">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-green-500/20 rounded-lg">
										<Play className="h-5 w-5 text-green-400" />
									</div>
									<div>
										<p className="text-2xl font-bold">
											{analytics.reduce((sum, song) => sum + song.playCount, 0).toLocaleString()}
										</p>
										<p className="text-sm text-zinc-400">Total Plays</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="bg-zinc-800/50 border-zinc-700">
							<CardContent className="p-4">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-blue-500/20 rounded-lg">
										<Clock className="h-5 w-5 text-blue-400" />
									</div>
									<div>
										<p className="text-2xl font-bold">
											{formatTime(analytics.reduce((sum, song) => sum + song.totalPlayTime, 0))}
										</p>
										<p className="text-sm text-zinc-400">Total Play Time</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="bg-zinc-800/50 border-zinc-700">
							<CardContent className="p-4">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-orange-500/20 rounded-lg">
										<TrendingUp className="h-5 w-5 text-orange-400" />
									</div>
									<div>
										<p className="text-2xl font-bold">
											{requests.filter(r => r.status === 'pending').length}
										</p>
										<p className="text-sm text-zinc-400">Pending Requests</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					<Tabs defaultValue='analytics' className='space-y-4'>
						<TabsList className='p-1 bg-zinc-800/50 w-full grid grid-cols-2 sm:flex sm:w-auto'>
							<TabsTrigger value='analytics' className='data-[state=active]:bg-zinc-700 flex-1 sm:flex-none text-xs sm:text-sm'>
								<BarChart3 className='mr-1 sm:mr-2 size-3 sm:size-4' />
								<span className="hidden xs:inline">Analytics</span>
								<span className="xs:hidden">A</span>
							</TabsTrigger>
							<TabsTrigger value='requests' className='data-[state=active]:bg-zinc-700 flex-1 sm:flex-none text-xs sm:text-sm'>
								<Upload className='mr-1 sm:mr-2 size-3 sm:size-4' />
								<span className="hidden xs:inline">Requests</span>
								<span className="xs:hidden">R</span>
							</TabsTrigger>
						</TabsList>

						<TabsContent value='analytics' className="space-y-4">
							<Card className="bg-zinc-800/50 border-zinc-700">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<BarChart3 className="h-5 w-5" />
										Song Analytics
									</CardTitle>
									<CardDescription>
										Track performance of your songs
									</CardDescription>
								</CardHeader>
								<CardContent>
									{isLoadingData ? (
										<div className="flex items-center justify-center py-8">
											<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
										</div>
									) : (
										<div className="space-y-4">
											{analytics.map((song) => (
												<div key={song._id} className="flex items-center gap-4 p-4 bg-zinc-700/30 rounded-lg">
													<img 
														src={song.imageUrl} 
														alt={song.title}
														className="w-12 h-12 rounded object-cover"
													/>
													<div className="flex-1">
														<h3 className="font-medium">{song.title}</h3>
														<p className="text-sm text-zinc-400">{song.artist}</p>
													</div>
													<div className="text-right">
														<p className="font-medium">{song.playCount.toLocaleString()} plays</p>
														<p className="text-sm text-zinc-400">{formatTime(song.totalPlayTime)}</p>
													</div>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value='requests' className="space-y-4">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
								{/* Request Forms */}
								<Card className="bg-zinc-800/50 border-zinc-700">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Plus className="h-5 w-5" />
											Submit Request
										</CardTitle>
										<CardDescription>
											Submit requests for song/album management
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-3">
										<SongRequestDialog 
											type="upload" 
											trigger={
												<Button className="w-full justify-start" variant="outline">
													<Upload className="mr-2 h-4 w-4" />
													Song Upload Request
												</Button>
											}
										/>
										<SongRequestDialog 
											type="edit" 
											trigger={
												<Button className="w-full justify-start" variant="outline">
													<Edit className="mr-2 h-4 w-4" />
													Song Edit Request
												</Button>
											}
										/>
										<SongRequestDialog 
											type="delete" 
											trigger={
												<Button className="w-full justify-start" variant="outline">
													<Trash2 className="mr-2 h-4 w-4" />
													Song Delete Request
												</Button>
											}
										/>
										<AlbumRequestDialog 
											type="create" 
											trigger={
												<Button className="w-full justify-start" variant="outline">
													<Album className="mr-2 h-4 w-4" />
													Album Create Request
												</Button>
											}
										/>
										<AlbumRequestDialog 
											type="edit" 
											trigger={
												<Button className="w-full justify-start" variant="outline">
													<Edit className="mr-2 h-4 w-4" />
													Album Edit Request
												</Button>
											}
										/>
										<AlbumRequestDialog 
											type="delete" 
											trigger={
												<Button className="w-full justify-start" variant="outline">
													<Trash2 className="mr-2 h-4 w-4" />
													Album Delete Request
												</Button>
											}
										/>
									</CardContent>
								</Card>

								{/* Request History */}
								<Card className="bg-zinc-800/50 border-zinc-700">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Upload className="h-5 w-5" />
											Request History
										</CardTitle>
										<CardDescription>
											Track your submitted requests
										</CardDescription>
									</CardHeader>
									<CardContent>
										{isLoadingData ? (
											<div className="flex items-center justify-center py-8">
												<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
											</div>
										) : (
											<div className="space-y-3">
												{requests.map((request) => (
													<div key={request._id} className="p-3 bg-zinc-700/30 rounded-lg">
														<div className="flex items-center justify-between mb-2">
															<div className="flex items-center gap-2">
																{getRequestTypeIcon(request.type)}
																<span className="font-medium">{request.title}</span>
															</div>
															<Badge className={getStatusColor(request.status)}>
																{request.status}
															</Badge>
														</div>
														<p className="text-sm text-zinc-400 mb-1">{request.description}</p>
														<p className="text-xs text-zinc-500">
															{new Date(request.createdAt).toLocaleDateString()}
														</p>
													</div>
												))}
											</div>
										)}
									</CardContent>
								</Card>
							</div>
						</TabsContent>
					</Tabs>
				</motion.div>
			</ScrollArea>
		</div>
	);
};

export default ArtistDashboardPage;
