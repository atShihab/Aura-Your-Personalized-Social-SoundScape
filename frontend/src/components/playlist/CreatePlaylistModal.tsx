import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Image, Music, Upload, X } from 'lucide-react';
import { usePlaylistStore } from '@/stores/usePlaylistStore';
import { toast } from 'react-hot-toast';

interface CreatePlaylistModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const CreatePlaylistModal = ({ isOpen, onClose }: CreatePlaylistModalProps) => {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [isPublic, setIsPublic] = useState(true);
	const [coverImage, setCoverImage] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>('');
	const [isLoading, setIsLoading] = useState(false);
	
	const { createPlaylist } = usePlaylistStore();

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			// Validate file type
			if (!file.type.startsWith('image/')) {
				toast.error('Please select an image file');
				return;
			}
			
			// Validate file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast.error('Image size must be less than 5MB');
				return;
			}
			
			setCoverImage(file);
			
			// Create preview URL
			const url = URL.createObjectURL(file);
			setPreviewUrl(url);
		}
	};

	const removeImage = () => {
		setCoverImage(null);
		setPreviewUrl('');
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!name.trim()) {
			toast.error('Playlist name is required');
			return;
		}
		
		console.log('🔄 Creating playlist:', { name: name.trim(), description: description.trim(), isPublic });
		setIsLoading(true);
		
		try {
			await createPlaylist(name.trim(), description.trim(), isPublic);
			
			// Reset form
			setName('');
			setDescription('');
			setIsPublic(true);
			setCoverImage(null);
			setPreviewUrl('');
			
			onClose();
		} catch (error) {
			console.error('Error creating playlist:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		if (!isLoading) {
			// Reset form
			setName('');
			setDescription('');
			setIsPublic(true);
			setCoverImage(null);
			setPreviewUrl('');
			onClose();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800">
				<DialogHeader>
					<DialogTitle className="text-white">Create New Playlist</DialogTitle>
					<DialogDescription className="text-zinc-400">
						Create a new playlist to organize your favorite songs.
					</DialogDescription>
				</DialogHeader>
				
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Cover Image Upload */}
					<div className="space-y-2">
						<Label htmlFor="cover-image" className="text-white">Cover Image (Optional)</Label>
						<div className="flex items-center gap-4">
							<div className="relative w-24 h-24 bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
								{previewUrl ? (
									<>
										<img 
											src={previewUrl} 
											alt="Cover preview" 
											className="w-full h-full object-cover"
										/>
										<button
											type="button"
											onClick={removeImage}
											className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
										>
											<X className="w-3 h-3 text-white" />
										</button>
									</>
								) : (
									<div className="w-full h-full flex items-center justify-center">
										<Music className="w-8 h-8 text-zinc-500" />
									</div>
								)}
							</div>
							
							<div className="flex-1">
								<Label 
									htmlFor="cover-image" 
									className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 text-white transition-colors"
								>
									<Upload className="w-4 h-4" />
									Upload Image
								</Label>
								<input
									id="cover-image"
									type="file"
									accept="image/*"
									onChange={handleImageUpload}
									className="hidden"
								/>
								<p className="text-xs text-zinc-500 mt-1">
									Max 5MB. JPG, PNG, GIF supported.
								</p>
							</div>
						</div>
					</div>
					
					{/* Playlist Name */}
					<div className="space-y-2">
						<Label htmlFor="name" className="text-white">Playlist Name *</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Enter playlist name"
							className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
							maxLength={100}
						/>
					</div>
					
					{/* Description */}
					<div className="space-y-2">
						<Label htmlFor="description" className="text-white">Description (Optional)</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Describe your playlist..."
							className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
							rows={3}
							maxLength={500}
						/>
					</div>
					
					{/* Privacy Setting */}
					<div className="space-y-2">
						<Label className="text-white">Privacy</Label>
						<div className="flex items-center space-x-4">
							<label className="flex items-center space-x-2 cursor-pointer">
								<input
									type="radio"
									checked={isPublic}
									onChange={() => setIsPublic(true)}
									className="text-green-500"
								/>
								<span className="text-white">Public</span>
							</label>
							<label className="flex items-center space-x-2 cursor-pointer">
								<input
									type="radio"
									checked={!isPublic}
									onChange={() => setIsPublic(false)}
									className="text-green-500"
								/>
								<span className="text-white">Private</span>
							</label>
						</div>
						<p className="text-xs text-zinc-500">
							{isPublic 
								? "Anyone can see and play your playlist" 
								: "Only you can see and play your playlist"
							}
						</p>
					</div>
					
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isLoading}
							className="border-zinc-700 text-white hover:bg-zinc-800"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isLoading || !name.trim()}
							className="bg-green-500 hover:bg-green-600 text-black"
						>
							{isLoading ? 'Creating...' : 'Create Playlist'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default CreatePlaylistModal;
