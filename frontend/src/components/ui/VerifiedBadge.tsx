import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
	size?: "sm" | "md" | "lg";
	className?: string;
}

const VerifiedBadge = ({ size = "md", className }: VerifiedBadgeProps) => {
	const sizeClasses = {
		sm: "w-3 h-3",
		md: "w-4 h-4", 
		lg: "w-5 h-5"
	};

	return (
		<div className={cn(
			"bg-blue-500 rounded-full flex items-center justify-center text-black shadow-lg",
			className
		)}>
			<Check className={sizeClasses[size]} />
		</div>
	);
};

export default VerifiedBadge;
