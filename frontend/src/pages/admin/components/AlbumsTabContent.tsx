import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Library, Search, X } from "lucide-react";
import { useState } from "react";
import AlbumsTable from "./AlbumsTable";
import AddAlbumDialog from "./AddAlbumDialog";

const AlbumsTabContent = () => {
	const [searchQuery, setSearchQuery] = useState("");

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		// Search functionality will be handled by AlbumsTable component
	};

	const clearSearch = () => {
		setSearchQuery("");
	};

	return (
		<Card className='bg-zinc-800/50 border-zinc-700/50'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='flex items-center gap-2'>
							<Library className='h-5 w-5 text-violet-500' />
							Albums Library
						</CardTitle>
						<CardDescription>Manage your album collection</CardDescription>
					</div>
					<AddAlbumDialog />
				</div>
				
				{/* Search Bar */}
				<form onSubmit={handleSearch} className="mt-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 size-4" />
						<Input
							type="text"
							placeholder="Search albums by title, artist, or genre..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 pr-10 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 focus:border-violet-500"
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
				<AlbumsTable searchQuery={searchQuery} />
			</CardContent>
		</Card>
	);
};
export default AlbumsTabContent;
