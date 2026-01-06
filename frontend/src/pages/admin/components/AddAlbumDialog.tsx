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
import { GENRES } from "@/lib/constants";
import { useMusicStore } from "@/stores/useMusicStore";
import { Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import ArtistAutocomplete from "@/components/ArtistAutocomplete";

const AddAlbumDialog = () => {
	const { fetchAlbums } = useMusicStore();
	const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [newAlbum, setNewAlbum] = useState({
		title: "",
		artist: "",
		releaseYear: new Date().getFullYear(),
		genre: "none",
	});

	const [imageFile, setImageFile] = useState<File | null>(null);

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);
		}
	};

	const handleSubmit = async () => {
		setIsLoading(true);

		try {
			if (!newAlbum.title) {
				return toast.error("Please fill in album title");
			}

			const formData = new FormData();
			formData.append("title", newAlbum.title);
			if (newAlbum.artist && newAlbum.artist.trim()) {
				formData.append("artist", newAlbum.artist.trim());
			}
			formData.append("releaseYear", newAlbum.releaseYear.toString());
			if (newAlbum.genre && newAlbum.genre !== "none") {
				formData.append("genre", newAlbum.genre);
			}
			if (imageFile) {
				formData.append("imageFile", imageFile);
			}

			await axiosInstance.post("/admin/albums", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			setNewAlbum({
				title: "",
				artist: "",
				releaseYear: new Date().getFullYear(),
				genre: "none",
			});
			setImageFile(null);
			setAlbumDialogOpen(false);
			toast.success("Album created successfully");
			
			// Refresh albums list after successful creation
			try {
				await fetchAlbums();
			} catch (error) {
				console.error("Error refreshing albums list:", error);
				// Don't show error to user since the creation was successful
			}
		} catch (error: any) {
			console.error("Error creating album:", error);
			const errorMessage = error.response?.data?.message || error.message || "Failed to create album";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={albumDialogOpen} onOpenChange={setAlbumDialogOpen}>
			<DialogTrigger asChild>
				<Button className='bg-violet-500 hover:bg-violet-600 text-white'>
					<Plus className='mr-2 h-4 w-4' />
					Add Album
				</Button>
			</DialogTrigger>
			<DialogContent className='bg-zinc-900 border-zinc-700 w-[95vw] max-w-lg sm:w-full'>
				<DialogHeader>
					<DialogTitle className="text-lg sm:text-xl">Add New Album</DialogTitle>
					<DialogDescription className="text-sm">Add a new album to your collection</DialogDescription>
				</DialogHeader>
				<div className='space-y-4 py-4'>
					<input
						type='file'
						ref={fileInputRef}
						onChange={handleImageSelect}
						accept='image/*'
						className='hidden'
					/>
					<div
						className='flex items-center justify-center p-4 sm:p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer min-h-[120px] sm:min-h-[150px]'
						onClick={() => fileInputRef.current?.click()}
					>
						<div className='text-center px-2'>
							<div className='p-2 sm:p-3 bg-zinc-800 rounded-full inline-block mb-2'>
								<Upload className='h-5 w-5 sm:h-6 sm:w-6 text-zinc-400' />
							</div>
							<div className='text-sm text-zinc-400 mb-2 break-all'>
								{imageFile ? imageFile.name : "Upload album artwork"}
							</div>
							<Button variant='outline' size='sm' className='text-xs'>
								Choose File
							</Button>
						</div>
					</div>
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Album Title</label>
						<Input
							value={newAlbum.title}
							onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
							placeholder='Enter album title'
						/>
					</div>
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Artist (Optional)</label>
						<ArtistAutocomplete
							value={newAlbum.artist}
							onChange={(value) => setNewAlbum({ ...newAlbum, artist: value })}
							placeholder="Search and select artist..."
							className="bg-zinc-800 border-zinc-700"
						/>
					</div>
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Release Year</label>
						<Input
							type='number'
							value={newAlbum.releaseYear}
							onChange={(e) => setNewAlbum({ ...newAlbum, releaseYear: parseInt(e.target.value) })}
							className='bg-zinc-800 border-zinc-700'
							placeholder='Enter release year'
							min={1900}
							max={new Date().getFullYear()}
						/>
					</div>
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Genre (Optional)</label>
						<Select
							value={newAlbum.genre}
							onValueChange={(value) => setNewAlbum({ ...newAlbum, genre: value })}
						>
							<SelectTrigger className='bg-zinc-800 border-zinc-700'>
								<SelectValue placeholder='Select genre' />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700'>
								<SelectItem value="none">No genre</SelectItem>
								{GENRES.map((genre) => (
									<SelectItem key={genre} value={genre}>
										{genre}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
					<Button variant='outline' onClick={() => setAlbumDialogOpen(false)} disabled={isLoading} className="w-full sm:w-auto">
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						className='bg-violet-500 hover:bg-violet-600 w-full sm:w-auto'
						disabled={isLoading || !newAlbum.title}
					>
						{isLoading ? "Creating..." : "Add Album"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
export default AddAlbumDialog;
