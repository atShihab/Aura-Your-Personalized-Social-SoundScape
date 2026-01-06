import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
	MoreHorizontal, 
	Reply, 
	Edit, 
	Trash2, 
	Copy, 
	Pin,
	Forward,
	Heart,
	Share2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageContextMenuProps {
	messageId: string;
	isOwnMessage: boolean;
	onReply?: (messageId: string) => void;
	onEdit?: (messageId: string) => void;
	onDelete?: (messageId: string) => void;
	onCopy?: (messageId: string) => void;
	onPin?: (messageId: string) => void;
	onForward?: (messageId: string) => void;
	onReact?: (messageId: string) => void;
	onShare?: (messageId: string) => void;
	compact?: boolean;
	className?: string;
}

const MessageContextMenu = ({
	messageId,
	isOwnMessage,
	onReply,
	onEdit,
	onDelete,
	onCopy,
	onPin,
	onForward,
	onReact,
	onShare,
	compact = false,
	className
}: MessageContextMenuProps) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					size="sm"
					variant="ghost"
					className={cn(
						"rounded-full hover:bg-zinc-600/50 transition-all duration-200",
						compact ? "h-7 w-7 p-0" : "h-8 w-8 p-0",
						className
					)}
					title="More options"
				>
					<MoreHorizontal className={compact ? "w-3 h-3" : "w-4 h-4"} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent 
				align="end" 
				className="w-48 bg-zinc-800 border-zinc-700"
			>
				{/* Reply */}
				<DropdownMenuItem 
					className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700/50 cursor-pointer"
					onClick={() => onReply?.(messageId)}
				>
					<Reply className="w-4 h-4 mr-2" />
					Reply
				</DropdownMenuItem>

				{/* React */}
				<DropdownMenuItem 
					className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700/50 cursor-pointer"
					onClick={() => onReact?.(messageId)}
				>
					<Heart className="w-4 h-4 mr-2" />
					Add Reaction
				</DropdownMenuItem>

				<DropdownMenuSeparator className="bg-zinc-700" />

				{/* Copy */}
				<DropdownMenuItem 
					className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700/50 cursor-pointer"
					onClick={() => onCopy?.(messageId)}
				>
					<Copy className="w-4 h-4 mr-2" />
					Copy Text
				</DropdownMenuItem>

				{/* Forward */}
				<DropdownMenuItem 
					className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700/50 cursor-pointer"
					onClick={() => onForward?.(messageId)}
				>
					<Forward className="w-4 h-4 mr-2" />
					Forward
				</DropdownMenuItem>

				{/* Share */}
				<DropdownMenuItem 
					className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700/50 cursor-pointer"
					onClick={() => onShare?.(messageId)}
				>
					<Share2 className="w-4 h-4 mr-2" />
					Share
				</DropdownMenuItem>

				{/* Pin */}
				<DropdownMenuItem 
					className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700/50 cursor-pointer"
					onClick={() => onPin?.(messageId)}
				>
					<Pin className="w-4 h-4 mr-2" />
					Pin Message
				</DropdownMenuItem>

				{/* Own message actions */}
				{isOwnMessage && (
					<>
						<DropdownMenuSeparator className="bg-zinc-700" />
						
						{/* Edit */}
						<DropdownMenuItem 
							className="text-blue-400 hover:text-blue-300 hover:bg-zinc-700/50 cursor-pointer"
							onClick={() => onEdit?.(messageId)}
						>
							<Edit className="w-4 h-4 mr-2" />
							Edit
						</DropdownMenuItem>

						{/* Delete */}
						<DropdownMenuItem 
							className="text-red-400 hover:text-red-300 hover:bg-zinc-700/50 cursor-pointer"
							onClick={() => onDelete?.(messageId)}
						>
							<Trash2 className="w-4 h-4 mr-2" />
							Delete
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default MessageContextMenu;
