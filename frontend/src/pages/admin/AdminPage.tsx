import { useAuthStore } from "@/stores/useAuthStore";
import Header from "./components/Header";
import DashboardStats from "./components/DashboardStats";
import AdminDebugPanel from "./components/AdminDebugPanel";
import { Album, Music, Mic, Clock, Users, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SongsTabContent from "./components/SongsTabContent";
import AlbumsTabContent from "./components/AlbumsTabContent";
import ArtistsTabContent from "./components/ArtistsTabContent";
import PendingSongsTabContent from "./components/PendingSongsTabContent";
import UsersTabContent from "./components/UsersTabContent";
import ActivityLogsTabContent from "./components/ActivityLogsTabContent";
import { useEffect } from "react";
import { useMusicStore } from "@/stores/useMusicStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import MobileNav from "@/components/MobileNav";
import { motion } from "framer-motion";

const AdminPage = () => {
	const { isAdmin, isLoading, checkAdminStatus } = useAuthStore();

	const { fetchAlbums, fetchSongs, fetchStats } = useMusicStore();

	useEffect(() => {
		checkAdminStatus();
		fetchAlbums();
		fetchSongs();
		fetchStats();
	}, [checkAdminStatus, fetchAlbums, fetchSongs, fetchStats]);

	if (!isAdmin && !isLoading) return <div>Unauthorized</div>;

	return (
		<div className='min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-zinc-100'>
			{/* Mobile Header with Hamburger Menu */}
			<div className="md:hidden sticky top-0 z-50 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800">
				<div className="flex items-center justify-between p-3 sm:p-4">
					<div className="flex items-center gap-3">
						<MobileNav />
						<h1 className="text-lg sm:text-xl font-bold text-white">Admin Dashboard</h1>
					</div>
				</div>
			</div>

			<ScrollArea className='h-[calc(100vh-6rem)] md:h-[calc(100vh-6rem)]'>
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className='p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 pb-6 sm:pb-8'
				>
					{/* Desktop Header - Hidden on Mobile */}
					<div className="hidden md:block">
						<Header />
					</div>

					<AdminDebugPanel />
					<DashboardStats />

					<Tabs defaultValue='songs' className='space-y-3 sm:space-y-4 md:space-y-6'>
						<TabsList className='p-1 bg-zinc-800/50 w-full grid grid-cols-3 sm:flex sm:w-auto sm:flex-wrap'>
							<TabsTrigger value='songs' className='data-[state=active]:bg-zinc-700 flex-1 sm:flex-none text-xs sm:text-sm'>
								<Music className='mr-1 sm:mr-2 size-3 sm:size-4' />
								<span className="hidden xs:inline">Songs</span>
								<span className="xs:hidden">S</span>
							</TabsTrigger>
							<TabsTrigger value='pending' className='data-[state=active]:bg-zinc-700 flex-1 sm:flex-none text-xs sm:text-sm'>
								<Clock className='mr-1 sm:mr-2 size-3 sm:size-4' />
								<span className="hidden xs:inline">Pending</span>
								<span className="xs:hidden">P</span>
							</TabsTrigger>
							<TabsTrigger value='albums' className='data-[state=active]:bg-zinc-700 flex-1 sm:flex-none text-xs sm:text-sm'>
								<Album className='mr-1 sm:mr-2 size-3 sm:size-4' />
								<span className="hidden xs:inline">Albums</span>
								<span className="xs:hidden">A</span>
							</TabsTrigger>
							<TabsTrigger value='artists' className='data-[state=active]:bg-zinc-700 flex-1 sm:flex-none text-xs sm:text-sm'>
								<Mic className='mr-1 sm:mr-2 size-3 sm:size-4' />
								<span className="hidden xs:inline">Artists</span>
								<span className="xs:hidden">Ar</span>
							</TabsTrigger>
							<TabsTrigger value='users' className='data-[state=active]:bg-zinc-700 flex-1 sm:flex-none text-xs sm:text-sm'>
								<Users className='mr-1 sm:mr-2 size-3 sm:size-4' />
								<span className="hidden xs:inline">Users</span>
								<span className="xs:hidden">U</span>
							</TabsTrigger>
							<TabsTrigger value='logs' className='data-[state=active]:bg-zinc-700 flex-1 sm:flex-none text-xs sm:text-sm'>
								<FileText className='mr-1 sm:mr-2 size-3 sm:size-4' />
								<span className="hidden xs:inline">Logs</span>
								<span className="xs:hidden">L</span>
							</TabsTrigger>
						</TabsList>

						<TabsContent value='songs'>
							<SongsTabContent />
						</TabsContent>
						<TabsContent value='pending'>
							<PendingSongsTabContent />
						</TabsContent>
						<TabsContent value='albums'>
							<AlbumsTabContent />
						</TabsContent>
						<TabsContent value='artists'>
							<ArtistsTabContent />
						</TabsContent>
						<TabsContent value='users'>
							<UsersTabContent />
						</TabsContent>
						<TabsContent value='logs'>
							<ActivityLogsTabContent />
						</TabsContent>
					</Tabs>
				</motion.div>
			</ScrollArea>
		</div>
	);
};
export default AdminPage;
