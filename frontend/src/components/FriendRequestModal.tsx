import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useFriendStore } from '@/stores/useFriendStore';
import { useUser } from '@clerk/clerk-react';
import { 
	UserPlus, 
	X, 
	Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import VerifiedBadge from '@/components/ui/VerifiedBadge';

interface FriendRequestModalProps {
	isOpen: boolean;
	onClose: () => void;
	userId: string;
	userName: string;
	userImage: string;
	userHandle?: string;
	isArtist?: boolean;
	artistName?: string;
	isVerified?: boolean;
	onStatusChange?: () => void; // Add callback for status changes
}

const FriendRequestModal = ({
	isOpen,
	onClose,
	userId,
	userName,
	userImage,
	userHandle,
	isArtist,
	artistName,
	isVerified,
	onStatusChange
}: FriendRequestModalProps) => {
	const { user: currentUser } = useUser();
	const { sendFriendRequest, isLoading } = useFriendStore();
	const [message, setMessage] = useState('');
	const [isSending, setIsSending] = useState(false);

	if (!isOpen) return null;

	const handleSendRequest = async () => {
		if (!currentUser) {
			toast.error('Please sign in to send friend requests');
			return;
		}

		setIsSending(true);
		try {
			await sendFriendRequest(userId, message);
			onClose();
			setMessage('');
			
			// Notify parent component to refresh status
			if (onStatusChange) {
				onStatusChange();
			}
		} catch (error) {
			// Error is handled in the store
		} finally {
			setIsSending(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<Card className="w-full max-w-md bg-zinc-800 border-zinc-700">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<CardTitle className="text-white text-lg">Send Friend Request</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							onClick={onClose}
							className="text-zinc-400 hover:text-white"
						>
							<X className="size-4" />
						</Button>
					</div>
					<CardDescription className="text-zinc-400">
						Send a friend request to {userName}
					</CardDescription>
				</CardHeader>
				
				<CardContent className="space-y-4">
					{/* User Info */}
					<div className="flex items-center gap-3 p-3 bg-zinc-700/30 rounded-lg">
						<Avatar className="w-12 h-12">
							<AvatarImage src={userImage} alt={userName} />
							<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">
								{userName.charAt(0)}
							</AvatarFallback>
						</Avatar>
						
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2">
								<h3 className="text-white font-medium truncate">
									{isArtist ? artistName : userName}
								</h3>
								{isVerified && <VerifiedBadge size="sm" />}
								{isArtist && (
									<Badge variant="secondary" className="text-xs">
										Artist
									</Badge>
								)}
							</div>
							{userHandle && (
								<p className="text-zinc-400 text-sm">@{userHandle}</p>
							)}
						</div>
					</div>

					{/* Message Input */}
					<div className="space-y-2">
						<label className="text-sm font-medium text-zinc-300">
							Message (optional)
						</label>
						<Textarea
							placeholder="Add a personal message..."
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							className="bg-zinc-700/30 border-zinc-600 text-white placeholder:text-zinc-400"
							rows={3}
							maxLength={200}
						/>
						<div className="text-xs text-zinc-500 text-right">
							{message.length}/200
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-2 pt-2">
						<Button
							variant="outline"
							onClick={onClose}
							className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-700"
						>
							Cancel
						</Button>
						<Button
							onClick={handleSendRequest}
							disabled={isSending || isLoading}
							className="flex-1 bg-blue-600 hover:bg-blue-700"
						>
							{isSending ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<UserPlus className="size-4" />
							)}
							Send Request
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default FriendRequestModal;
