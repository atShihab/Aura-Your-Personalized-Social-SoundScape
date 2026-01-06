import mongoose from "mongoose";

export const connectDB = async () => {
	try {
		// Use environment variable or fallback to local MongoDB
		const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/amar_gaan";
		
		console.log("Attempting to connect to MongoDB...");
		const conn = await mongoose.connect(mongoURI, {
			// Add connection options for better stability
			maxPoolSize: 10,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000,
		});
		
		console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
		console.log(`📊 Database: ${conn.connection.name}`);
		
		// Handle connection events
		mongoose.connection.on('error', (err) => {
			console.error('❌ MongoDB connection error:', err);
		});
		
		mongoose.connection.on('disconnected', () => {
			console.log('⚠️  MongoDB disconnected');
		});
		
	} catch (error) {
		console.log("❌ Failed to connect to MongoDB:", error.message);
		
		// Don't exit the process, just log the error
		// This allows the app to continue running for demo purposes
		console.log("💡 Tip: Make sure MongoDB is running locally or set MONGODB_URI environment variable");
		console.log("🔧 For local development, run: brew services start mongodb-community");
	}
};
