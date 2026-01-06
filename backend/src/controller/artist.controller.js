import { User } from "../models/user.model.js";
import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import { uploadToCloudinary } from "../lib/cloudinary.js";
import { NotificationService } from "../lib/notificationService.js";

// Get all verified artists
export const getAllArtists = async (req, res, next) => {
	try {
		const { genre, verified, limit = 20, page = 1 } = req.query;
		
		let query = { isArtist: true };
		
		// Filter by genre if provided
		if (genre) {
			query.genre = genre;
		}
		
		// Filter by verification status if provided
		if (verified === 'true') {
			query.isVerified = true;
		} else if (verified === 'false') {
			query.isVerified = false;
		}
		
		const skip = (parseInt(page) - 1) * parseInt(limit);
		
		const artists = await User.find(query)
			.select('fullName artistName genre bio isVerified imageUrl followers totalPlays monthlyListeners')
			.sort({ followers: -1, totalPlays: -1 })
			.limit(parseInt(limit))
			.skip(skip);
		
		const total = await User.countDocuments(query);
		
		res.status(200).json({
			artists,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(total / parseInt(limit)),
				totalArtists: total,
				hasNext: skip + artists.length < total,
				hasPrev: parseInt(page) > 1
			}
		});
	} catch (error) {
		console.error("❌ Error getting artists:", error);
		next(error);
	}
};

// Get artist profile by ID
export const getArtistProfile = async (req, res, next) => {
	try {
		const { id } = req.params;
		const currentUserId = req.auth?.userId;
		
		const artist = await User.findOne({ 
			$or: [{ clerkId: id }, { _id: id }],
			isArtist: true 
		}).select('-verificationNotes');
		
		if (!artist) {
			return res.status(404).json({ message: "Artist not found" });
		}
		
		// Check if current user is following this artist
		let isFollowing = false;
		if (currentUserId) {
			// This would need to be implemented with a separate Follow model
			// For now, we'll return false
			isFollowing = false;
		}
		
		res.status(200).json({
			artist: {
				...artist.toObject(),
				isFollowing
			}
		});
	} catch (error) {
		console.error("❌ Error getting artist profile:", error);
		next(error);
	}
};

// Create or update artist profile
export const createOrUpdateArtistProfile = async (req, res, next) => {
        try {
                const currentUserId = req.auth.userId;
                
                // Debug: Log the request body and files
                console.log("📝 Request body:", req.body);
                console.log("📁 Request files:", req.files);
                
                const {
                        artistName,
                        fullName,
                        genre,
                        bio,
                        socialMedia
                } = req.body;

                // Validate required fields
                if (!artistName || !fullName || !genre) {
                        return res.status(400).json({ 
                                message: "Full name, artist name and genre are required" 
                        });
                }
		
		// Check if artist name is already taken
		const existingArtist = await User.findOne({ 
			artistName: { $regex: new RegExp(`^${artistName}$`, 'i') },
			clerkId: { $ne: currentUserId }
		});
		
		if (existingArtist) {
			return res.status(400).json({ 
				message: "Artist name is already taken" 
			});
		}
		
		                // Update or create artist profile
                const user = await User.findOne({ clerkId: currentUserId });
                if (!user) {
                        return res.status(404).json({ message: "User not found" });
                }

                // Parse social media from form data
                let parsedSocialMedia = {};
                if (req.body.socialMedia) {
                        try {
                                parsedSocialMedia = JSON.parse(req.body.socialMedia);
                        } catch (e) {
                                console.error("Error parsing social media:", e);
                                parsedSocialMedia = {};
                        }
                }

                // Handle profile image upload
                let imageUrl = user.imageUrl; // Keep existing image if no new one uploaded
                if (req.files && req.files.profileImage) {
                        const file = req.files.profileImage;
                        
                        // Validate file type
                        if (!file.mimetype.startsWith('image/')) {
                                return res.status(400).json({ 
                                        message: "Only image files are allowed" 
                                });
                        }
                        
                        // Validate file size (5MB limit)
                        if (file.size > 5 * 1024 * 1024) {
                                return res.status(400).json({ 
                                        message: "File size too large. Maximum 5MB allowed." 
                                });
                        }
                        
                        // Upload to Cloudinary
                        try {
                                imageUrl = await uploadToCloudinary(file.tempFilePath, "artist-profiles");
                                console.log("✅ Profile image uploaded to Cloudinary:", imageUrl);
                        } catch (err) {
                                console.error("❌ Profile image upload error:", err);
                                return res.status(500).json({ 
                                        message: "Error uploading profile image to Cloudinary" 
                                });
                        }
                }

                // Handle artist documents upload
                let documentUrls = [];
                if (req.files && req.files.artistDocuments) {
                        const files = Array.isArray(req.files.artistDocuments) 
                                ? req.files.artistDocuments 
                                : [req.files.artistDocuments];
                        
                        for (const file of files) {
                                // Validate file type
                                const allowedTypes = [
                                        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
                                        'application/pdf',
                                        'application/msword',
                                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                                ];
                                
                                if (!allowedTypes.includes(file.mimetype)) {
                                        return res.status(400).json({ 
                                                message: `${file.name} is not a supported file type. Please upload images, PDFs, or Word documents.` 
                                        });
                                }
                                
                                // Validate file size (10MB limit for documents)
                                if (file.size > 10 * 1024 * 1024) {
                                        return res.status(400).json({ 
                                                message: `${file.name} is too large. Maximum file size is 10MB.` 
                                        });
                                }
                                
                                // Upload to Cloudinary
                                try {
                                        const cloudinaryUrl = await uploadToCloudinary(file.tempFilePath, "artist-documents");
                                        documentUrls.push({
                                                name: file.name,
                                                url: cloudinaryUrl,
                                                type: file.mimetype,
                                                size: file.size
                                        });
                                        console.log("✅ Document uploaded to Cloudinary:", cloudinaryUrl);
                                } catch (err) {
                                        console.error("❌ Document upload error:", err);
                                        return res.status(500).json({ 
                                                message: "Error uploading document to Cloudinary" 
                                        });
                                }
                        }
                }

                // Update user with artist information
                user.isArtist = true;
                user.fullName = fullName.trim();
                user.artistName = artistName.trim();
                user.genre = genre;
                user.bio = bio?.trim() || "";
                user.socialMedia = parsedSocialMedia;
                user.verificationStatus = 'pending'; // Set to pending for verification
                
                // Update image if new one was uploaded
                if (req.files && req.files.profileImage) {
                        user.imageUrl = imageUrl;
                }

                // Save documents if uploaded
                if (documentUrls.length > 0) {
                        user.artistDocuments = documentUrls;
                }

                await user.save();
		
		console.log("✅ Artist profile created/updated:", user.artistName);
		
		res.status(200).json({
			success: true,
			message: "Artist profile created successfully",
			artist: {
				id: user._id,
				artistName: user.artistName,
				genre: user.genre,
				bio: user.bio,
				isVerified: user.isVerified,
				verificationStatus: user.verificationStatus
			}
		});
	} catch (error) {
		console.error("❌ Error creating/updating artist profile:", error);
		next(error);
	}
};

