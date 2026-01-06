import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '../../.env') });

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export const uploadToCloudinary = async (filePath, folder = "general") => {
	try {
		console.log("Cloudinary upload - filePath:", filePath);
		console.log("Cloudinary upload - folder:", folder);
		console.log("Cloudinary config:", {
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY ? "SET" : "NOT SET",
			api_secret: process.env.CLOUDINARY_API_SECRET ? "SET" : "NOT SET"
		});
		
		const result = await cloudinary.uploader.upload(filePath, {
			folder: folder,
			resource_type: "auto",
		});
		console.log("Cloudinary upload successful:", result.secure_url);
		return result.secure_url;
	} catch (error) {
		console.error("Error uploading to Cloudinary:", error);
		console.error("Error details:", error.message);
		throw error;
	}
};
