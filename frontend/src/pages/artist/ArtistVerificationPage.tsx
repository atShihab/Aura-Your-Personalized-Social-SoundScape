import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@clerk/clerk-react";
import { 
	CheckCircle, 
	Clock, 
	XCircle, 
	AlertCircle, 
	Loader2, 
	Mic, 
	Shield, 
	FileText,
	Instagram,
	Twitter,
	Youtube,
	Music,
	Star
} from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

interface VerificationStatus {
	verificationStatus: 'pending' | 'approved' | 'rejected';
	isVerified: boolean;
	verificationDate?: string;
	verificationType: 'artist' | 'industry';
	verificationNotes?: string;
}

const ArtistVerificationPage = () => {
	const { user } = useUser();
	const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (user) {
			fetchVerificationStatus();
		}
	}, [user]);

	const fetchVerificationStatus = async () => {
		try {
			const response = await axiosInstance.get("/artists/verification/status");
			setVerificationStatus(response.data);
		} catch (err: any) {
			console.error("Error fetching verification status:", err);
			if (err.response?.status === 400) {
				// User is not an artist yet
				setVerificationStatus(null);
			} else {
				setError("Failed to fetch verification status");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const submitVerification = async () => {
		setIsSubmitting(true);
		try {
			await axiosInstance.post("/artists/verify", { verificationType: 'artist' });
			toast.success("Verification submitted successfully!");
			await fetchVerificationStatus(); // Refresh status
		} catch (err: any) {
			console.error("Error submitting verification:", err);
			const errorMessage = err.response?.data?.message || "Failed to submit verification";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!user) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
				<Card className="w-full max-w-md bg-zinc-800/50 border-zinc-700 shadow-2xl">
					<CardContent className="text-center pt-6">
						<Mic className="size-12 text-blue-500 mx-auto mb-4" />
						<h3 className="text-white text-xl font-bold mb-2">Authentication Required</h3>
						<p className="text-zinc-400 text-sm mb-4">Please sign in to check verification status</p>
						<Button onClick={() => window.location.href = "/login"} className="w-full">
							Sign In
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
				<Card className="w-full max-w-md bg-zinc-800/50 border-zinc-700 shadow-2xl">
					<CardContent className="text-center pt-6">
						<Loader2 className="size-12 text-blue-500 animate-spin mx-auto mb-4" />
						<h3 className="text-white text-xl font-bold mb-2">Loading...</h3>
						<p className="text-zinc-400 text-sm">Checking verification status</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	// User is not an artist yet
	if (!verificationStatus) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
				<div className="w-full max-w-sm sm:max-w-md md:max-w-2xl">
					{/* Header */}
					<div className="text-center mb-6 sm:mb-8">
						<div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-3 sm:mb-4">
							<Mic className="size-8 sm:size-10 text-white" />
						</div>
						<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Become an Artist</h1>
						<p className="text-zinc-400 text-sm sm:text-base md:text-lg">Create your artist profile to get started</p>
					</div>

					<Card className="bg-zinc-800/50 border-zinc-700 shadow-2xl">
						<CardHeader className="text-center">
							<CardTitle className="text-xl sm:text-2xl text-white">Artist Profile Required</CardTitle>
							<CardDescription className="text-zinc-400 text-sm sm:text-base">
								You need to create an artist profile before applying for verification
							</CardDescription>
						</CardHeader>
						<CardContent className="text-center space-y-6">
							<div className="text-zinc-400">
								<p>To get verified as an artist, you first need to:</p>
								<ol className="list-decimal list-inside mt-2 space-y-1 text-left max-w-md mx-auto">
									<li>Create your artist profile</li>
									<li>Add your music and bio</li>
									<li>Submit for verification</li>
									<li>Wait for approval</li>
								</ol>
							</div>

							<Button
								onClick={() => window.location.href = "/artist/signup"}
								className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold rounded-lg"
							>
								Create Artist Profile
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	const getStatusIcon = () => {
		switch (verificationStatus.verificationStatus) {
			case 'approved':
				return <CheckCircle className="size-16 text-green-500" />;
			case 'pending':
				return <Clock className="size-16 text-amber-500" />;
			case 'rejected':
				return <XCircle className="size-16 text-red-500" />;
			default:
				return <AlertCircle className="size-16 text-zinc-500" />;
		}
	};

	const getStatusColor = () => {
		switch (verificationStatus.verificationStatus) {
			case 'approved':
				return 'text-green-500';
			case 'pending':
				return 'text-amber-500';
			case 'rejected':
				return 'text-red-500';
			default:
				return 'text-zinc-500';
		}
	};

	const getStatusMessage = () => {
		switch (verificationStatus.verificationStatus) {
			case 'approved':
				return "Your artist profile is now verified!";
			case 'pending':
				return "We're reviewing your verification request";
			case 'rejected':
				return "Your verification request was not approved";
			default:
				return "Unknown verification status";
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
			<div className="w-full max-w-sm sm:max-w-md md:max-w-4xl">
				{/* Header */}
				<div className="text-center mb-6 sm:mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-3 sm:mb-4">
						<Shield className="size-8 sm:size-10 text-white" />
					</div>
					<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Artist Verification</h1>
					<p className="text-zinc-400 text-sm sm:text-base md:text-lg">Get verified and build trust with your audience</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
					{/* Main Status Card */}
					<div className="lg:col-span-2">
						<Card className="bg-zinc-800/50 border-zinc-700 shadow-2xl">
							<CardHeader className="text-center">
								<div className="flex justify-center mb-4">
									{getStatusIcon()}
								</div>
								<CardTitle className={`text-xl sm:text-2xl font-bold ${getStatusColor()}`}>
									{verificationStatus.verificationStatus === 'approved' ? 'Artist Verified' : 
									 verificationStatus.verificationStatus === 'pending' ? 'Verification in Progress' :
									 'Verification Failed'}
								</CardTitle>
								<CardDescription className="text-zinc-400 text-sm sm:text-base md:text-lg">
									{getStatusMessage()}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Verification Details */}
								<div className="bg-zinc-700/30 rounded-lg p-4 space-y-3">
									<div className="flex justify-between items-center">
										<span className="text-zinc-400">Status:</span>
										<span className={`font-semibold ${getStatusColor()}`}>
											{verificationStatus.verificationStatus.charAt(0).toUpperCase() + 
											 verificationStatus.verificationStatus.slice(1)}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-zinc-400">Type:</span>
										<span className="text-white font-semibold">
											{verificationStatus.verificationType === 'artist' ? 'Artist' : 'Industry Professional'}
										</span>
									</div>
									{verificationStatus.verificationDate && (
										<div className="flex justify-between items-center">
											<span className="text-zinc-400">Verified on:</span>
											<span className="text-white font-semibold">
												{new Date(verificationStatus.verificationDate).toLocaleDateString()}
											</span>
										</div>
									)}
								</div>

								{/* Verification Notes */}
								{verificationStatus.verificationNotes && (
									<div className="bg-zinc-700/30 rounded-lg p-4">
										<h4 className="text-white font-semibold mb-2">Verification Notes:</h4>
										<p className="text-zinc-300 text-sm">{verificationStatus.verificationNotes}</p>
									</div>
								)}

								{/* Action Buttons */}
								{verificationStatus.verificationStatus === 'rejected' && (
									<div className="space-y-3">
										<Button
											onClick={submitVerification}
											disabled={isSubmitting}
											className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-lg"
										>
											{isSubmitting ? (
												<>
													<Loader2 className="size-5 animate-spin mr-2" />
													Resubmitting...
												</>
											) : (
												"Resubmit Verification"
											)}
										</Button>
										<p className="text-zinc-400 text-sm text-center">
											You can resubmit your verification request after addressing any issues
										</p>
									</div>
								)}

								{verificationStatus.verificationStatus === 'pending' && (
									<div className="text-center space-y-3">
										<div className="flex items-center justify-center gap-2 text-amber-500">
											<Clock className="size-5" />
											<span className="font-semibold">Processing Time: 3-5 business days</span>
										</div>
										<p className="text-zinc-400 text-sm">
											Our team is carefully reviewing your application. You'll receive an email notification once the review is complete.
										</p>
									</div>
								)}

								{verificationStatus.verificationStatus === 'approved' && (
									<div className="text-center space-y-4">
										<div className="flex justify-center">
											<VerifiedBadge size="lg" />
										</div>
										<div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
											<h4 className="text-green-400 font-semibold mb-2">🎉 Congratulations!</h4>
											<p className="text-green-300 text-sm">
												You're now a verified artist on Aura. Your profile will display the blue verification badge, 
												helping you build trust with listeners and grow your audience.
											</p>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Verification Requirements */}
						<Card className="bg-zinc-800/50 border-zinc-700 shadow-2xl">
							<CardHeader>
								<CardTitle className="text-white flex items-center gap-2">
									<FileText className="size-5" />
									Requirements
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-start gap-3">
									<CheckCircle className="size-5 text-green-500 mt-0.5 flex-shrink-0" />
									<span className="text-zinc-300 text-sm">Valid artist profile</span>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircle className="size-5 text-green-500 mt-0.5 flex-shrink-0" />
									<span className="text-zinc-300 text-sm">Original music content</span>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircle className="size-5 text-green-500 mt-0.5 flex-shrink-0" />
									<span className="text-zinc-300 text-sm">Active social media presence</span>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircle className="size-5 text-green-500 mt-0.5 flex-shrink-0" />
									<span className="text-zinc-300 text-sm">Professional bio and description</span>
								</div>
							</CardContent>
						</Card>

						{/* Benefits */}
						<Card className="bg-zinc-800/50 border-zinc-700 shadow-2xl">
							<CardHeader>
								<CardTitle className="text-white flex items-center gap-2">
									<Star className="size-5" />
									Verification Benefits
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-start gap-3">
									<VerifiedBadge size="sm" />
									<span className="text-zinc-300 text-sm">Blue verification badge</span>
								</div>
								<div className="flex items-start gap-3">
									<Music className="size-5 text-blue-500 mt-0.5 flex-shrink-0" />
									<span className="text-zinc-300 text-sm">Enhanced discoverability</span>
								</div>
								<div className="flex items-start gap-3">
									<Shield className="size-5 text-blue-500 mt-0.5 flex-shrink-0" />
									<span className="text-zinc-300 text-sm">Trust and credibility</span>
								</div>
								<div className="flex items-start gap-3">
									<Instagram className="size-5 text-blue-500 mt-0.5 flex-shrink-0" />
									<span className="text-zinc-300 text-sm">Priority in search results</span>
								</div>
							</CardContent>
						</Card>

						{/* Support */}
						<Card className="bg-zinc-800/50 border-zinc-700 shadow-2xl">
							<CardHeader>
								<CardTitle className="text-white">Need Help?</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<p className="text-zinc-400 text-sm">
									If you have questions about the verification process or need assistance, 
									our support team is here to help.
								</p>
								<Button
									variant="outline"
									className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white"
								>
									Contact Support
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ArtistVerificationPage;