// Submit artist verification
export const submitVerification = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { verificationType = 'artist' } = req.body;
		
		const user = await User.findOne({ clerkId: currentUserId });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		
		if (!user.isArtist) {
			return res.status(400).json({ 
				message: "Only artists can submit verification" 
			});
		}
		
		if (user.verificationStatus === 'approved') {
			return res.status(400).json({ 
				message: "Artist is already verified" 
			});
		}
		
		// Update verification status
		user.verificationStatus = 'pending';
		user.verificationType = verificationType;
		
		await user.save();
		
		console.log("✅ Verification submitted for:", user.artistName);
		
		res.status(200).json({
			success: true,
			message: "Verification submitted successfully",
			verificationStatus: user.verificationStatus
		});
	} catch (error) {
		console.error("❌ Error submitting verification:", error);
		next(error);
	}
};

// Get verification status
export const getVerificationStatus = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		
		const user = await User.findOne({ clerkId: currentUserId });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		
		if (!user.isArtist) {
			return res.status(400).json({ 
				message: "Only artists can check verification status" 
			});
		}
		
		res.status(200).json({
			verificationStatus: user.verificationStatus,
			isVerified: user.isVerified,
			verificationDate: user.verificationDate,
			verificationType: user.verificationType,
			verificationNotes: user.verificationNotes
		});
	} catch (error) {
		console.error("❌ Error getting verification status:", error);
		next(error);
	}
};

