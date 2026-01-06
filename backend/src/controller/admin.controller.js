import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import { User } from "../models/user.model.js";
import { AdminActivityLog } from "../models/adminActivityLog.model.js";
import { uploadToCloudinary } from "../lib/cloudinary.js";
import { NotificationService } from "../lib/notificationService.js";
import { createNotification } from "./notification.controller.js";
import { clerkClient } from "@clerk/express";

export const createSong = async (req, res, next) => {
	try {
		console.log("=== CREATE SONG DEBUG ===");
		console.log("Request body:", req.body);
		console.log("Request files:", req.files);
		
		if (!req.files || !req.files.audioFile || !req.files.imageFile) {
			console.log("Missing files:", { 
				hasFiles: !!req.files, 
				hasAudio: !!req.files?.audioFile, 
				hasImage: !!req.files?.imageFile 
			});
			return res.status(400).json({ message: "Please upload both audio and image files" });
		}

		const { title, artist, featuredArtist, albumId, duration, genre, mood, releaseDate } = req.body;
		const audioFile = req.files.audioFile; // express-fileupload style
		const imageFile = req.files.imageFile; // express-fileupload style

		// Check for duplicate song
		const existingSong = await Song.findOne({ 
			title: title.trim(), 
			artist: artist.trim() 
		});
		
		if (existingSong) {
			console.log("❌ Duplicate song found:", existingSong._id);
			return res.status(400).json({ 
				message: `A song with title "${title}" by "${artist}" already exists` 
			});
		}

		console.log("Files to upload:", {
			audioFile: audioFile?.name,
			imageFile: imageFile?.name
		});

		console.log("Uploading audio file to Cloudinary:", audioFile.tempFilePath);
		const audioUrl = await uploadToCloudinary(audioFile.tempFilePath);
		console.log("Audio uploaded successfully:", audioUrl);
		
		console.log("Uploading image file to Cloudinary:", imageFile.tempFilePath);
		const imageUrl = await uploadToCloudinary(imageFile.tempFilePath);
		console.log("Image uploaded successfully:", imageUrl);

		const song = new Song({
			title,
			artist,
			featuredArtist: featuredArtist || null,
			audioUrl,
			imageUrl,
			duration: parseFloat(duration), // Convert to number
			genre,
			mood: mood || null,
			releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
			albumId: albumId || null,
		});

		await song.save();
		console.log("✅ Song saved successfully:", song._id);

		// if song belongs to an album, update the album's songs array
		if (albumId) {
			await Album.findByIdAndUpdate(albumId, {
				$push: { songs: song._id },
			});
			console.log("✅ Song added to album:", albumId);
		}

		// Find the artist and send notification
		const artistUser = await User.findOne({ artistName: artist, isArtist: true });
		if (artistUser && artistUser.emailPreferences?.artist?.uploadStatus) {
			const notificationData = {
				clerkUserId: artistUser.clerkId,
				userName: artistUser.fullName,
				artistName: artistUser.artistName || artistUser.fullName,
				releaseTitle: title,
				releaseType: 'Song'
			};

			await NotificationService.sendArtistNotification('upload_success', notificationData);
		}

		// Notify followers of new release
		if (artistUser) {
			await NotificationService.notifyFollowersOfNewRelease(artistUser.clerkId, title, 'Song');
		}
		
		console.log("✅ Song creation completed successfully");
		res.status(201).json(song);
	} catch (error) {
		console.error("❌ Error in createSong:", error);
		console.error("Error details:", {
			message: error.message,
			stack: error.stack,
			name: error.name
		});
		next(error);
	}
};

export const deleteSong = async (req, res, next) => {
	try {
		const { id } = req.params;

		const song = await Song.findById(id);

		// if song belongs to an album, update the album's songs array
		if (song.albumId) {
			await Album.findByIdAndUpdate(song.albumId, {
				$pull: { songs: song._id },
			});
		}

		await Song.findByIdAndDelete(id);

		res.status(200).json({ message: "Song deleted successfully" });
	} catch (error) {
		console.log("Error in deleteSong", error);
		next(error);
	}
};

