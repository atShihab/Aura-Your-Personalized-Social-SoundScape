import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

interface Reaction {
	emoji: string;
	count: number;
	users: string[];
	hasReacted: boolean;
}

interface MessageReactionsProps {
	messageId: string;
	reactions?: Reaction[];
	onReactionAdd?: (messageId: string, emoji: string) => void;
	onReactionRemove?: (messageId: string, emoji: string) => void;
	compact?: boolean;
}

const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const MessageReactions = ({ 
	messageId, 
	reactions = [], 
	onReactionAdd, 
	onReactionRemove,
	compact = false 
}: MessageReactionsProps) => {
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const pickerRef = useRef<HTMLDivElement>(null);

	// Handle click outside to close emoji picker
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
				setShowEmojiPicker(false);
			}
		};

		if (showEmojiPicker) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showEmojiPicker]);

	const handleReactionClick = (emoji: string, hasReacted: boolean) => {
		if (hasReacted) {
			onReactionRemove?.(messageId, emoji);
		} else {
			onReactionAdd?.(messageId, emoji);
		}
	};

	const handleEmojiSelect = (emoji: string) => {
		onReactionAdd?.(messageId, emoji);
		setShowEmojiPicker(false);
	};

	// Filter out reactions with 0 count
	const visibleReactions = reactions.filter(reaction => reaction.count > 0);

	return (
		<div className="flex items-center gap-1 flex-wrap mt-1">
			{/* Existing reactions */}
			{visibleReactions.map((reaction) => (
				<Button
					key={reaction.emoji}
					variant="ghost"
					size="sm"
					onClick={() => handleReactionClick(reaction.emoji, reaction.hasReacted)}
					className={cn(
						"h-6 px-2 py-1 rounded-full text-xs transition-all duration-200",
						compact ? "h-5 px-1.5" : "h-6 px-2",
						reaction.hasReacted
							? "bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30"
							: "bg-zinc-700/50 text-zinc-300 border border-zinc-600/30 hover:bg-zinc-600/50"
					)}
					title={`${reaction.users.join(", ")} reacted with ${reaction.emoji}`}
				>
					<span className="mr-1">{reaction.emoji}</span>
					<span className={compact ? "text-xs" : "text-xs"}>{reaction.count}</span>
				</Button>
			))}

			{/* Add reaction button */}
			<div className="relative">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setShowEmojiPicker(!showEmojiPicker)}
					className={cn(
						"rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 transition-all duration-200",
						compact ? "h-5 w-5 p-0" : "h-6 w-6 p-0"
					)}
					title="Add reaction"
				>
					<span className={compact ? "text-xs" : "text-sm"}>+</span>
				</Button>

				{/* Quick emoji picker */}
				{showEmojiPicker && (
					<div 
						ref={pickerRef}
						className="absolute bottom-full left-0 mb-1 bg-zinc-800 border border-zinc-600 rounded-lg p-2 shadow-lg z-20"
					>
						<div className="flex gap-1">
							{commonEmojis.map((emoji) => (
								<Button
									key={emoji}
									variant="ghost"
									size="sm"
									onClick={() => handleEmojiSelect(emoji)}
									className="h-8 w-8 p-0 hover:bg-zinc-700 rounded-md transition-colors duration-200"
									title={`React with ${emoji}`}
								>
									{emoji}
								</Button>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default MessageReactions;
