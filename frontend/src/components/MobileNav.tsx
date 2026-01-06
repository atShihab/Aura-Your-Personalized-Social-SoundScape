import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { 
	Menu, 
	X, 
	Home, 
	MessageCircle, 
	Library, 
	Music, 
	Search, 
	Settings, 
	User, 
	Mic, 
	Heart, 
	Plus,
	Clock,
	Users,
	Crown,
	LogOut
} from "lucide-react";
import { useMusicStore } from "@/stores/useMusicStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

const MobileNav = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { albums } = useMusicStore();
	const { isAdmin } = useAuthStore();
	const { playlists, likedSongsPlaylist } = usePlaylistStore();
	const { favorites } = useFavoritesStore();
	const { user } = useUser();
	const location = useLocation();

	const closeMenu = () => setIsOpen(false);

	const isActive = (path: string) => location.pathname === path;

	const navigationItems = [
		{ path: "/home", label: "Home", icon: Home },
		{ path: "/home/search", label: "Search", icon: Search },
		{ path: "/home/library", label: "Your Library", icon: Library },
	];

	const signedInItems = [
		{ path: "/home/chat", label: "Messages", icon: MessageCircle },
		{ path: "/home/liked-songs", label: "Liked Songs", icon: Heart },
	];

	const adminItems = [
		{ path: "/home/admin", label: "Admin Dashboard", icon: Library },
	];

	const profileItems = [
		{ path: user ? `/home/profile/${user.id}` : "/home/profile", label: "Profile", icon: User },
		{ path: "/home/settings", label: "Settings", icon: Settings },
		{ path: "/artist/signup", label: "Join as Artist", icon: Mic },
	];

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" className="md:hidden">
					<Menu className="h-6 w-6" />
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="w-[300px] bg-zinc-900 border-zinc-800 p-0">
				<div className="flex flex-col h-full">
					{/* Header */}
					<div className="flex items-center justify-between p-4 border-b border-zinc-800">
					<div className="flex items-center gap-2">
						<img 
							src="/aura.svg" 
							className="size-10 sm:size-12" 
							alt="AURA MUSIC logo"
							onError={(e) => {
								console.warn('Aura logo not found');
							}}
						/>
						<span className="font-semibold text-lg sm:text-xl bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent text-glow-gradient">
							AURA
						</span>
					</div>
						<Button variant="ghost" size="icon" onClick={closeMenu}>
							<X className="h-5 w-5" />
						</Button>
					</div>

					{/* Navigation Content */}
					<ScrollArea className="flex-1">
						<div className="p-4 space-y-6">
							{/* Main Navigation */}
							<div className="space-y-2">
								<h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
									Navigation
								</h3>
								{navigationItems.map((item) => {
									const Icon = item.icon;
									return (
										<Link
											key={item.path}
											to={item.path}
											onClick={closeMenu}
											className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
												isActive(item.path)
													? "bg-zinc-800 text-white"
													: "text-zinc-300 hover:bg-zinc-800/50"
											}`}
										>
											<Icon className="h-5 w-5" />
											<span>{item.label}</span>
										</Link>
									);
								})}
							</div>

							{/* Signed In Features */}
							<SignedIn>
								<div className="space-y-2">
									<h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
										Your Music
									</h3>
									{signedInItems.map((item) => {
										const Icon = item.icon;
										return (
											<Link
												key={item.path}
												to={item.path}
												onClick={closeMenu}
												className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
													isActive(item.path)
														? "bg-zinc-800 text-white"
														: "text-zinc-300 hover:bg-zinc-800/50"
												}`}
											>
												<Icon className="h-5 w-5" />
												<span>{item.label}</span>
												{item.path === "/liked-songs" && (
													<span className="ml-auto text-xs text-zinc-400">
														{likedSongsPlaylist?.songCount || favorites.filter(f => f.type === 'song').length}
													</span>
												)}
											</Link>
										);
									})}
								</div>

								{/* Admin Section */}
								{isAdmin && (
									<div className="space-y-2">
										<h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
											Admin
										</h3>
										{adminItems.map((item) => {
											const Icon = item.icon;
											return (
												<Link
													key={item.path}
													to={item.path}
													onClick={closeMenu}
													className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
														isActive(item.path)
															? "bg-zinc-800 text-white"
															: "text-zinc-300 hover:bg-zinc-800/50"
													}`}
												>
													<Icon className="h-5 w-5" />
													<span>{item.label}</span>
												</Link>
											);
										})}
									</div>
								)}

								{/* Profile Section */}
								<div className="space-y-2">
									<h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
										Profile
									</h3>
									{profileItems.map((item) => {
										const Icon = item.icon;
										return (
											<Link
												key={item.path}
												to={item.path}
												onClick={closeMenu}
												className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
													isActive(item.path)
														? "bg-zinc-800 text-white"
														: "text-zinc-300 hover:bg-zinc-800/50"
												}`}
											>
												<Icon className="h-5 w-5" />
												<span>{item.label}</span>
											</Link>
										);
									})}
								</div>
							</SignedIn>

							{/* Signed Out */}
							<SignedOut>
								<div className="space-y-2">
									<h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
										Account
									</h3>
									<Link
										to="/login"
										onClick={closeMenu}
										className="flex items-center gap-3 p-3 rounded-lg text-zinc-300 hover:bg-zinc-800/50 transition-colors"
									>
										<LogOut className="h-5 w-5" />
										<span>Sign In</span>
									</Link>
								</div>
							</SignedOut>
						</div>
					</ScrollArea>

					{/* Library Section */}
					<div className="p-4 border-t border-zinc-800">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<Music className="h-5 w-5 text-zinc-400" />
								<span className="font-medium text-zinc-300">Quick Access</span>
							</div>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<Plus className="h-4 w-4" />
							</Button>
						</div>
						
						<ScrollArea className="max-h-48">
							<div className="space-y-2">
								{/* Liked Songs */}
								{(likedSongsPlaylist?.songCount > 0 || favorites.filter(f => f.type === 'song').length > 0) && (
									<Link
										to="/liked-songs"
										onClick={closeMenu}
										className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
									>
										<div className="size-10 rounded-md bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
											<Heart className="size-5 text-white fill-white" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-medium text-white truncate text-sm">Liked Songs</p>
											<p className="text-xs text-zinc-400 truncate">
												{likedSongsPlaylist?.songCount || favorites.filter(f => f.type === 'song').length} songs
											</p>
										</div>
									</Link>
								)}

								{/* Recent Albums */}
								{albums.slice(0, 3).map((album) => (
									<Link
										key={album._id}
										to={`/album/${album._id}`}
										onClick={closeMenu}
										className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
									>
										<img
											src={album.imageUrl}
											alt={album.title}
											className="size-10 rounded-md object-cover flex-shrink-0"
										/>
										<div className="flex-1 min-w-0">
											<p className="font-medium text-white truncate text-sm">
												{album.title}
											</p>
											<p className="text-xs text-zinc-400 truncate">
												{album.artist}
											</p>
										</div>
									</Link>
								))}

								{/* Recent Playlists */}
								{playlists.slice(0, 2).map((playlist) => (
									<Link
										key={playlist._id}
										to="/library"
										onClick={closeMenu}
										className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
									>
										{playlist.imageUrl ? (
											<img
												src={playlist.imageUrl}
												alt={playlist.name}
												className="size-10 rounded-md object-cover flex-shrink-0"
											/>
										) : (
											<div className="size-10 rounded-md bg-zinc-700 flex items-center justify-center flex-shrink-0">
												<Music className="size-5 text-zinc-400" />
											</div>
										)}
										<div className="flex-1 min-w-0">
											<p className="font-medium text-white truncate text-sm">
												{playlist.name}
											</p>
											<p className="text-xs text-zinc-400 truncate">
												Playlist • {playlist.songCount} songs
											</p>
										</div>
									</Link>
								))}
							</div>
						</ScrollArea>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default MobileNav;
