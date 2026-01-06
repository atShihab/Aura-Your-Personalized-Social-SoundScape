import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Loader2, Mail, CheckCircle, XCircle } from "lucide-react";

const VerifyEmailPage = () => {
	const [code, setCode] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [isVerified, setIsVerified] = useState(false);

	const { signUp, isLoaded } = useSignUp();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		if (!isLoaded || !signUp) {
			setError("Please wait while we load the verification form...");
			setIsLoading(false);
			return;
		}

		try {
			// Attempt to verify the email
			const result = await signUp.attemptEmailAddressVerification({
				code,
			});

			if (result.status === "complete") {
				setIsVerified(true);
				// Redirect to home after a short delay
				setTimeout(() => {
					console.log("Email verification successful, redirecting to home");
					window.location.href = "/";
				}, 2000);
			} else {
				setError("Verification failed. Please try again.");
			}
		} catch (err: any) {
			console.error("Verification error:", err);
			setError(err.errors?.[0]?.message || "Invalid verification code. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleResendCode = async () => {
		setError("");
		setIsLoading(true);

		if (!signUp) {
			setError("Sign-up service not available");
			setIsLoading(false);
			return;
		}

		try {
			await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
			setError("Verification code resent! Check your email.");
		} catch (err: any) {
			setError("Failed to resend code. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	if (!isLoaded) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
				<div className="text-center">
					<Loader2 className="size-8 animate-spin text-emerald-500 mx-auto mb-4" />
					<p className="text-zinc-400">Loading verification form...</p>
				</div>
			</div>
		);
	}

	if (isVerified) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
				<div className="text-center">
					<CheckCircle className="size-16 text-emerald-500 mx-auto mb-4" />
					<h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
					<p className="text-zinc-400">Your account has been created successfully.</p>
					<p className="text-zinc-400 mt-2">Redirecting you to the home page...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Logo and Title */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full mb-4">
						<Mail className="size-8 text-white" />
					</div>
					<h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
					<p className="text-zinc-400">We sent a verification code to your email</p>
				</div>

				{/* Verification Form */}
				<Card className="bg-zinc-800/50 border-zinc-700 shadow-2xl">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl text-white">Enter Verification Code</CardTitle>
						<CardDescription className="text-zinc-400">
							Check your email and enter the 6-digit code
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							{/* Verification Code */}
							<Input
								type="text"
								placeholder="Enter 6-digit code"
								value={code}
								onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
								required
								maxLength={6}
								className="bg-zinc-700/50 border-zinc-600 text-white placeholder:text-zinc-400 focus:border-emerald-500 text-center text-2xl tracking-widest"
							/>

							{/* Error Message */}
							{error && (
								<div className={`text-sm rounded-md p-3 ${
									error.includes("resent") 
										? "text-emerald-400 bg-emerald-900/20 border border-emerald-500/30"
										: "text-red-400 bg-red-900/20 border border-red-500/30"
								}`}>
									{error}
								</div>
							)}

							{/* Submit Button */}
							<Button
								type="submit"
								disabled={isLoading || code.length !== 6}
								className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isLoading ? (
									<>
										<Loader2 className="size-5 animate-spin mr-2" />
										Verifying...
									</>
								) : (
									"Verify Email"
								)}
							</Button>

							{/* Resend Code */}
							<div className="text-center">
								<button
									type="button"
									onClick={handleResendCode}
									disabled={isLoading}
									className="text-sm text-emerald-400 hover:text-emerald-300 hover:underline transition-colors disabled:opacity-50"
								>
									Didn't receive the code? Resend
								</button>
							</div>
						</form>

						{/* Back to Sign Up */}
						<div className="mt-6 text-center">
							<Button
								variant="outline"
								onClick={() => window.location.href = "/sign-up"}
								className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all duration-200"
							>
								Back to Sign Up
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default VerifyEmailPage;
