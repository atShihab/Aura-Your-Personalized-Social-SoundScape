import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

const updateApiToken = (token: string | null) => {
	if (token) axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
	else delete axiosInstance.defaults.headers.common["Authorization"];
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const { getToken, userId, isSignedIn } = useAuth();
	const { user } = useUser();
	const [loading, setLoading] = useState(true);
	const { checkAdminStatus } = useAuthStore();
	const { initSocket, disconnectSocket, fetchUsers } = useChatStore();

	// Function to sync user with backend
	const syncUserWithBackend = async (token: string, clerkUser: any) => {
		try {
			console.log("🔄 Syncing user with backend:", {
				id: clerkUser.id,
				firstName: clerkUser.firstName || "",
				lastName: clerkUser.lastName || "",
				imageUrl: clerkUser.imageUrl || "",
			});

			// Call auth callback to ensure user exists in backend
			const response = await axiosInstance.post("/auth/callback", {
				id: clerkUser.id,
				firstName: clerkUser.firstName || "",
				lastName: clerkUser.lastName || "",
				imageUrl: clerkUser.imageUrl || "",
			});
			
			console.log("✅ User synced with backend:", response.data);
		} catch (error) {
			console.error("❌ Failed to sync user with backend:", error);
		}
	};

	useEffect(() => {
		const initAuth = async () => {
			try {
				const token = await getToken();
				updateApiToken(token);
				
				if (token && userId && user) {
					// Sync user with backend first
					await syncUserWithBackend(token, user);
					
					// Check admin status
					await checkAdminStatus();
					
					// Fetch users list
					await fetchUsers();
					
					// Initialize socket for online status
					console.log("🔌 Initializing socket for user:", userId);
					initSocket(userId);
				}
			} catch (error: any) {
				updateApiToken(null);
				console.log("Error in auth provider", error);
			} finally {
				setLoading(false);
			}
		};

		initAuth();

		// Clean up socket on unmount
		return () => {
			console.log("Cleaning up socket connection");
			disconnectSocket();
		};
	}, [getToken, userId, user, checkAdminStatus, initSocket, disconnectSocket, fetchUsers]);

	// Handle socket connection when user signs in/out
	useEffect(() => {
		if (isSignedIn && userId && user) {
			console.log("🟢 User signed in, initializing socket:", userId);
			
			// Ensure user is synced with backend
			getToken().then(token => {
				if (token) {
					syncUserWithBackend(token, user);
					fetchUsers();
					initSocket(userId);
				}
			});
		} else {
			console.log("🔴 User signed out, disconnecting socket");
			disconnectSocket();
		}
	}, [isSignedIn, userId, user, initSocket, disconnectSocket, fetchUsers]);

	if (loading)
		return (
			<div className='h-screen w-full flex items-center justify-center'>
				<Loader className='size-8 text-emerald-500 animate-spin' />
			</div>
		);

	return <>{children}</>;
};
export default AuthProvider;
