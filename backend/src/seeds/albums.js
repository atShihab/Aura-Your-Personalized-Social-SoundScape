import mongoose from "mongoose";
import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import { config } from "dotenv";

config();

const seedDatabase = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI);

		// Clear existing data
		await Album.deleteMany({});
		await Song.deleteMany({});

		// First, create all songs
		const createdSongs = await Song.insertMany([
			{
				title: "City Rain",
				artist: "Urban Echo",
				imageUrl: "https://via.placeholder.com/300x300.png?text=City+Rain",
				audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
				plays: Math.floor(Math.random() * 5000),
				duration: 39, // 0:39
				genre: "Indie",
			},
			{
				title: "Neon Lights",
				artist: "Night Runners",
				imageUrl: "https://via.placeholder.com/300x300.png?text=Neon+Lights",
				audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
				plays: Math.floor(Math.random() * 5000),
				duration: 36, // 0:36
				genre: "Electronic",
			},
			{
				title: "Urban Jungle",
				artist: "City Lights",
				imageUrl: "https://via.placeholder.com/300x300.png?text=Urban+Jungle",
				audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
				plays: Math.floor(Math.random() * 5000),
				duration: 36, // 0:36
				genre: "Electronic",
			},
			{
				title: "Neon Dreams",
				artist: "Cyber Pulse",
				imageUrl: "https://via.placeholder.com/300x300.png?text=Neon+Dreams",
				audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
				plays: Math.floor(Math.random() * 5000),
				duration: 39, // 0:39
				genre: "Electronic",
			},
			{
				title: "Summer Daze",
				artist: "Coastal Kids",
				imageUrl: "https://via.placeholder.com/300x300.png?text=Summer+Daze",
				audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
				plays: Math.floor(Math.random() * 5000),
				duration: 24, // 0:24
				genre: "Pop",
			},
			{
				title: "Ocean Waves",
				artist: "Coastal Drift",
				imageUrl: "https://via.placeholder.com/300x300.png?text=Ocean+Waves",
				audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
				plays: Math.floor(Math.random() * 5000),
				duration: 28, // 0:28
				genre: "Ambient",
			},
			{
				title: "Crystal Rain",
				artist: "Echo Valley",
				imageUrl: "https://via.placeholder.com/300x300.png?text=Crystal+Rain",
				audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
				plays: Math.floor(Math.random() * 5000),
				duration: 39, // 0:39
				genre: "Ambient",
			},
			{
				title: "Starlight",
				artist: "Luna Bay",
				imageUrl: "https://via.placeholder.com/300x300.png?text=Starlight",
				audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
				plays: Math.floor(Math.random() * 5000),
				duration: 30, // 0:30
				genre: "Indie",
			},
			{
				title: "Stay With Me",
				artist: "Sarah Mitchell",
				imageUrl: "https://via.placeholder.com/300x300.png?text=Stay+With+Me",
				audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
				plays: Math.floor(Math.random() * 5000),
				duration: 46, // 0:46
				genre: "Pop",
			},
			{
				title: "Midnight Drive",
				artist: "The Wanderers",
				imageUrl: "https://via.placeholder.com/300x300.png?text=Midnight+Drive",
				audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
				plays: Math.floor(Math.random() * 5000),
				duration: 41, // 0:41
				genre: "Rock",
			},
			{
				title: "Moonlight Dance",
				artist: "Silver Shadows",
				imageUrl: "https://via.placeholder.com/300x300.png?text=Moonlight+Dance",
				audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
				plays: Math.floor(Math.random() * 5000),
				duration: 27, // 0:27
				genre: "Jazz",
			},
			{
				title: "Lost in Tokyo",
				artist: "Electric Dreams",
				imageUrl: "https://via.placeholder.com/300x300.png?text=Lost+in+Tokyo",
				audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
				plays: Math.floor(Math.random() * 5000),
				duration: 24, // 0:24
				genre: "Electronic",
			},
			{
				title: "Neon Tokyo",
				artist: "Future Pulse",
				imageUrl: "https://via.placeholder.com/300x300.png?text=Neon+Tokyo",
				audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3",
				plays: Math.floor(Math.random() * 5000),
				duration: 39, // 0:39
				genre: "Electronic",
			},
			{
				title: "Purple Sunset",
				artist: "Dream Valley",
				imageUrl: "https://via.placeholder.com/300x300.png?text=Purple+Sunset",
				audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
				plays: Math.floor(Math.random() * 5000),
				duration: 17, // 0:17
				genre: "Indie",
			},
		]);

		// Create albums with references to song IDs
		const albums = [
			{
				title: "Urban Nights",
				artist: "Various Artists",
				imageUrl: "/albums/1.jpg",
				releaseYear: 2024,
				songs: createdSongs.slice(0, 4).map((song) => song._id),
			},
			{
				title: "Coastal Dreaming",
				artist: "Various Artists",
				imageUrl: "/albums/2.jpg",
				releaseYear: 2024,
				songs: createdSongs.slice(4, 8).map((song) => song._id),
			},
			{
				title: "Midnight Sessions",
				artist: "Various Artists",
				imageUrl: "/albums/3.jpg",
				releaseYear: 2024,
				songs: createdSongs.slice(8, 11).map((song) => song._id),
			},
			{
				title: "Eastern Dreams",
				artist: "Various Artists",
				imageUrl: "/albums/4.jpg",
				releaseYear: 2024,
				songs: createdSongs.slice(11, 14).map((song) => song._id),
			},
		];

		// Insert all albums
		const createdAlbums = await Album.insertMany(albums);

		// Update songs with their album references
		for (let i = 0; i < createdAlbums.length; i++) {
			const album = createdAlbums[i];
			const albumSongs = albums[i].songs;

			await Song.updateMany({ _id: { $in: albumSongs } }, { albumId: album._id });
		}

		console.log("Database seeded successfully!");
	} catch (error) {
		console.error("Error seeding database:", error);
	} finally {
		mongoose.connection.close();
	}
};

seedDatabase();
