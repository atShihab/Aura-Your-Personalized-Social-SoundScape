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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { axiosInstance } from "@/lib/axios";
import { GENRES, MOODS } from "@/lib/constants";
import { useMusicStore } from "@/stores/useMusicStore";
import { Plus, Upload, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import ArtistAutocomplete from "@/components/ArtistAutocomplete";

interface NewSong {
	title: string;
	artist: string;
	featuredArtist: string;
	album: string;
	duration: string;
	genre: string;
	mood: string;
	releaseDate: string;
}

const AddSongDialog = () => {
	const { albums, fetchSongs } = useMusicStore();
	const [songDialogOpen, setSongDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [newSong, setNewSong] = useState<NewSong>({
		title: "",
		artist: "",
		featuredArtist: "",
		album: "",
		duration: "",
		genre: "",
		mood: "none",
		releaseDate: "",
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

		if (!newSong.title.trim()) {
			newErrors.title = "Title is required";
		}

		if (!newSong.artist.trim()) {
			newErrors.artist = "Artist is required";
		}

		if (!newSong.genre) {
			newErrors.genre = "Genre is required";
		}

		if (!files.audio) {
			newErrors.audio = "Audio file is required";
		}

		if (!files.image) {
			newErrors.image = "Image file is required";
		}

		if (newSong.duration && parseFloat(newSong.duration) <= 0) {
			newErrors.duration = "Duration must be greater than 0";
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

			formData.append("title", newSong.title.trim());
			formData.append("artist", newSong.artist.trim());
			if (newSong.featuredArtist.trim()) {
				formData.append("featuredArtist", newSong.featuredArtist.trim());
			}
			formData.append("duration", newSong.duration || "0");
			formData.append("genre", newSong.genre);
			if (newSong.mood && newSong.mood !== "none") {
				formData.append("mood", newSong.mood);
			}
			if (newSong.album && newSong.album !== "none") {
				formData.append("albumId", newSong.album);
			}
			if (newSong.releaseDate) {
				formData.append("releaseDate", newSong.releaseDate);
			}

			formData.append("audioFile", files.audio!);
			formData.append("imageFile", files.image!);

			console.log("Submitting song data:", {
				title: newSong.title,
				artist: newSong.artist,
				genre: newSong.genre,
				audioFile: files.audio?.name,
				imageFile: files.image?.name
			});

			// Log FormData contents for debugging
			console.log("FormData contents:");
			for (let [key, value] of formData.entries()) {
				console.log(`${key}:`, value);
			}

			const response = await axiosInstance.post("/admin/songs", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			console.log("Song created successfully:", response.data);

			// Refresh the songs list
			await fetchSongs();

			// Reset form
			setNewSong({
				title: "",
				artist: "",
				featuredArtist: "",
				album: "",
				duration: "",
				genre: "",
				mood: "none",
				releaseDate: "",
			});

			setFiles({
				audio: null,
				image: null,
			});

			setErrors({});
			setSongDialogOpen(false);
			toast.success("Song added successfully!");
		} catch (error: any) {
			console.error("Error adding song:", error);
			const errorMessage = error.response?.data?.message || error.message || "Failed to add song";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const resetForm = () => {
		setNewSong({
			title: "",
			artist: "",
			featuredArtist: "",
			album: "",
			duration: "",
			genre: "",
			mood: "none",
			releaseDate: "",
		});
		setFiles({
			audio: null,
			image: null,
		});
		setErrors({});
	};

	return (
		<Dialog open={songDialogOpen} onOpenChange={(open) => {
			setSongDialogOpen(open);
			if (!open) {
				resetForm();
			}
		}}>
			<DialogTrigger asChild>
				<Button className='bg-emerald-500 hover:bg-emerald-600 text-black'>
					<Plus className='mr-2 h-4 w-4' />
					Add Song
				</Button>
			</DialogTrigger>

			<DialogContent className='bg-zinc-900 border-zinc-700 max-h-[90vh] overflow-auto w-[95vw] max-w-2xl sm:w-full'>
				<DialogHeader>
					<DialogTitle className="text-lg sm:text-xl">Add New Song</DialogTitle>
					<DialogDescription className="text-sm">Add a new song to your music library</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
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

					{/* image upload area */}
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

					{/* Title */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Title *</label>
						<Input
							value={newSong.title}
							onChange={(e) => {
								setNewSong({ ...newSong, title: e.target.value });
								if (e.target.value.trim()) {
									setErrors(prev => ({ ...prev, title: "" }));
								}
							}}
							className={`bg-zinc-800 border-zinc-700 ${errors.title ? 'border-red-500' : ''}`}
							placeholder="Enter song title"
						/>
						{errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
					</div>

					{/* Artist */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Artist *</label>
						<ArtistAutocomplete
							value={newSong.artist}
							onChange={(value) => {
								setNewSong({ ...newSong, artist: value });
								if (value.trim()) {
									setErrors(prev => ({ ...prev, artist: "" }));
								}
							}}
							placeholder="Search and select artist..."
							className={`bg-zinc-800 border-zinc-700 ${errors.artist ? 'border-red-500' : ''}`}
						/>
						{errors.artist && <p className="text-red-500 text-sm">{errors.artist}</p>}
					</div>

					{/* Featured Artist */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Featured Artist (Optional)</label>
						<ArtistAutocomplete
							value={newSong.featuredArtist}
							onChange={(value) => setNewSong({ ...newSong, featuredArtist: value })}
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
								value={newSong.duration}
								onChange={(e) => {
									setNewSong({ ...newSong, duration: e.target.value });
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
								value={newSong.genre}
								onValueChange={(value) => {
									setNewSong({ ...newSong, genre: value });
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
							value={newSong.mood}
							onValueChange={(value) => setNewSong({ ...newSong, mood: value })}
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
						<label className='text-sm font-medium'>Album (Optional)</label>
						<Select
							value={newSong.album}
							onValueChange={(value) => setNewSong({ ...newSong, album: value })}
						>
							<SelectTrigger className='bg-zinc-800 border-zinc-700'>
								<SelectValue placeholder='Select album' />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700'>
								<SelectItem value='none'>No Album (Single)</SelectItem>
								{albums.map((album) => (
									<SelectItem key={album._id} value={album._id}>
										{album.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Release Date (Optional)</label>
						<Input
							type='date'
							value={newSong.releaseDate}
							onChange={(e) => setNewSong({ ...newSong, releaseDate: e.target.value })}
							className={`bg-zinc-800 border-zinc-700 ${errors.releaseDate ? 'border-red-500' : ''}`}
							placeholder="Select release date"
						/>
						{errors.releaseDate && <p className="text-red-500 text-sm">{errors.releaseDate}</p>}
					</div>
				</div>

				<DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
					<Button variant='outline' onClick={() => setSongDialogOpen(false)} disabled={isLoading} className="w-full sm:w-auto">
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isLoading} className="w-full sm:w-auto">
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Uploading...
							</>
						) : (
							"Add Song"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
export default AddSongDialog;

