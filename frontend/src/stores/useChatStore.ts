import { axiosInstance } from "@/lib/axios";
import { Message, User } from "@/types";
import { create } from "zustand";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { usePlayerStore } from "./usePlayerStore";

interface ChatStore {
  users: User[];
  isLoading: boolean;
  error: string | null;
  socket: any;
  isConnected: boolean;
  onlineUsers: Set<string>;
  userActivities: Map<string, string>;
  messages: Message[];
  selectedUser: User | null;
  usersWithMessages: Set<string>;
  conversations: Map<string, any>;
  unreadCounts: Map<string, number>;
  totalUnreadCount: number;

  fetchUsers: () => Promise<void>;
  initSocket: (userId: string) => void;
  disconnectSocket: () => void;
  sendMessage: (
    receiverId: string,
    senderId: string,
    content: string,
    imageFile?: File | null,
    playlistData?: any
  ) => void;
  fetchMessages: (userId: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  deleteAccount: () => Promise<any>;
  fetchUsersWithMessages: () => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  sendTypingStart: (receiverId: string, senderId: string) => void;
  sendTypingStop: (receiverId: string, senderId: string) => void;
  togglePinChat: (userId: string) => Promise<void>;
  deleteChat: (userId: string) => Promise<void>;
  toggleMuteChat: (userId: string) => Promise<void>;
  toggleBlockUser: (userId: string) => Promise<void>;
  markMessagesAsRead: (userId: string) => Promise<void>;
  fetchUnreadCounts: () => Promise<void>;
  updateUnreadCount: (userId: string, count: number) => void;
}

const baseURL =
  import.meta.env.MODE === "development" 
    ? "http://localhost:5001" 
    : import.meta.env.VITE_API_BASE_URL || "/";

const socket = io(baseURL, {
  autoConnect: false, // only connect if user is authenticated
  withCredentials: true,
});

export const useChatStore = create<ChatStore>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,
  socket: socket,
  isConnected: false,
  onlineUsers: new Set(),
  userActivities: new Map(),
  messages: [],
  selectedUser: null,
  usersWithMessages: new Set(),
  conversations: new Map(),
  unreadCounts: new Map(),
  totalUnreadCount: 0,

