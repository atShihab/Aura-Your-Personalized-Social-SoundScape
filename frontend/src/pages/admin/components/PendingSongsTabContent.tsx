import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { getImageUrl, handleImageError } from "@/lib/imageUtils";

interface PendingSong {
	_id: string;
	title: string;
	artist: string;
	featuredArtist?: string;
	genre: string;
	imageUrl: string;
	audioUrl: string;
	duration: number;
	createdAt: string;
	uploadedBy?: string;
}

const PendingSongsTabContent = () => {
	const [pendingSongs, setPendingSongs] = useState<PendingSong[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [approveDialogOpen, setApproveDialogOpen] = useState(false);
	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const [selectedSong, setSelectedSong] = useState<PendingSong | null>(null);
	const [notes, setNotes] = useState("");

	const fetchPendingSongs = async () => {
		try {
			setIsLoading(true);
			const response = await axiosInstance.get("/admin/songs/pending");
			setPendingSongs(response.data.songs || []);
		} catch (error: any) {
			console.error("Error fetching pending songs:", error);
			toast.error("Failed to load pending songs");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchPendingSongs();
	}, []);

	const handleApprove = async () => {
		if (!selectedSong) return;

		try {
			await axiosInstance.post(`/admin/songs/${selectedSong._id}/approve`, {
				notes: notes.trim() || undefined,
			});
			toast.success("Song approved successfully!");
			setApproveDialogOpen(false);
			setSelectedSong(null);
			setNotes("");
			fetchPendingSongs();
		} catch (error: any) {
			console.error("Error approving song:", error);
			toast.error(error.response?.data?.message || "Failed to approve song");
		}
	};

	const handleReject = async () => {
		if (!selectedSong) return;

		try {
			await axiosInstance.post(`/admin/songs/${selectedSong._id}/reject`, {
				notes: notes.trim() || undefined,
			});
			toast.success("Song rejected");
			setRejectDialogOpen(false);
			setSelectedSong(null);
			setNotes("");
			fetchPendingSongs();
		} catch (error: any) {
			console.error("Error rejecting song:", error);
			toast.error(error.response?.data?.message || "Failed to reject song");
		}
	};

	if (isLoading) {
		return (
			<Card className='bg-zinc-800/50 border-zinc-700'>
				<CardContent className='flex items-center justify-center py-8'>
					<div className='text-zinc-400'>Loading pending songs...</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card className='bg-zinc-800/50 border-zinc-700'>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Clock className='size-5 text-yellow-500' />
						Pending Song Reviews
					</CardTitle>
					<CardDescription>
						Review and approve songs uploaded by artists ({pendingSongs.length} pending)
					</CardDescription>
				</CardHeader>
				<CardContent className='overflow-x-auto'>
					{pendingSongs.length === 0 ? (
						<div className='text-center py-8 text-zinc-400'>
							No pending songs to review
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow className='hover:bg-zinc-800/50'>
									<TableHead className='w-[50px]'></TableHead>
									<TableHead>Title</TableHead>
									<TableHead>Artist</TableHead>
									<TableHead>Genre</TableHead>
									<TableHead>Duration</TableHead>
									<TableHead>Uploaded</TableHead>
									<TableHead className='text-right'>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{pendingSongs.map((song) => (
									<TableRow key={song._id} className='hover:bg-zinc-800/50'>
										<TableCell>
											<img
												src={getImageUrl(song.imageUrl)}
												alt={song.title}
												onError={(e) => handleImageError(e)}
												className='size-10 rounded object-cover'
											/>
										</TableCell>
										<TableCell className='font-medium'>{song.title}</TableCell>
										<TableCell>{song.artist}</TableCell>
										<TableCell>{song.genre}</TableCell>
										<TableCell>{song.duration} min</TableCell>
										<TableCell className='text-zinc-400 text-sm'>
											{new Date(song.createdAt).toLocaleDateString()}
										</TableCell>
										<TableCell className='text-right'>
											<div className='flex gap-2 justify-end'>
												<Button
													variant='outline'
													size='sm'
													className='text-green-400 border-green-400/50 hover:bg-green-400/10'
													onClick={() => {
														setSelectedSong(song);
														setApproveDialogOpen(true);
													}}
												>
													<CheckCircle2 className='size-4 mr-1' />
													Approve
												</Button>
												<Button
													variant='outline'
													size='sm'
													className='text-red-400 border-red-400/50 hover:bg-red-400/10'
													onClick={() => {
														setSelectedSong(song);
														setRejectDialogOpen(true);
													}}
												>
													<XCircle className='size-4 mr-1' />
													Reject
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Approve Dialog */}
			<Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Approve Song</DialogTitle>
						<DialogDescription>
							Approve "{selectedSong?.title}" by {selectedSong?.artist}?
						</DialogDescription>
					</DialogHeader>
					<div className='space-y-4'>
						<div>
							<label className='text-sm font-medium'>Notes (optional)</label>
							<Textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder='Add any notes about this approval...'
								className='mt-1 bg-zinc-800 border-zinc-700'
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant='outline' onClick={() => setApproveDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleApprove} className='bg-green-600 hover:bg-green-700'>
							Approve
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Reject Dialog */}
			<Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject Song</DialogTitle>
						<DialogDescription>
							Reject "{selectedSong?.title}" by {selectedSong?.artist}?
						</DialogDescription>
					</DialogHeader>
					<div className='space-y-4'>
						<div>
							<label className='text-sm font-medium'>Reason (optional)</label>
							<Textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder='Provide a reason for rejection...'
								className='mt-1 bg-zinc-800 border-zinc-700'
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant='outline' onClick={() => setRejectDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleReject} variant='destructive'>
							Reject
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default PendingSongsTabContent;
