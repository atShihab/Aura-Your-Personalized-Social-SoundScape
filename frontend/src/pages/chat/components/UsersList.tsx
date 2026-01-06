import UsersListSkeleton from "@/components/skeletons/UsersListSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { Search, Users, Circle, Music, Pin } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import UserActionsDropdown from "./UserActionsDropdown";
import { useNavigate } from "react-router-dom";
import { navigateToProfile } from '@/lib/profileUrl';

interface UsersListProps {
  showOnlineUsers?: boolean;
  setShowOnlineUsers?: (show: boolean) => void;
}

const UsersList = ({
  showOnlineUsers = false,
  setShowOnlineUsers,
}: UsersListProps) => {
  const { user } = useUser();
  const {
    users,
    selectedUser,
    isLoading,
    setSelectedUser,
    onlineUsers,
    conversations,
    fetchUsersWithMessages,
    userActivities,
    togglePinChat,
    deleteChat,
    toggleMuteChat,
    toggleBlockUser,
    unreadCounts,
  } = useChatStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsersWithMessages();
  }, [fetchUsersWithMessages]);

      const handleOpenProfile = (userId: string) => {
    	navigateToProfile(navigate, { clerkId: userId });
    };

  const filteredUsers = useMemo(() => {
    // Users array now only contains users with messages
    let filtered = [...users];

    console.log("🔍 UsersList filteredUsers Debug:");
    console.log("- Total users:", users.length);
    console.log("- Users data:", users.map((u: any) => ({ clerkId: u.clerkId, fullName: u.fullName })));
    console.log("- Conversations map size:", conversations.size);
    console.log("- Show online users:", showOnlineUsers);
    console.log("- Search query:", searchQuery);

    if (showOnlineUsers) {
      filtered = filtered.filter((user) => onlineUsers.has(user.clerkId));
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.isArtist?.toString().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      const aConv = conversations.get(a.clerkId);
      const bConv = conversations.get(b.clerkId);

      if (aConv?.isPinned && !bConv?.isPinned) return -1;
      if (!aConv?.isPinned && bConv?.isPinned) return 1;

      const aTime = aConv?.lastMessageTime
        ? new Date(aConv.lastMessageTime).getTime()
        : 0;
      const bTime = bConv?.lastMessageTime
        ? new Date(bConv.lastMessageTime).getTime()
        : 0;

      return bTime - aTime;
    });

    console.log("- Final filtered users:", filtered.length);
    console.log("- Final users data:", filtered.map((u: any) => ({ clerkId: u.clerkId, fullName: u.fullName })));

    return filtered;
  }, [
    users,
    searchQuery,
    showOnlineUsers,
    onlineUsers,
    conversations,
  ]);

  const onlineCount = useMemo(() => {
    const currentUserId = user?.id;
    return Array.from(onlineUsers).filter((userId) => userId !== currentUserId)
      .length;
  }, [onlineUsers, user?.id]);

  return (
    <div className="h-full flex flex-col bg-zinc-900 min-h-0">
      <div className="flex-shrink-0 p-4 pt-6 border-b border-white/10 sticky top-0 z-10 bg-zinc-900">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-zinc-100">Chats</h2>
          <Badge
            variant="outline"
            className={cn(
              "bg-green-500/10 text-green-400 border-green-500/20 cursor-pointer transition-all hover:bg-green-500/20",
              showOnlineUsers && "bg-green-500/20 border-green-500/40"
            )}
            onClick={() => setShowOnlineUsers?.(!showOnlineUsers)}
          >
            <Circle className="w-2 h-2 mr-2 fill-current" />
            {onlineCount} Online
          </Badge>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-black/25 border-white/10 text-zinc-100 placeholder:text-zinc-400 focus:border-green-500/50 focus:ring-green-500/20 rounded-md"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="h-full">
          <div className="p-2 relative">
            {isLoading ? (
              <UsersListSkeleton />
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-10 h-10 text-zinc-500 mx-auto mb-4" />
                <p className="text-zinc-400 text-sm font-medium">
                  {showOnlineUsers
                    ? searchQuery
                      ? "No one found"
                      : "No friends are online"
                    : searchQuery
                    ? "No users found"
                    : "Your chats will appear here"}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Try searching for a friend to start a conversation.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredUsers.map((userItem) => {
                  const isOnline = onlineUsers.has(userItem.clerkId);
                  const isSelected =
                    selectedUser?.clerkId === userItem.clerkId;
                  const conversation = conversations.get(userItem.clerkId);
                  const activity = userActivities.get(userItem.clerkId);
                  const listeningData =
                    activity && activity !== "Idle" && activity !== "Online"
                      ? { song: activity, artist: "Unknown Artist" }
                      : null;

                  return (
                    <div
                      key={userItem._id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg transition-all duration-200 group relative",
                        isSelected
                          ? "bg-green-500/15"
                          : "hover:bg-white/10"
                      )}
                    >
                      <div
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                        onClick={() => setSelectedUser(userItem)}
                      >
                        <div className="relative flex-shrink-0">
                          <Avatar className="size-12 border-2 border-black/20">
                            <AvatarImage src={userItem.imageUrl} />
                            <AvatarFallback className="bg-zinc-700 text-zinc-300">
                              {userItem.fullName[0]}
                            </AvatarFallback>
                          </Avatar>
                          {listeningData ? (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full ring-2 ring-zinc-800 bg-zinc-700 flex items-center justify-center">
                              <Music className="w-3 h-3 text-zinc-400" />
                            </div>
                          ) : (
                            <div
                              className={cn(
                                "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-zinc-900",
                                isOnline ? "bg-green-500" : "bg-zinc-500"
                              )}
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3
                              className={cn(
                                "font-semibold text-sm truncate flex items-center gap-2",
                                isSelected
                                  ? "text-green-300"
                                  : "text-zinc-200"
                              )}
                            >
                              {userItem.fullName}
                              {conversation?.isPinned && (
                                <Pin className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                              )}
                            </h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {(unreadCounts.get(userItem.clerkId) || 0) > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                  {(unreadCounts.get(userItem.clerkId) || 0) > 99 ? '99+' : (unreadCounts.get(userItem.clerkId) || 0)}
                                </span>
                              )}
                              <span className="text-xs text-zinc-400">
                                {conversation?.lastMessageTime
                                  ? new Date(
                                      conversation.lastMessageTime
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    })
                                  : ""}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {listeningData ? (
                              <>
                                <Music className="w-3 h-3 text-green-400 flex-shrink-0" />
                                <p className="text-xs text-zinc-300 truncate">
                                  <span className="font-medium">
                                    {listeningData.song}
                                  </span>
                                  {listeningData.artist !==
                                    "Unknown Artist" && (
                                    <> - {listeningData.artist}</>
                                  )}
                                </p>
                              </>
                            ) : conversation?.lastMessage ? (
                              <p className="text-xs text-zinc-400 truncate">
                                {conversation.lastMessage.content ||
                                  (conversation.lastMessage.imageUrl
                                    ? "📷 Image"
                                    : "") ||
                                  (conversation.lastMessage.playlistData
                                    ? "🎵 Playlist"
                                    : "")}
                              </p>
                            ) : (
                              <p className="text-xs text-zinc-400 truncate">
                                {isOnline ? "Online" : "Last seen recently"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <UserActionsDropdown
                          userId={userItem.clerkId}
                          onOpenProfile={handleOpenProfile}
                          onPinChat={togglePinChat}
                          onDeleteChat={deleteChat}
                          onMuteChat={toggleMuteChat}
                          onBlockUser={toggleBlockUser}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersList;

