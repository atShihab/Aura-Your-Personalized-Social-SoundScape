import multer from "multer";

// Error handling middleware for multer
export const handleMulterError = (err, req, res, next) => {
	if (err instanceof multer.MulterError) {
		console.error("=== MULTER ERROR ===");
		console.error("Error code:", err.code);
		console.error("Error message:", err.message);
		console.error("Error field:", err.field);
		
		if (err.code === 'LIMIT_FILE_SIZE') {
			return res.status(400).json({ 
				message: "File too large. Maximum size is 50MB.",
				error: err.message 
			});
		} else if (err.code === 'LIMIT_FILE_COUNT') {
			return res.status(400).json({ 
				message: "Too many files uploaded.",
				error: err.message 
			});
		} else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
			return res.status(400).json({ 
				message: "Unexpected file field.",
				error: err.message 
			});
		}
		
		return res.status(400).json({ 
			message: "File upload error: " + err.message,
			error: err.message 
		});
	} else if (err) {
		console.error("=== OTHER ERROR ===");
		console.error("Error:", err);
		return res.status(500).json({ 
			message: "Unexpected error: " + err.message,
			error: err.message 
		});
	}
	next();
};
