import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Mic, Play, Heart, MessageCircle, Users, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Artist = {
	_id: string;
	fullName: string;
	artistName?: string;
	imageUrl: string;
	isVerified?: boolean;
	followers?: number;
	genre?: string;
};

type PopularArtistsProps = {
	artists: Artist[];
	isLoading: boolean;
};

const PopularArtists = ({ artists, isLoading }: PopularArtistsProps) => {
	const navigate = useNavigate();
	
	if (isLoading) {
		return (
			<div className='mb-6 md:mb-8'>
				<div className='flex items-center justify-between mb-3 md:mb-4'>
					<h2 className='text-lg sm:text-xl md:text-2xl font-bold text-white'>Popular artists</h2>
					<Button 
						variant='link' 
						className='text-emerald-400 hover:text-emerald-300'
						onClick={() => navigate('/search?q=artists&type=artists')}
					>
						Show all <ArrowRight className="ml-1 w-4 h-4" />
					</Button>
				</div>
				<div className='flex gap-4 overflow-x-auto pb-2'>
					{Array.from({ length: 6 }).map((_, index) => (
						<div key={index} className='flex flex-col items-center gap-3 min-w-[120px]'>
							<div className='w-20 h-20 bg-zinc-800 rounded-full animate-pulse' />
							<div className='w-16 h-4 bg-zinc-800 rounded animate-pulse' />
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className='mb-6 md:mb-8'>
			<div className='flex items-center justify-between mb-3 md:mb-4'>
				<h2 className='text-lg sm:text-xl md:text-2xl font-bold text-white'>Popular artists</h2>
				<Button 
					variant='link' 
					className='text-emerald-400 hover:text-emerald-300'
					onClick={() => navigate('/search?q=artists&type=artists')}
				>
					Show all <ArrowRight className="ml-1 w-4 h-4" />
				</Button>
			</div>
			
			{artists.length > 0 ? (
				<div className='flex gap-4 overflow-x-auto pb-2'>
					{artists.map((artist) => (
					<HoverCard key={artist._id}>
						<HoverCardTrigger asChild>
							<div className='flex flex-col items-center gap-3 min-w-[120px] cursor-pointer group'>
								<div className='relative'>
									<Avatar className='w-20 h-20 border-2 border-zinc-700 hover:border-emerald-500 transition-all duration-300 group-hover:scale-110'>
										<AvatarImage src={artist.imageUrl} alt={artist.artistName || artist.fullName} />
										<AvatarFallback className='bg-gradient-to-br from-emerald-500 to-blue-600 text-white text-lg font-semibold'>
											{(artist.artistName || artist.fullName)[0]}
										</AvatarFallback>
									</Avatar>
									{artist.isVerified && (
										<div className='absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 shadow-lg'>
											<CheckCircle className='w-3 h-3 text-white' />
										</div>
									)}
									<div className='absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
										<Play className='w-6 h-6 text-white' />
									</div>
								</div>
								<div className='text-center'>
									<h3 className='font-medium text-sm text-white truncate w-full'>{artist.artistName || artist.fullName}</h3>
									{artist.genre && (
										<p className='text-xs text-zinc-400 mt-1'>{artist.genre}</p>
									)}
								</div>
							</div>
						</HoverCardTrigger>
						<HoverCardContent className="w-80 bg-zinc-800 border-zinc-700">
							<div className="flex justify-between space-x-4">
								<Avatar className="w-16 h-16">
									<AvatarImage src={artist.imageUrl} alt={artist.artistName || artist.fullName} />
									<AvatarFallback className="bg-gradient-to-br from-emerald-500 to-blue-600 text-white">
										{(artist.artistName || artist.fullName)[0]}
									</AvatarFallback>
								</Avatar>
								<div className="space-y-1">
									<div className="flex items-center space-x-2">
										<h4 className="text-sm font-semibold text-white">{artist.artistName || artist.fullName}</h4>
										{artist.isVerified && (
											<Badge className="bg-blue-500 text-white text-xs">
												<CheckCircle className="w-3 h-3 mr-1" />
												Verified
											</Badge>
										)}
									</div>
									{artist.genre && (
										<p className="text-xs text-zinc-400">{artist.genre}</p>
									)}
									{artist.followers && (
										<div className="flex items-center text-xs text-zinc-400">
											<Users className="w-3 h-3 mr-1" />
											{artist.followers > 1000000 
												? `${(artist.followers / 1000000).toFixed(1)}M` 
												: artist.followers > 1000 
												? `${(artist.followers / 1000).toFixed(1)}K` 
												: artist.followers
											} followers
										</div>
									)}
								</div>
							</div>
							<div className="flex items-center justify-between pt-4">
								<Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
									<Heart className="w-4 h-4 mr-2" />
									Follow
								</Button>
								<div className="flex space-x-2">
									<Button size="sm" variant="outline" className="border-zinc-600 text-zinc-400 hover:bg-zinc-700">
										<Play className="w-4 h-4" />
									</Button>
									<Button size="sm" variant="outline" className="border-zinc-600 text-zinc-400 hover:bg-zinc-700">
										<MessageCircle className="w-4 h-4" />
									</Button>
								</div>
							</div>
						</HoverCardContent>
					</HoverCard>
				))}
			</div>
		) : (
			<div className='text-center py-8'>
				<Mic className='w-12 h-12 text-zinc-500 mx-auto mb-3' />
				<p className='text-zinc-400 text-sm'>No artists available</p>
				<p className='text-zinc-500 text-xs mt-1'>Check back later for featured artists</p>
			</div>
		)}
		</div>
	);
};

export default PopularArtists;