export const updateSong = async (req, res, next) => {
	try {
		console.log("=== UPDATE SONG DEBUG ===");
		console.log("Request params:", req.params);
		console.log("Request body:", req.body);
		console.log("Request files:", req.files);
		
		const { id } = req.params;
		const { title, artist, featuredArtist, albumId, duration, genre, mood, releaseDate } = req.body;
		
		const updateData = { title, artist, featuredArtist: featuredArtist || null, duration: parseFloat(duration), genre, mood: mood || null };
		
		// Handle release date if provided
		if (releaseDate) {
			updateData.releaseDate = new Date(releaseDate);
		}
		
		// Handle album assignment/removal
		if (albumId !== undefined) {
			const song = await Song.findById(id);
			const oldAlbumId = song.albumId;
			
			// Remove from old album if exists
			if (oldAlbumId) {
				await Album.findByIdAndUpdate(oldAlbumId, {
					$pull: { songs: id }
				});
			}
			
			// Add to new album if specified
			if (albumId && albumId !== "none") {
				// Ensure albumId is a string
				const albumIdString = typeof albumId === 'string' ? albumId : albumId.toString();
				updateData.albumId = albumIdString;
				await Album.findByIdAndUpdate(albumIdString, {
					$push: { songs: id }
				});
			} else {
				updateData.albumId = null;
			}
		}
		
		// Handle file uploads if provided (express-fileupload style)
		if (req.files) {
			if (req.files.audioFile) {
				console.log("Processing audio file:", req.files.audioFile.name);
				const audioUrl = await uploadToCloudinary(req.files.audioFile.tempFilePath);
				updateData.audioUrl = audioUrl;
				console.log("✅ Audio uploaded to Cloudinary:", audioUrl);
			}
			if (req.files.imageFile) {
				console.log("Processing image file:", req.files.imageFile.name);
				const imageUrl = await uploadToCloudinary(req.files.imageFile.tempFilePath);
				updateData.imageUrl = imageUrl;
				console.log("✅ Image uploaded to Cloudinary:", imageUrl);
			}
		}
		
		console.log("Final update data:", updateData);
		
		const updatedSong = await Song.findByIdAndUpdate(
			id,
			updateData,
			{ new: true }
		);
		
		if (!updatedSong) {
			return res.status(404).json({ message: "Song not found" });
		}
		
		console.log("✅ Song updated successfully:", updatedSong._id);
		res.status(200).json(updatedSong);
	} catch (error) {
		console.error("❌ Error in updateSong:", error);
		console.error("Error details:", {
			message: error.message,
			stack: error.stack,
			name: error.name
		});
		next(error);
	}
};


export const deleteAlbum = async (req, res, next) => {
	try {
		const { id } = req.params;
		await Song.deleteMany({ albumId: id });
		await Album.findByIdAndDelete(id);
		res.status(200).json({ message: "Album deleted successfully" });
	} catch (error) {
		console.log("Error in deleteAlbum", error);
		next(error);
	}
};

export const updateAlbum = async (req, res, next) => {
	try {
		console.log("=== UPDATE ALBUM DEBUG ===");
		console.log("Album ID:", req.params.id);
		console.log("Request body:", req.body);
		console.log("Request files:", req.files);
		
		const { id } = req.params;
		const { title, artist, releaseYear, genre } = req.body;
		
		const updateData = { title, releaseYear: parseInt(releaseYear) };
		
		// Add optional fields only if they are provided
		if (artist && artist.trim()) {
			updateData.artist = artist.trim();
		}
		if (genre && genre.trim() && genre !== "none") {
			updateData.genre = genre.trim();
		}
		
		// Handle image upload if provided
		if (req.files && req.files.imageFile) {
			console.log("Processing image file:", req.files.imageFile.name);
			try {
				const imageUrl = await uploadToCloudinary(req.files.imageFile.tempFilePath, "albums");
				updateData.imageUrl = imageUrl;
				console.log("✅ Album image uploaded to Cloudinary:", imageUrl);
			} catch (uploadError) {
				console.error("❌ Album image upload failed:", uploadError);
				return res.status(500).json({ message: "Failed to upload album image" });
			}
		}
		
		console.log("Final update data:", updateData);
		
		const updatedAlbum = await Album.findByIdAndUpdate(
			id,
			updateData,
			{ new: true }
		);
		
		if (!updatedAlbum) {
			return res.status(404).json({ message: "Album not found" });
		}
		
		console.log("✅ Album updated successfully:", updatedAlbum._id);
		res.status(200).json(updatedAlbum);
	} catch (error) {
		console.error("❌ Error in updateAlbum:", error);
		next(error);
	}
};

export const checkAdmin = async (req, res, next) => {
	try {
		// The requireAdmin middleware has already verified the user is an admin
		// So if we reach this point, the user is definitely an admin
		res.status(200).json({ admin: true });
	} catch (error) {
		console.error("❌ Error checking admin status:", error);
		next(error);
	}
};

