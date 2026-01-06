import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Headphones, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const SignUpPage = () => {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const { signUp, isLoaded } = useSignUp();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		if (!isLoaded) {
			setError("Please wait while we load the sign-up form...");
			setIsLoading(false);
			return;
		}

		// Validate required fields
		if (!firstName.trim() || !lastName.trim()) {
			setError("First name and last name are required");
			setIsLoading(false);
			return;
		}

		try {
			// Start the sign-up process
			await signUp.create({
				firstName: firstName.trim(),
				lastName: lastName.trim(),
				emailAddress: email,
				password,
			});

			// Send verification email
			await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

			// Redirect to verification page
			console.log("Sign-up successful, redirecting to email verification");
			window.location.href = "/verify-email";
		} catch (err: any) {
			console.error("Sign-up error:", err);
			setError(err.errors?.[0]?.message || "Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleSignUp = async () => {
		try {
			await signUp?.authenticateWithRedirect({
				strategy: "oauth_google",
				redirectUrl: "/oauth-callback",
				redirectUrlComplete: "/oauth-callback"
			});
		} catch (error) {
			console.error("Google sign-up error:", error);
			setError("Failed to sign up with Google. Please try again.");
		}
	};

	if (!isLoaded) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden flex items-center justify-center p-4">
				{/* Animated Background Elements */}
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
					<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
				</div>
				<div className="relative z-10 text-center">
					<Loader2 className="size-8 animate-spin text-cyan-400 mx-auto mb-4" />
					<p className="text-gray-300">Loading Aura...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden flex items-center justify-center p-4">
			{/* Animated Background Elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-300/10 to-pink-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
			</div>

			{/* Particle Effects */}
			<div className="absolute inset-0">
				{[...Array(30)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
						style={{
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
						}}
						animate={{
							y: [0, -20, 0],
							opacity: [0.3, 1, 0.3],
						}}
						transition={{
							duration: 3 + Math.random() * 2,
							repeat: Infinity,
							delay: Math.random() * 2,
						}}
					/>
				))}
			</div>

			<div className="relative z-10 w-full max-w-sm sm:max-w-md">
				{/* Logo and Title */}
				<motion.div 
					className="text-center mb-8"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					<div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6">
						<img 
							src="/aura.svg" 
							className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28" 
							alt="AURA MUSIC logo"
							onError={(e) => {
								console.warn('Aura logo not found');
							}}
						/>
					</div>
					<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 sm:mb-3 text-glow-gradient">
						Join AURA
					</h1>
					<p className="text-gray-300 text-sm sm:text-base md:text-lg">Experience the future of music streaming</p>
				</motion.div>

				{/* Sign Up Form */}
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
				>
					<Card className="backdrop-blur-md bg-white/5 border border-cyan-400/20 shadow-2xl shadow-cyan-500/10">
						<CardHeader className="text-center">
							<CardTitle className="text-xl sm:text-2xl text-white">Create Account</CardTitle>
							<CardDescription className="text-gray-300 text-sm sm:text-base">
								Join the future of music streaming
							</CardDescription>
						</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							{/* First Name */}
							<Input
								type="text"
								placeholder="First Name"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								required
								className="backdrop-blur-md bg-white/10 border border-cyan-400/30 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
							/>
							{/* Last Name */}
							<Input
								type="text"
								placeholder="Last Name"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								required
								className="backdrop-blur-md bg-white/10 border border-cyan-400/30 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
							/>
							{/* Email */}
							<Input
								type="email"
								placeholder="Email Address"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="backdrop-blur-md bg-white/10 border border-cyan-400/30 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
							/>

							{/* Password */}
							<div className="relative">
								<Input
									type={showPassword ? "text" : "password"}
									placeholder="Password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									minLength={8}
									className="backdrop-blur-md bg-white/10 border border-cyan-400/30 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
								>
									{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
								</button>
							</div>

							{/* Error Message */}
							{error && (
								<div className="text-red-400 text-sm backdrop-blur-md bg-red-900/20 border border-red-500/30 rounded-lg p-3">
									{error}
								</div>
							)}

							{/* Submit Button */}
							<Button
								type="submit"
								disabled={isLoading}
								className="group relative w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
							>
								<div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
								<span className="relative flex items-center justify-center">
									{isLoading ? (
										<>
											<Loader2 className="size-5 animate-spin mr-2" />
											Creating Account...
										</>
									) : (
										<>
											<Sparkles className="size-5 mr-2" />
											Create Account
										</>
									)}
								</span>
							</Button>

							{/* Terms */}
							<p className="text-xs text-gray-400 text-center">
								By signing up, you agree to our{" "}
								<Link to="/terms" className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">
									Terms of Service
								</Link>{" "}
								and{" "}
								<Link to="/privacy" className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">
									Privacy Policy
								</Link>
							</p>
						</form>

						{/* Divider */}
						<div className="relative my-6">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-cyan-400/30" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-white/5 text-gray-400">Or continue with</span>
							</div>
						</div>

						{/* Google Sign Up Option */}
						<Button
							variant="outline"
							onClick={handleGoogleSignUp}
							className="w-full backdrop-blur-md bg-white/10 border border-purple-400/30 text-purple-300 hover:bg-purple-400/20 hover:text-white transition-all duration-300"
						>
							<svg className="size-4 mr-2" viewBox="0 0 24 24">
								<path
									fill="currentColor"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="currentColor"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="currentColor"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="currentColor"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
							Continue with Google
						</Button>

						{/* Divider */}
						<div className="relative my-6">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-cyan-400/30" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-white/5 text-gray-400">Already have an account?</span>
							</div>
						</div>

						{/* Login Link */}
						<Button
							variant="outline"
							onClick={() => window.location.href = "/login"}
							className="w-full backdrop-blur-md bg-white/10 border border-blue-400/30 text-blue-300 hover:bg-blue-400/20 hover:text-white transition-all duration-300"
						>
							<Zap className="size-4 mr-2" />
							Sign In
						</Button>
					</CardContent>
				</Card>
				</motion.div>
			</div>
		</div>
	);
};

export default SignUpPage;
