import { useEffect, useState, useMemo } from "react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Check, X, Eye, MessageSquare, FileText, Trash2, Music, Instagram, Twitter, Youtube, Globe, Download, ExternalLink, Search } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface ArtistApplication {
	_id: string;
	fullName: string;
	artistName: string;
	email: string | null;
	imageUrl: string;
	genre: string;
	bio: string;
	socialMedia: {
		instagram?: string;
		twitter?: string;
		youtube?: string;
		tiktok?: string;
		website?: string;
	};
	artistDocuments?: Array<{
		name: string;
		url: string;
		type: string;
		size: number;
	}>;
	verificationStatus: "pending" | "approved" | "rejected";
	verificationNotes?: string;
	createdAt: string;
}

const ArtistsTabContent = () => {
	const [applications, setApplications] = useState<ArtistApplication[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedApplication, setSelectedApplication] = useState<ArtistApplication | null>(null);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
	const [isDocumentsDialogOpen, setIsDocumentsDialogOpen] = useState(false);
	const [selectedDocuments, setSelectedDocuments] = useState<ArtistApplication['artistDocuments']>([]);
	const [rejectFeedback, setRejectFeedback] = useState("");
	const [rejectingId, setRejectingId] = useState<string | null>(null);

	const fetchApplications = async () => {
		setIsLoading(true);
		try {
			const response = await axiosInstance.get("/admin/artist-applications");
			setApplications(response.data.applications);
		} catch (error) {
			toast.error("Failed to fetch artist applications");
		} finally {
			setIsLoading(false);
		}
	};

	// Filter applications based on search query
	const filteredApplications = useMemo(() => {
		if (!searchQuery.trim()) return applications;
		
		const query = searchQuery.toLowerCase();
		return applications.filter(app => 
			app.fullName.toLowerCase().includes(query) ||
			app.artistName.toLowerCase().includes(query) ||
			app.genre.toLowerCase().includes(query) ||
			app.verificationStatus.toLowerCase().includes(query)
		);
	}, [applications, searchQuery]);

	useEffect(() => {
		fetchApplications();
	}, []);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		// Search functionality is handled by filteredApplications
	};

	const clearSearch = () => {
		setSearchQuery("");
	};

	const handleViewApplication = (application: ArtistApplication) => {
		setSelectedApplication(application);
		setIsViewDialogOpen(true);
	};

	const handleViewDocuments = (documents: ArtistApplication['artistDocuments']) => {
		setSelectedDocuments(documents || []);
		setIsDocumentsDialogOpen(true);
	};

	const handleApprove = async (id: string) => {
		try {
			await axiosInstance.post(`/admin/artist-applications/${id}/approve`);
			toast.success("Artist approved successfully");
			fetchApplications(); // Refresh the list
		} catch (error) {
			toast.error("Failed to approve artist");
		}
	};

	const handleReject = async (id: string) => {
		setRejectingId(id);
		setRejectFeedback("");
		setIsRejectDialogOpen(true);
	};

	const handleRejectSubmit = async () => {
		if (!rejectingId) return;
		
		try {
			await axiosInstance.post(`/admin/artist-applications/${rejectingId}/reject`, {
				feedback: rejectFeedback
			});
			toast.success("Artist rejected successfully");
			setIsRejectDialogOpen(false);
			setRejectingId(null);
			setRejectFeedback("");
			fetchApplications(); // Refresh the list
		} catch (error) {
			toast.error("Failed to reject artist");
		}
	};

	const handleDeleteArtist = async (id: string) => {
		if (!window.confirm("Are you sure you want to remove this artist? This will convert them back to a regular user and remove their artist status and verification badge.")) {
			return;
		}
		
		try {
			await axiosInstance.delete(`/admin/artist-applications/${id}/delete`);
			toast.success("Artist removed successfully - converted back to regular user");
			fetchApplications(); // Refresh the list
		} catch (error) {
			toast.error("Failed to remove artist");
		}
	};


	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const getFileIcon = (fileType: string) => {
		if (fileType.startsWith('image/')) return '🖼️';
		if (fileType.startsWith('video/')) return '🎥';
		if (fileType.startsWith('audio/')) return '🎵';
		if (fileType.includes('pdf')) return '📄';
		if (fileType.includes('word') || fileType.includes('document')) return '📝';
		if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
		return '📎';
	};

	return (
		<div className="bg-zinc-800/50 p-4 sm:p-6 rounded-lg">
			<h2 className="text-xl sm:text-2xl font-bold mb-4">
				Artist Applications
			</h2>
			
			{/* Search Bar */}
			<form onSubmit={handleSearch} className="mb-6">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 size-4" />
					<Input
						type="text"
						placeholder="Search applications by name, artist name, genre, or status..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10 pr-10 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 focus:border-orange-500"
					/>
					{searchQuery && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={clearSearch}
							className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-zinc-400 hover:text-white"
						>
							<X className="size-4" />
						</Button>
					)}
				</div>
			</form>
			
			{isLoading ? (
				<div className="flex items-center justify-center py-8">
					<div className="text-zinc-400">Loading applications...</div>
				</div>
			) : filteredApplications.length === 0 ? (
				<div className="flex items-center justify-center py-8">
					<div className="text-zinc-400">
						{searchQuery ? `No applications found matching "${searchQuery}"` : "No artist applications found"}
					</div>
				</div>
			) : (
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Artist</TableHead>
								<TableHead>Full Name</TableHead>
								<TableHead>Genre</TableHead>
								<TableHead>Documents</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Applied</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredApplications.map((app) => (
								<TableRow key={app._id}>
									<TableCell className="flex items-center gap-4">
										<Avatar>
											<AvatarImage src={app.imageUrl} />
											<AvatarFallback>
												{app.artistName.charAt(0)}
											</AvatarFallback>
										</Avatar>
										{app.artistName}
									</TableCell>
									<TableCell>{app.fullName}</TableCell>
									<TableCell>{app.genre}</TableCell>
									<TableCell>
										{app.artistDocuments && app.artistDocuments.length > 0 ? (
											<button
												onClick={() => handleViewDocuments(app.artistDocuments)}
												className="text-sm text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
											>
												{app.artistDocuments.length} doc{app.artistDocuments.length !== 1 ? 's' : ''}
											</button>
										) : (
											<span className="text-sm text-zinc-500">None</span>
										)}
									</TableCell>
									<TableCell>
										<Badge
											className={
												app.verificationStatus === "pending"
													? "bg-yellow-400/20 text-yellow-400"
													: app.verificationStatus === "approved"
													? "bg-green-400/20 text-green-400"
													: "bg-red-400/20 text-red-400"
											}
										>
											{app.verificationStatus}
										</Badge>
									</TableCell>
									<TableCell>{formatDate(app.createdAt)}</TableCell>
									<TableCell className="text-right">
										<div className="flex gap-2 justify-end">
											<Button
												size="sm"
												variant="ghost"
												className="text-blue-400 hover:bg-blue-400/10"
												onClick={() => handleViewApplication(app)}
											>
												<Eye className="size-4" />
											</Button>
											{app.verificationStatus === "pending" && (
												<>
													<Button
														size="sm"
														variant="ghost"
														className="text-green-400 hover:bg-green-400/10"
														onClick={() => handleApprove(app._id)}
													>
														<Check className="size-4" />
													</Button>
													<Button
														size="sm"
														variant="ghost"
														className="text-red-400 hover:bg-red-400/10"
														onClick={() => handleReject(app._id)}
													>
														<X className="size-4" />
													</Button>
												</>
											)}
											{app.verificationStatus === "approved" && (
												<Button
													size="sm"
													variant="ghost"
													className="text-red-400 hover:bg-red-400/10"
													onClick={() => handleDeleteArtist(app._id)}
													title="Remove artist (convert back to regular user)"
												>
													<Trash2 className="size-4" />
												</Button>
											)}
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			{/* View Application Dialog */}
			<Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Artist Application Details</DialogTitle>
					</DialogHeader>
					{selectedApplication && (
						<div className="space-y-6">
							{/* Header */}
							<div className="flex items-center gap-4">
								<Avatar className="w-16 h-16">
									<AvatarImage src={selectedApplication.imageUrl} />
									<AvatarFallback className="text-lg">
										{selectedApplication.artistName.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div>
									<h3 className="text-xl font-bold">{selectedApplication.artistName}</h3>
									<p className="text-zinc-400">{selectedApplication.fullName}</p>
									<Badge className="mt-1">{selectedApplication.genre}</Badge>
								</div>
							</div>

							{/* Application Details */}
							<Card>
								<CardHeader>
									<CardTitle>Application Information</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<label className="text-sm font-medium text-zinc-400">Artist Bio</label>
										<p className="mt-1 text-white">{selectedApplication.bio || "No bio provided"}</p>
									</div>

									<div>
										<label className="text-sm font-medium text-zinc-400">Social Media Links</label>
										<div className="mt-2 space-y-2">
											{Object.entries(selectedApplication.socialMedia).map(([platform, url]) => (
												url && (
													<div key={platform} className="flex items-center gap-2">
														<span className="text-sm text-zinc-400 capitalize">{platform}:</span>
														<a 
															href={url} 
															target="_blank" 
															rel="noopener noreferrer"
															className="text-blue-400 hover:underline text-sm"
														>
															{url}
														</a>
													</div>
												)
											))}
											{Object.values(selectedApplication.socialMedia).every(url => !url) && (
												<p className="text-zinc-500 text-sm">No social media links provided</p>
											)}
										</div>
									</div>

									<div>
										<label className="text-sm font-medium text-zinc-400">Application Date</label>
										<p className="mt-1 text-white">{formatDate(selectedApplication.createdAt)}</p>
									</div>

									{selectedApplication.artistDocuments && selectedApplication.artistDocuments.length > 0 && (
										<div>
											<label className="text-sm font-medium text-zinc-400">Supporting Documents</label>
											<div className="mt-2 space-y-2">
												{selectedApplication.artistDocuments.map((doc, index) => (
													<div key={index} className="flex items-center gap-3 p-2 bg-zinc-700/30 rounded">
														<div className="flex-shrink-0">
															{doc.type.startsWith('image/') ? (
																<img
																	src={doc.url}
																	alt={doc.name}
																	className="w-10 h-10 rounded object-cover"
																/>
															) : (
																<div className="w-10 h-10 bg-zinc-600 rounded flex items-center justify-center">
																	<FileText className="size-5 text-zinc-400" />
																</div>
															)}
														</div>
														<div className="flex-1 min-w-0">
															<p className="text-sm text-white truncate">{doc.name}</p>
															<p className="text-xs text-zinc-400">
																{formatFileSize(doc.size)} • {doc.type}
															</p>
														</div>
														<div className="flex gap-2">
															<Button
																size="sm"
																variant="ghost"
																className="text-blue-400 hover:text-blue-300 p-1"
																onClick={() => {
																	setSelectedDocuments([doc]);
																	setIsDocumentsDialogOpen(true);
																	setIsViewDialogOpen(false);
																}}
															>
																<Eye className="size-4" />
															</Button>
															<a
																href={doc.url}
																target="_blank"
																rel="noopener noreferrer"
																className="text-blue-400 hover:text-blue-300 p-1"
															>
																<ExternalLink className="size-4" />
															</a>
														</div>
													</div>
												))}
											</div>
										</div>
									)}

									<div>
										<label className="text-sm font-medium text-zinc-400">Status</label>
										<div className="mt-1">
											<Badge
												className={
													selectedApplication.verificationStatus === "pending"
														? "bg-yellow-400/20 text-yellow-400"
														: selectedApplication.verificationStatus === "approved"
														? "bg-green-400/20 text-green-400"
														: "bg-red-400/20 text-red-400"
												}
											>
												{selectedApplication.verificationStatus}
											</Badge>
										</div>
									</div>

									{selectedApplication.verificationNotes && (
										<div>
											<label className="text-sm font-medium text-zinc-400">Admin Notes</label>
											<p className="mt-1 text-white">{selectedApplication.verificationNotes}</p>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Actions */}
							{selectedApplication.verificationStatus === "pending" && (
								<div className="flex gap-3 justify-end">
									<Button
										variant="outline"
										onClick={() => setIsViewDialogOpen(false)}
									>
										Close
									</Button>
									<Button
										className="bg-green-600 hover:bg-green-700"
										onClick={() => {
											handleApprove(selectedApplication._id);
											setIsViewDialogOpen(false);
										}}
									>
										<Check className="size-4 mr-2" />
										Approve
									</Button>
									<Button
										variant="destructive"
										onClick={() => {
											setIsViewDialogOpen(false);
											handleReject(selectedApplication._id);
										}}
									>
										<X className="size-4 mr-2" />
										Reject
									</Button>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Documents Viewer Dialog */}
			<Dialog open={isDocumentsDialogOpen} onOpenChange={setIsDocumentsDialogOpen}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Supporting Documents</DialogTitle>
					</DialogHeader>
					{selectedDocuments && selectedDocuments.length > 0 && (
						<div className="space-y-4">
							{selectedDocuments.map((doc, index) => (
								<div key={index} className="border border-zinc-700 rounded-lg p-4">
									{/* Document Header */}
									<div className="flex items-center justify-between mb-4">
										<div className="flex items-center gap-3">
											<span className="text-2xl">{getFileIcon(doc.type)}</span>
											<div>
												<h3 className="font-medium text-white">{doc.name}</h3>
												<p className="text-sm text-zinc-400">
													{formatFileSize(doc.size)} • {doc.type}
												</p>
											</div>
										</div>
										<div className="flex gap-2">
											<a
												href={doc.url}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
											>
												<ExternalLink className="size-4" />
												Open in New Tab
											</a>
											<a
												href={doc.url}
												download={doc.name}
												className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
											>
												<Download className="size-4" />
												Download
											</a>
										</div>
									</div>

									{/* Document Content */}
									<div className="bg-zinc-900 rounded-lg p-4">
										{doc.type.startsWith('image/') ? (
											<div className="flex justify-center">
												<img
													src={doc.url}
													alt={doc.name}
													className="max-w-full max-h-96 object-contain rounded-lg"
												/>
											</div>
										) : doc.type.includes('pdf') ? (
											<div className="text-center py-8">
												<FileText className="size-16 text-zinc-400 mx-auto mb-4" />
												<p className="text-zinc-400 mb-4">PDF documents can be viewed by opening in a new tab</p>
												<a
													href={doc.url}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
												>
													<ExternalLink className="size-4" />
													Open PDF
												</a>
											</div>
										) : doc.type.startsWith('video/') ? (
											<div className="flex justify-center">
												<video
													src={doc.url}
													controls
													className="max-w-full max-h-96 rounded-lg"
												>
													Your browser does not support the video tag.
												</video>
											</div>
										) : doc.type.startsWith('audio/') ? (
											<div className="text-center py-8">
												<audio
													src={doc.url}
													controls
													className="w-full max-w-md"
												>
													Your browser does not support the audio tag.
												</audio>
											</div>
										) : (
											<div className="text-center py-8">
												<FileText className="size-16 text-zinc-400 mx-auto mb-4" />
												<p className="text-zinc-400 mb-4">
													This file type ({doc.type}) cannot be previewed directly.
												</p>
												<p className="text-zinc-500 text-sm">
													Please download the file or open it in a new tab to view its contents.
												</p>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Reject with Feedback Dialog */}
			<Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject Artist Application</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<label className="text-sm font-medium text-zinc-400">
								Feedback (Optional)
							</label>
							<Textarea
								placeholder="Provide feedback to the artist about why their application was rejected..."
								value={rejectFeedback}
								onChange={(e) => setRejectFeedback(e.target.value)}
								className="mt-2"
								rows={4}
							/>
						</div>
						<div className="flex gap-3 justify-end">
							<Button
								variant="outline"
								onClick={() => setIsRejectDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={handleRejectSubmit}
							>
								<X className="size-4 mr-2" />
								Reject Application
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default ArtistsTabContent;
