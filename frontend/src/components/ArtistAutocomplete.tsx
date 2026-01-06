import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios";
import { Mic, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Artist {
	_id: string;
	artistName: string;
	imageUrl: string;
	isVerified: boolean;
}

interface ArtistAutocompleteProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

const ArtistAutocomplete = ({ value, onChange, placeholder = "Search artist...", className = "" }: ArtistAutocompleteProps) => {
	const [suggestions, setSuggestions] = useState<Artist[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout>();
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setShowSuggestions(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const searchArtists = async (query: string) => {
		if (!query || query.length < 2) {
			setSuggestions([]);
			return;
		}

		setIsLoading(true);
		try {
			const response = await axiosInstance.get(`/artists/autocomplete?q=${encodeURIComponent(query)}`);
			setSuggestions(response.data.artists || []);
		} catch (error) {
			console.error('Error searching artists:', error);
			setSuggestions([]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputChange = (newValue: string) => {
		onChange(newValue);
		
		// Clear previous timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		// Set new timeout for search
		timeoutRef.current = setTimeout(() => {
			searchArtists(newValue);
		}, 300);
	};

	const handleArtistSelect = (artist: Artist) => {
		onChange(artist.artistName);
		setShowSuggestions(false);
		setSuggestions([]);
	};

	const clearInput = () => {
		onChange('');
		setSuggestions([]);
		setShowSuggestions(false);
	};

	return (
		<div ref={containerRef} className={`relative ${className}`}>
			<div className="relative">
				<Input
					value={value}
					onChange={(e) => handleInputChange(e.target.value)}
					onFocus={() => setShowSuggestions(true)}
					placeholder={placeholder}
					className="pr-10"
				/>
				<div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
					{value && (
						<button
							onClick={clearInput}
							className="p-1 hover:bg-zinc-700 rounded"
						>
							<X className="h-4 w-4 text-zinc-400" />
						</button>
					)}
					<Search className="h-4 w-4 text-zinc-400" />
				</div>
			</div>

			{/* Suggestions dropdown */}
			{showSuggestions && (suggestions.length > 0 || isLoading) && (
				<div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
					{isLoading ? (
						<div className="p-4 text-center text-zinc-400">
							Searching...
						</div>
					) : (
						<div className="py-1">
							{suggestions.map((artist) => (
								<button
									key={artist._id}
									onClick={() => handleArtistSelect(artist)}
									className="w-full px-4 py-2 text-left hover:bg-zinc-700 flex items-center gap-3 transition-colors"
								>
									<Avatar className="w-8 h-8">
										<AvatarImage src={artist.imageUrl} alt={artist.artistName} />
										<AvatarFallback className="bg-zinc-700 text-white text-sm">
											{artist.artistName[0]}
										</AvatarFallback>
									</Avatar>
									<div className="flex items-center gap-2">
										<span className="text-white font-medium">{artist.artistName}</span>
										{artist.isVerified && (
											<div className="bg-blue-500 rounded-full p-1">
												<Mic className="w-3 h-3 text-white" />
											</div>
										)}
									</div>
								</button>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default ArtistAutocomplete;
