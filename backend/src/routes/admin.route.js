import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import {
	checkAdmin,
	createSong,
	deleteAlbum,
	deleteSong,
	updateAlbum,
	updateSong,
	getArtistApplications,
	approveArtistApplication,
	rejectArtistApplication,
	deleteArtist,
	getPendingSongs,
	approveSong,
	rejectSong,
	getAllUsers,
	suspendUser,
	unsuspendUser,
	getActivityLogs
} from "../controller/admin.controller.js";
import { createAlbum } from "../controller/album.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute, requireAdmin);

router.get("/check", checkAdmin);

// Database status endpoint
router.get("/db-status", async (req, res) => {
	try {
		const { default: mongoose } = await import("mongoose");
		const connectionState = mongoose.connection.readyState;
		const states = {
			0: "disconnected",
			1: "connected",
			2: "connecting",
			3: "disconnecting"
		};
		
		res.json({
			status: "success",
			connectionState: states[connectionState],
			readyState: connectionState,
			host: mongoose.connection.host,
			port: mongoose.connection.port,
			name: mongoose.connection.name
		});
	} catch (error) {
		console.error("Database status check error:", error);
		res.status(500).json({
			status: "error",
			message: "Database connection check failed",
			error: error.message
		});
	}
});

// Admin stats endpoint
router.get("/stats", async (req, res) => {
	try {
		const { default: mongoose } = await import("mongoose");
		const db = mongoose.connection.db;
		
		const stats = await db.stats();
		
		res.json({
			status: "success",
			database: {
				name: db.databaseName,
				collections: stats.collections,
				dataSize: stats.dataSize,
				storageSize: stats.storageSize,
				indexes: stats.indexes,
				indexSize: stats.indexSize
			}
		});
	} catch (error) {
		console.error("Admin stats error:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to fetch admin stats",
			error: error.message
		});
	}
});

// Test endpoint for form data debugging
router.post("/test-form", async (req, res) => {
	console.log("=== TEST FORM ENDPOINT ===");
	console.log("Request body:", req.body);
	console.log("Request files:", req.files);
	console.log("Request headers:", req.headers);
	
	try {
		res.json({
			message: "Form data received successfully",
			body: req.body,
			files: req.files ? Object.keys(req.files) : null,
			fileCount: req.files ? Object.keys(req.files).length : 0
		});
	} catch (error) {
		console.error("Test form endpoint error:", error);
		res.status(500).json({ 
			message: "Test failed", 
			error: error.message 
		});
	}
});

// Song routes using express-fileupload (same as artist uploads)
router.post("/songs", createSong);
router.put("/songs/:id", updateSong);
router.delete("/songs/:id", deleteSong);

// Album routes using express-fileupload
router.post("/albums", createAlbum);
router.put("/albums/:id", updateAlbum);
router.delete("/albums/:id", deleteAlbum);

// Artist application routes
router.get("/artist-applications", getArtistApplications);
router.post("/artist-applications/:id/approve", approveArtistApplication);
router.post("/artist-applications/:id/reject", rejectArtistApplication);
router.delete("/artist-applications/:id/delete", deleteArtist);

// Song approval routes
router.get("/songs/pending", getPendingSongs);
router.post("/songs/:id/approve", approveSong);
router.post("/songs/:id/reject", rejectSong);

// User management routes
router.get("/users", getAllUsers);
router.post("/users/:id/suspend", suspendUser);
router.post("/users/:id/unsuspend", unsuspendUser);

// Activity logs routes
router.get("/activity-logs", getActivityLogs);

// Test endpoint using express-fileupload instead of multer
router.post("/test-fileupload", async (req, res) => {
	console.log("=== TEST FILEUPLOAD ENDPOINT ===");
	console.log("Request headers:", req.headers);
	console.log("Request body:", req.body);
	console.log("Request files:", req.files);
	
	try {
		if (!req.files) {
			return res.json({
				message: "No files received",
				body: req.body,
				contentType: req.headers['content-type']
			});
		}
		
		const fileInfo = {};
		for (const [fieldName, file] of Object.entries(req.files)) {
			if (Array.isArray(file)) {
				fileInfo[fieldName] = file.map(f => ({
					name: f.name,
					size: f.size,
					mimetype: f.mimetype,
					fieldname: f.fieldname
				}));
			} else {
				fileInfo[fieldName] = {
					name: file.name,
					size: file.size,
					mimetype: file.mimetype,
					fieldname: file.fieldname
				};
			}
		}
		
		res.json({
			message: "Files received successfully",
			body: req.body,
			files: fileInfo,
			contentType: req.headers['content-type']
		});
	} catch (error) {
		console.error("Test fileupload error:", error);
		res.status(500).json({
			message: "Test failed",
			error: error.message
		});
	}
});

export default router;
