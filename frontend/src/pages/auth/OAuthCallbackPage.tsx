import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader, CheckCircle } from "lucide-react";
import { useState } from "react";

const OAuthCallbackPage = () => {
	const { isLoaded, isSignedIn } = useAuth();
	const navigate = useNavigate();
	const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

	useEffect(() => {
		if (!isLoaded) return;

		// If user is signed in, redirect to home
		if (isSignedIn) {
			setStatus("success");
			// Small delay to show success state
			setTimeout(() => {
				console.log("OAuth sign-in successful, redirecting to home");
				window.location.href = "/";
			}, 1500);
		} else {
			// If not signed in after OAuth, something went wrong
			setStatus("error");
			setTimeout(() => {
				console.log("OAuth sign-in failed, redirecting to login");
				window.location.href = "/login";
			}, 2000);
		}
	}, [isLoaded, isSignedIn]);

	if (status === "loading") {
		return (
			<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
				<Card className="w-[90%] max-w-md bg-zinc-800/50 border-zinc-700 shadow-2xl">
					<CardContent className="flex flex-col items-center gap-4 pt-6">
						<Loader className="size-8 text-emerald-500 animate-spin" />
						<h3 className="text-white text-xl font-bold">Completing Sign In</h3>
						<p className="text-zinc-400 text-sm">Please wait while we complete your authentication...</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (status === "success") {
		return (
			<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
				<Card className="w-[90%] max-w-md bg-zinc-800/50 border-zinc-700 shadow-2xl">
					<CardContent className="flex flex-col items-center gap-4 pt-6">
						<CheckCircle className="size-8 text-emerald-500" />
						<h3 className="text-white text-xl font-bold">Successfully Signed In!</h3>
						<p className="text-zinc-400 text-sm">Redirecting you to the home page...</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
			<Card className="w-[90%] max-w-md bg-zinc-800/50 border-zinc-700 shadow-2xl">
				<CardContent className="flex flex-col items-center gap-4 pt-6">
					<div className="size-8 text-red-500">❌</div>
					<h3 className="text-white text-xl font-bold">Authentication Failed</h3>
					<p className="text-zinc-400 text-sm">Redirecting you to the login page...</p>
				</CardContent>
			</Card>
		</div>
	);
};

export default OAuthCallbackPage;