// Get all artist applications
export const getArtistApplications = async (req, res, next) => {
	try {
		const applications = await User.find({ 
			isArtist: true,
			verificationStatus: { $in: ['pending', 'approved', 'rejected'] }
		})
		.select('fullName artistName imageUrl verificationStatus genre bio socialMedia verificationNotes artistDocuments createdAt')
		.sort({ createdAt: -1 });

		// Add email field as null since we don't store it in our database
		const applicationsWithEmail = applications.map(app => ({
			...app.toObject(),
			email: null // We don't store email in our database, it's handled by Clerk
		}));

		res.status(200).json({ applications: applicationsWithEmail });
	} catch (error) {
		console.error("❌ Error getting artist applications:", error);
		next(error);
	}
};

// Approve artist application
export const approveArtistApplication = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { notes } = req.body;
		
		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ message: "Artist application not found" });
		}
		
		if (!user.isArtist) {
			return res.status(400).json({ message: "User is not an artist" });
		}
		
		// Update user profile with artist information from the application
		user.verificationStatus = 'approved';
		user.isVerified = true;
		user.verificationDate = new Date();
		
		// Update profile with artist form data if available
		if (user.artistApplication) {
			const app = user.artistApplication;
			
			// Update bio with artist bio if provided
			if (app.bio && app.bio.trim()) {
				user.bio = app.bio.trim();
			}
			
			// Update genre if provided
			if (app.genre && app.genre.trim()) {
				user.genre = app.genre.trim();
			}
			
			// Update social links if provided
			if (app.socialLinks) {
				user.socialLinks = {
					website: app.socialLinks.website || user.socialLinks?.website,
					instagram: app.socialLinks.instagram || user.socialLinks?.instagram,
					twitter: app.socialLinks.twitter || user.socialLinks?.twitter,
					facebook: app.socialLinks.facebook || user.socialLinks?.facebook,
					youtube: app.socialLinks.youtube || user.socialLinks?.youtube
				};
			}
			
			// Update location if provided
			if (app.location && app.location.trim()) {
				user.location = app.location.trim();
			}
			
			// Update experience if provided
			if (app.experience && app.experience.trim()) {
				user.experience = app.experience.trim();
			}
			
			// Update influences if provided
			if (app.influences && app.influences.trim()) {
				user.influences = app.influences.trim();
			}
		}
		
		// Add notes if provided
		if (notes && notes.trim()) {
			user.verificationNotes = notes.trim();
		}
		
		await user.save();
		
		// Create notification for the artist
		await createNotification(
			user.clerkId,
			'artist_approved',
			'Artist Application Approved!',
			'Congratulations! Your artist application has been approved. You can now upload music and manage your artist profile.',
			{ artistId: user._id, verificationDate: user.verificationDate }
		);
		
		console.log("✅ Artist approved and profile updated:", user.artistName);
		if (notes) {
			console.log("📝 Approval notes provided");
		}
		
		res.status(200).json({ 
			message: "Artist approved successfully and profile updated",
			artist: {
				id: user._id,
				artistName: user.artistName,
				verificationStatus: user.verificationStatus,
				verificationNotes: user.verificationNotes,
				profileUpdated: true
			}
		});
	} catch (error) {
		console.error("❌ Error approving artist:", error);
		next(error);
	}
};

// Reject artist application
export const rejectArtistApplication = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { feedback } = req.body;
		
		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ message: "Artist application not found" });
		}
		
		if (!user.isArtist) {
			return res.status(400).json({ message: "User is not an artist" });
		}
		
		user.verificationStatus = 'rejected';
		user.isVerified = false;
		
		// Add feedback if provided
		if (feedback && feedback.trim()) {
			user.verificationNotes = feedback.trim();
		}
		
		await user.save();
		
		console.log("❌ Artist rejected:", user.artistName);
		if (feedback) {
			console.log("📝 Rejection feedback provided");
		}
		
		res.status(200).json({ 
			message: "Artist rejected successfully",
			artist: {
				id: user._id,
				artistName: user.artistName,
				verificationStatus: user.verificationStatus,
				verificationNotes: user.verificationNotes
			}
		});
	} catch (error) {
		console.error("❌ Error rejecting artist:", error);
		next(error);
	}
};


// Delete artist (remove artist status and verification)
export const deleteArtist = async (req, res, next) => {
	try {
		const { id } = req.params;
		
		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ message: "Artist not found" });
		}
		
		if (!user.isArtist) {
			return res.status(400).json({ message: "User is not an artist" });
		}
		
		// Remove artist status and verification
		user.isArtist = false;
		user.isVerified = false;
		user.verificationStatus = 'rejected';
		user.verificationDate = undefined;
		user.verificationNotes = "Artist status removed by admin";
		user.artistName = undefined;
		user.genre = undefined;
		user.bio = undefined;
		user.socialMedia = {};
		user.artistDocuments = [];
		
		await user.save();
		
		console.log("🗑️ Artist deleted:", user.fullName);
		
		res.status(200).json({ 
			message: "Artist deleted successfully",
			user: {
				id: user._id,
				fullName: user.fullName,
				isArtist: user.isArtist,
				isVerified: user.isVerified
			}
		});
	} catch (error) {
		console.error("❌ Error deleting artist:", error);
		next(error);
	}
};

