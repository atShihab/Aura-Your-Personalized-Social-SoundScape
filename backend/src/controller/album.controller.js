import { Album } from "../models/album.model.js";
import cloudinary, { uploadToCloudinary } from "../lib/cloudinary.js";
import { AlbumFavorite } from "../models/albumFavorite.model.js";

export const createAlbum = async (req, res, next) => {
	try {
		console.log("=== CREATE ALBUM DEBUG ===");
		console.log("Request body:", req.body);
		console.log("Request files:", req.files);

		const { title, artist, releaseYear, genre } = req.body;

		console.log("Extracted fields:", { title, artist, releaseYear, genre });

		// Validate required fields
		if (!title || !title.trim()) {
			console.log("Missing title");
			return res.status(400).json({ message: "Title is required" });
		}

		let imageUrl = "https://via.placeholder.com/300x300?text=Test+Album";

		// Handle file upload if present (express-fileupload style)
		if (req.files && req.files.imageFile) {
			console.log("Image file uploaded:", req.files.imageFile.name);
			try {
				imageUrl = await uploadToCloudinary(req.files.imageFile.tempFilePath, "albums");
				console.log("Image uploaded to Cloudinary:", imageUrl);
			} catch (uploadError) {
				console.error("Cloudinary upload failed:", uploadError);
				// Continue with placeholder image if upload fails
			}
		}

		const albumData = {
			title: title.trim(),
			imageUrl: imageUrl,
			releaseYear: parseInt(releaseYear) || new Date().getFullYear(),
		};

		// Add optional fields only if they are provided
		if (artist && artist.trim()) {
			albumData.artist = artist.trim();
		}
		if (genre && genre.trim() && genre !== "none") {
			albumData.genre = genre.trim();
		}

		console.log("Album data to save:", albumData);

		console.log("Creating Album model instance...");
		const album = new Album(albumData);
		console.log("Album model created successfully");

		console.log("Saving album to database...");
		const savedAlbum = await album.save();
		console.log("Album saved successfully:", savedAlbum._id);

		res.status(201).json({
			message: "Album created successfully",
			album: savedAlbum
		});
	} catch (error) {
		console.error("=== CREATE ALBUM ERROR ===");
		console.error("Error type:", error.constructor.name);
		console.error("Error message:", error.message);
		console.error("Error stack:", error.stack);

		// Check if it's a MongoDB validation error
		if (error.name === 'ValidationError') {
			console.error("Validation errors:", error.errors);
			return res.status(400).json({
				message: "Validation error",
				errors: Object.values(error.errors).map(err => err.message)
			});
		}

		// Check if it's a MongoDB duplicate key error
		if (error.code === 11000) {
			return res.status(400).json({ message: "Album with this title already exists" });
		}

		// Check if it's a MongoDB connection error
		if (error.name === 'MongoError' || error.name === 'MongoServerError') {
			console.error("MongoDB error:", error);
			return res.status(500).json({ message: "Database error", error: error.message });
		}

		// Generic error
		console.error("Generic error:", error);
		res.status(500).json({ message: "Failed to create album", error: error.message });
	}
};

export const getAllAlbums = async (req, res, next) => {
	try {
		const albums = await Album.find({}).populate({
			path: 'songs',
			select: 'title artist imageUrl audioUrl duration createdAt'
		});
		res.json(albums);
	} catch (error) {
		next(error);
	}
};

export const getAlbumById = async (req, res, next) => {
	try {
		const albumId = req.params.albumId;
		console.log("🎵 getAlbumById called with albumId:", albumId);

		const album = await Album.findById(albumId).populate({
			path: 'songs',
			select: 'title artist imageUrl audioUrl duration releaseDate createdAt'
		});

		if (!album) {
			console.log("🎵 Album not found:", albumId);
			return res.status(404).json({ message: "Album not found" });
		}

		console.log("🎵 Album found:", {
			title: album.title,
			songCount: album.songs.length,
			songs: album.songs.map(s => ({ title: s.title, hasAudioUrl: !!s.audioUrl }))
		});

		// Calculate album statistics
		const totalDuration = album.songs.reduce((total, song) => total + (song.duration || 0), 0);
		const totalPlays = album.songs.reduce((total, song) => total + (song.totalPlays || 0), 0);

		// Add calculated fields to the response
		const albumWithStats = {
			...album.toObject(),
			totalDuration,
			totalPlays,
			songCount: album.songs.length
		};

		res.json(albumWithStats);
	} catch (error) {
		console.error("🎵 Error in getAlbumById:", error);
		next(error);
	}
};

// Add album to library
export const addAlbumToLibrary = async (req, res, next) => {
	try {
		const { albumId } = req.params;
		const userId = req.auth.userId;

		// Check if album exists
		const album = await Album.findById(albumId);
		if (!album) {
			return res.status(404).json({ message: "Album not found" });
		}

		// Check if user already added this album to library
		const existingFavorite = await AlbumFavorite.findOne({
			userId,
			albumId
		});

		if (existingFavorite) {
			return res.status(400).json({ message: "Album already in library" });
		}

		// Add to library
		const albumFavorite = new AlbumFavorite({
			userId,
			albumId
		});

		await albumFavorite.save();

		res.status(201).json({
			message: "Album added to library successfully",
			favorite: albumFavorite
		});
	} catch (error) {
		console.error("Add album to library error:", error);
		next(error);
	}
};

// Remove album from library
export const removeAlbumFromLibrary = async (req, res, next) => {
	try {
		const { albumId } = req.params;
		const userId = req.auth.userId;

		// Find and remove the favorite
		const albumFavorite = await AlbumFavorite.findOneAndDelete({
			userId,
			albumId
		});

		if (!albumFavorite) {
			return res.status(404).json({ message: "Album not found in library" });
		}

		res.json({
			message: "Album removed from library successfully"
		});
	} catch (error) {
		console.error("Remove album from library error:", error);
		next(error);
	}
};

// Check if user has added album to library
export const checkAlbumLibraryStatus = async (req, res, next) => {
	try {
		const { albumId } = req.params;
		const userId = req.auth.userId;

		const albumFavorite = await AlbumFavorite.findOne({
			userId,
			albumId
		});

		res.json({
			isInLibrary: !!albumFavorite
		});
	} catch (error) {
		console.error("Check album library status error:", error);
		next(error);
	}
};

// Get user's library albums
export const getLibraryAlbums = async (req, res, next) => {
	try {
		const userId = req.auth.userId;

		const albumFavorites = await AlbumFavorite.find({ userId })
			.populate('albumId')
			.sort({ addedAt: -1 });

		const libraryAlbums = albumFavorites
			.map(fav => fav.albumId)
			.filter(album => album); // Only return valid albums

		res.json({
			albums: libraryAlbums,
			total: libraryAlbums.length
		});
	} catch (error) {
		console.error("Get library albums error:", error);
		next(error);
	}
};
