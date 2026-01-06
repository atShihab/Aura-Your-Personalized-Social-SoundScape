import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";

interface ActivityLog {
	_id: string;
	adminId: string;
	adminName: string;
	action: string;
	targetType: string;
	targetId: string;
	targetName: string;
	details: any;
	createdAt: string;
}

const ActivityLogsTabContent = () => {
	const [logs, setLogs] = useState<ActivityLog[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [actionFilter, setActionFilter] = useState<string>("");
	const [targetTypeFilter, setTargetTypeFilter] = useState<string>("");

	const fetchLogs = async (pageNum = 1) => {
		try {
			setIsLoading(true);
			const params = new URLSearchParams({
				page: pageNum.toString(),
				limit: "50",
			});
			if (actionFilter) {
				params.append("action", actionFilter);
			}
			if (targetTypeFilter) {
				params.append("targetType", targetTypeFilter);
			}
			const response = await axiosInstance.get(`/admin/activity-logs?${params}`);
			setLogs(response.data.logs || []);
			setTotalPages(response.data.pagination?.totalPages || 1);
		} catch (error: any) {
			console.error("Error fetching activity logs:", error);
			toast.error("Failed to load activity logs");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchLogs(page);
	}, [page, actionFilter, targetTypeFilter]);

	const getActionBadge = (action: string) => {
		const colors: Record<string, string> = {
			song_approved: "text-green-400 border-green-400/50",
			song_rejected: "text-red-400 border-red-400/50",
			song_deleted: "text-red-400 border-red-400/50",
			album_created: "text-blue-400 border-blue-400/50",
			album_updated: "text-yellow-400 border-yellow-400/50",
			album_deleted: "text-red-400 border-red-400/50",
			artist_approved: "text-green-400 border-green-400/50",
			artist_rejected: "text-red-400 border-red-400/50",
			artist_deleted: "text-red-400 border-red-400/50",
			user_suspended: "text-orange-400 border-orange-400/50",
			user_unsuspended: "text-green-400 border-green-400/50",
			user_deleted: "text-red-400 border-red-400/50",
		};
		return colors[action] || "text-zinc-400 border-zinc-400/50";
	};

	const formatAction = (action: string) => {
		return action
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	return (
		<Card className='bg-zinc-800/50 border-zinc-700'>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<FileText className='size-5 text-indigo-500' />
					Activity Logs
				</CardTitle>
				<CardDescription>View all admin activities and actions</CardDescription>
				<div className='flex gap-4 mt-4'>
					<Select value={actionFilter} onValueChange={setActionFilter}>
						<SelectTrigger className='w-[200px] bg-zinc-800 border-zinc-700'>
							<SelectValue placeholder='Filter by action' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value=''>All Actions</SelectItem>
							<SelectItem value='song_approved'>Song Approved</SelectItem>
							<SelectItem value='song_rejected'>Song Rejected</SelectItem>
							<SelectItem value='song_deleted'>Song Deleted</SelectItem>
							<SelectItem value='album_created'>Album Created</SelectItem>
							<SelectItem value='album_updated'>Album Updated</SelectItem>
							<SelectItem value='album_deleted'>Album Deleted</SelectItem>
							<SelectItem value='artist_approved'>Artist Approved</SelectItem>
							<SelectItem value='artist_rejected'>Artist Rejected</SelectItem>
							<SelectItem value='artist_deleted'>Artist Deleted</SelectItem>
							<SelectItem value='user_suspended'>User Suspended</SelectItem>
							<SelectItem value='user_unsuspended'>User Unsuspended</SelectItem>
							<SelectItem value='user_deleted'>User Deleted</SelectItem>
						</SelectContent>
					</Select>
					<Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
						<SelectTrigger className='w-[150px] bg-zinc-800 border-zinc-700'>
							<SelectValue placeholder='Filter by type' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value=''>All Types</SelectItem>
							<SelectItem value='song'>Song</SelectItem>
							<SelectItem value='album'>Album</SelectItem>
							<SelectItem value='artist'>Artist</SelectItem>
							<SelectItem value='user'>User</SelectItem>
						</SelectContent>
					</Select>
					{(actionFilter || targetTypeFilter) && (
						<Button
							variant='outline'
							size='sm'
							onClick={() => {
								setActionFilter("");
								setTargetTypeFilter("");
								setPage(1);
							}}
						>
							Clear Filters
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent className='overflow-x-auto'>
				{isLoading ? (
					<div className='text-center py-8 text-zinc-400'>Loading activity logs...</div>
				) : logs.length === 0 ? (
					<div className='text-center py-8 text-zinc-400'>No activity logs found</div>
				) : (
					<>
						<Table>
							<TableHeader>
								<TableRow className='hover:bg-zinc-800/50'>
									<TableHead>Time</TableHead>
									<TableHead>Admin</TableHead>
									<TableHead>Action</TableHead>
									<TableHead>Target</TableHead>
									<TableHead>Details</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{logs.map((log) => (
									<TableRow key={log._id} className='hover:bg-zinc-800/50'>
										<TableCell className='text-zinc-400 text-sm'>
											{new Date(log.createdAt).toLocaleString()}
										</TableCell>
										<TableCell className='font-medium'>{log.adminName}</TableCell>
										<TableCell>
											<Badge variant='outline' className={getActionBadge(log.action)}>
												{formatAction(log.action)}
											</Badge>
										</TableCell>
										<TableCell>
											<div>
												<div className='font-medium'>{log.targetName}</div>
												<div className='text-xs text-zinc-400'>{log.targetType}</div>
											</div>
										</TableCell>
										<TableCell className='text-sm text-zinc-400'>
											{log.details?.notes && (
												<div>Notes: {log.details.notes}</div>
											)}
											{log.details?.reason && (
												<div>Reason: {log.details.reason}</div>
											)}
											{log.details?.artist && (
												<div>Artist: {log.details.artist}</div>
											)}
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
	);
};

export default ActivityLogsTabContent;
