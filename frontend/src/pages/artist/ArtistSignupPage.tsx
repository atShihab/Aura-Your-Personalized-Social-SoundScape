import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useUser } from "@clerk/clerk-react"; // Corrected hook
import { Music, Mic, Upload, X, Loader2, FileText, ArrowLeft } from "lucide-react"; // Added Loader2
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

const GENRES = [
	"Pop",
	"Rock",
	"Hip-Hop",
	"Electronic",
	"Jazz",
	"Classical",
	"Country",
	"R&B",
	"Folk",
	"Metal",
	"Punk",
	"Blues",
	"Reggae",
	"Other",
];

const ArtistSignupPage = () => {
	const { user } = useUser(); // Corrected hook
	const navigate = useNavigate();
	
	// Helper function to validate URLs
	const isValidUrl = (url: string) => {
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	};
	const [formData, setFormData] = useState({
		artistName: "",
		fullName: "", // Added fullName
		genre: "",
		bio: "",
		socialMedia: {
			instagram: "",
			twitter: "",
			youtube: "",
			tiktok: "",
			website: "",
		},
	});
	const [profileImage, setProfileImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>("");
	const [artistDocuments, setArtistDocuments] = useState<File[]>([]);
	const [documentPreviews, setDocumentPreviews] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingProfile, setIsLoadingProfile] = useState(true);
	const [error, setError] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);

	// Load existing artist profile if user is already an artist
	useEffect(() => {
		const loadArtistProfile = async () => {
			if (!user) return;
			
			try {
				const response = await axiosInstance.get("/artists/profile");
				const artistData = response.data.artist;
				
				if (artistData) {
					setFormData({
						artistName: artistData.artistName || "",
						fullName: artistData.fullName || user.fullName || "",
						genre: artistData.genre || "",
						bio: artistData.bio || "",
						socialMedia: artistData.socialMedia || {
							instagram: "",
							twitter: "",
							youtube: "",
							tiktok: "",
							website: "",
						},
					});
					setImagePreview(artistData.imageUrl || "");
					setIsEditMode(true);
				} else {
					// New artist signup
					setFormData(prev => ({
						...prev,
						fullName: user.fullName || ""
					}));
				}
			} catch (error) {
				// If no artist profile exists, this is a new signup
				setFormData(prev => ({
					...prev,
					fullName: user.fullName || ""
				}));
			} finally {
				setIsLoadingProfile(false);
			}
		};

		loadArtistProfile();
	}, [user]);

	const handleInputChange = (field: string, value: string) => {
		if (field.includes(".")) {
			const [parent, child] = field.split('.');
			setFormData(prev => ({
				...prev,
				[parent]: {
					...(prev[parent as keyof typeof prev] as any || {}),
					[child]: value
				}
			}));
		} else {
			setFormData(prev => ({
				...prev,
				[field]: value
			}));
		}
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) { // 5MB limit
				toast.error("Image size must be less than 5MB");
				return;
			}
			
			setProfileImage(file);
			const reader = new FileReader();
			reader.onload = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const removeImage = () => {
		setProfileImage(null);
		setImagePreview("");
	};

	const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		const validFiles = files.filter(file => {
			if (file.size > 10 * 1024 * 1024) { // 10MB limit
				toast.error(`${file.name} is too large. Maximum size is 10MB.`);
				return false;
			}
			return true;
		});

		setArtistDocuments(prev => [...prev, ...validFiles]);
		
		// Create previews for new documents
		validFiles.forEach(file => {
			const reader = new FileReader();
			reader.onload = () => {
				setDocumentPreviews(prev => [...prev, reader.result as string]);
			};
			reader.readAsDataURL(file);
		});
	};

	const removeDocument = (index: number) => {
		setArtistDocuments(prev => prev.filter((_, i) => i !== index));
		setDocumentPreviews(prev => prev.filter((_, i) => i !== index));
	};

	const validateForm = () => {
		if (!formData.artistName.trim()) {
			toast.error("Artist name is required");
			return false;
		}
		if (!formData.fullName.trim()) {
			toast.error("Full name is required");
			return false;
		}
		if (!formData.genre) {
			toast.error("Please select a genre");
			return false;
		}

		// Validate social media URLs
		const socialMediaFields = ['instagram', 'twitter', 'youtube', 'tiktok', 'website'];
		for (const field of socialMediaFields) {
			const url = formData.socialMedia[field as keyof typeof formData.socialMedia];
			if (url && !isValidUrl(url)) {
				toast.error(`Please enter a valid ${field} URL`);
				return false;
			}
		}

		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		if (!validateForm()) {
			setIsLoading(false);
			return;
		}

		try {
			// Create FormData for image upload
			const submitData = new FormData();
			submitData.append("artistName", formData.artistName.trim());
			submitData.append("fullName", formData.fullName.trim());
			submitData.append("genre", formData.genre);
			submitData.append("bio", formData.bio.trim());
			
			// Add social media as JSON string to avoid form data parsing issues
			submitData.append("socialMedia", JSON.stringify(formData.socialMedia));

			if (profileImage) {
				submitData.append("profileImage", profileImage);
			}

			// Add documents
			artistDocuments.forEach((doc, index) => {
				submitData.append(`artistDocuments`, doc);
			});

			console.log("📤 Submitting form data:", {
				artistName: formData.artistName.trim(),
				fullName: formData.fullName.trim(),
				genre: formData.genre,
				bio: formData.bio.trim(),
				socialMedia: formData.socialMedia,
				hasImage: !!profileImage,
				documentCount: artistDocuments.length
			});

			const response = await axiosInstance.post("/artists/profile", submitData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				timeout: 30000, // 30 second timeout
			});

			if (isEditMode) {
				toast.success("Artist profile updated successfully!");
			} else {
				toast.success("Artist application submitted successfully! You'll be notified once your application is reviewed.");
			}
			setIsSubmitted(true);
		} catch (err: any) {
			console.error("Artist application error:", err);
			const errorMessage = err.response?.data?.message || "Failed to submit artist application";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoadingProfile) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
				<Card className="w-full max-w-md bg-zinc-800/50 border-zinc-700 shadow-2xl">
					<CardContent className="text-center pt-6">
						<Loader2 className="size-12 text-blue-500 animate-spin mx-auto mb-4" />
						<h3 className="text-white text-xl font-bold mb-2">Loading Profile</h3>
						<p className="text-zinc-400 text-sm">Please wait...</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isSubmitted) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
				<Card className="w-full max-w-md bg-zinc-800/50 border-zinc-700 shadow-2xl">
					<CardContent className="text-center pt-6">
						<div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
							<Music className="size-8 text-white" />
						</div>
						<h3 className="text-white text-xl font-bold mb-2">
							{isEditMode ? "Profile Updated!" : "Application Submitted!"}
						</h3>
						<p className="text-zinc-400 text-sm mb-6">
							{isEditMode 
								? "Your artist profile has been updated successfully."
								: "Your artist application has been submitted successfully. You'll be notified once your application is reviewed."
							}
						</p>
						<div className="space-y-3">
							<Button onClick={() => navigate("/")} className="w-full">
								Go to Home
							</Button>
							{!isEditMode && (
								<Button 
									variant="outline" 
									onClick={() => navigate("/artist/verification")} 
									className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-700"
								>
									Check Verification Status
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
			{/* Back Button */}
			<div className="p-4">
				<Button
					variant="ghost"
					onClick={() => navigate(-1)}
					className="text-zinc-400 hover:text-white hover:bg-zinc-800/50"
				>
					<ArrowLeft className="size-4 mr-2" />
					Back
				</Button>
			</div>

			<div className="max-w-sm sm:max-w-md md:max-w-4xl mx-auto px-4 pb-8">
				<Card className="bg-zinc-800/50 border-zinc-700 shadow-2xl">
					<CardHeader className="text-center">
						<div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
							<Mic className="size-6 sm:size-8 text-white" />
						</div>
						<CardTitle className="text-xl sm:text-2xl font-bold text-white">
							{isEditMode ? "Edit Artist Profile" : "Join as Artist"}
						</CardTitle>
						<CardDescription className="text-zinc-400 text-sm sm:text-base">
							{isEditMode 
								? "Update your artist profile information"
								: "Create your artist profile and get verified on Aura"
							}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Basic Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-white">Basic Information</h3>
								
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-zinc-300 mb-2">
											Full Name *
										</label>
										<Input
											type="text"
											value={formData.fullName}
											onChange={(e) => handleInputChange("fullName", e.target.value)}
											placeholder="Your full name"
											className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-500"
											required
										/>
									</div>
									
									<div>
										<label className="block text-sm font-medium text-zinc-300 mb-2">
											Artist Name *
										</label>
										<Input
											type="text"
											value={formData.artistName}
											onChange={(e) => handleInputChange("artistName", e.target.value)}
											placeholder="Your stage name"
											className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-500"
											required
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-zinc-300 mb-2">
										Genre *
									</label>
									<select
										value={formData.genre}
										onChange={(e) => handleInputChange("genre", e.target.value)}
										className="w-full bg-zinc-700 border border-zinc-600 text-white rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
										required
									>
										<option value="">Select a genre</option>
										{GENRES.map((genre) => (
											<option key={genre} value={genre}>
												{genre}
											</option>
										))}
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-zinc-300 mb-2">
										Bio
									</label>
									<textarea
										value={formData.bio}
										onChange={(e) => handleInputChange("bio", e.target.value)}
										placeholder="Tell us about yourself and your music..."
										rows={4}
										className="w-full bg-zinc-700 border border-zinc-600 text-white rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 placeholder:text-zinc-500"
									/>
								</div>
							</div>

							{/* Profile Image */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-white">Profile Image</h3>
								
								<div className="flex items-center gap-4">
									<div className="relative">
										{imagePreview ? (
											<div className="relative">
												<img
													src={imagePreview}
													alt="Profile preview"
													className="w-24 h-24 rounded-full object-cover border-2 border-zinc-600"
												/>
												<button
													type="button"
													onClick={removeImage}
													className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
												>
													<X className="size-4" />
												</button>
											</div>
										) : (
											<div className="w-24 h-24 bg-zinc-700 rounded-full flex items-center justify-center border-2 border-dashed border-zinc-600">
												<Upload className="size-8 text-zinc-400" />
											</div>
										)}
									</div>
									
									<div className="flex-1">
										<label className="block text-sm font-medium text-zinc-300 mb-2">
											Upload Profile Image
										</label>
										<input
											type="file"
											accept="image/*"
											onChange={handleImageUpload}
											className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
										/>
										<p className="text-xs text-zinc-500 mt-1">
											Recommended: Square image, max 5MB
										</p>
									</div>
								</div>
							</div>

							{/* Social Media Links */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-white">Social Media Links</h3>
								
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-zinc-300 mb-2">
											Instagram
										</label>
										<Input
											type="url"
											value={formData.socialMedia.instagram}
											onChange={(e) => handleInputChange("socialMedia.instagram", e.target.value)}
											placeholder="https://instagram.com/yourusername"
											className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-500"
										/>
									</div>
									
									<div>
										<label className="block text-sm font-medium text-zinc-300 mb-2">
											Twitter
										</label>
										<Input
											type="url"
											value={formData.socialMedia.twitter}
											onChange={(e) => handleInputChange("socialMedia.twitter", e.target.value)}
											placeholder="https://twitter.com/yourusername"
											className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-500"
										/>
									</div>
									
									<div>
										<label className="block text-sm font-medium text-zinc-300 mb-2">
											YouTube
										</label>
										<Input
											type="url"
											value={formData.socialMedia.youtube}
											onChange={(e) => handleInputChange("socialMedia.youtube", e.target.value)}
											placeholder="https://youtube.com/@yourchannel"
											className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-500"
										/>
									</div>
									
									<div>
										<label className="block text-sm font-medium text-zinc-300 mb-2">
											TikTok
										</label>
										<Input
											type="url"
											value={formData.socialMedia.tiktok}
											onChange={(e) => handleInputChange("socialMedia.tiktok", e.target.value)}
											placeholder="https://tiktok.com/@yourusername"
											className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-500"
										/>
									</div>
									
									<div className="md:col-span-2">
										<label className="block text-sm font-medium text-zinc-300 mb-2">
											Website
										</label>
										<Input
											type="url"
											value={formData.socialMedia.website}
											onChange={(e) => handleInputChange("socialMedia.website", e.target.value)}
											placeholder="https://yourwebsite.com"
											className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-500"
										/>
									</div>
								</div>
							</div>

							{/* Supporting Documents */}
							{!isEditMode && (
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-white">Supporting Documents (Optional)</h3>
									<p className="text-sm text-zinc-400">
										Upload documents that help verify your identity as an artist (e.g., music releases, press coverage, etc.)
									</p>
									
									<div>
										<label className="block text-sm font-medium text-zinc-300 mb-2">
											Upload Documents
										</label>
										<input
											type="file"
											multiple
											accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
											onChange={handleDocumentUpload}
											className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
										/>
										<p className="text-xs text-zinc-500 mt-1">
											Accepted formats: PDF, DOC, DOCX, JPG, PNG. Max 10MB per file.
										</p>
									</div>

									{artistDocuments.length > 0 && (
										<div className="space-y-2">
											<h4 className="text-sm font-medium text-zinc-300">Uploaded Documents:</h4>
											{artistDocuments.map((doc, index) => (
												<div key={index} className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg">
													<div className="flex items-center gap-3">
														<FileText className="size-5 text-blue-400" />
														<span className="text-sm text-white">{doc.name}</span>
													</div>
													<button
														type="button"
														onClick={() => removeDocument(index)}
														className="text-red-400 hover:text-red-300"
													>
														<X className="size-4" />
													</button>
												</div>
											))}
										</div>
									)}
								</div>
							)}

							{/* Error Message */}
							{error && (
								<div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
									<p className="text-red-400 text-sm">{error}</p>
								</div>
							)}

							{/* Submit Button */}
							<div className="flex gap-4">
								<Button
									type="submit"
									disabled={isLoading}
									className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold rounded-lg"
								>
									{isLoading ? (
										<>
											<Loader2 className="size-5 animate-spin mr-2" />
											{isEditMode ? "Updating..." : "Submitting..."}
										</>
									) : (
										<>
											<Mic className="size-5 mr-2" />
											{isEditMode ? "Update Profile" : "Submit Application"}
										</>
									)}
								</Button>
							</div>

							{/* Terms and Conditions */}
							{!isEditMode && (
								<p className="text-xs text-zinc-500 text-center">
									By submitting this application, you agree to our{" "}
									<Link to="/terms" className="text-blue-400 hover:underline">
										Terms of Service
									</Link>{" "}
									and{" "}
									<Link to="/privacy" className="text-blue-400 hover:underline">
										Privacy Policy
									</Link>
								</p>
							)}
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default ArtistSignupPage;
