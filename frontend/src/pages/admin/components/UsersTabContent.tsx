import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Search, X, Ban, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";

interface User {
	_id: string;
	fullName: string;
	artistName?: string;
	imageUrl: string;
	isArtist: boolean;
	isVerified: boolean;
	isSuspended?: boolean;
	suspendedAt?: string;
	suspendedReason?: string;
	createdAt: string;
}

const UsersTabContent = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
	const [unsuspendDialogOpen, setUnsuspendDialogOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [reason, setReason] = useState("");
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	const fetchUsers = async (pageNum = 1, search = "") => {
		try {
			setIsLoading(true);
			const params = new URLSearchParams({
				page: pageNum.toString(),
				limit: "20",
			});
			if (search) {
				params.append("search", search);
			}
			const response = await axiosInstance.get(`/admin/users?${params}`);
			setUsers(response.data.users || []);
			setTotalPages(response.data.pagination?.totalPages || 1);
		} catch (error: any) {
			console.error("Error fetching users:", error);
			toast.error("Failed to load users");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers(page, searchQuery);
	}, [page]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setPage(1);
		fetchUsers(1, searchQuery);
	};

	const handleSuspend = async () => {
		if (!selectedUser) return;

		try {
			await axiosInstance.post(`/admin/users/${selectedUser._id}/suspend`, {
				reason: reason.trim() || undefined,
			});
			toast.success("User suspended successfully");
			setSuspendDialogOpen(false);
			setSelectedUser(null);
			setReason("");
			fetchUsers(page, searchQuery);
		} catch (error: any) {
			console.error("Error suspending user:", error);
			toast.error(error.response?.data?.message || "Failed to suspend user");
		}
	};

	const handleUnsuspend = async () => {
		if (!selectedUser) return;

		try {
			await axiosInstance.post(`/admin/users/${selectedUser._id}/unsuspend`);
			toast.success("User unsuspended successfully");
			setUnsuspendDialogOpen(false);
			setSelectedUser(null);
			fetchUsers(page, searchQuery);
		} catch (error: any) {
			console.error("Error unsuspending user:", error);
			toast.error(error.response?.data?.message || "Failed to unsuspend user");
		}
	};

	return (
		<>
			<Card className='bg-zinc-800/50 border-zinc-700'>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Users className='size-5 text-blue-500' />
						User Management
					</CardTitle>
					<CardDescription>View and manage all users</CardDescription>
					<form onSubmit={handleSearch} className="mt-4">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 size-4" />
							<Input
								type="text"
								placeholder="Search users by name..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 pr-10 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 focus:border-blue-500"
							/>
							{searchQuery && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => {
										setSearchQuery("");
										setPage(1);
										fetchUsers(1, "");
									}}
									className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-zinc-400 hover:text-white"
								>
									<X className="size-4" />
								</Button>
							)}
						</div>
					</form>
				</CardHeader>
				<CardContent className='overflow-x-auto'>
					{isLoading ? (
						<div className='text-center py-8 text-zinc-400'>Loading users...</div>
					) : users.length === 0 ? (
						<div className='text-center py-8 text-zinc-400'>No users found</div>
					) : (
						<>
							<Table>
								<TableHeader>
									<TableRow className='hover:bg-zinc-800/50'>
										<TableHead className='w-[50px]'></TableHead>
										<TableHead>Name</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Joined</TableHead>
										<TableHead className='text-right'>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{users.map((user) => (
										<TableRow key={user._id} className='hover:bg-zinc-800/50'>
											<TableCell>
												<img
													src={getImageUrl(user.imageUrl)}
													alt={user.fullName}
													onError={(e) => handleImageError(e)}
													className='size-10 rounded-full object-cover'
												/>
											</TableCell>
											<TableCell>
												<div>
													<div className='font-medium'>{user.fullName}</div>
													{user.artistName && (
														<div className='text-sm text-zinc-400'>{user.artistName}</div>
													)}
												</div>
											</TableCell>
											<TableCell>
												{user.isArtist ? (
													<Badge variant='outline' className='text-purple-400 border-purple-400/50'>
														Artist
													</Badge>
												) : (
													<Badge variant='outline' className='text-zinc-400 border-zinc-400/50'>
														User
													</Badge>
												)}
											</TableCell>
											<TableCell>
												{user.isSuspended ? (
													<Badge variant='destructive'>Suspended</Badge>
												) : (
													<Badge variant='outline' className='text-green-400 border-green-400/50'>
														Active
													</Badge>
												)}
											</TableCell>
											<TableCell className='text-zinc-400 text-sm'>
												{new Date(user.createdAt).toLocaleDateString()}
											</TableCell>
											<TableCell className='text-right'>
												<div className='flex gap-2 justify-end'>
													{user.isSuspended ? (
														<Button
															variant='outline'
															size='sm'
															className='text-green-400 border-green-400/50 hover:bg-green-400/10'
															onClick={() => {
																setSelectedUser(user);
																setUnsuspendDialogOpen(true);
															}}
														>
															<CheckCircle2 className='size-4 mr-1' />
															Unsuspend
														</Button>
													) : (
														<Button
															variant='outline'
															size='sm'
															className='text-red-400 border-red-400/50 hover:bg-red-400/10'
															onClick={() => {
																setSelectedUser(user);
																setSuspendDialogOpen(true);
															}}
														>
															<Ban className='size-4 mr-1' />
															Suspend
														</Button>
													)}
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
							{totalPages > 1 && (
								<div className='flex justify-center gap-2 mt-4'>
									<Button
										variant='outline'
										size='sm'
										onClick={() => setPage((p) => Math.max(1, p - 1))}
										disabled={page === 1}
									>
										Previous
									</Button>
									<span className='flex items-center text-zinc-400'>
										Page {page} of {totalPages}
									</span>
									<Button
										variant='outline'
										size='sm'
										onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
										disabled={page === totalPages}
									>
										Next
									</Button>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			{/* Suspend Dialog */}
			<Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Suspend User</DialogTitle>
						<DialogDescription>
							Suspend {selectedUser?.fullName}? They will not be able to access their account.
						</DialogDescription>
					</DialogHeader>
					<div className='space-y-4'>
						<div>
							<label className='text-sm font-medium'>Reason (optional)</label>
							<Textarea
								value={reason}
								onChange={(e) => setReason(e.target.value)}
								placeholder='Provide a reason for suspension...'
								className='mt-1 bg-zinc-800 border-zinc-700'
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant='outline' onClick={() => setSuspendDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleSuspend} variant='destructive'>
							Suspend
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Unsuspend Dialog */}
			<Dialog open={unsuspendDialogOpen} onOpenChange={setUnsuspendDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Unsuspend User</DialogTitle>
						<DialogDescription>
							Restore access for {selectedUser?.fullName}?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant='outline' onClick={() => setUnsuspendDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleUnsuspend} className='bg-green-600 hover:bg-green-700'>
							Unsuspend
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default UsersTabContent;
