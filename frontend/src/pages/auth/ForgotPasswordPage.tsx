import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Loader2, Mail, ArrowLeft, CheckCircle, Lock, Eye, EyeOff } from "lucide-react";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [isEmailSent, setIsEmailSent] = useState(false);
	const [isOtpVerified, setIsOtpVerified] = useState(false);

	const { signIn, isLoaded } = useSignIn();
	const navigate = useNavigate();

	const handleSendOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		if (!signIn) {
			setError("Sign-in service not available");
			setIsLoading(false);
			return;
		}

		try {
			// Send password reset OTP
			await signIn.create({
				strategy: "reset_password_email_code",
				identifier: email,
			});

			setIsEmailSent(true);
		} catch (err: any) {
			console.error("Password reset error:", err);
			setError(err.errors?.[0]?.message || "Failed to send reset OTP. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleVerifyOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		if (!signIn) {
			setError("Sign-in service not available");
			setIsLoading(false);
			return;
		}

		try {
			// For password reset with OTP, we need to complete the reset flow
			// The OTP is already verified when we sent it, now we set the new password
			await signIn.attemptFirstFactor({
				strategy: "reset_password_email_code",
				code: otp,
				password: newPassword,
			});
			
			// Password reset successful
			setIsOtpVerified(true);
			setTimeout(() => {
				console.log("Password reset successful, redirecting to login");
				window.location.href = "/login";
			}, 2000);
		} catch (err: any) {
			console.error("OTP verification error:", err);
			setError(err.errors?.[0]?.message || "Invalid OTP. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleResendOtp = async () => {
		setError("");
		setIsLoading(true);

		if (!signIn) {
			setError("Sign-in service not available");
			setIsLoading(false);
			return;
		}

		try {
			await signIn.create({
				strategy: "reset_password_email_code",
				identifier: email,
			});
			setError("Reset OTP resent! Check your email.");
		} catch (err: any) {
			setError("Failed to resend OTP. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	if (!isLoaded) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
				<div className="text-center">
					<Loader2 className="size-8 animate-spin text-emerald-500 mx-auto mb-4" />
					<p className="text-zinc-400">Loading form...</p>
				</div>
			</div>
		);
	}

	if (isOtpVerified) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
				<div className="w-full max-w-md text-center">
					<CheckCircle className="size-16 text-emerald-500 mx-auto mb-4" />
					<h1 className="text-2xl font-bold text-white mb-2">Password Reset Successful!</h1>
					<p className="text-zinc-400 mb-8">
						Your password has been updated successfully.
					</p>
					<p className="text-zinc-400 mb-8">
						Redirecting you to the login page...
					</p>
				</div>
			</div>
		);
	}

	if (isEmailSent) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
				<div className="w-full max-w-md">
					{/* Logo and Title */}
					<div className="text-center mb-8">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full mb-4">
							<Mail className="size-8 text-white" />
						</div>
						<h1 className="text-3xl font-bold text-white mb-2">Enter Reset OTP</h1>
						<p className="text-zinc-400">We sent a 6-digit code to {email}</p>
					</div>

					{/* OTP Verification Form */}
					<Card className="bg-zinc-800/50 border-zinc-700 shadow-2xl">
						<CardHeader className="text-center">
							<CardTitle className="text-2xl text-white">Verify OTP</CardTitle>
							<CardDescription className="text-zinc-400">
								Enter the 6-digit code from your email
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleVerifyOtp} className="space-y-4">
								{/* OTP Input */}
								<Input
									type="text"
									placeholder="Enter 6-digit OTP"
									value={otp}
									onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
									required
									maxLength={6}
									className="bg-zinc-700/50 border-zinc-600 text-white placeholder:text-zinc-400 focus:border-emerald-500 text-center text-2xl tracking-widest"
								/>

								{/* New Password */}
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 size-4" />
									<Input
										type={showPassword ? "text" : "password"}
										placeholder="Enter new password"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										required
										minLength={8}
										className="bg-zinc-700/50 border-zinc-600 text-white placeholder:text-zinc-400 focus:border-emerald-500 pl-10 pr-10"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
									>
										{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
									</button>
								</div>

								{/* Error Message */}
								{error && (
									<div className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-md p-3">
										{error}
									</div>
								)}

								{/* Submit Button */}
								<Button
									type="submit"
									disabled={isLoading || otp.length !== 6 || newPassword.length < 8}
									className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isLoading ? (
										<>
											<Loader2 className="size-5 animate-spin mr-2" />
											Resetting Password...
										</>
									) : (
										"Reset Password"
									)}
								</Button>

								{/* Resend OTP */}
								<div className="text-center">
									<button
										type="button"
										onClick={handleResendOtp}
										disabled={isLoading}
										className="text-sm text-emerald-400 hover:text-emerald-300 hover:underline transition-colors disabled:opacity-50"
									>
										Didn't receive the code? Resend
									</button>
								</div>
							</form>

							{/* Back to Login */}
							<div className="mt-6 text-center">
								<Button
									variant="outline"
									onClick={() => window.location.href = "/login"}
									className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all duration-200"
								>
									<ArrowLeft className="size-4 mr-2" />
									Back to Login
								</Button>
							</div>
						</CardContent>
					</Card>
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
					<h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
					<p className="text-zinc-400">Enter your email to receive a reset OTP</p>
				</div>

				{/* Reset Form */}
				<Card className="bg-zinc-800/50 border-zinc-700 shadow-2xl">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl text-white">Forgot Your Password?</CardTitle>
						<CardDescription className="text-zinc-400">
							No worries! Enter your email and we'll send you a 6-digit OTP.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSendOtp} className="space-y-4">
							{/* Email */}
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 size-4" />
								<Input
									type="email"
									placeholder="Enter your email address"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="bg-zinc-700/50 border-zinc-600 text-white placeholder:text-zinc-400 focus:border-emerald-500 pl-10"
								/>
							</div>

							{/* Error Message */}
							{error && (
								<div className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-md p-3">
									{error}
								</div>
							)}

							{/* Submit Button */}
							<Button
								type="submit"
								disabled={isLoading}
								className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg font-semibold rounded-lg transition-all duration-200"
							>
								{isLoading ? (
									<>
										<Loader2 className="size-5 animate-spin mr-2" />
										Sending Reset OTP...
									</>
								) : (
									"Send Reset OTP"
								)}
							</Button>
						</form>

						{/* Back to Login */}
						<div className="mt-6 text-center">
							<Button
								variant="outline"
								onClick={() => window.location.href = "/login"}
								className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all duration-200"
							>
								<ArrowLeft className="size-4 mr-2" />
								Back to Login
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default ForgotPasswordPage;
