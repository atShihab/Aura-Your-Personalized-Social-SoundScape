import { useAuth } from "@clerk/clerk-react";
import { useLocation, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

interface AuthWrapperProps {
	children: React.ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
	const { isSignedIn, isLoaded, userId } = useAuth();
	const location = useLocation();
	const [isChecking, setIsChecking] = useState(true);
	
	console.log("🔐 AuthWrapper rendering...");

	// List of public routes that don't require authentication
	const publicRoutes = [
		"/landing",
		"/sign-up",
		"/login",
		"/verify-email",
		"/forgot-password",
		"/auth-callback",
		"/oauth-callback",
		"/sso-callback",
		"/artist/signup",
		"/artist/verification"
	];

	useEffect(() => {
		if (isLoaded) {
			// Add a small delay to ensure Clerk has properly initialized the auth state
			const timer = setTimeout(() => {
				setIsChecking(false);
			}, 100);
			
			return () => clearTimeout(timer);
		}
	}, [isLoaded]);

	// Debug logging
	useEffect(() => {
		console.log("AuthWrapper - Auth State:", {
			isSignedIn,
			isLoaded,
			userId,
			currentPath: location.pathname,
			isChecking
		});
	}, [isSignedIn, isLoaded, userId, location.pathname, isChecking]);

	// Show loading spinner while checking authentication
	if (isChecking || !isLoaded) {
		return (
			<div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
				<div className="text-center">
					<Loader className="size-12 text-emerald-500 animate-spin mx-auto mb-4" />
					<p className="text-zinc-400">Loading authentication...</p>
				</div>
			</div>
		);
	}

	// If user is signed in and trying to access auth pages, redirect to home
	if (isSignedIn && (location.pathname === "/login" || location.pathname === "/sign-up" || location.pathname === "/verify-email" || location.pathname === "/forgot-password")) {
		console.log("Redirecting authenticated user from auth page to home");
		return <Navigate to="/home" replace />;
	}

	// If user is signed in and trying to access landing page, redirect to home
	if (isSignedIn && location.pathname === "/landing") {
		console.log("Redirecting authenticated user from landing to home");
		return <Navigate to="/home" replace />;
	}

	// If user is not signed in and trying to access a protected route, redirect to landing
	if (!isSignedIn && !publicRoutes.includes(location.pathname)) {
		console.log("Redirecting unauthenticated user to landing page");
		return <Navigate to="/landing" replace />;
	}

	// For all other cases, render the children
	console.log("Rendering children for path:", location.pathname);
	return <>{children}</>;
};

export default AuthWrapper;
