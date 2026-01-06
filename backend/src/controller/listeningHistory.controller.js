import { ListeningHistory } from "../models/listeningHistory.model.js";
import { User } from "../models/user.model.js";

// Add listening activity
export const addListeningActivity = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const {
			songId,
			songTitle,
			artistName,
			artistId,
			albumId,
			albumTitle,
			imageUrl,
			duration,
			completed = false,
			playCount = 1,
			metadata
		} = req.body;

		// Check if there's a recent entry for this song (within last 5 minutes)
		const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
		const existingEntry = await ListeningHistory.findOne({
			userId: currentUserId,
			songId,
			playedAt: { $gte: fiveMinutesAgo }
		}).sort({ playedAt: -1 });

		let listeningEntry;

		if (existingEntry) {
			// Update existing entry with new play time and increment play count
			existingEntry.playedAt = new Date();
			existingEntry.playCount = (existingEntry.playCount || 1) + 1;
			existingEntry.completed = completed;
			await existingEntry.save();
			listeningEntry = existingEntry;
		} else {
			// Create new listening history entry
			listeningEntry = new ListeningHistory({
				userId: currentUserId,
				songId,
				songTitle,
				artistName,
				artistId,
				albumId,
				albumTitle,
				imageUrl,
				duration,
				completed,
				playCount,
				metadata: metadata || {}
			});

			await listeningEntry.save();
		}

		res.status(201).json({
			message: "Listening activity recorded",
			entry: listeningEntry
		});
	} catch (error) {
		next(error);
	}
};

// Get user's listening history
export const getListeningHistory = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { limit = 20, page = 1, songId, artistId } = req.query;

		let query = { userId: currentUserId };
		if (songId) query.songId = songId;
		if (artistId) query.artistId = artistId;

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const history = await ListeningHistory.find(query)
			.sort({ playedAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await ListeningHistory.countDocuments(query);

		res.status(200).json({
			history,
			total,
			page: parseInt(page),
			limit: parseInt(limit),
			totalPages: Math.ceil(total / parseInt(limit))
		});
	} catch (error) {
		next(error);
	}
};

// Get listening statistics
export const getListeningStats = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { period = 'all' } = req.query; // all, week, month, year

		let dateFilter = {};
		if (period !== 'all') {
			const now = new Date();
			let startDate;
			
			switch (period) {
				case 'week':
					startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
					break;
				case 'month':
					startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
					break;
				case 'year':
					startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
					break;
			}
			dateFilter = { playedAt: { $gte: startDate } };
		}

		const query = { userId: currentUserId, ...dateFilter };

		// Get total listening time
		const totalTimeResult = await ListeningHistory.aggregate([
			{ $match: query },
			{ $group: { _id: null, totalTime: { $sum: "$duration" } } }
		]);

		// Get top songs
		const topSongs = await ListeningHistory.aggregate([
			{ $match: query },
			{ $group: { _id: "$songId", count: { $sum: 1 }, totalTime: { $sum: "$duration" } } },
			{ $sort: { count: -1 } },
			{ $limit: 10 }
		]);

		// Get top artists
		const topArtists = await ListeningHistory.aggregate([
			{ $match: query },
			{ $group: { _id: "$artistId", artistName: { $first: "$artistName" }, count: { $sum: 1 }, totalTime: { $sum: "$duration" } } },
			{ $sort: { count: -1 } },
			{ $limit: 10 }
		]);

		// Get listening sessions count
		const sessionsCount = await ListeningHistory.countDocuments(query);

		// Get unique songs count
		const uniqueSongsCount = await ListeningHistory.distinct('songId', query).then(ids => ids.length);

		// Get unique artists count
		const uniqueArtistsCount = await ListeningHistory.distinct('artistId', query).then(ids => ids.length);

		res.status(200).json({
			stats: {
				totalListeningTime: totalTimeResult[0]?.totalTime || 0,
				totalSessions: sessionsCount,
				uniqueSongs: uniqueSongsCount,
				uniqueArtists: uniqueArtistsCount,
				topSongs,
				topArtists,
				period
			}
		});
	} catch (error) {
		next(error);
	}
};

// Get recent activity
export const getRecentActivity = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { limit = 10 } = req.query;

		// Get unique songs with their most recent play time
		const recentActivity = await ListeningHistory.aggregate([
			{ $match: { userId: currentUserId } },
			{ $sort: { playedAt: -1 } },
			{
				$group: {
					_id: "$songId",
					songId: { $first: "$songId" },
					songTitle: { $first: "$songTitle" },
					artistName: { $first: "$artistName" },
					artistId: { $first: "$artistId" },
					albumId: { $first: "$albumId" },
					albumTitle: { $first: "$albumTitle" },
					imageUrl: { $first: "$imageUrl" },
					playedAt: { $first: "$playedAt" },
					duration: { $first: "$duration" },
					completed: { $first: "$completed" },
					playCount: { $sum: 1 }
				}
			},
			{ $sort: { playedAt: -1 } },
			{ $limit: parseInt(limit) }
		]);


		res.status(200).json({
			recentActivity
		});
	} catch (error) {
		next(error);
	}
};

// Update listening activity (for completion status)
export const updateListeningActivity = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const { entryId } = req.params;
		const { completed, playCount } = req.body;

		const entry = await ListeningHistory.findOneAndUpdate(
			{ _id: entryId, userId: currentUserId },
			{ completed, playCount },
			{ new: true }
		);

		if (!entry) {
			return res.status(404).json({ message: "Listening activity not found" });
		}

		res.status(200).json({
			message: "Listening activity updated",
			entry
		});
	} catch (error) {
		next(error);
	}
};

// Clear listening history
export const clearListeningHistory = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;

		await ListeningHistory.deleteMany({ userId: currentUserId });

		res.status(200).json({
			message: "Listening history cleared"
		});
	} catch (error) {
		next(error);
	}
};