// Admin: Approve/reject artist verification
export const updateVerificationStatus = async (req, res, next) => {
	try {
		const { userId } = req.params;
		const { status, notes } = req.body;
		
		if (!['approved', 'rejected'].includes(status)) {
			return res.status(400).json({ 
				message: "Status must be 'approved' or 'rejected'" 
			});
		}
		
		const user = await User.findOne({ clerkId: userId });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		
		if (!user.isArtist) {
			return res.status(400).json({ 
				message: "Only artists can be verified" 
			});
		}
		
		// Update verification status
		user.verificationStatus = status;
		user.verificationNotes = notes || "";
		
		if (status === 'approved') {
			user.isVerified = true;
			user.verificationDate = new Date();
		} else {
			user.isVerified = false;
			user.verificationDate = undefined;
		}
		
		await user.save();
		
		console.log(`✅ Artist verification ${status}:`, user.artistName);
		
		// Emit socket event to notify user
		if (req.io) {
			req.io.emit("verification_status_updated", {
				userId: user.clerkId,
				status: user.verificationStatus,
				isVerified: user.isVerified
			});
		}

		// Send email notification
		if (user.emailPreferences?.artist?.verification) {
			const notificationData = {
				clerkUserId: user.clerkId,
				userName: user.fullName,
				artistName: user.artistName || user.fullName,
				reason: notes || 'No specific reason provided'
			};

			if (status === 'approved') {
				await NotificationService.sendArtistNotification('verification_approved', notificationData);
			} else {
				await NotificationService.sendArtistNotification('verification_rejected', notificationData);
			}
		}
		
		res.status(200).json({
			success: true,
			message: `Artist verification ${status}`,
			verificationStatus: user.verificationStatus,
			isVerified: user.isVerified
		});
	} catch (error) {
		console.error("❌ Error updating verification status:", error);
		next(error);
	}
};

// Search artists for autocomplete
export const searchArtistsAutocomplete = async (req, res, next) => {
	try {
		const { q, limit = 10 } = req.query;
		
		if (!q || q.length < 2) {
			return res.status(200).json({ artists: [] });
		}
		
		const artists = await User.find({
			isArtist: true,
			artistName: { $regex: q, $options: 'i' }
		})
			.select('artistName imageUrl isVerified')
			.sort({ isVerified: -1, artistName: 1 })
			.limit(parseInt(limit));
		
		res.status(200).json({ artists });
	} catch (error) {
		console.error("❌ Error searching artists for autocomplete:", error);
		next(error);
	}
};

// Search artists
export const searchArtists = async (req, res, next) => {
	try {
		const { q, genre, verified, limit = 20 } = req.query;
		
		if (!q) {
			return res.status(400).json({ message: "Search query is required" });
		}
		
		let query = { 
			isArtist: true,
			$or: [
				{ artistName: { $regex: q, $options: 'i' } },
				{ bio: { $regex: q, $options: 'i' } }
			]
		};
		
		// Filter by genre if provided
		if (genre) {
			query.genre = genre;
		}
		
		// Filter by verification status if provided
		if (verified === 'true') {
			query.isVerified = true;
		} else if (verified === 'false') {
			query.isVerified = false;
		}
		
		const artists = await User.find(query)
			.select('artistName genre bio isVerified imageUrl followers totalPlays')
			.sort({ followers: -1, totalPlays: -1 })
			.limit(parseInt(limit));
		
		res.status(200).json({
			artists,
			query: q,
			total: artists.length
		});
	} catch (error) {
		console.error("❌ Error searching artists:", error);
		next(error);
	}
};

// Artist upload song (requires approval)
export const uploadSong = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		
		// Check if user is a verified artist
		const user = await User.findOne({ clerkId: currentUserId });
		if (!user || !user.isArtist || !user.isVerified) {
			return res.status(403).json({ 
				message: "Only verified artists can upload songs" 
			});
		}

		if (!req.files || !req.files.audioFile || !req.files.imageFile) {
			return res.status(400).json({ message: "Please upload both audio and image files" });
		}

		const { title, featuredArtist, albumId, duration, genre, mood, releaseDate } = req.body;
		const audioFile = req.files.audioFile;
		const imageFile = req.files.imageFile;

		// Use artist's artistName as the artist field
		const artist = user.artistName || user.fullName;

		// Check for duplicate song
		const existingSong = await Song.findOne({ 
			title: title.trim(), 
			artist: artist.trim() 
		});
		
		if (existingSong) {
			return res.status(400).json({ 
				message: `A song with title "${title}" already exists` 
			});
		}

		// Upload files to Cloudinary
		const audioUrl = await uploadToCloudinary(audioFile.tempFilePath);
		const imageUrl = await uploadToCloudinary(imageFile.tempFilePath);

		// Create song with pending approval status
		const song = new Song({
			title: title.trim(),
			artist: artist.trim(),
			featuredArtist: featuredArtist?.trim() || null,
			audioUrl,
			imageUrl,
			duration: parseFloat(duration),
			genre,
			mood: mood || null,
			releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
			albumId: albumId || null,
			approvalStatus: 'pending', // Requires admin approval
			uploadedBy: currentUserId, // Track who uploaded it
		});

		await song.save();

		// If song belongs to an album, update the album's songs array
		if (albumId) {
			await Album.findByIdAndUpdate(albumId, {
				$push: { songs: song._id },
			});
		}

		console.log("✅ Song uploaded by artist, pending approval:", song._id);
		
		res.status(201).json({
			message: "Song uploaded successfully. It will be reviewed by an admin before being published.",
			song
		});
	} catch (error) {
		console.error("❌ Error uploading song:", error);
		next(error);
	}
};
