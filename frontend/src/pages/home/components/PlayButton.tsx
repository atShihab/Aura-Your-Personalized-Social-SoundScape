import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Song } from "@/types";
import { Pause, Play } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import LoginModal from "@/components/LoginModal";

const PlayButton = ({ song }: { song: Song }) => {
	const { currentSong, isPlaying, setCurrentSong, togglePlay } = usePlayerStore();
	const { user } = useUser();
	const [showLoginModal, setShowLoginModal] = useState(false);
	const isCurrentSong = currentSong?._id === song._id;

	const handlePlay = (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent the card click from triggering
		
		// Check if user is logged in
		if (!user) {
			setShowLoginModal(true);
			return;
		}

		// User is logged in, proceed with playing
		if (isCurrentSong) togglePlay();
		else setCurrentSong(song);
	};

	return (
		<>
			<Button
				size={"icon"}
				onClick={handlePlay}
				className={`absolute bottom-3 right-2 bg-green-500 hover:bg-green-400 hover:scale-105 transition-all 
					opacity-0 translate-y-2 group-hover:translate-y-0 ${
						isCurrentSong ? "opacity-100" : "opacity-0 group-hover:opacity-100"
					}`}
			>
				{isCurrentSong && isPlaying ? (
					<Pause className='size-5 text-black' />
				) : (
					<Play className='size-5 text-black' />
				)}
			</Button>

			{/* Login Modal */}
			<LoginModal
				isOpen={showLoginModal}
				onClose={() => setShowLoginModal(false)}
				songTitle={song.title}
				albumCover={song.imageUrl}
			/>
		</>
	);
};
export default PlayButton;
