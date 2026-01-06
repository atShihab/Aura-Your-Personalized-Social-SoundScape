import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
	ArrowLeft, 
	Upload, 
	X, 
	Loader2, 
	Save,
	User,
	Music,
	Globe,
	Instagram,
	Twitter,
	Youtube
} from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import { navigateToProfile } from "@/lib/profileUrl";
import toast from "react-hot-toast";

const GENRES = [
	'Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 
	'Country', 'R&B', 'Folk', 'Metal', 'Punk', 'Blues', 'Reggae', 
	'Indie', 'Alternative', 'EDM', 'Trap', 'Lo-Fi', 'Ambient', 'Other'
];

const EditProfilePage = () => {
	const navigate = useNavigate();
	const { user: currentUser } = useUser();
	const [isLoading, setIsLoading] = useState(false);
	const [profileImage, setProfileImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>("");
	
	const [formData, setFormData] = useState({
		fullName: "",
		handle: "",
		bio: "",
		favoriteGenres: [] as string[],
		socialMedia: {
			instagram: "",
			twitter: "",
			youtube: "",
			tiktok: "",
			website: ""
		}
	});

	useEffect(() => {
		if (currentUser) {
			fetchCurrentProfile();
		}
	}, [currentUser]);

	const fetchCurrentProfile = async () => {
		try {
			const response = await axiosInstance.get(`/users/profile/${currentUser?.id}`);
			const profile = response.data.user;
			
			setFormData({
				fullName: profile.fullName || "",
				handle: profile.handle || "",
				bio: profile.bio || "",
				favoriteGenres: profile.favoriteGenres || [],
				socialMedia: {
					instagram: profile.socialMedia?.instagram || "",
					twitter: profile.socialMedia?.twitter || "",
					youtube: profile.socialMedia?.youtube || "",
					tiktok: profile.socialMedia?.tiktok || "",
					website: profile.socialMedia?.website || ""
				}
			});
		} catch (error) {
			console.error("Error fetching profile:", error);
			toast.error("Failed to load profile data");
		}
	};

	const handleInputChange = (field: string, value: string) => {
		if (field.includes('.')) {
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

	const handleGenreToggle = (genre: string) => {
		setFormData(prev => ({
			...prev,
			favoriteGenres: prev.favoriteGenres.includes(genre)
				? prev.favoriteGenres.filter(g => g !== genre)
				: [...prev.favoriteGenres, genre]
		}));
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log("🚀 Form submission started");
		setIsLoading(true);

		try {
			// Basic validation
			if (!formData.fullName.trim()) {
				toast.error("Full name is required");
				setIsLoading(false);
				return;
			}

			const submitData = new FormData();
			
			// Add form data with proper validation
			submitData.append("fullName", formData.fullName.trim());
			submitData.append("handle", formData.handle.trim());
			submitData.append("bio", formData.bio.trim());
			submitData.append("favoriteGenres", JSON.stringify(formData.favoriteGenres));
			submitData.append("socialMedia", JSON.stringify(formData.socialMedia));
			
			// Add image if selected
			if (profileImage) {
				console.log("📸 Adding image to form data:", profileImage.name, profileImage.size);
				submitData.append("profileImage", profileImage);
			} else {
				console.log("📸 No image selected");
			}

			// Debug: Log form data
			console.log("📝 Form data being submitted:", {
				fullName: formData.fullName,
				handle: formData.handle,
				bio: formData.bio,
				favoriteGenres: formData.favoriteGenres,
				socialMedia: formData.socialMedia,
				hasImage: !!profileImage
			});

			// Debug: Log FormData contents
			for (let [key, value] of submitData.entries()) {
				console.log(`📋 FormData: ${key} =`, value);
			}

			console.log("🌐 Making API request to /users/profile");
			
			let response;
			if (profileImage) {
				// Use FormData for multipart upload with image
				response = await axiosInstance.put("/users/profile", submitData, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				});
			} else {
				// Use JSON for text-only data
				const jsonData = {
					fullName: formData.fullName.trim(),
					handle: formData.handle.trim(),
					bio: formData.bio.trim(),
					favoriteGenres: formData.favoriteGenres,
					socialMedia: formData.socialMedia
				};
				console.log("📤 Sending JSON data:", jsonData);
				response = await axiosInstance.put("/users/profile", jsonData, {
					headers: {
						"Content-Type": "application/json",
					},
				});
			}

			console.log("✅ Profile update response:", response.data);
			toast.success("Profile updated successfully!");
			navigateToProfile(navigate, { clerkId: currentUser?.id || '' });
		} catch (error: any) {
			console.error("❌ Error updating profile:", error);
			console.error("❌ Error response:", error.response?.data);
			console.error("❌ Error status:", error.response?.status);
			console.error("❌ Error message:", error.message);
			
			// More specific error handling
			if (error.message === "Unexpected end of form") {
				toast.error("Form submission error. Please try again.");
			} else if (error.response?.status === 401) {
				toast.error("Authentication required. Please log in again.");
			} else {
				toast.error(error.response?.data?.message || "Failed to update profile");
			}
		} finally {
			setIsLoading(false);
		}
	};

	if (!currentUser) {
		return (
			<div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
				<div className="text-center">
					<h3 className="text-white text-xl font-bold mb-2">Authentication Required</h3>
					<p className="text-zinc-400 text-sm mb-4">Please sign in to edit your profile</p>
					<Button onClick={() => navigate("/login")} variant="outline">
						Sign In
					</Button>
				</div>
			</div>
		);
	}

	return (
		<main className="rounded-md overflow-hidden h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
			{/* Header */}
			<div className="p-3 sm:p-4 md:p-6 border-b border-zinc-800">
				<div className="flex items-center justify-between">
					<Button
						variant="ghost"
						onClick={() => navigate(-1)}
						className="text-zinc-400 hover:text-white hover:bg-zinc-800/50"
					>
						<ArrowLeft className="size-4 mr-2" />
						Back
					</Button>
					
					<h1 className="text-xl font-bold text-white">Edit Profile</h1>
					
					<Button
						type="submit"
						form="edit-profile-form"
						disabled={isLoading}
						className="flex items-center gap-2"
					>
						{isLoading ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Save className="size-4" />
						)}
						Save Changes
					</Button>
				</div>
			</div>

			<ScrollArea className="h-[calc(100vh-180px)]">
				<div className="p-3 sm:p-4 md:p-6">
				<form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-8">
					{/* Profile Image Section */}
					<Card className="bg-zinc-800/50 border-zinc-700">
						<CardHeader>
							<CardTitle className="text-white">Profile Picture</CardTitle>
							<CardDescription className="text-zinc-400">
								Upload a new profile picture
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex items-center gap-6">
								<div className="relative">
									<Avatar className="w-24 h-24 border-4 border-zinc-700">
										<AvatarImage 
											src={imagePreview || currentUser.imageUrl} 
											alt="Profile preview" 
										/>
										<AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600">
											{formData.fullName.charAt(0) || currentUser.firstName?.charAt(0)}
										</AvatarFallback>
									</Avatar>
									
									{imagePreview && (
										<Button
											type="button"
											variant="destructive"
											size="icon"
											className="absolute -top-2 -right-2 size-6"
											onClick={removeImage}
										>
											<X className="size-3" />
										</Button>
									)}
								</div>
								
								<div className="flex-1">
									<Label htmlFor="profile-image" className="text-zinc-300">
										Choose Image
									</Label>
									<div className="mt-2">
										<Input
											id="profile-image"
											type="file"
											accept="image/*"
											onChange={handleImageUpload}
											className="hidden"
										/>
										<Button
											type="button"
											variant="outline"
											onClick={() => document.getElementById('profile-image')?.click()}
											className="flex items-center gap-2"
										>
											<Upload className="size-4" />
											Upload Image
										</Button>
									</div>
									<p className="text-zinc-500 text-sm mt-2">
										JPG, PNG or GIF. Max size 5MB.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Basic Information */}
					<Card className="bg-zinc-800/50 border-zinc-700">
						<CardHeader>
							<CardTitle className="text-white flex items-center gap-2">
								<User className="size-5" />
								Basic Information
							</CardTitle>
							<CardDescription className="text-zinc-400">
								Update your basic profile information
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="fullName" className="text-zinc-300">Full Name *</Label>
								<Input
									id="fullName"
									value={formData.fullName}
									onChange={(e) => handleInputChange("fullName", e.target.value)}
									placeholder="Enter your full name"
									required
									className="mt-1 bg-zinc-700 border-zinc-600 text-white"
								/>
							</div>
							
							<div>
								<Label htmlFor="handle" className="text-zinc-300">Handle</Label>
								<div className="relative mt-1">
									<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400">@</span>
									<Input
										id="handle"
										value={formData.handle.replace('@', '')}
										onChange={(e) => {
											const value = e.target.value.replace('@', '').replace(/\s/g, '');
											handleInputChange("handle", value);
										}}
										placeholder="username"
										className="pl-8 bg-zinc-700 border-zinc-600 text-white"
									/>
								</div>
								<p className="text-zinc-500 text-sm mt-1">
									Your unique username (no spaces, @ will be added automatically)
								</p>
							</div>
							
							<div>
								<Label htmlFor="bio" className="text-zinc-300">Bio</Label>
								<Textarea
									id="bio"
									value={formData.bio}
									onChange={(e) => handleInputChange("bio", e.target.value)}
									placeholder="Tell us about yourself..."
									className="mt-1 bg-zinc-700 border-zinc-600 text-white"
									rows={4}
									maxLength={500}
								/>
								<p className="text-zinc-500 text-sm mt-1">
									{formData.bio.length}/500 characters
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Music Preferences */}
					<Card className="bg-zinc-800/50 border-zinc-700">
						<CardHeader>
							<CardTitle className="text-white flex items-center gap-2">
								<Music className="size-5" />
								Music Preferences
							</CardTitle>
							<CardDescription className="text-zinc-400">
								Select your favorite music genres
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-2">
								{GENRES.map((genre) => (
									<Badge
										key={genre}
										variant={formData.favoriteGenres.includes(genre) ? "default" : "outline"}
										className="cursor-pointer hover:bg-zinc-600"
										onClick={() => handleGenreToggle(genre)}
									>
										{genre}
									</Badge>
								))}
							</div>
							<p className="text-zinc-500 text-sm mt-3">
								Selected: {formData.favoriteGenres.length} genres
							</p>
						</CardContent>
					</Card>

					{/* Social Media */}
					<Card className="bg-zinc-800/50 border-zinc-700">
						<CardHeader>
							<CardTitle className="text-white flex items-center gap-2">
								<Globe className="size-5" />
								Social Media
							</CardTitle>
							<CardDescription className="text-zinc-400">
								Add your social media links
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="instagram" className="text-zinc-300 flex items-center gap-2">
										<Instagram className="size-4" />
										Instagram
									</Label>
									<Input
										id="instagram"
										value={formData.socialMedia.instagram}
										onChange={(e) => handleInputChange("socialMedia.instagram", e.target.value)}
										placeholder="https://instagram.com/username"
										className="mt-1 bg-zinc-700 border-zinc-600 text-white"
									/>
								</div>
								
								<div>
									<Label htmlFor="twitter" className="text-zinc-300 flex items-center gap-2">
										<Twitter className="size-4" />
										Twitter
									</Label>
									<Input
										id="twitter"
										value={formData.socialMedia.twitter}
										onChange={(e) => handleInputChange("socialMedia.twitter", e.target.value)}
										placeholder="https://twitter.com/username"
										className="mt-1 bg-zinc-700 border-zinc-600 text-white"
									/>
								</div>
								
								<div>
									<Label htmlFor="youtube" className="text-zinc-300 flex items-center gap-2">
										<Youtube className="size-4" />
										YouTube
									</Label>
									<Input
										id="youtube"
										value={formData.socialMedia.youtube}
										onChange={(e) => handleInputChange("socialMedia.youtube", e.target.value)}
										placeholder="https://youtube.com/@channel"
										className="mt-1 bg-zinc-700 border-zinc-600 text-white"
									/>
								</div>
								
								<div>
									<Label htmlFor="website" className="text-zinc-300 flex items-center gap-2">
										<Globe className="size-4" />
										Website
									</Label>
									<Input
										id="website"
										value={formData.socialMedia.website}
										onChange={(e) => handleInputChange("socialMedia.website", e.target.value)}
										placeholder="https://yourwebsite.com"
										className="mt-1 bg-zinc-700 border-zinc-600 text-white"
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				</form>
				</div>
			</ScrollArea>
		</main>
	);
};

export default EditProfilePage;
