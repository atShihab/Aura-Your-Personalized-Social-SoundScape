import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useSignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

interface LoginModalProps {
	isOpen: boolean;
	onClose: () => void;
	songTitle?: string;
	albumCover?: string;
}

const LoginModal = ({ isOpen, onClose, songTitle = "Music", albumCover }: LoginModalProps) => {
	const { signIn } = useSignIn();
	const navigate = useNavigate();

	const handleSignIn = () => {
		onClose();
		navigate("/login");
	};

	const handleSignUp = () => {
		onClose();
		navigate("/sign-up");
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl p-0 bg-zinc-900 border-zinc-700">
				{/* Close button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-white hover:text-zinc-300 transition-colors z-10"
				>
					<X className="size-6" />
				</button>

				<div className="flex">
					{/* Left side - Album cover */}
					<div className="w-1/2 bg-gradient-to-br from-zinc-800 to-zinc-900 p-8 flex items-center justify-center">
						<div className="text-center">
							{albumCover ? (
								<img
									src={albumCover}
									alt={songTitle}
									className="w-48 h-48 object-cover rounded-lg shadow-2xl mx-auto mb-4"
								/>
							) : (
								<div className="w-48 h-48 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg shadow-2xl mx-auto mb-4 flex items-center justify-center">
									<span className="text-white text-4xl font-bold">🎵</span>
								</div>
							)}
							<h3 className="text-white text-xl font-semibold">{songTitle}</h3>
						</div>
					</div>

					{/* Right side - Content and buttons */}
					<div className="w-1/2 p-8 flex flex-col justify-center">
						<DialogHeader>
							<DialogTitle className="text-white text-2xl font-bold text-left mb-6">
								Start listening with a free account
							</DialogTitle>
						</DialogHeader>

						<div className="space-y-4">
							{/* Sign up button */}
							<Button
								onClick={handleSignUp}
								className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold rounded-full"
							>
								Sign up free
							</Button>

							{/* Download app button */}
							<Button
								onClick={() => window.open('https://github.com/your-repo', '_blank')}
								variant="outline"
								className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 text-lg font-semibold rounded-full border-zinc-600"
							>
								Download app
							</Button>

							{/* Login link */}
							<div className="text-center pt-4">
								<span className="text-zinc-400">Already have an account? </span>
								<button
									onClick={handleSignIn}
									className="text-white hover:text-emerald-400 underline font-medium"
								>
									Log in
								</button>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default LoginModal;
