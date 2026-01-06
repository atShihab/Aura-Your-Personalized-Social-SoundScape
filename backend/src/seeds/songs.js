import mongoose from "mongoose";
import { Song } from "../models/song.model.js";
import { config } from "dotenv";

config();

const songs = [
	{
		title: "Stay With Me",
		artist: "Sarah Mitchell",
		imageUrl: "https://via.placeholder.com/300x300.png?text=Stay+With+Me",
		audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
		duration: 46, // 0:46
		genre: "Pop",
	},
	{
		title: "Midnight Drive",
		artist: "The Wanderers",
		imageUrl: "https://via.placeholder.com/300x300.png?text=Midnight+Drive",
		audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
		duration: 41, // 0:41
		genre: "Rock",
	},
	{
		title: "Lost in Tokyo",
		artist: "Electric Dreams",
		imageUrl: "https://via.placeholder.com/300x300.png?text=Lost+in+Tokyo",
		audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
		duration: 24, // 0:24
		genre: "Electronic",
	},
	{
		title: "Summer Daze",
		artist: "Coastal Kids",
		imageUrl: "https://via.placeholder.com/300x300.png?text=Summer+Daze",
		audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
		duration: 24, // 0:24
		genre: "Pop",
	},
	{
		title: "Neon Lights",
		artist: "Night Runners",
		imageUrl: "https://via.placeholder.com/300x300.png?text=Neon+Lights",
		audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
		duration: 36, // 0:36
		genre: "Electronic",
	},
	{
		title: "Mountain High",
		artist: "The Wild Ones",
		imageUrl: "https://via.placeholder.com/300x300.png?text=Mountain+High",
		audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
		duration: 40, // 0:40
		genre: "Rock",
	},
	{
		title: "City Rain",
		artist: "Urban Echo",
		imageUrl: "https://via.placeholder.com/300x300.png?text=City+Rain",
		audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
		duration: 39, // 0:39
		genre: "Indie",
	},
	{
		title: "Desert Wind",
		artist: "Sahara Sons",
		imageUrl: "https://via.placeholder.com/300x300.png?text=Desert+Wind",
		audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
		duration: 28, // 0:28
		genre: "Folk",
	},
	{
		title: "Ocean Waves",
		artist: "Coastal Drift",
		imageUrl: "https://via.placeholder.com/300x300.png?text=Ocean+Waves",
		audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
		duration: 28, // 0:28
		genre: "Ambient",
	},
	{
		title: "Starlight",
		artist: "Luna Bay",
		imageUrl: "https://via.placeholder.com/300x300.png?text=Starlight",
		audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
		duration: 30, // 0:30
		genre: "Indie",
	},
	{
		title: "Winter Dreams",
		artist: "Arctic Pulse",
		imageUrl: "https://via.placeholder.com/300x300.png?text=Winter+Dreams",
		audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
		duration: 29, // 0:29
		genre: "Ambient",
	},
	{
		title: "Purple Sunset",
		artist: "Dream Valley",
		imageUrl: "https://via.placeholder.com/300x300.png?text=Purple+Sunset",
		audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
		duration: 17, // 0:17
		genre: "Indie",
	},
	{
		title: "Neon Dreams",
		artist: "Cyber Pulse",
		imageUrl: "https://via.placeholder.com/300x300.png?text=Neon+Dreams",
		audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
		duration: 39, // 0:39
		genre: "Electronic",
	},
	{
		title: "Moonlight Dance",
		artist: "Silver Shadows",
		imageUrl: "https://via.placeholder.com/300x300.png?text=Moonlight+Dance",
		audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
		duration: 27, // 0:27
		genre: "Jazz",
	},
	{
		title: "Urban Jungle",
		artist: "City Lights",
		imageUrl: "https://via.placeholder.com/300x300.png?text=Urban+Jungle",
		audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
		duration: 36, // 0:36
		genre: "Electronic",
	},
	{
		title: "Crystal Rain",
		artist: "Echo Valley",
		imageUrl: "https://via.placeholder.com/300x300.png?text=Crystal+Rain",
		audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
		duration: 39, // 0:39
		genre: "Ambient",
	},
	{
		title: "Neon Tokyo",
		artist: "Future Pulse",
		imageUrl: "https://via.placeholder.com/300x300.png?text=Neon+Tokyo",
		audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3",
		duration: 39, // 0:39
		genre: "Electronic",
	},
	{
		title: "Midnight Blues",
		artist: "Jazz Cats",
		imageUrl: "https://via.placeholder.com/300x300.png?text=Midnight+Blues",
		audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-18.mp3",
		duration: 29, // 0:29
		genre: "Blues",
	},
];

const seedSongs = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI);

		// Clear existing songs
		await Song.deleteMany({});

		// Insert new songs
		await Song.insertMany(songs);

		console.log("Songs seeded successfully!");
	} catch (error) {
		console.error("Error seeding songs:", error);
	} finally {
		mongoose.connection.close();
	}
};

seedSongs();