// Helper function to log admin activities
const logAdminActivity = async (adminId, adminName, action, targetType, targetId, targetName, details = {}, ipAddress = null) => {
	try {
		const log = new AdminActivityLog({
			adminId,
			adminName,
			action,
			targetType,
			targetId,
			targetName,
			details,
			ipAddress: ipAddress || null,
		});
		await log.save();
		console.log(`📝 Admin activity logged: ${action} on ${targetType} ${targetId}`);
	} catch (error) {
		console.error("❌ Error logging admin activity:", error);
		// Don't throw - logging failures shouldn't break the main operation
	}
};

// Get pending songs for review
export const getPendingSongs = async (req, res, next) => {
	try {
		const pendingSongs = await Song.find({ approvalStatus: 'pending' })
			.sort({ createdAt: -1 })
			.populate('albumId', 'title');

		res.status(200).json({ songs: pendingSongs });
	} catch (error) {
		console.error("❌ Error getting pending songs:", error);
		next(error);
	}
};

// Approve song
export const approveSong = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { notes } = req.body;
		const adminId = req.auth.userId;
		
		// Get admin info
		const adminUser = await clerkClient.users.getUser(adminId);
		const adminName = `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || adminUser.primaryEmailAddress?.emailAddress || 'Admin';

		const song = await Song.findById(id);
		if (!song) {
			return res.status(404).json({ message: "Song not found" });
		}

		song.approvalStatus = 'approved';
		song.approvedBy = adminId;
		song.approvedAt = new Date();
		if (notes && notes.trim()) {
			song.approvalNotes = notes.trim();
		}

		await song.save();

		// Log activity
		await logAdminActivity(
			adminId,
			adminName,
			'song_approved',
			'song',
			song._id.toString(),
			song.title,
			{ artist: song.artist, notes: notes || null },
			req.ip || req.connection?.remoteAddress
		);

		// Notify artist if song was uploaded by artist
		if (song.uploadedBy) {
			const artistUser = await User.findOne({ clerkId: song.uploadedBy });
			if (artistUser) {
				await createNotification(
					song.uploadedBy,
					'song_approved',
					'Song Approved!',
					`Your song "${song.title}" has been approved and is now live on Aura.`,
					{ songId: song._id, songTitle: song.title }
				);
			}
		}

		res.status(200).json({ 
			message: "Song approved successfully",
			song 
		});
	} catch (error) {
		console.error("❌ Error approving song:", error);
		next(error);
	}
};

// Reject song
export const rejectSong = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { notes } = req.body;
		const adminId = req.auth.userId;
		
		// Get admin info
		const adminUser = await clerkClient.users.getUser(adminId);
		const adminName = `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || adminUser.primaryEmailAddress?.emailAddress || 'Admin';

		const song = await Song.findById(id);
		if (!song) {
			return res.status(404).json({ message: "Song not found" });
		}

		song.approvalStatus = 'rejected';
		if (notes && notes.trim()) {
			song.approvalNotes = notes.trim();
		}

		await song.save();

		// Log activity
		await logAdminActivity(
			adminId,
			adminName,
			'song_rejected',
			'song',
			song._id.toString(),
			song.title,
			{ artist: song.artist, notes: notes || null },
			req.ip || req.connection?.remoteAddress
		);

		// Notify artist if song was uploaded by artist
		if (song.uploadedBy) {
			const artistUser = await User.findOne({ clerkId: song.uploadedBy });
			if (artistUser) {
				await createNotification(
					song.uploadedBy,
					'song_rejected',
					'Song Rejected',
					`Your song "${song.title}" has been rejected. ${notes ? `Reason: ${notes}` : ''}`,
					{ songId: song._id, songTitle: song.title, notes: notes || null }
				);
			}
		}

		res.status(200).json({ 
			message: "Song rejected successfully",
			song 
		});
	} catch (error) {
		console.error("❌ Error rejecting song:", error);
		next(error);
	}
};

