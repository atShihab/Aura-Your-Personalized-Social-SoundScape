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
import { GENRES } from "@/lib/constants";
import { Upload, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import ArtistAutocomplete from "@/components/ArtistAutocomplete";

interface AlbumRequest {
	title: string;
	artist: string;
	releaseYear: number;
	genre: string;
	description: string;
}

interface AlbumRequestDialogProps {
	type: 'create' | 'edit' | 'delete';
	trigger: React.ReactNode;
}

const AlbumRequestDialog = ({ type, trigger }: AlbumRequestDialogProps) => {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [request, setRequest] = useState<AlbumRequest>({
		title: "",
		artist: "",
		releaseYear: new Date().getFullYear(),
		genre: "none",
		description: "",
	});

	const [imageFile, setImageFile] = useState<File | null>(null);
	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);
		}
	};

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};

		if (!request.title.trim()) {
			newErrors.title = "Title is required";
		}

		if (!request.description.trim()) {
			newErrors.description = "Description is required";
		}

		if (type === 'create' || type === 'edit') {
			if (!imageFile) {
				newErrors.image = "Image file is required";
			}
		}

		if (request.releaseYear < 1900 || request.releaseYear > new Date().getFullYear()) {
			newErrors.releaseYear = "Invalid release year";
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
			formData.append("type", `album_${type}`);
			formData.append("title", request.title.trim());
			if (request.artist && request.artist.trim()) {
				formData.append("artist", request.artist.trim());
			}
			formData.append("releaseYear", request.releaseYear.toString());
			if (request.genre && request.genre !== "none") {
				formData.append("genre", request.genre);
			}
			formData.append("description", request.description.trim());

			if (imageFile) {
				formData.append("imageFile", imageFile);
			}

			// TODO: Submit to backend
			console.log("Submitting album request:", {
				type: `album_${type}`,
				title: request.title,
				description: request.description
			});

			// Mock submission
			await new Promise(resolve => setTimeout(resolve, 1000));

			// Reset form
			setRequest({
				title: "",
				artist: "",
				releaseYear: new Date().getFullYear(),
				genre: "none",
				description: "",
			});
			setImageFile(null);
			setErrors({});
			setDialogOpen(false);
			toast.success(`${type === 'create' ? 'Create' : type === 'edit' ? 'Edit' : 'Delete'} request submitted successfully!`);
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
			releaseYear: new Date().getFullYear(),
			genre: "none",
			description: "",
		});
		setImageFile(null);
		setErrors({});
	};

	const getDialogTitle = () => {
		switch (type) {
			case 'create': return 'Album Create Request';
			case 'edit': return 'Album Edit Request';
			case 'delete': return 'Album Delete Request';
			default: return 'Album Request';
		}
	};

	const getDialogDescription = () => {
		switch (type) {
			case 'create': return 'Submit a request to create a new album';
			case 'edit': return 'Submit a request to edit an existing album';
			case 'delete': return 'Submit a request to delete an album';
			default: return 'Submit an album request';
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

			<DialogContent className='bg-zinc-900 border-zinc-700 w-[95vw] max-w-lg sm:w-full'>
				<DialogHeader>
					<DialogTitle className="text-lg sm:text-xl">{getDialogTitle()}</DialogTitle>
					<DialogDescription className="text-sm">{getDialogDescription()}</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					{/* Description */}
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

					{(type === 'create' || type === 'edit') && (
						<>
							<input
								type='file'
								ref={fileInputRef}
								onChange={handleImageSelect}
								accept='image/*'
								className='hidden'
							/>
							<div
								className={`flex items-center justify-center p-4 sm:p-6 border-2 border-dashed rounded-lg cursor-pointer min-h-[120px] sm:min-h-[150px] ${
									errors.image ? 'border-red-500 bg-red-500/10' : 'border-zinc-700 hover:border-zinc-600'
								}`}
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
							{errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
						</>
					)}

					{/* Album Title */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Album Title *</label>
						<Input
							value={request.title}
							onChange={(e) => {
								setRequest({ ...request, title: e.target.value });
								if (e.target.value.trim()) {
									setErrors(prev => ({ ...prev, title: "" }));
								}
							}}
							className={`bg-zinc-800 border-zinc-700 ${errors.title ? 'border-red-500' : ''}`}
							placeholder='Enter album title'
						/>
						{errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
					</div>

					{/* Artist */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Artist (Optional)</label>
						<ArtistAutocomplete
							value={request.artist}
							onChange={(value) => setRequest({ ...request, artist: value })}
							placeholder="Search and select artist..."
							className="bg-zinc-800 border-zinc-700"
						/>
					</div>

					{/* Release Year */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Release Year *</label>
						<Input
							type='number'
							value={request.releaseYear}
							onChange={(e) => {
								setRequest({ ...request, releaseYear: parseInt(e.target.value) });
								const year = parseInt(e.target.value);
								if (year >= 1900 && year <= new Date().getFullYear()) {
									setErrors(prev => ({ ...prev, releaseYear: "" }));
								}
							}}
							className={`bg-zinc-800 border-zinc-700 ${errors.releaseYear ? 'border-red-500' : ''}`}
							placeholder='Enter release year'
							min={1900}
							max={new Date().getFullYear()}
						/>
						{errors.releaseYear && <p className="text-red-500 text-sm">{errors.releaseYear}</p>}
					</div>

					{/* Genre */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Genre (Optional)</label>
						<Select
							value={request.genre}
							onValueChange={(value) => setRequest({ ...request, genre: value })}
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
					<Button variant='outline' onClick={() => setDialogOpen(false)} disabled={isLoading} className="w-full sm:w-auto">
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						className='bg-violet-500 hover:bg-violet-600 w-full sm:w-auto'
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Submitting...
							</>
						) : (
							`Submit ${type === 'create' ? 'Create' : type === 'edit' ? 'Edit' : 'Delete'} Request`
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AlbumRequestDialog;
