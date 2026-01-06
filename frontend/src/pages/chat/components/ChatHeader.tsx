import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useChatStore } from "@/stores/useChatStore";
import { ArrowLeft, Phone, Video, MoreHorizontal, Music } from "lucide-react";
import { cn } from "@/lib/utils";

const ChatHeader = () => {
	const { selectedUser, onlineUsers, setSelectedUser, userActivities } = useChatStore();

	if (!selectedUser) return null;

	const isOnline = onlineUsers.has(selectedUser.clerkId);
	// Get real listening data from userActivities
	const activity = userActivities.get(selectedUser.clerkId);
	const listeningData = (activity && activity !== "Idle" && activity !== "Online") 
		? { song: activity, artist: "Unknown Artist" }
		: null;

	return (
		<div className="px-4 py-3 sm:px-6">
			<div className="flex items-center justify-between min-h-[56px]">
				{/* Left section */}
				<div className="flex items-center gap-3 flex-1 min-w-0">
					{/* Mobile back button */}
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setSelectedUser(null)}
						className="md:hidden h-9 w-9 hover:bg-white/10 rounded-full"
					>
						<ArrowLeft className="h-5 w-5 text-zinc-300" />
					</Button>

					{/* Avatar */}
					<Avatar className="h-10 w-10">
						<AvatarImage src={selectedUser.imageUrl} />
						<AvatarFallback className="bg-zinc-700 text-zinc-300">
							{selectedUser.fullName[0]}
						</AvatarFallback>
					</Avatar>

					{/* User info */}
					<div className="flex-1 min-w-0">
						<h2 className="font-semibold text-zinc-100 text-sm sm:text-base truncate">
							{selectedUser.fullName}
						</h2>
						<div className="flex items-center gap-2">
							<div
								className={cn(
									"w-2 h-2 rounded-full",
									isOnline ? "bg-green-500" : "bg-zinc-500"
								)}
							/>
							{listeningData ? (
								<div className="flex items-center gap-1.5 text-xs text-green-400 truncate">
									<Music className="w-3 h-3" />
									<p className="truncate">
										{listeningData.song}
										{listeningData.artist !== "Unknown Artist" && (
											<> - {listeningData.artist}</>
										)}
									</p>
								</div>
							) : (
								<p className="text-xs text-zinc-400">
									{isOnline ? "Online" : "Offline"}
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Right section */}
				<div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
					<Button
						variant="ghost"
						size="icon"
						className="h-9 w-9 hover:bg-white/10 rounded-full"
						title="Voice call"
					>
						<Phone className="h-5 w-5 text-zinc-300" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-9 w-9 hover:bg-white/10 rounded-full"
						title="Video call"
					>
						<Video className="h-5 w-5 text-zinc-300" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-9 w-9 hover:bg-white/10 rounded-full"
						title="More options"
					>
						<MoreHorizontal className="h-5 w-5 text-zinc-300" />
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ChatHeader;
