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
import { useMusicStore } from "@/stores/useMusicStore";
import { Song } from "@/types";
import { Edit, Upload, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import ArtistAutocomplete from "@/components/ArtistAutocomplete";
import { GENRES, MOODS } from "@/lib/constants";

interface EditSongDialogProps {
	song: Song;
}

const EditSongDialog = ({ song }: EditSongDialogProps) => {
	const { albums, updateSong, fetchSongs } = useMusicStore();
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [editedSong, setEditedSong] = useState({
		title: song.title,
		artist: song.artist,
		featuredArtist: song.featuredArtist || "",
		album: typeof song.albumId === 'string' ? song.albumId : (song.albumId as any)?._id || "",
		duration: song.duration.toString(),
		genre: song.genre || "",
		mood: song.mood || "none",
		releaseDate: song.releaseDate ? new Date(song.releaseDate).toISOString().split('T')[0] : "",
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

		if (!editedSong.title.trim()) {
			newErrors.title = "Title is required";
		}

		if (!editedSong.artist.trim()) {
			newErrors.artist = "Artist is required";
		}

		if (!editedSong.genre) {
			newErrors.genre = "Genre is required";
		}

		if (editedSong.duration && parseFloat(editedSong.duration) <= 0) {
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

			formData.append("title", editedSong.title.trim());
			formData.append("artist", editedSong.artist.trim());
			if (editedSong.featuredArtist.trim()) {
				formData.append("featuredArtist", editedSong.featuredArtist.trim());
			}
			formData.append("duration", editedSong.duration || "0");
			formData.append("genre", editedSong.genre);
			if (editedSong.mood && editedSong.mood !== "none") {
				formData.append("mood", editedSong.mood);
			}
			if (editedSong.album && editedSong.album !== "none") {
				formData.append("albumId", editedSong.album);
			}
			if (editedSong.releaseDate) {
				formData.append("releaseDate", editedSong.releaseDate);
			}

			// Only append files if they were selected
			if (files.audio) {
				formData.append("audioFile", files.audio);
			}
			if (files.image) {
				formData.append("imageFile", files.image);
			}

			console.log("Updating song data:", {
				id: song._id,
				title: editedSong.title,
				artist: editedSong.artist,
				genre: editedSong.genre,
				audioFile: files.audio?.name,
				imageFile: files.image?.name
			});

			await updateSong(song._id, formData);

			// Reset form
			setEditedSong({
				title: song.title,
				artist: song.artist,
				featuredArtist: song.featuredArtist || "",
				album: typeof song.albumId === 'string' ? song.albumId : (song.albumId as any)?._id || "",
				duration: song.duration.toString(),
				genre: song.genre || "",
				mood: song.mood || "none",
				releaseDate: song.releaseDate ? new Date(song.releaseDate).toISOString().split('T')[0] : "",
			});

			setFiles({
				audio: null,
				image: null,
			});

			setErrors({});
			setEditDialogOpen(false);
		} catch (error: any) {
			console.error("Error updating song:", error);
			const errorMessage = error.response?.data?.message || error.message || "Failed to update song";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const resetForm = () => {
		setEditedSong({
			title: song.title,
			artist: song.artist,
			featuredArtist: song.featuredArtist || "",
			album: typeof song.albumId === 'string' ? song.albumId : (song.albumId as any)?._id || "",
			duration: song.duration.toString(),
			genre: song.genre || "",
			mood: song.mood || "none",
			releaseDate: song.releaseDate ? new Date(song.releaseDate).toISOString().split('T')[0] : "",
		});
		setFiles({
			audio: null,
			image: null,
		});
		setErrors({});
	};

	return (
		<Dialog open={editDialogOpen} onOpenChange={(open) => {
			setEditDialogOpen(open);
			if (!open) {
				resetForm();
			}
		}}>
			<DialogTrigger asChild>
				<Button
					variant={"ghost"}
					size={"sm"}
					className='text-blue-400 hover:text-blue-300 hover:bg-blue-400/10'
				>
					<Edit className='size-4' />
				</Button>
			</DialogTrigger>

			<DialogContent className='bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-auto'>
				<DialogHeader>
					<DialogTitle>Edit Song</DialogTitle>
					<DialogDescription>
						Update the song information. Leave file fields empty to keep existing files.
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4'>
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='text-sm font-medium text-zinc-300'>Title *</label>
							<Input
								value={editedSong.title}
								onChange={(e) => {
									setEditedSong({ ...editedSong, title: e.target.value });
									if (e.target.value.trim()) {
										setErrors(prev => ({ ...prev, title: "" }));
									}
								}}
								className={`bg-zinc-800 border-zinc-700 text-white ${errors.title ? 'border-red-500' : ''}`}
								placeholder='Song title'
							/>
							{errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
						</div>
						<div>
							<label className='text-sm font-medium text-zinc-300'>Artist *</label>
							<ArtistAutocomplete
								value={editedSong.artist}
								onChange={(value) => {
									setEditedSong({ ...editedSong, artist: value });
									if (value.trim()) {
										setErrors(prev => ({ ...prev, artist: "" }));
									}
								}}
								placeholder="Search and select artist..."
								className={`bg-zinc-800 border-zinc-700 ${errors.artist ? 'border-red-500' : ''}`}
							/>
							{errors.artist && <p className="text-red-500 text-sm">{errors.artist}</p>}
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='text-sm font-medium text-zinc-300'>Featured Artist (Optional)</label>
							<ArtistAutocomplete
								value={editedSong.featuredArtist}
								onChange={(value) => setEditedSong({ ...editedSong, featuredArtist: value })}
								placeholder="Search and select featured artist..."
								className="bg-zinc-800 border-zinc-700"
							/>
						</div>
						<div>
							<label className='text-sm font-medium text-zinc-300'>Genre *</label>
							<Select
								value={editedSong.genre}
								onValueChange={(value) => {
									setEditedSong({ ...editedSong, genre: value });
									if (value) {
										setErrors(prev => ({ ...prev, genre: "" }));
									}
								}}
							>
								<SelectTrigger className={`bg-zinc-800 border-zinc-700 text-white ${errors.genre ? 'border-red-500' : ''}`}>
									<SelectValue placeholder='Select genre' />
								</SelectTrigger>
								<SelectContent className='bg-zinc-800 border-zinc-700 text-white'>
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
						<label className='text-sm font-medium text-zinc-300'>Mood (Optional)</label>
						<Select
							value={editedSong.mood}
							onValueChange={(value) => setEditedSong({ ...editedSong, mood: value })}
						>
							<SelectTrigger className='bg-zinc-800 border-zinc-700 text-white'>
								<SelectValue placeholder='Select mood' />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700 text-white'>
								<SelectItem value="none">No mood</SelectItem>
								{MOODS.map((mood) => (
									<SelectItem key={mood} value={mood}>
										{mood}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='text-sm font-medium text-zinc-300'>Album</label>
							<Select
								value={editedSong.album}
								onValueChange={(value) => setEditedSong({ ...editedSong, album: value })}
							>
								<SelectTrigger className='bg-zinc-800 border-zinc-700 text-white'>
									<SelectValue placeholder='Select album' />
								</SelectTrigger>
								<SelectContent className='bg-zinc-800 border-zinc-700 text-white'>
									<SelectItem value='none'>No Album</SelectItem>
									{albums.map((album) => (
										<SelectItem key={album._id} value={album._id}>
											{album.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<label className='text-sm font-medium text-zinc-300'>Duration (minutes)</label>
							<Input
								value={editedSong.duration}
								onChange={(e) => {
									setEditedSong({ ...editedSong, duration: e.target.value });
									if (e.target.value && parseFloat(e.target.value) > 0) {
										setErrors(prev => ({ ...prev, duration: "" }));
									}
								}}
								className={`bg-zinc-800 border-zinc-700 text-white ${errors.duration ? 'border-red-500' : ''}`}
								placeholder='Duration in minutes (e.g., 3.5)'
								type='number'
								step='0.1'
							/>
							{errors.duration && <p className="text-red-500 text-sm">{errors.duration}</p>}
						</div>
						<div>
							<label className='text-sm font-medium text-zinc-300'>Release Date (Optional)</label>
							<Input
								type='date'
								value={editedSong.releaseDate}
								onChange={(e) => setEditedSong({ ...editedSong, releaseDate: e.target.value })}
								className='bg-zinc-800 border-zinc-700 text-white'
								placeholder="Select release date"
							/>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='text-sm font-medium text-zinc-300'>Audio File (optional)</label>
							<Input
								ref={audioInputRef}
								type='file'
								accept='audio/*'
								onChange={(e) => setFiles({ ...files, audio: e.target.files?.[0] || null })}
								className='bg-zinc-800 border-zinc-700 text-white'
							/>
							{files.audio && (
								<p className='text-xs text-zinc-400 mt-1'>
									Selected: {files.audio.name}
								</p>
							)}
						</div>
						<div>
							<label className='text-sm font-medium text-zinc-300'>Image File (optional)</label>
							<Input
								ref={imageInputRef}
								type='file'
								accept='image/*'
								onChange={(e) => setFiles({ ...files, image: e.target.files?.[0] || null })}
								className='bg-zinc-800 border-zinc-700 text-white'
							/>
							{files.image && (
								<p className='text-xs text-zinc-400 mt-1'>
									Selected: {files.image.name}
								</p>
							)}
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => setEditDialogOpen(false)}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isLoading}
						className='bg-emerald-500 hover:bg-emerald-600 text-black'
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Updating...
							</>
						) : (
							"Update Song"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default EditSongDialog;

