import { Check, CheckCheck, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type MessageStatusType = "sending" | "sent" | "delivered" | "read" | "failed";

interface MessageStatusProps {
	status: MessageStatusType;
	timestamp?: string;
	compact?: boolean;
	className?: string;
}

const MessageStatus = ({ status, timestamp, compact = false, className }: MessageStatusProps) => {
	const getStatusIcon = () => {
		switch (status) {
			case "sending":
				return <Clock className={cn("animate-spin", compact ? "w-3 h-3" : "w-4 h-4")} />;
			case "sent":
				return <Check className={compact ? "w-3 h-3" : "w-4 h-4"} />;
			case "delivered":
				return <CheckCheck className={compact ? "w-3 h-3" : "w-4 h-4"} />;
			case "read":
				return <CheckCheck className={cn("text-green-400", compact ? "w-3 h-3" : "w-4 h-4")} />;
			case "failed":
				return <AlertCircle className={cn("text-red-400", compact ? "w-3 h-3" : "w-4 h-4")} />;
			default:
				return null;
		}
	};

	const getStatusText = () => {
		switch (status) {
			case "sending":
				return "Sending...";
			case "sent":
				return "Sent";
			case "delivered":
				return "Delivered";
			case "read":
				return "Read";
			case "failed":
				return "Failed to send";
			default:
				return "";
		}
	};

	const getStatusColor = () => {
		switch (status) {
			case "sending":
				return "text-zinc-400";
			case "sent":
				return "text-zinc-400";
			case "delivered":
				return "text-zinc-400";
			case "read":
				return "text-green-400";
			case "failed":
				return "text-red-400";
			default:
				return "text-zinc-400";
		}
	};

	return (
		<div className={cn(
			"flex items-center gap-1",
			getStatusColor(),
			className
		)}>
			{getStatusIcon()}
			{timestamp && (
				<span className={compact ? "text-xs" : "text-xs"}>
					{timestamp}
				</span>
			)}
		</div>
	);
};

export default MessageStatus;
