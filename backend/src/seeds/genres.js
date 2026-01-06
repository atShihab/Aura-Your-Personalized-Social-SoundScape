import mongoose from "mongoose";
import { Genre } from "../models/genre.model.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const genres = [
	{
		name: "Pop",
		description: "Popular music characterized by catchy melodies and broad appeal",
		color: "#FF6B9D",
		tags: ["mainstream", "catchy", "radio-friendly"],
		moods: ["Happy", "Energetic", "Excited", "Confident"]
	},
	{
		name: "Rock",
		description: "Guitar-driven music with strong rhythms and powerful vocals",
		color: "#FF4757",
		tags: ["guitar", "powerful", "energetic"],
		moods: ["Energetic", "Confident", "Intense", "Passionate"]
	},
	{
		name: "Hip-Hop",
		description: "Rhythmic music with spoken word delivery and electronic beats",
		color: "#A55EEA",
		tags: ["rap", "beats", "urban"],
		moods: ["Confident", "Energetic", "Intense", "Playful"]
	},
	{
		name: "Electronic",
		description: "Music created using electronic instruments and digital technology",
		color: "#26DE81",
		tags: ["digital", "synthetic", "dance"],
		moods: ["Energetic", "Excited", "Chill", "Dreamy"]
	},
	{
		name: "Jazz",
		description: "Improvisational music with complex harmonies and swing rhythms",
		color: "#FED330",
		tags: ["improvisation", "sophisticated", "smooth"],
		moods: ["Chill", "Reflective", "Calm", "Passionate"]
	},
	{
		name: "Classical",
		description: "Traditional orchestral and instrumental music",
		color: "#45AAF2",
		tags: ["orchestral", "traditional", "sophisticated"],
		moods: ["Peaceful", "Reflective", "Calm", "Dreamy"]
	},
	{
		name: "Country",
		description: "American folk music with storytelling lyrics and acoustic instruments",
		color: "#FD79A8",
		tags: ["folk", "storytelling", "acoustic"],
		moods: ["Nostalgic", "Reflective", "Peaceful", "Romantic"]
	},
	{
		name: "R&B",
		description: "Rhythm and blues with soulful vocals and smooth melodies",
		color: "#6C5CE7",
		tags: ["soulful", "smooth", "romantic"],
		moods: ["Romantic", "Passionate", "Chill", "Reflective"]
	},
	{
		name: "Folk",
		description: "Traditional music passed down through generations",
		color: "#00B894",
		tags: ["traditional", "acoustic", "storytelling"],
		moods: ["Peaceful", "Nostalgic", "Reflective", "Calm"]
	},
	{
		name: "Metal",
		description: "Heavy, aggressive music with distorted guitars and powerful vocals",
		color: "#2D3436",
		tags: ["heavy", "aggressive", "intense"],
		moods: ["Intense", "Angry", "Dark", "Confident"]
	},
	{
		name: "Punk",
		description: "Fast, aggressive music with anti-establishment themes",
		color: "#E17055",
		tags: ["aggressive", "rebellious", "fast"],
		moods: ["Angry", "Intense", "Confident", "Playful"]
	},
	{
		name: "Blues",
		description: "Emotional music with soulful vocals and expressive guitar",
		color: "#74B9FF",
		tags: ["emotional", "soulful", "expressive"],
		moods: ["Sad", "Melancholic", "Passionate", "Reflective"]
	},
	{
		name: "Reggae",
		description: "Jamaican music with offbeat rhythms and positive messages",
		color: "#00B894",
		tags: ["jamaican", "positive", "rhythmic"],
		moods: ["Chill", "Peaceful", "Happy", "Calm"]
	},
	{
		name: "Indie",
		description: "Independent music with alternative and experimental sounds",
		color: "#A29BFE",
		tags: ["independent", "alternative", "experimental"],
		moods: ["Reflective", "Dreamy", "Melancholic", "Playful"]
	},
	{
		name: "Alternative",
		description: "Non-mainstream rock music with diverse influences",
		color: "#FD79A8",
		tags: ["non-mainstream", "diverse", "experimental"],
		moods: ["Reflective", "Melancholic", "Intense", "Confident"]
	},
	{
		name: "EDM",
		description: "Electronic dance music for clubs and festivals",
		color: "#00CEC9",
		tags: ["dance", "electronic", "festival"],
		moods: ["Energetic", "Excited", "Happy", "Playful"]
	},
	{
		name: "Trap",
		description: "Hip-hop subgenre with heavy bass and electronic elements",
		color: "#6C5CE7",
		tags: ["bass", "electronic", "hip-hop"],
		moods: ["Intense", "Confident", "Energetic", "Dark"]
	},
	{
		name: "Lo-Fi",
		description: "Low-fidelity music with relaxed, atmospheric sounds",
		color: "#A29BFE",
		tags: ["relaxed", "atmospheric", "chill"],
		moods: ["Chill", "Calm", "Peaceful", "Dreamy"]
	},
	{
		name: "Ambient",
		description: "Atmospheric music designed for background listening",
		color: "#74B9FF",
		tags: ["atmospheric", "background", "textural"],
		moods: ["Peaceful", "Calm", "Dreamy", "Reflective"]
	}
];

const seedGenres = async () => {
	try {
		// Connect to MongoDB
		const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/amar_gaan";
		await mongoose.connect(mongoURI);
		console.log("✅ Connected to MongoDB");

		// Clear existing genres
		await Genre.deleteMany({});
		console.log("🗑️  Cleared existing genres");

		// Insert new genres
		const createdGenres = await Genre.insertMany(genres);
		console.log(`✅ Created ${createdGenres.length} genres`);

		// Log created genres
		createdGenres.forEach(genre => {
			console.log(`📝 Created genre: ${genre.name} (${genre.color})`);
		});

		console.log("🎉 Genre seeding completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("❌ Error seeding genres:", error);
		process.exit(1);
	}
};

// Run the seeder
seedGenres();
