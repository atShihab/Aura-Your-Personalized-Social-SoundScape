import { Server } from "socket.io";

let io;
let userSockets;

export const initializeSocket = (server) => {
	io = new Server(server, {
		cors: {
			origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://127.0.0.1:3002"],
			credentials: true,
			methods: ["GET", "POST"]
		},
	});

	userSockets = new Map(); // { userId: socketId}
	const userActivities = new Map(); // {userId: activity}

	// Function to broadcast online users to all clients
	const broadcastOnlineUsers = () => {
		const onlineUserIds = Array.from(userSockets.keys());
		console.log("📡 Broadcasting online users to all clients:", onlineUserIds);
		io.emit("users_online", onlineUserIds);
	};

	// Function to broadcast all user activities
	const broadcastActivities = () => {
		const activitiesArray = Array.from(userActivities.entries());
		console.log("📱 Broadcasting all activities:", activitiesArray);
		io.emit("activities", activitiesArray);
	};

	// Function to remove user from all socket data
	const removeUser = (userId) => {
		console.log("🗑️ Removing user from socket data:", userId);
		
		// Remove from userSockets
		const socketId = userSockets.get(userId);
		if (socketId) {
			userSockets.delete(userId);
			console.log("🔌 Removed socket mapping for user:", userId);
		}
		
		// Remove from userActivities
		if (userActivities.has(userId)) {
			userActivities.delete(userId);
			console.log("📱 Removed activity for user:", userId);
		}
		
		// Broadcast updated lists to all remaining users
		broadcastOnlineUsers();
		broadcastActivities();
	};

	// Function to log current socket status
	const logSocketStatus = () => {
		console.log("📊 Current socket status:");
		console.log("   Connected users:", userSockets.size);
		console.log("   User IDs:", Array.from(userSockets.keys()));
		console.log("   Socket IDs:", Array.from(userSockets.values()));
		console.log("   User Activities:", Array.from(userActivities.entries()));
	};

	// Function to clean up orphaned connections (users that exist in socket but not in database)
	const cleanupOrphanedConnections = async () => {
		try {
			console.log("🧹 Starting orphaned connection cleanup...");
			const { User } = await import("../models/user.model.js");
			
			for (const [userId, socketId] of userSockets.entries()) {
				const userExists = await User.findOne({ clerkId: userId });
				if (!userExists) {
					console.log("🧹 Removing orphaned connection for deleted user:", userId);
					removeUser(userId);
				}
			}
		} catch (error) {
			console.error("❌ Error during orphaned connection cleanup:", error);
		}
	};

	// Set up periodic cleanup every 5 minutes
	setInterval(cleanupOrphanedConnections, 5 * 60 * 1000);

	io.on("connection", (socket) => {
		console.log("🔌 New socket connection:", socket.id);
		console.log("📊 Socket auth data:", socket.auth);

		socket.on("user_connected", (userId) => {
			console.log("🟢 User connected:", userId, "Socket:", socket.id);
			
			// Store user socket mapping
			userSockets.set(userId, socket.id);
			userActivities.set(userId, "Idle"); // Changed from "Online" to "Idle"

			// Broadcast to all connected sockets that this user just logged in
			io.emit("user_connected", userId);

			// Send current online users to the newly connected user
			const currentOnlineUsers = Array.from(userSockets.keys());
			console.log("📤 Sending online users to new user:", currentOnlineUsers);
			socket.emit("users_online", currentOnlineUsers);

			// Broadcast updated online users list to all clients
			broadcastOnlineUsers();

			// Broadcast all activities including the new user
			broadcastActivities();

			// Log current status
			logSocketStatus();
		});

		socket.on("update_activity", ({ userId, activity }) => {
			console.log("📱 Activity updated:", userId, "->", activity);
			
			// Validate userId matches the socket's authenticated user
			if (socket.auth && socket.auth.userId === userId) {
				userActivities.set(userId, activity);
				
				// Broadcast the specific activity update to all clients
				io.emit("activity_updated", { userId, activity });
				
				// Also broadcast all activities to ensure consistency
				broadcastActivities();
				
				console.log("✅ Activity broadcasted successfully");
			} else {
				console.warn("⚠️ Activity update rejected: userId mismatch", {
					provided: userId,
					authenticated: socket.auth?.userId
				});
			}
		});

		// Handle user deletion events
		socket.on("user_deleted", (userId) => {
			console.log("🗑️ User deletion event received:", userId);
			removeUser(userId);
		});

		// Handle typing events
		socket.on("typing_start", ({ receiverId, senderId }) => {
			console.log("📝 Typing start:", senderId, "->", receiverId);
			
			// Find the receiver's socket
			const receiverSocketId = userSockets.get(receiverId);
			if (receiverSocketId) {
				// Get sender info from users list (you might want to store this in a more efficient way)
				const senderSocketId = userSockets.get(senderId);
				if (senderSocketId) {
					// Emit typing event to the receiver
					io.to(receiverSocketId).emit("user_typing", {
						userId: senderId,
						userName: "User", // You might want to get the actual name from database
						userAvatar: null
					});
					console.log("📤 Sent typing start to receiver:", receiverId);
				}
			}
		});

		socket.on("typing_stop", ({ receiverId, senderId }) => {
			console.log("📝 Typing stop:", senderId, "->", receiverId);
			
			// Find the receiver's socket
			const receiverSocketId = userSockets.get(receiverId);
			if (receiverSocketId) {
				// Emit stop typing event to the receiver
				io.to(receiverSocketId).emit("user_stopped_typing", {
					userId: senderId
				});
				console.log("📤 Sent typing stop to receiver:", receiverId);
			}
		});

		// Removed send_message handler since we handle message creation via HTTP
		// Socket is now only used for real-time delivery

		socket.on("disconnect", () => {
			console.log("🔌 Socket disconnected:", socket.id);
			let disconnectedUserId;
			
			// Find disconnected user
			for (const [userId, socketId] of userSockets.entries()) {
				if (socketId === socket.id) {
					disconnectedUserId = userId;
					userSockets.delete(userId);
					userActivities.delete(userId);
					break;
				}
			}
			
			if (disconnectedUserId) {
				console.log("🔴 User disconnected:", disconnectedUserId);
				io.emit("user_disconnected", disconnectedUserId);
				// Broadcast updated online users list
				broadcastOnlineUsers();
				// Broadcast updated activities
				broadcastActivities();
				// Log current status
				logSocketStatus();
			}
		});

		// Handle connection errors
		socket.on("error", (error) => {
			console.error("❌ Socket error:", error);
		});
	});

	// Log when socket server is ready
	console.log("🚀 Socket.io server initialized and ready for connections");
};

// Function to send notification to a specific user
export const sendNotificationToUser = (userId, notification) => {
	const socketId = userSockets.get(userId);
	if (socketId && io) {
		console.log("📢 Sending notification to user:", userId);
		io.to(socketId).emit("new_notification", notification);
	} else {
		console.log("⚠️ User not online, notification will be delivered when they connect:", userId);
	}
};

// Function to broadcast notification count update
export const updateNotificationCount = (userId, count) => {
	const socketId = userSockets.get(userId);
	if (socketId && io) {
		console.log("🔢 Updating notification count for user:", userId, "count:", count);
		io.to(socketId).emit("notification_count_update", { count });
	}
};

// Export socket instances for use in other parts of the app
export const getSocketInstances = () => ({ io, userSockets });
