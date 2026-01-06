import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
	users?: Array<{
		id: string;
		name: string;
		avatar?: string;
	}>;
	userId?: string;
	userName?: string;
	compact?: boolean;
}

const TypingIndicator = ({ users, userId, userName, compact = false }: TypingIndicatorProps) => {
	// Handle both array of users and single user props
	const displayUsers = users || (userId && userName ? [{ id: userId, name: userName }] : []);
	
	if (displayUsers.length === 0) return null;

	const getTypingText = () => {
		if (displayUsers.length === 1) {
			return `${displayUsers[0].name} is typing...`;
		} else if (displayUsers.length === 2) {
			return `${displayUsers[0].name} and ${displayUsers[1].name} are typing...`;
		} else {
			return `${displayUsers[0].name} and ${displayUsers.length - 1} others are typing...`;
		}
	};

	return (
		<div className={cn(
			"flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3",
			compact && "px-2 py-1"
		)}>
			{/* Show first user's avatar */}
			{displayUsers[0] && (
				<Avatar className={cn("size-6", compact && "size-5")}>
					<AvatarImage src={displayUsers[0].avatar} />
					<AvatarFallback className="bg-zinc-700 text-zinc-300 text-xs">
						{displayUsers[0].name[0]}
					</AvatarFallback>
				</Avatar>
			)}

			{/* Typing animation and text */}
			<div className="flex items-center gap-2">
				{/* Animated dots */}
				<div className="flex items-center gap-1">
					<div className="flex space-x-1">
						<div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
						<div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
						<div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
					</div>
				</div>

				{/* Typing text */}
				<span className={cn(
					"text-zinc-400 text-sm italic",
					compact && "text-xs"
				)}>
					{getTypingText()}
				</span>
			</div>
		</div>
	);
};

export default TypingIndicator;
