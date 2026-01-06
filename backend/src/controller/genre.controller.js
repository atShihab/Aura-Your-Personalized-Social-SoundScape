import { Genre } from "../models/genre.model.js";
import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import { User } from "../models/user.model.js";
import { ListeningHistory } from "../models/listeningHistory.model.js";

// Get all genres
export const getAllGenres = async (req, res) => {
	try {
		const genres = await Genre.find({ isActive: true }).sort({ popularity: -1 });
		res.json(genres);
	} catch (error) {
		console.error("Error getting genres:", error);
		res.status(500).json({ message: "Failed to get genres", success: false });
	}
};

// Get genre by ID
export const getGenreById = async (req, res) => {
	try {
		const { id } = req.params;
		const genre = await Genre.findById(id);
		
		if (!genre) {
			return res.status(404).json({ message: "Genre not found", success: false });
		}
		
		res.json(genre);
	} catch (error) {
		console.error("Error getting genre:", error);
		res.status(500).json({ message: "Failed to get genre", success: false });
	}
};

// Create new genre
export const createGenre = async (req, res) => {
	try {
		const { name, description, imageUrl, color, tags, moods } = req.body;
		
		if (!name) {
			return res.status(400).json({ message: "Genre name is required", success: false });
		}
		
		// Check if genre already exists
		const existingGenre = await Genre.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
		if (existingGenre) {
			return res.status(400).json({ message: "Genre already exists", success: false });
		}
		
		const genre = new Genre({
			name,
			description,
			imageUrl,
			color,
			tags,
			moods
		});
		
		await genre.save();
		res.status(201).json({ message: "Genre created successfully", genre });
	} catch (error) {
		console.error("Error creating genre:", error);
		res.status(500).json({ message: "Failed to create genre", success: false });
	}
};

// Update genre
export const updateGenre = async (req, res) => {
	try {
		const { id } = req.params;
		const updateData = req.body;
		
		const genre = await Genre.findByIdAndUpdate(id, updateData, { new: true });
		
		if (!genre) {
			return res.status(404).json({ message: "Genre not found", success: false });
		}
		
		res.json({ message: "Genre updated successfully", genre });
	} catch (error) {
		console.error("Error updating genre:", error);
		res.status(500).json({ message: "Failed to update genre", success: false });
	}
};

// Delete genre
export const deleteGenre = async (req, res) => {
	try {
		const { id } = req.params;
		
		// Check if genre is being used
		const songsCount = await Song.countDocuments({ genre: id });
		const albumsCount = await Album.countDocuments({ genre: id });
		const usersCount = await User.countDocuments({ genre: id });
		
		if (songsCount > 0 || albumsCount > 0 || usersCount > 0) {
			return res.status(400).json({ 
				message: "Cannot delete genre that is being used", 
				usage: { songs: songsCount, albums: albumsCount, users: usersCount },
				success: false 
			});
		}
		
		const genre = await Genre.findByIdAndDelete(id);
		
		if (!genre) {
			return res.status(404).json({ message: "Genre not found", success: false });
		}
		
		res.json({ message: "Genre deleted successfully" });
	} catch (error) {
		console.error("Error deleting genre:", error);
		res.status(500).json({ message: "Failed to delete genre", success: false });
	}
};

// Search genres
export const searchGenres = async (req, res) => {
	try {
		const { q } = req.query;
		
		if (!q) {
			return res.status(400).json({ message: "Search query is required", success: false });
		}
		
		const genres = await Genre.find({
			$and: [
				{ isActive: true },
				{
					$or: [
						{ name: { $regex: q, $options: 'i' } },
						{ description: { $regex: q, $options: 'i' } },
						{ tags: { $in: [new RegExp(q, 'i')] } }
					]
				}
			]
		}).sort({ popularity: -1 });
		
		res.json(genres);
	} catch (error) {
		console.error("Error searching genres:", error);
		res.status(500).json({ message: "Failed to search genres", success: false });
	}
};

// Get genre statistics
export const getGenreStats = async (req, res) => {
	try {
		const { id } = req.params;
		
		const [genre, songsCount, albumsCount, artistsCount, totalPlays] = await Promise.all([
			Genre.findById(id),
			Song.countDocuments({ genre: id }),
			Album.countDocuments({ genre: id }),
			User.countDocuments({ genre: id, isArtist: true }),
			ListeningHistory.aggregate([
				{ $match: { songId: { $in: await Song.find({ genre: id }).distinct('_id') } } },
				{ $group: { _id: null, total: { $sum: '$playCount' } } }
			])
		]);
		
		if (!genre) {
			return res.status(404).json({ message: "Genre not found", success: false });
		}
		
		const stats = {
			genre,
			songsCount,
			albumsCount,
			artistsCount,
			totalPlays: totalPlays[0]?.total || 0
		};
		
		res.json(stats);
	} catch (error) {
		console.error("Error getting genre stats:", error);
		res.status(500).json({ message: "Failed to get genre statistics", success: false });
	}
};

// Get popular genres
export const getPopularGenres = async (req, res) => {
	try {
		const { limit = 10 } = req.query;
		
		const genres = await Genre.find({ isActive: true })
			.sort({ popularity: -1, totalPlays: -1 })
			.limit(parseInt(limit));
		
		res.json(genres);
	} catch (error) {
		console.error("Error getting popular genres:", error);
		res.status(500).json({ message: "Failed to get popular genres", success: false });
	}
};

// Get genres by mood
export const getGenresByMood = async (req, res) => {
	try {
		const { mood } = req.params;
		
		const genres = await Genre.find({
			isActive: true,
			moods: { $in: [mood] }
		}).sort({ popularity: -1 });
		
		res.json(genres);
	} catch (error) {
		console.error("Error getting genres by mood:", error);
		res.status(500).json({ message: "Failed to get genres by mood", success: false });
	}
};

// Update genre statistics (called periodically or when content changes)
export const updateGenreStats = async (req, res) => {
	try {
		const genres = await Genre.find({ isActive: true });
		
		for (const genre of genres) {
			const [songsCount, albumsCount, artistsCount, totalPlays] = await Promise.all([
				Song.countDocuments({ genre: genre.name }),
				Album.countDocuments({ genre: genre.name }),
				User.countDocuments({ genre: genre.name, isArtist: true }),
				ListeningHistory.aggregate([
					{ $match: { songId: { $in: await Song.find({ genre: genre.name }).distinct('_id') } } },
					{ $group: { _id: null, total: { $sum: '$playCount' } } }
				])
			]);
			
			// Calculate popularity score (weighted combination of metrics)
			const popularity = (songsCount * 0.3) + (albumsCount * 0.2) + (artistsCount * 0.2) + ((totalPlays[0]?.total || 0) * 0.3);
			
			await Genre.findByIdAndUpdate(genre._id, {
				totalSongs: songsCount,
				totalAlbums: albumsCount,
				totalArtists: artistsCount,
				totalPlays: totalPlays[0]?.total || 0,
				popularity
			});
		}
		
		res.json({ message: "Genre statistics updated successfully" });
	} catch (error) {
		console.error("Error updating genre stats:", error);
		res.status(500).json({ message: "Failed to update genre statistics", success: false });
	}
};
