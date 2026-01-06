import { UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect } from "react";

const Header = () => {
	const { isArtist, checkArtistStatus } = useAuthStore();

	useEffect(() => {
		checkArtistStatus();
	}, [checkArtistStatus]);

	return (
		<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
			<div className='flex items-center gap-3'>
				<Link to='/' className='rounded-lg hover:opacity-80 transition-opacity'>
					<img 
						src='/aura.svg' 
						className='size-10 sm:size-12 md:size-14' 
						alt='AURA MUSIC logo'
						onError={(e) => {
							console.warn('Aura logo not found');
						}}
					/>
				</Link>
				<div>
					<h1 className='text-xl sm:text-2xl md:text-3xl font-bold'>Music Manager</h1>
					<p className='text-zinc-400 mt-1 text-sm sm:text-base'>Manage your music catalog</p>
				</div>
			</div>
			<div className='flex items-center gap-3 justify-end'>
				{isArtist && (
					<Link to="/artist-dashboard">
						<Button variant="outline" className="bg-purple-500/20 border-purple-500/50 text-purple-300 hover:bg-purple-500/30">
							<Mic className="mr-2 h-4 w-4" />
							Artist Dashboard
						</Button>
					</Link>
				)}
				<UserButton />
			</div>
		</div>
	);
};
export default Header;
