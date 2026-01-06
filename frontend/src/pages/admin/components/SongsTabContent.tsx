import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Music, Search, X } from "lucide-react";
import { useState } from "react";
import SongsTable from "./SongsTable";
import AddSongDialog from "./AddSongDialog";

const SongsTabContent = () => {
	const [searchQuery, setSearchQuery] = useState("");

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		// Search functionality will be handled by SongsTable component
	};

	const clearSearch = () => {
		setSearchQuery("");
	};

	return (
		<Card>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='flex items-center gap-2'>
							<Music className='size-5 text-emerald-500' />
							Songs Library
						</CardTitle>
						<CardDescription>Manage your music tracks</CardDescription>
					</div>
					<AddSongDialog />
				</div>
				
				{/* Search Bar */}
				<form onSubmit={handleSearch} className="mt-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 size-4" />
						<Input
							type="text"
							placeholder="Search songs by title, artist, or genre..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 pr-10 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 focus:border-emerald-500"
						/>
						{searchQuery && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={clearSearch}
								className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-zinc-400 hover:text-white"
							>
								<X className="size-4" />
							</Button>
						)}
					</div>
				</form>
			</CardHeader>
			<CardContent className='overflow-x-auto'>
				<SongsTable searchQuery={searchQuery} />
			</CardContent>
		</Card>
	);
};
export default SongsTabContent;
