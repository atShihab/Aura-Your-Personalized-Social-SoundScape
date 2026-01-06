import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import fileUpload from "express-fileupload";
import path from "path";
import cors from "cors";
import fs from "fs";
import { createServer } from "http";
import cron from "node-cron";

import { initializeSocket, getSocketInstances } from "./lib/socket.js";

import { connectDB } from "./lib/db.js";
import "./lib/cloudinary.js"; // Initialize Cloudinary configuration
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import authRoutes from "./routes/auth.route.js";
import songRoutes from "./routes/song.route.js";
import albumRoutes from "./routes/album.route.js";
import statRoutes from "./routes/stat.route.js";
import messageRoutes from "./routes/message.route.js";
import artistRoutes from "./routes/artist.route.js";
import friendRoutes from "./routes/friend.route.js";
import followRoutes from "./routes/follow.route.js";
import playlistRoutes from "./routes/playlist.route.js";
import genreRoutes from "./routes/genre.route.js";
import favoriteRoutes from "./routes/favorite.route.js";
import listeningHistoryRoutes from "./routes/listeningHistory.route.js";
import notificationRoutes from "./routes/notification.route.js";
import healthRoutes from "./routes/health.route.js";

dotenv.config();

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT || 5001;

const httpServer = createServer(app);
initializeSocket(httpServer);

// Middleware to add socket instances to request context
app.use((req, res, next) => {
	const { io, userSockets } = getSocketInstances();
	req.io = io;
	req.userSockets = userSockets;
	next();
});

app.use(
	cors({
		origin: true, // Allow all origins temporarily for debugging
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
		optionsSuccessStatus: 200
	})
);

app.use(express.json()); // to parse req.body
app.use(express.urlencoded({ extended: true })); // to parse form data
app.use(clerkMiddleware()); // this will add auth to req obj => req.auth
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: path.join(__dirname, "tmp"),
		createParentPath: true,
		limits: {
			fileSize: 10 * 1024 * 1024, // 10MB  max file size
		},
	})
);

// cron jobs
const tempDir = path.join(process.cwd(), "tmp");
cron.schedule("0 * * * *", () => {
	if (fs.existsSync(tempDir)) {
		fs.readdir(tempDir, (err, files) => {
			if (err) {
				console.log("error", err);
				return;
			}
			for (const file of files) {
				fs.unlink(path.join(tempDir, file), (err) => {});
			}
		});
	}
});

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/listening-history", listeningHistoryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", healthRoutes);

// Add a test endpoint to verify connection
app.get("/api/test", (req, res) => {
	console.log("🧪 Test endpoint hit from:", req.headers.origin);
	res.json({ 
		message: "Backend connection successful!", 
		timestamp: new Date().toISOString(),
		origin: req.headers.origin,
		cors: "Updated for Vercel deployment",
		version: "2.0.0"
	});
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from tmp directory (for temporary uploads)
app.use('/tmp', express.static(path.join(__dirname, 'tmp')));

if (process.env.NODE_ENV === "production" && fs.existsSync(path.join(__dirname, "../frontend/dist"))) {
	app.use(express.static(path.join(__dirname, "../frontend/dist")));
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
	});
} else if (process.env.NODE_ENV === "production") {
	app.get("*", (req, res) => {
		res.json({ 
			message: "Aura Backend API is running", 
			status: "OK",
			frontend: "Deployed separately on Vercel"
		});
	});
}

// error handler
app.use((err, req, res, next) => {
	console.error("=== GLOBAL ERROR HANDLER ===");
	console.error("Error:", err);
	console.error("Error name:", err.name);
	console.error("Error message:", err.message);
	console.error("Error stack:", err.stack);
	
	// Handle multer errors specifically
	if (err.name === 'MulterError') {
		console.error("Multer error detected:", err.code);
		return res.status(400).json({ 
			message: "File upload error: " + err.message,
			error: err.message,
			code: err.code 
		});
	}
	
	// Handle other errors
	res.status(500).json({ 
		message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
		error: err.message 
	});
});

httpServer.listen(PORT, () => {
	console.log("Server is running on port " + PORT);
	connectDB();
});
