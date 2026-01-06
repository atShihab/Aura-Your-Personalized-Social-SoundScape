import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { axiosInstance } from "@/lib/axios";
import { Bug, RefreshCw, TestTube, Database, Users, Music, Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const AdminDebugPanel = () => {
	const { isAdmin, checkAdminStatus } = useAuthStore();
	const { songs, albums, fetchSongs, fetchAlbums } = useMusicStore();
	const [isTesting, setIsTesting] = useState(false);

	const testAdminAccess = async () => {
		setIsTesting(true);
		try {
			console.log("🔍 Testing admin access...");
			const response = await axiosInstance.get("/admin/check");
			console.log("✅ Admin check response:", response.data);
			toast.success("Admin access confirmed!");
		} catch (error: any) {
			console.error("❌ Admin access test failed:", error);
			toast.error("Admin access test failed: " + (error.response?.data?.message || error.message));
		} finally {
			setIsTesting(false);
		}
	};

	const testSongsEndpoint = async () => {
		setIsTesting(true);
		try {
			console.log("🔍 Testing songs endpoint...");
			const response = await axiosInstance.get("/songs");
			console.log("✅ Songs endpoint response:", response.data);
			toast.success(`Found ${response.data.length} songs`);
		} catch (error: any) {
			console.error("❌ Songs endpoint test failed:", error);
			toast.error("Songs endpoint test failed: " + (error.response?.data?.message || error.message));
		} finally {
			setIsTesting(false);
		}
	};

	const testAlbumsEndpoint = async () => {
		setIsTesting(true);
		try {
			console.log("🔍 Testing albums endpoint...");
			const response = await axiosInstance.get("/albums");
			console.log("✅ Albums endpoint response:", response.data);
			toast.success(`Found ${response.data.length} albums`);
		} catch (error: any) {
			console.error("❌ Albums endpoint test failed:", error);
			toast.error("Albums endpoint test failed: " + (error.response?.data?.message || error.message));
		} finally {
			setIsTesting(false);
		}
	};

	const testFormData = async () => {
		setIsTesting(true);
		try {
			console.log("🔍 Testing form data upload...");
			
			// Create a simple test form data
			const formData = new FormData();
			formData.append("title", "Test Song");
			formData.append("artist", "Test Artist");
			formData.append("genre", "Pop");
			formData.append("duration", "3.5");
			
			// Create dummy files
			const audioBlob = new Blob(["dummy audio content"], { type: "audio/mpeg" });
			const imageBlob = new Blob(["dummy image content"], { type: "image/jpeg" });
			
			formData.append("audioFile", audioBlob, "test-audio.mp3");
			formData.append("imageFile", imageBlob, "test-image.jpg");
			
			const response = await axiosInstance.post("/admin/test-form", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			
			console.log("✅ Form data test response:", response.data);
			toast.success("Form data test successful!");
		} catch (error: any) {
			console.error("❌ Form data test failed:", error);
			toast.error("Form data test failed: " + (error.response?.data?.message || error.message));
		} finally {
			setIsTesting(false);
		}
	};

	const refreshData = async () => {
		setIsTesting(true);
		try {
			console.log("🔄 Refreshing data...");
			await Promise.all([fetchSongs(), fetchAlbums()]);
			toast.success("Data refreshed successfully!");
		} catch (error: any) {
			console.error("❌ Data refresh failed:", error);
			toast.error("Data refresh failed: " + (error.response?.data?.message || error.message));
		} finally {
			setIsTesting(false);
		}
	};

	const testDatabaseConnection = async () => {
		setIsTesting(true);
		try {
			console.log("🔍 Testing database connection...");
			const response = await axiosInstance.get("/admin/db-status");
			console.log("✅ Database status:", response.data);
			toast.success("Database connection successful!");
		} catch (error: any) {
			console.error("❌ Database test failed:", error);
			toast.error("Database test failed: " + (error.response?.data?.message || error.message));
		} finally {
			setIsTesting(false);
		}
	};

	const testUserEndpoint = async () => {
		setIsTesting(true);
		try {
			console.log("🔍 Testing users endpoint...");
			const response = await axiosInstance.get("/users");
			console.log("✅ Users endpoint response:", response.data);
			toast.success(`Found ${response.data.length} users`);
		} catch (error: any) {
			console.error("❌ Users endpoint test failed:", error);
			toast.error("Users endpoint test failed: " + (error.response?.data?.message || error.message));
		} finally {
			setIsTesting(false);
		}
	};

	const testArtistApplications = async () => {
		setIsTesting(true);
		try {
			console.log("🔍 Testing artist applications endpoint...");
			const response = await axiosInstance.get("/admin/artist-applications");
			console.log("✅ Artist applications response:", response.data);
			toast.success(`Found ${response.data.applications?.length || 0} artist applications`);
		} catch (error: any) {
			console.error("❌ Artist applications test failed:", error);
			toast.error("Artist applications test failed: " + (error.response?.data?.message || error.message));
		} finally {
			setIsTesting(false);
		}
	};

	const testStatsEndpoint = async () => {
		setIsTesting(true);
		try {
			console.log("🔍 Testing stats endpoint...");
			const response = await axiosInstance.get("/admin/stats");
			console.log("✅ Stats endpoint response:", response.data);
			toast.success("Stats endpoint working!");
		} catch (error: any) {
			console.error("❌ Stats endpoint test failed:", error);
			toast.error("Stats endpoint test failed: " + (error.response?.data?.message || error.message));
		} finally {
			setIsTesting(false);
		}
	};

	return (
		<Card className="mb-6 bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 border-zinc-700/50">
			<CardHeader className="pb-4">
				<CardTitle className="flex items-center gap-3 text-xl">
					<div className="p-2 bg-orange-500/20 rounded-lg">
						<Bug className="h-6 w-6 text-orange-500" />
					</div>
					<div>
						<div className="text-white">Admin Debug Panel</div>
						<div className="text-sm text-zinc-400 font-normal">System diagnostics and testing tools</div>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Status Overview */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
						<div className="p-2 bg-emerald-500/20 rounded-lg">
							{isAdmin ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
						</div>
						<div>
							<div className="text-sm font-medium text-white">Admin Status</div>
							<Badge variant={isAdmin ? "default" : "destructive"} className="text-xs">
								{isAdmin ? "Authorized" : "Unauthorized"}
							</Badge>
						</div>
					</div>

					<div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
						<div className="p-2 bg-blue-500/20 rounded-lg">
							<Music className="h-4 w-4 text-blue-500" />
						</div>
						<div>
							<div className="text-sm font-medium text-white">Songs Loaded</div>
							<div className="text-lg font-bold text-blue-400">{songs.length}</div>
						</div>
					</div>

					<div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
						<div className="p-2 bg-purple-500/20 rounded-lg">
							<Database className="h-4 w-4 text-purple-500" />
						</div>
						<div>
							<div className="text-sm font-medium text-white">Albums Loaded</div>
							<div className="text-lg font-bold text-purple-400">{albums.length}</div>
						</div>
					</div>

					<div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
						<div className="p-2 bg-orange-500/20 rounded-lg">
							{isTesting ? <Loader2 className="h-4 w-4 text-orange-500 animate-spin" /> : <TestTube className="h-4 w-4 text-orange-500" />}
						</div>
						<div>
							<div className="text-sm font-medium text-white">System Status</div>
							<Badge variant={isTesting ? "secondary" : "outline"} className="text-xs">
								{isTesting ? "Testing..." : "Ready"}
							</Badge>
						</div>
					</div>
				</div>

				{/* Test Buttons Grid */}
				<div className="space-y-4">
					<div className="text-sm font-medium text-zinc-300 mb-3">API Endpoint Tests</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						<Button
							onClick={testAdminAccess}
							disabled={isTesting}
							variant="outline"
							className="h-auto p-4 flex flex-col items-center gap-2 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 hover:border-zinc-600"
						>
							<Shield className="h-5 w-5 text-emerald-500" />
							<span className="text-sm font-medium">Admin Access</span>
							<span className="text-xs text-zinc-400">Test admin privileges</span>
						</Button>

						<Button
							onClick={testDatabaseConnection}
							disabled={isTesting}
							variant="outline"
							className="h-auto p-4 flex flex-col items-center gap-2 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 hover:border-zinc-600"
						>
							<Database className="h-5 w-5 text-blue-500" />
							<span className="text-sm font-medium">Database</span>
							<span className="text-xs text-zinc-400">Test DB connection</span>
						</Button>

						<Button
							onClick={testSongsEndpoint}
							disabled={isTesting}
							variant="outline"
							className="h-auto p-4 flex flex-col items-center gap-2 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 hover:border-zinc-600"
						>
							<Music className="h-5 w-5 text-blue-500" />
							<span className="text-sm font-medium">Songs API</span>
							<span className="text-xs text-zinc-400">Test songs endpoint</span>
						</Button>

						<Button
							onClick={testAlbumsEndpoint}
							disabled={isTesting}
							variant="outline"
							className="h-auto p-4 flex flex-col items-center gap-2 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 hover:border-zinc-600"
						>
							<Database className="h-5 w-5 text-purple-500" />
							<span className="text-sm font-medium">Albums API</span>
							<span className="text-xs text-zinc-400">Test albums endpoint</span>
						</Button>

						<Button
							onClick={testUserEndpoint}
							disabled={isTesting}
							variant="outline"
							className="h-auto p-4 flex flex-col items-center gap-2 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 hover:border-zinc-600"
						>
							<Users className="h-5 w-5 text-green-500" />
							<span className="text-sm font-medium">Users API</span>
							<span className="text-xs text-zinc-400">Test users endpoint</span>
						</Button>

						<Button
							onClick={testArtistApplications}
							disabled={isTesting}
							variant="outline"
							className="h-auto p-4 flex flex-col items-center gap-2 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 hover:border-zinc-600"
						>
							<Users className="h-5 w-5 text-orange-500" />
							<span className="text-sm font-medium">Artist Apps</span>
							<span className="text-xs text-zinc-400">Test artist applications</span>
						</Button>

						<Button
							onClick={testStatsEndpoint}
							disabled={isTesting}
							variant="outline"
							className="h-auto p-4 flex flex-col items-center gap-2 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 hover:border-zinc-600"
						>
							<Database className="h-5 w-5 text-cyan-500" />
							<span className="text-sm font-medium">Stats API</span>
							<span className="text-xs text-zinc-400">Test statistics endpoint</span>
						</Button>

						<Button
							onClick={testFormData}
							disabled={isTesting}
							variant="outline"
							className="h-auto p-4 flex flex-col items-center gap-2 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 hover:border-zinc-600"
						>
							<TestTube className="h-5 w-5 text-yellow-500" />
							<span className="text-sm font-medium">Form Data</span>
							<span className="text-xs text-zinc-400">Test file uploads</span>
						</Button>

						<Button
							onClick={refreshData}
							disabled={isTesting}
							variant="outline"
							className="h-auto p-4 flex flex-col items-center gap-2 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 hover:border-zinc-600"
						>
							<RefreshCw className={`h-5 w-5 text-indigo-500 ${isTesting ? 'animate-spin' : ''}`} />
							<span className="text-sm font-medium">Refresh Data</span>
							<span className="text-xs text-zinc-400">Reload all data</span>
						</Button>
					</div>
				</div>

			</CardContent>
		</Card>
	);
};

export default AdminDebugPanel;
