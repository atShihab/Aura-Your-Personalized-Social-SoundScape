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
import { Album } from "@/types";
import { Edit, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import ArtistAutocomplete from "@/components/ArtistAutocomplete";
import { GENRES } from "@/lib/constants";

interface EditAlbumDialogProps {
	album: Album;
}

const EditAlbumDialog = ({ album }: EditAlbumDialogProps) => {
	const { updateAlbum } = useMusicStore();
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [editedAlbum, setEditedAlbum] = useState({
		title: album.title,
		artist: album.artist || "",
		releaseYear: album.releaseYear,
		genre: album.genre || "none",
	});

	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) { // 5MB limit
				toast.error("Image size should be less than 5MB");
				return;
			}
			setImageFile(file);
			const reader = new FileReader();
			reader.onload = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const removeImage = () => {
		setImageFile(null);
		setImagePreview(null);
		if (imageInputRef.current) {
			imageInputRef.current.value = "";
		}
	};

	const handleSubmit = async () => {
		setIsLoading(true);

		try {
			const formData = new FormData();

			formData.append("title", editedAlbum.title);
			if (editedAlbum.artist && editedAlbum.artist.trim()) {
				formData.append("artist", editedAlbum.artist.trim());
			}
			formData.append("releaseYear", editedAlbum.releaseYear.toString());
			if (editedAlbum.genre && editedAlbum.genre !== "none") {
				formData.append("genre", editedAlbum.genre);
			}

			if (imageFile) {
				formData.append("imageFile", imageFile);
			}

			await updateAlbum(album._id, formData);

			setEditedAlbum({
				title: album.title,
				artist: album.artist || "",
				releaseYear: album.releaseYear,
				genre: album.genre || "none",
			});

			removeImage();
			setEditDialogOpen(false);
		} catch (error: any) {
			toast.error("Failed to update album: " + error.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
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
					<DialogTitle>Edit Album</DialogTitle>
					<DialogDescription>
						Update the album information. Leave image field empty to keep existing image.
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4'>
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='text-sm font-medium text-zinc-300'>Title</label>
							<Input
								value={editedAlbum.title}
								onChange={(e) => setEditedAlbum({ ...editedAlbum, title: e.target.value })}
								className='bg-zinc-800 border-zinc-700 text-white'
								placeholder='Album title'
							/>
						</div>
						<div>
							<label className='text-sm font-medium text-zinc-300'>Artist (Optional)</label>
							<ArtistAutocomplete
								value={editedAlbum.artist}
								onChange={(value) => setEditedAlbum({ ...editedAlbum, artist: value })}
								placeholder="Search and select artist..."
								className="bg-zinc-800 border-zinc-700"
							/>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='text-sm font-medium text-zinc-300'>Release Year</label>
							<Input
								value={editedAlbum.releaseYear}
								onChange={(e) => setEditedAlbum({ ...editedAlbum, releaseYear: parseInt(e.target.value) || 0 })}
								className='bg-zinc-800 border-zinc-700 text-white'
								placeholder='Release year'
								type='number'
							/>
						</div>
						<div>
							<label className='text-sm font-medium text-zinc-300'>Genre (Optional)</label>
							<Select
								value={editedAlbum.genre}
								onValueChange={(value) => setEditedAlbum({ ...editedAlbum, genre: value })}
							>
								<SelectTrigger className='bg-zinc-800 border-zinc-700 text-white'>
									<SelectValue placeholder='Select genre' />
								</SelectTrigger>
								<SelectContent className='bg-zinc-800 border-zinc-700 text-white'>
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

					<div>
						<label className='text-sm font-medium text-zinc-300'>Album Cover (optional)</label>
						<Input
							ref={imageInputRef}
							type='file'
							accept='image/*'
							onChange={handleImageSelect}
							className='bg-zinc-800 border-zinc-700 text-white'
						/>
						{imagePreview && (
							<div className='relative mt-2 inline-block'>
								<img
									src={imagePreview}
									alt="Preview"
									className='max-h-32 max-w-32 rounded object-cover'
								/>
								<Button
									size="icon"
									variant="destructive"
									className='absolute -top-2 -right-2 h-6 w-6'
									onClick={removeImage}
								>
									<Upload className='h-3 w-3' />
								</Button>
							</div>
						)}
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
						{isLoading ? "Updating..." : "Update Album"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default EditAlbumDialog;