  setSelectedUser: (user) => set({ selectedUser: user }),

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log("🔄 Fetching users from backend...");
      const response = await axiosInstance.get("/users");
      console.log("✅ Users fetched successfully:", response.data);
      set({ users: response.data });
    } catch (error: any) {
      console.error("❌ Error fetching users:", error);
      set({ error: error.response?.data?.message || "Failed to fetch users" });
    } finally {
      set({ isLoading: false });
    }
  },

  initSocket: (userId) => {
    if (!get().isConnected) {
      console.log("🔌 Initializing socket connection for user:", userId);

      socket.auth = { userId };
      socket.connect();

      socket.on("connect", () => {
        console.log("✅ Socket connected with ID:", socket.id);
        console.log("📡 Emitting user_connected for:", userId);

        // Emit user_connected event to notify backend
        socket.emit("user_connected", userId);

        set({ isConnected: true });
        
        // Check if user is currently playing music and update activity
        const playerStore = usePlayerStore.getState();
        if (playerStore.currentSong && playerStore.isPlaying) {
          setTimeout(() => {
            socket.emit("update_activity", {
              userId: userId,
              activity: `Playing ${playerStore.currentSong?.title} by ${playerStore.currentSong?.artist}`,
            });
          }, 500); // Small delay to ensure backend is ready
        }
      });

      socket.on("users_online", (users: string[]) => {
        console.log("👥 Users online received:", users);
        const onlineSet = new Set(users);
        console.log("🟢 Setting online users:", Array.from(onlineSet));
        set({ onlineUsers: onlineSet });
      });

      socket.on("activities", (activities: [string, string][]) => {
        console.log("📱 Activities received:", activities);
        set({ userActivities: new Map(activities) });
      });

      socket.on("activity_updated", ({ userId, activity }: { userId: string; activity: string }) => {
        console.log("📱 Activity updated event received:", userId, "->", activity);
        set((state) => {
          const newActivities = new Map(state.userActivities);
          newActivities.set(userId, activity);
          return { userActivities: newActivities };
        });
      });

      socket.on("user_connected", (userId: string) => {
        console.log("🟢 User connected event received:", userId);
        set((state) => {
          const newOnlineUsers = new Set([...state.onlineUsers, userId]);
          console.log("🟢 Updated online users:", Array.from(newOnlineUsers));
          return { onlineUsers: newOnlineUsers };
        });
      });

      socket.on("user_disconnected", (userId: string) => {
        console.log("🔴 User disconnected event received:", userId);
        set((state) => {
          const newOnlineUsers = new Set(state.onlineUsers);
          newOnlineUsers.delete(userId);
          return { onlineUsers: newOnlineUsers };
        });
      });

      socket.on("receive_message", (message: Message) => {
        console.log("📨 Received message:", message);
        set((state) => {
          // Safety check for messages array
          const messages = state.messages || [];
          
          // Check if message already exists to prevent duplicates
          const messageExists = messages.some(msg => msg._id === message._id);
          if (messageExists) {
            return state;
          }
          
          // Add new message to messages array
          const newMessages = [...messages, message];
          
          // Update conversations if this is a new conversation
          const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
          const newConversations = new Map(state.conversations);
          const existingConv = newConversations.get(otherUserId);
          
          if (existingConv) {
            newConversations.set(otherUserId, {
              ...existingConv,
              lastMessage: message,
              lastMessageTime: message.createdAt
            });
          }
          
          // Update unread count if this is a message received (not sent by current user)
          const newUnreadCounts = new Map(state.unreadCounts);
          if (message.receiverId === userId) {
            const currentCount = newUnreadCounts.get(message.senderId) || 0;
            newUnreadCounts.set(message.senderId, currentCount + 1);
          }
          
          // Recalculate total unread count
          const newTotalUnreadCount = Array.from(newUnreadCounts.values()).reduce((sum, count) => sum + count, 0);
          
          return {
            messages: newMessages,
            conversations: newConversations,
            unreadCounts: newUnreadCounts,
            totalUnreadCount: newTotalUnreadCount
          };
        });
      });

      socket.on("messages_read", ({ userId, readAt }) => {
        console.log("📖 Messages read event received:", userId, readAt);
        set((state) => {
          const newUnreadCounts = new Map(state.unreadCounts);
          newUnreadCounts.set(userId, 0);
          
          // Recalculate total unread count
          const newTotalUnreadCount = Array.from(newUnreadCounts.values()).reduce((sum, count) => sum + count, 0);
          
          return {
            unreadCounts: newUnreadCounts,
            totalUnreadCount: newTotalUnreadCount
          };
        });
      });

      socket.on("unread_count_update", ({ userId, count, totalCount }) => {
        console.log("🔢 Unread count update received:", userId, count, totalCount);
        set((state) => {
          const newUnreadCounts = new Map(state.unreadCounts);
          newUnreadCounts.set(userId, count);
          
          return {
            unreadCounts: newUnreadCounts,
            totalUnreadCount: totalCount
          };
        });
      });

      socket.on("activity_updated", ({ userId, activity }) => {
        console.log("📱 Activity updated:", userId, activity);
        set((state) => {
          const newActivities = new Map(state.userActivities);
          newActivities.set(userId, activity);
          return { userActivities: newActivities };
        });
      });

      socket.on("user_deleted", (userId: string) => {
        console.log("🗑️ User deleted event received:", userId);
        set((state) => {
          // Remove user from online users
          const newOnlineUsers = new Set(state.onlineUsers);
          newOnlineUsers.delete(userId);

          // Remove user from activities
          const newActivities = new Map(state.userActivities);
          newActivities.delete(userId);

          // Remove user from users list
          const newUsers = state.users.filter((user) => user.clerkId !== userId);

          return {
            onlineUsers: newOnlineUsers,
            userActivities: newActivities,
            users: newUsers,
          };
        });
      });

      socket.on(
        "user_typing",
        (data: { userId: string; userName: string; userAvatar?: string }) => {
          console.log("📝 User typing event received:", data);
          set((state) => {
            const newActivities = new Map(state.userActivities);
            newActivities.set(data.userId, "typing...");
            return { userActivities: newActivities };
          });
        }
      );

      socket.on("user_stopped_typing", (data: { userId: string }) => {
        console.log("📝 User stopped typing event received:", data);
        set((state) => {
          const newActivities = new Map(state.userActivities);
          newActivities.delete(data.userId);
          return { userActivities: newActivities };
        });
      });

      socket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
        set({ isConnected: false, onlineUsers: new Set() });
      });

      socket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
        set({ isConnected: false });
      });
    } else {
      console.log("🔌 Socket already connected, skipping initialization");
    }
  },

  disconnectSocket: () => {
    if (get().isConnected) {
      socket.disconnect();
      set({ isConnected: false, onlineUsers: new Set() });
    }
  },

  sendMessage: async (
    receiverId,
    senderId,
    content,
    imageFile,
    playlistData?: any,
    songData?: any
  ) => {
    try {
      console.log("Sending message:", { receiverId, senderId, content, imageFile });

      const formData = new FormData();
      formData.append("receiverId", receiverId);
      if (content) {
        formData.append("content", content);
      }
      if (imageFile) {
        formData.append("imageFile", imageFile);
        console.log(
          "Image file added to FormData:",
          imageFile.name,
          imageFile.size
        );
      }
      if (playlistData) {
        formData.append("playlistData", JSON.stringify(playlistData));
        console.log("Playlist data added to FormData:", playlistData);
      }
      if (songData) {
        formData.append("songData", JSON.stringify(songData));
        console.log("Song data added to FormData:", songData);
      }

      // Log FormData contents for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`FormData entry: ${key} =`, value);
      }

      const response = await axiosInstance.post("/messages", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Message sent successfully:", response.data);
      const message = response.data;

      // Add message to local state immediately for instant feedback
      set((state) => ({
        messages: [...state.messages, message],
      }));

      // No need to emit socket event - the backend will handle real-time delivery
      // This prevents duplicate messages and database entries
    } catch (error: any) {
      console.error("Error sending message:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error headers:", error.response?.headers);

      let errorMessage = "Failed to send message";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  },

  fetchMessages: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: response.data });
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch messages" });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAccount: async () => {
    try {
      console.log("🗑️ Deleting user account...");
      const response = await axiosInstance.delete("/users");
      console.log("✅ Account deleted successfully:", response.data);

      // Disconnect socket after account deletion
      get().disconnectSocket();

      return response.data;
    } catch (error: any) {
      console.error("❌ Error deleting account:", error);
      throw error;
    }
  },

  fetchUsersWithMessages: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log("🔄 Fetching users with messages...");
      const response = await axiosInstance.get("/messages/conversations");
      console.log("✅ Conversations fetched successfully:", response.data);

      const { usersWithMessages, conversations, users } = response.data;
      
      console.log("🔍 Frontend fetchUsersWithMessages Debug:");
      console.log("- usersWithMessages:", usersWithMessages);
      console.log("- conversations:", conversations);
      console.log("- users received:", users?.length || 0);
      console.log("- users data:", users?.map((u: any) => ({ clerkId: u.clerkId, fullName: u.fullName })));
      
      set({
        usersWithMessages: new Set(usersWithMessages),
        conversations: new Map(Object.entries(conversations)),
        users: users || [], // Update users with conversation users
      });
    } catch (error: any) {
      console.error("❌ Error fetching conversations:", error);
      set({
        error:
          error.response?.data?.message || "Failed to fetch conversations",
      });
    } finally {
      set({ isLoading: false });
    }
  },



  deleteMessage: async (messageId: string) => {
    try {
      console.log("🗑️ Deleting message:", messageId);
      await axiosInstance.delete(`/messages/${messageId}`);
      console.log("✅ Message deleted successfully:");

      // Update local state
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
    } catch (error: any) {
      console.error("❌ Error deleting message:", error);
      throw error;
    }
  },

  editMessage: async (messageId: string, content: string) => {
    try {
      console.log("✏️ Editing message:", messageId);
      const response = await axiosInstance.put(`/messages/${messageId}`, {
        content,
      });
      console.log("✅ Message edited successfully:", response.data);

      // Update local state
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId
            ? { ...msg, content, isEdited: true }
            : msg
        ),
      }));
    } catch (error: any) {
      console.error("❌ Error editing message:", error);
      throw error;
    }
  },

  sendTypingStart: (receiverId, senderId) => {
    if (get().isConnected && get().socket) {
      console.log("📝 Sending typing start event to:", receiverId);
      get().socket.emit("typing_start", { receiverId, senderId });
    }
  },

  sendTypingStop: (receiverId, senderId) => {
    if (get().isConnected && get().socket) {
      console.log("📝 Sending typing stop event to:", receiverId);
      get().socket.emit("typing_stop", { receiverId, senderId });
    }
  },

  togglePinChat: async (userId: string) => {
    const conversation = get().conversations.get(userId);
    if (!conversation) return;

    const isPinned = conversation.isPinned;
    const endpoint = isPinned ? "unpin" : "pin";

    // Optimistic update
    set((state) => {
      const newConversations = new Map(state.conversations);
      const conv = newConversations.get(userId);
      if (conv) {
        newConversations.set(userId, { ...conv, isPinned: !isPinned });
      }
      return { conversations: newConversations };
    });

    try {
      await axiosInstance.patch(`/messages/conversations/${userId}/${endpoint}`);
      toast.success(`Chat ${endpoint}ned`);
    } catch (error) {
      console.error(`Error ${endpoint}ning conversation:`, error);
      toast.error(`Failed to ${endpoint} chat`);
      // Revert on error
      set((state) => {
        const newConversations = new Map(state.conversations);
        const conv = newConversations.get(userId);
        if (conv) {
          newConversations.set(userId, { ...conv, isPinned });
        }
        return { conversations: newConversations };
      });
    }
  },

  toggleMuteChat: async (userId: string) => {
    const conversation = get().conversations.get(userId);
    if (!conversation) return;

    const isMuted = conversation.isMuted;
    const endpoint = isMuted ? "unmute" : "mute";

    try {
      await axiosInstance.patch(`/messages/conversations/${userId}/${endpoint}`);
      set((state) => {
        const newConversations = new Map(state.conversations);
        const conv = newConversations.get(userId);
        if (conv) {
          newConversations.set(userId, { ...conv, isMuted: !isMuted });
        }
        return { conversations: newConversations };
      });
      toast.success(`Chat ${endpoint}d`);
    } catch (error) {
      console.error(`Error ${endpoint}ing conversation:`, error);
      toast.error(`Failed to ${endpoint} chat`);
    }
  },

  deleteChat: async (userId: string) => {
    try {
      await axiosInstance.delete(`/messages/conversations/${userId}`);
      set((state) => {
        const newConversations = new Map(state.conversations);
        newConversations.delete(userId);
        const newUsersWithMessages = new Set(state.usersWithMessages);
        newUsersWithMessages.delete(userId);
        return {
          conversations: newConversations,
          usersWithMessages: newUsersWithMessages,
        };
      });
      toast.success("Chat deleted successfully");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete chat");
    }
  },

  toggleBlockUser: async (userId: string) => {
    try {
      // For now, we'll just remove the user from conversations
      // In a real implementation, you'd track blocked status in the backend
      set((state) => {
        const newConversations = new Map(state.conversations);
        newConversations.delete(userId);
        const newUsersWithMessages = new Set(state.usersWithMessages);
        newUsersWithMessages.delete(userId);
        return {
          conversations: newConversations,
          usersWithMessages: newUsersWithMessages,
        };
      });
      toast.success("User blocked");
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Failed to block user");
    }
  },

  markMessagesAsRead: async (userId: string) => {
    try {
      await axiosInstance.patch(`/messages/conversations/${userId}/read`);
      
      // Update local state
      set((state) => {
        const newUnreadCounts = new Map(state.unreadCounts);
        newUnreadCounts.set(userId, 0);
        
        // Recalculate total unread count
        const newTotalUnreadCount = Array.from(newUnreadCounts.values()).reduce((sum, count) => sum + count, 0);
        
        return {
          unreadCounts: newUnreadCounts,
          totalUnreadCount: newTotalUnreadCount,
        };
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  },

  fetchUnreadCounts: async () => {
    try {
      const response = await axiosInstance.get("/messages/unread-count");
      const { totalUnreadCount } = response.data;
      
      set({ totalUnreadCount });
      
      // Fetch individual unread counts for each user with messages
      const { usersWithMessages } = get();
      const unreadCounts = new Map();
      
      for (const userId of usersWithMessages) {
        try {
          const userResponse = await axiosInstance.get(`/messages/unread-count/${userId}`);
          unreadCounts.set(userId, userResponse.data.unreadCount);
        } catch (error) {
          console.error(`Error fetching unread count for user ${userId}:`, error);
          unreadCounts.set(userId, 0);
        }
      }
      
      set({ unreadCounts });
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    }
  },

  updateUnreadCount: (userId: string, count: number) => {
    set((state) => {
      const newUnreadCounts = new Map(state.unreadCounts);
      newUnreadCounts.set(userId, count);
      
      // Recalculate total unread count
      const newTotalUnreadCount = Array.from(newUnreadCounts.values()).reduce((sum, count) => sum + count, 0);
      
      return {
        unreadCounts: newUnreadCounts,
        totalUnreadCount: newTotalUnreadCount,
      };
    });
  },
}));