// Get all users
export const getAllUsers = async (req, res, next) => {
	try {
		const { status, search, page = 1, limit = 20 } = req.query;
		
		let query = {};
		
		// Filter by status (active, suspended)
		if (status === 'suspended') {
			query.isSuspended = true;
		} else if (status === 'active') {
			query.isSuspended = { $ne: true };
		}
		
		// Search filter
		if (search) {
			query.$or = [
				{ fullName: { $regex: search, $options: 'i' } },
				{ artistName: { $regex: search, $options: 'i' } },
				{ handle: { $regex: search, $options: 'i' } },
			];
		}
		
		const skip = (parseInt(page) - 1) * parseInt(limit);
		
		const users = await User.find(query)
			.select('fullName artistName imageUrl isArtist isVerified isSuspended suspendedAt suspendedReason createdAt')
			.sort({ createdAt: -1 })
			.limit(parseInt(limit))
			.skip(skip);
		
		const total = await User.countDocuments(query);
		
		res.status(200).json({
			users,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(total / parseInt(limit)),
				totalUsers: total,
				hasNext: skip + users.length < total,
				hasPrev: parseInt(page) > 1
			}
		});
	} catch (error) {
		console.error("❌ Error getting users:", error);
		next(error);
	}
};

// Suspend user
export const suspendUser = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { reason } = req.body;
		const adminId = req.auth.userId;
		
		// Get admin info
		const adminUser = await clerkClient.users.getUser(adminId);
		const adminName = `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || adminUser.primaryEmailAddress?.emailAddress || 'Admin';

		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.isSuspended = true;
		user.suspendedAt = new Date();
		if (reason && reason.trim()) {
			user.suspendedReason = reason.trim();
		}

		await user.save();

		// Log activity
		await logAdminActivity(
			adminId,
			adminName,
			'user_suspended',
			'user',
			user._id.toString(),
			user.fullName || user.artistName,
			{ reason: reason || null },
			req.ip || req.connection?.remoteAddress
		);

		// Notify user
		await createNotification(
			user.clerkId,
			'account_suspended',
			'Account Suspended',
			`Your account has been suspended. ${reason ? `Reason: ${reason}` : 'Please contact support for more information.'}`,
			{ reason: reason || null, suspendedAt: user.suspendedAt }
		);

		res.status(200).json({ 
			message: "User suspended successfully",
			user: {
				id: user._id,
				fullName: user.fullName,
				isSuspended: user.isSuspended,
				suspendedAt: user.suspendedAt
			}
		});
	} catch (error) {
		console.error("❌ Error suspending user:", error);
		next(error);
	}
};

// Unsuspend user
export const unsuspendUser = async (req, res, next) => {
	try {
		const { id } = req.params;
		const adminId = req.auth.userId;
		
		// Get admin info
		const adminUser = await clerkClient.users.getUser(adminId);
		const adminName = `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || adminUser.primaryEmailAddress?.emailAddress || 'Admin';

		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.isSuspended = false;
		user.suspendedAt = undefined;
		user.suspendedReason = undefined;

		await user.save();

		// Log activity
		await logAdminActivity(
			adminId,
			adminName,
			'user_unsuspended',
			'user',
			user._id.toString(),
			user.fullName || user.artistName,
			{},
			req.ip || req.connection?.remoteAddress
		);

		// Notify user
		await createNotification(
			user.clerkId,
			'account_unsuspended',
			'Account Restored',
			'Your account has been restored. You can now access all features.',
			{}
		);

		res.status(200).json({ 
			message: "User unsuspended successfully",
			user: {
				id: user._id,
				fullName: user.fullName,
				isSuspended: user.isSuspended
			}
		});
	} catch (error) {
		console.error("❌ Error unsuspending user:", error);
		next(error);
	}
};

// Get admin activity logs
export const getActivityLogs = async (req, res, next) => {
	try {
		const { page = 1, limit = 50, action, targetType, startDate, endDate } = req.query;
		
		let query = {};
		
		if (action) {
			query.action = action;
		}
		
		if (targetType) {
			query.targetType = targetType;
		}
		
		if (startDate || endDate) {
			query.createdAt = {};
			if (startDate) {
				query.createdAt.$gte = new Date(startDate);
			}
			if (endDate) {
				query.createdAt.$lte = new Date(endDate);
			}
		}
		
		const skip = (parseInt(page) - 1) * parseInt(limit);
		
		const logs = await AdminActivityLog.find(query)
			.sort({ createdAt: -1 })
			.limit(parseInt(limit))
			.skip(skip);
		
		const total = await AdminActivityLog.countDocuments(query);
		
		res.status(200).json({
			logs,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(total / parseInt(limit)),
				totalLogs: total,
				hasNext: skip + logs.length < total,
				hasPrev: parseInt(page) > 1
			}
		});
	} catch (error) {
		console.error("❌ Error getting activity logs:", error);
		next(error);
	}
};
