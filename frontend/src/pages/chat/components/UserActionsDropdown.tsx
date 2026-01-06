
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  User,
  Pin,
  Trash2,
  MicOff,
  MessageCircleX,
} from "lucide-react";

interface UserActionsDropdownProps {
  userId: string;
  onOpenProfile: (userId: string) => void;
  onPinChat: (userId: string) => void;
  onDeleteChat: (userId: string) => void;
  onMuteChat: (userId: string) => void;
  onBlockUser: (userId: string) => void;
}

const UserActionsDropdown = ({
  userId,
  onOpenProfile,
  onPinChat,
  onDeleteChat,
  onMuteChat,
  onBlockUser,
}: UserActionsDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 rounded-full hover:bg-zinc-700 transition-colors">
          <MoreVertical className="w-5 h-5 text-zinc-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
        <DropdownMenuItem onClick={() => onOpenProfile(userId)}>
          <User className="w-4 h-4 mr-2" />
          Open Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPinChat(userId)}>
          <Pin className="w-4 h-4 mr-2" />
          Pin/Unpin Chat
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onMuteChat(userId)}>
          <MicOff className="w-4 h-4 mr-2" />
          Mute/Unmute Chat
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-700" />
        <DropdownMenuItem onClick={() => onBlockUser(userId)} className="text-red-500">
          <MessageCircleX className="w-4 h-4 mr-2" />
          Block Messages
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDeleteChat(userId)} className="text-red-500">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Chat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActionsDropdown;
