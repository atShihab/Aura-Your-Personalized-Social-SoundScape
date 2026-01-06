import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GENRES, MOODS } from "@/lib/constants";
import { Upload, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import ArtistAutocomplete from "@/components/ArtistAutocomplete";
import { axiosInstance } from "@/lib/axios";

interface SongRequest {
	title: string;
	artist: string;
	featuredArtist: string;
	album: string;
	duration: string;
	genre: string;
	mood: string;
	releaseDate: string;
	description: string;
}

interface SongRequestDialogProps {
	type: 'upload' | 'edit' | 'delete';
	trigger: React.ReactNode;
}

const SongRequestDialog = ({ type, trigger }: SongRequestDialogProps) => {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [request, setRequest] = useState<SongRequest>({
		title: "",
		artist: "",
		featuredArtist: "",
		album: "",
		duration: "",
		genre: "",
		mood: "none",
		releaseDate: "",
		description: "",
	});

	const [files, setFiles] = useState<{ audio: File | null; image: File | null }>({
		audio: null,
		image: null,
	});

	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	const audioInputRef = useRef<HTMLInputElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};

		if (!request.title.trim()) {
			newErrors.title = "Title is required";
		}

		// Artist field is only required for edit/delete requests, not for uploads
		if (type !== 'upload' && !request.artist.trim()) {
			newErrors.artist = "Artist is required";
		}

		if (!request.genre) {
			newErrors.genre = "Genre is required";
		}

		if (type === 'upload' || type === 'edit') {
			if (!files.audio) {
				newErrors.audio = "Audio file is required";
			}
			if (!files.image) {
				newErrors.image = "Image file is required";
			}
		}

		if (request.duration && parseFloat(request.duration) <= 0) {
			newErrors.duration = "Duration must be greater than 0";
		}

		// Description is only required for edit/delete requests
		if (type !== 'upload' && !request.description.trim()) {
			newErrors.description = "Description is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			toast.error("Please fix the errors before submitting");
			return;
		}

		setIsLoading(true);

		try {
			const formData = new FormData();
			formData.append("type", `song_${type}`);
			formData.append("title", request.title.trim());
			formData.append("artist", request.artist.trim());
			if (request.featuredArtist.trim()) {
				formData.append("featuredArtist", request.featuredArtist.trim());
			}
			formData.append("duration", request.duration || "0");
			formData.append("genre", request.genre);
			if (request.mood && request.mood !== "none") {
				formData.append("mood", request.mood);
			}
			if (request.album && request.album !== "none") {
				formData.append("albumId", request.album);
			}
			if (request.releaseDate) {
				formData.append("releaseDate", request.releaseDate);
			}
			formData.append("description", request.description.trim());

			if (files.audio) {
				formData.append("audioFile", files.audio);
			}
			if (files.image) {
				formData.append("imageFile", files.image);
			}

			// Submit to backend based on type
			if (type === 'upload') {
				// For upload, use the artist song upload endpoint
				if (!files.audio || !files.image) {
					toast.error("Please upload both audio and image files");
					setIsLoading(false);
					return;
				}

				const uploadFormData = new FormData();
				uploadFormData.append("title", request.title.trim());
				uploadFormData.append("duration", request.duration || "0");
				uploadFormData.append("genre", request.genre);
				if (request.featuredArtist.trim()) {
					uploadFormData.append("featuredArtist", request.featuredArtist.trim());
				}
				if (request.mood && request.mood !== "none") {
					uploadFormData.append("mood", request.mood);
				}
				if (request.album && request.album !== "none") {
					uploadFormData.append("albumId", request.album);
				}
				if (request.releaseDate) {
					uploadFormData.append("releaseDate", request.releaseDate);
				}
				uploadFormData.append("audioFile", files.audio);
				uploadFormData.append("imageFile", files.image);

				const response = await axiosInstance.post("/artists/songs", uploadFormData, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				});

				toast.success(response.data.message || "Song uploaded successfully! It will be reviewed by an admin.");
			} else {
				// For edit/delete requests, keep the request system (can be implemented later)
				console.log("Submitting song request:", {
					type: `song_${type}`,
					title: request.title,
					artist: request.artist,
					description: request.description
				});
				toast.info(`${type === 'edit' ? 'Edit' : 'Delete'} request functionality coming soon!`);
			}

			// Reset form
			setRequest({
				title: "",
				artist: "",
				featuredArtist: "",
				album: "",
				duration: "",
				genre: "",
				mood: "none",
				releaseDate: "",
				description: "",
			});

			setFiles({
				audio: null,
				image: null,
			});

			setErrors({});
			setDialogOpen(false);
			toast.success(`${type === 'upload' ? 'Upload' : type === 'edit' ? 'Edit' : 'Delete'} request submitted successfully!`);
		} catch (error: any) {
			console.error("Error submitting request:", error);
			toast.error("Failed to submit request");
		} finally {
			setIsLoading(false);
		}
	};

	const resetForm = () => {
		setRequest({
			title: "",
			artist: "",
			featuredArtist: "",
			album: "",
			duration: "",
			genre: "",
			mood: "none",
			releaseDate: "",
			description: "",
		});
		setFiles({
			audio: null,
			image: null,
		});
		setErrors({});
	};

	const getDialogTitle = () => {
		switch (type) {
			case 'upload': return 'Song Upload Request';
			case 'edit': return 'Song Edit Request';
			case 'delete': return 'Song Delete Request';
			default: return 'Song Request';
		}
	};

	const getDialogDescription = () => {
		switch (type) {
			case 'upload': return 'Submit a request to upload a new song';
			case 'edit': return 'Submit a request to edit an existing song';
			case 'delete': return 'Submit a request to delete a song';
			default: return 'Submit a song request';
		}
	};

	return (
		<Dialog open={dialogOpen} onOpenChange={(open) => {
			setDialogOpen(open);
			if (!open) {
				resetForm();
			}
		}}>
			<DialogTrigger asChild>
				{trigger}
			</DialogTrigger>

			<DialogContent className='bg-zinc-900 border-zinc-700 max-h-[90vh] overflow-auto w-[95vw] max-w-2xl sm:w-full'>
				<DialogHeader>
					<DialogTitle className="text-lg sm:text-xl">{getDialogTitle()}</DialogTitle>
					<DialogDescription className="text-sm">{getDialogDescription()}</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					{/* Description - Only show for edit/delete requests */}
					{type !== 'upload' && (
						<div className='space-y-2'>
							<label className='text-sm font-medium'>Request Description *</label>
							<Textarea
								value={request.description}
								onChange={(e) => {
									setRequest({ ...request, description: e.target.value });
									if (e.target.value.trim()) {
										setErrors(prev => ({ ...prev, description: "" }));
									}
								}}
								className={`bg-zinc-800 border-zinc-700 ${errors.description ? 'border-red-500' : ''}`}
								placeholder="Describe your request in detail..."
								rows={3}
							/>
							{errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
						</div>
					)}

					{(type === 'upload' || type === 'edit') && (
						<>
							<input
								type='file'
								accept='audio/*'
								ref={audioInputRef}
								hidden
								onChange={(e) => {
									const file = e.target.files?.[0];
									setFiles((prev) => ({ ...prev, audio: file || null }));
									if (file) {
										setErrors(prev => ({ ...prev, audio: "" }));
									}
								}}
							/>

							<input
								type='file'
								ref={imageInputRef}
								className='hidden'
								accept='image/*'
								onChange={(e) => {
									const file = e.target.files?.[0];
									setFiles((prev) => ({ ...prev, image: file || null }));
									if (file) {
										setErrors(prev => ({ ...prev, image: "" }));
									}
								}}
							/>

							{/* Image upload area */}
							<div
								className={`flex items-center justify-center p-4 sm:p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors min-h-[120px] sm:min-h-[150px] ${
									errors.image ? 'border-red-500 bg-red-500/10' : 'border-zinc-700 hover:border-zinc-600'
								}`}
								onClick={() => imageInputRef.current?.click()}
							>
								<div className='text-center px-2'>
									{files.image ? (
										<div className='space-y-2'>
											<div className='text-sm text-emerald-500'>Image selected:</div>
											<div className='text-xs text-zinc-400 break-all'>{files.image.name}</div>
										</div>
									) : (
										<>
											<div className='p-2 sm:p-3 bg-zinc-800 rounded-full inline-block mb-2'>
												<Upload className='h-5 w-5 sm:h-6 sm:w-6 text-zinc-400' />
											</div>
											<div className='text-sm text-zinc-400 mb-2'>Upload artwork</div>
											<Button variant='outline' size='sm' className='text-xs'>
												Choose File
											</Button>
										</>
									)}
								</div>
							</div>
							{errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}

							{/* Audio upload */}
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Audio File *</label>
								<div className='flex items-center gap-2'>
									<Button 
										variant='outline' 
										onClick={() => audioInputRef.current?.click()} 
										className={`w-full ${errors.audio ? 'border-red-500' : ''}`}
									>
										{files.audio ? files.audio.name : "Choose Audio File"}
									</Button>
								</div>
								{errors.audio && <p className="text-red-500 text-sm">{errors.audio}</p>}
							</div>
						</>
					)}

					{/* Title */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Title *</label>
						<Input
							value={request.title}
							onChange={(e) => {
								setRequest({ ...request, title: e.target.value });
								if (e.target.value.trim()) {
									setErrors(prev => ({ ...prev, title: "" }));
								}
							}}
							className={`bg-zinc-800 border-zinc-700 ${errors.title ? 'border-red-500' : ''}`}
							placeholder="Enter song title"
						/>
						{errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
					</div>

					{/* Artist - Only show for edit/delete requests, not for uploads */}
					{type !== 'upload' && (
						<div className='space-y-2'>
							<label className='text-sm font-medium'>Artist *</label>
							<ArtistAutocomplete
								value={request.artist}
								onChange={(value) => {
									setRequest({ ...request, artist: value });
									if (value.trim()) {
										setErrors(prev => ({ ...prev, artist: "" }));
									}
								}}
								placeholder="Search and select artist..."
								className={`bg-zinc-800 border-zinc-700 ${errors.artist ? 'border-red-500' : ''}`}
							/>
							{errors.artist && <p className="text-red-500 text-sm">{errors.artist}</p>}
						</div>
					)}

					{/* Featured Artist */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Featured Artist (Optional)</label>
						<ArtistAutocomplete
							value={request.featuredArtist}
							onChange={(value) => setRequest({ ...request, featuredArtist: value })}
							placeholder="Search and select featured artist..."
							className="bg-zinc-800 border-zinc-700"
						/>
					</div>

					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<label className='text-sm font-medium'>Duration (minutes)</label>
							<Input
								type='number'
								min='0'
								step='0.1'
								value={request.duration}
								onChange={(e) => {
									setRequest({ ...request, duration: e.target.value });
									if (e.target.value && parseFloat(e.target.value) > 0) {
										setErrors(prev => ({ ...prev, duration: "" }));
									}
								}}
								className={`bg-zinc-800 border-zinc-700 ${errors.duration ? 'border-red-500' : ''}`}
								placeholder="e.g., 3.5"
							/>
							{errors.duration && <p className="text-red-500 text-sm">{errors.duration}</p>}
						</div>
						<div className='space-y-2'>
							<label className='text-sm font-medium'>Genre *</label>
							<Select
								value={request.genre}
								onValueChange={(value) => {
									setRequest({ ...request, genre: value });
									if (value) {
										setErrors(prev => ({ ...prev, genre: "" }));
									}
								}}
							>
								<SelectTrigger className={`bg-zinc-800 border-zinc-700 ${errors.genre ? 'border-red-500' : ''}`}>
									<SelectValue placeholder='Select genre' />
								</SelectTrigger>
								<SelectContent className='bg-zinc-800 border-zinc-700'>
									{GENRES.map((genre) => (
										<SelectItem key={genre} value={genre}>
											{genre}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.genre && <p className="text-red-500 text-sm">{errors.genre}</p>}
						</div>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Mood (Optional)</label>
						<Select
							value={request.mood}
							onValueChange={(value) => setRequest({ ...request, mood: value })}
						>
							<SelectTrigger className='bg-zinc-800 border-zinc-700'>
								<SelectValue placeholder='Select mood' />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700'>
								<SelectItem value="none">No mood</SelectItem>
								{MOODS.map((mood) => (
									<SelectItem key={mood} value={mood}>
										{mood}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Release Date (Optional)</label>
						<Input
							type='date'
							value={request.releaseDate}
							onChange={(e) => setRequest({ ...request, releaseDate: e.target.value })}
							className={`bg-zinc-800 border-zinc-700 ${errors.releaseDate ? 'border-red-500' : ''}`}
							placeholder="Select release date"
						/>
						{errors.releaseDate && <p className="text-red-500 text-sm">{errors.releaseDate}</p>}
					</div>
				</div>

				<DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
					<Button variant='outline' onClick={() => setDialogOpen(false)} disabled={isLoading} className="w-full sm:w-auto">
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isLoading} className="w-full sm:w-auto">
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Submitting...
							</>
						) : (
							`Submit ${type === 'upload' ? 'Upload' : type === 'edit' ? 'Edit' : 'Delete'} Request`
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default SongRequestDialog;
