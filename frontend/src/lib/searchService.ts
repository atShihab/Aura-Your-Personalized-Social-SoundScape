import { axiosInstance } from "./axios";

// Import chat store for user search fallback
let chatStoreUsers: any[] = [];

// Function to set chat store users (called from components)
export const setChatStoreUsers = (users: any[]) => {
	chatStoreUsers = users;
};

export interface SearchSuggestion {
	id: string;
	text: string;
	type: 'recent' | 'trending' | 'suggestion';
	icon?: string;
}

export interface SearchResults {
	songs: any[];
	artists: any[];
	albums: any[];
	playlists: any[];
	users: any[];
	genres: any[];
}

export interface SearchFilters {
	type?: 'all' | 'songs' | 'playlists' | 'albums' | 'artists' | 'users' | 'genres';
	genre?: string;
	verified?: boolean;
	sortBy?: 'relevance' | 'popularity' | 'newest' | 'oldest';
}

class SearchService {
	private recentSearches: string[] = [];
	private readonly MAX_RECENT_SEARCHES = 10;

	// Get search suggestions (recent, trending, and general)
	async getSearchSuggestions(query: string = ''): Promise<SearchSuggestion[]> {
		const suggestions: SearchSuggestion[] = [];

		// Add recent searches
		if (this.recentSearches.length > 0) {
			suggestions.push(...this.recentSearches
				.filter(search => !query || (search?.toLowerCase() || '').includes((query || '').toLowerCase()))
				.map(search => ({
					id: `recent-${search}`,
					text: search,
					type: 'recent' as const,
					icon: 'Clock'
				}))
			);
		}

		// Add trending searches (mock data for now, can be replaced with real API)
		const trendingSearches = [
			'Pop Music',
			'Rock Classics',
			'Hip Hop',
			'Jazz',
			'Classical',
			'Electronic',
			'Folk',
			'Country'
		];

		suggestions.push(...trendingSearches
			.filter(search => !query || (search?.toLowerCase() || '').includes((query || '').toLowerCase()))
			.map(search => ({
				id: `trending-${search}`,
				text: search,
				type: 'trending' as const,
				icon: 'TrendingUp'
			}))
		);

		// Add genre suggestions
		const genreSuggestions = [
			'Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic',
			'Folk', 'Country', 'R&B', 'Reggae', 'Blues', 'Metal'
		];

		suggestions.push(...genreSuggestions
			.filter(genre => !query || (genre?.toLowerCase() || '').includes((query || '').toLowerCase()))
			.map(genre => ({
				id: `genre-${genre}`,
				text: genre,
				type: 'suggestion' as const,
				icon: 'Music'
			}))
		);

		// Remove duplicates and limit results
		const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
			index === self.findIndex(s => s.text === suggestion.text)
		);

		return uniqueSuggestions.slice(0, 15);
	}

	// Perform comprehensive search across all content types
	async searchAll(query: string, filters: SearchFilters = {}): Promise<SearchResults> {
		const results: SearchResults = {
			songs: [],
			artists: [],
			albums: [],
			playlists: [],
			users: [],
			genres: []
		};

		try {
			// Search songs
			if (filters.type === 'all' || filters.type === 'songs') {
				try {
					const songResponse = await axiosInstance.get(`/songs/search?q=${encodeURIComponent(query)}`);
					results.songs = songResponse.data || [];
				} catch (error) {
					console.error('Error searching songs:', error);
				}
			}

			// Search artists
			if (filters.type === 'all' || filters.type === 'artists') {
				try {
					const artistResponse = await axiosInstance.get(`/artists/search?q=${encodeURIComponent(query)}&limit=10`);
					results.artists = artistResponse.data?.artists || [];
				} catch (error) {
					console.error('Error searching artists:', error);
				}
			}

			// Search users
			if (filters.type === 'all' || filters.type === 'users') {
				try {
					const userResponse = await axiosInstance.get(`/users/search?q=${encodeURIComponent(query)}&type=all&limit=10`);
					results.users = userResponse.data?.users || [];
				} catch (error) {
					console.error('Error searching users:', error);
					// Fallback: Use chat store users like Topbar does
					if (chatStoreUsers.length > 0) {
						results.users = chatStoreUsers.filter(user => 
							(user.fullName?.toLowerCase() || '').includes((query || '').toLowerCase()) ||
							(user.handle?.toLowerCase() || '').includes((query || '').toLowerCase()) ||
							(user.artistName?.toLowerCase() || '').includes((query || '').toLowerCase())
						);
					} else {
						results.users = [];
					}
				}
			}

			// Search albums (using existing albums data for now)
			if (filters.type === 'all' || filters.type === 'albums') {
				try {
					const albumResponse = await axiosInstance.get('/albums');
					const allAlbums = albumResponse.data || [];
					results.albums = allAlbums.filter((album: any) => 
						(album.title?.toLowerCase() || '').includes((query || '').toLowerCase()) ||
						(album.artist?.toLowerCase() || '').includes((query || '').toLowerCase())
					);
				} catch (error) {
					console.error('Error searching albums:', error);
				}
			}

			// Search playlists
			if (filters.type === 'all' || filters.type === 'playlists') {
				try {
					const playlistResponse = await axiosInstance.get(`/playlists/search?q=${encodeURIComponent(query)}&limit=10`);
					results.playlists = playlistResponse.data?.playlists || [];
				} catch (error) {
					console.error('Error searching playlists:', error);
					// Fallback to mock data
					results.playlists = this.getMockPlaylists().filter(playlist =>
						(playlist.name?.toLowerCase() || '').includes((query || '').toLowerCase()) ||
						(playlist.creator?.toLowerCase() || '').includes((query || '').toLowerCase())
					);
				}
			}

			// Search genres
			if (filters.type === 'all' || filters.type === 'genres') {
				try {
					const genreResponse = await axiosInstance.get(`/genres/search?q=${encodeURIComponent(query)}&limit=10`);
					results.genres = genreResponse.data?.genres || [];
				} catch (error) {
					console.error('Error searching genres:', error);
					// Fallback to mock data
					results.genres = this.getMockGenres().filter(genre =>
						(genre.name?.toLowerCase() || '').includes((query || '').toLowerCase())
					);
				}
			}

			// Add to recent searches
			this.addToRecentSearches(query);

		} catch (error) {
			console.error('Error in comprehensive search:', error);
		}

		return results;
	}

	// Real-time search with debouncing
	async searchRealtime(query: string, filters: SearchFilters = {}): Promise<SearchResults> {
		if (query.length < 2) {
			return {
				songs: [],
				artists: [],
				albums: [],
				playlists: [],
				users: [],
				genres: []
			};
		}

		return this.searchAll(query, filters);
	}

	// Get artist autocomplete suggestions
	async getArtistSuggestions(query: string): Promise<any[]> {
		if (query.length < 2) return [];

		try {
			const response = await axiosInstance.get(`/artists/autocomplete?q=${encodeURIComponent(query)}&limit=5`);
			return response.data?.artists || [];
		} catch (error) {
			console.error('Error getting artist suggestions:', error);
			return [];
		}
	}

	// Add search to recent searches
	private addToRecentSearches(query: string): void {
		if (!query.trim()) return;

		// Remove if already exists
		this.recentSearches = this.recentSearches.filter(search => search !== query);
		
		// Add to beginning
		this.recentSearches.unshift(query);
		
		// Keep only the most recent searches
		if (this.recentSearches.length > this.MAX_RECENT_SEARCHES) {
			this.recentSearches = this.recentSearches.slice(0, this.MAX_RECENT_SEARCHES);
		}

		// Save to localStorage
		try {
			localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
		} catch (error) {
			console.error('Error saving recent searches:', error);
		}
	}

	// Load recent searches from localStorage
	loadRecentSearches(): void {
		try {
			const saved = localStorage.getItem('recentSearches');
			if (saved) {
				this.recentSearches = JSON.parse(saved);
			}
		} catch (error) {
			console.error('Error loading recent searches:', error);
		}
	}

	// Clear recent searches
	clearRecentSearches(): void {
		this.recentSearches = [];
		try {
			localStorage.removeItem('recentSearches');
		} catch (error) {
			console.error('Error clearing recent searches:', error);
		}
	}

	// Mock data for playlists (replace with real API when available)
	private getMockPlaylists(): any[] {
		return [];
	}

	// Mock data for genres (replace with real API when available)
	private getMockGenres(): any[] {
		return [
			{ name: 'Pop', color: 'from-pink-600 to-purple-600' },
			{ name: 'Rock', color: 'from-red-600 to-orange-600' },
			{ name: 'Hip-Hop', color: 'from-purple-600 to-pink-600' },
			{ name: 'Jazz', color: 'from-yellow-600 to-orange-600' },
			{ name: 'Classical', color: 'from-blue-600 to-indigo-600' },
			{ name: 'Electronic', color: 'from-green-600 to-teal-600' },
			{ name: 'Folk', color: 'from-green-600 to-teal-600' },
			{ name: 'Country', color: 'from-orange-600 to-red-600' }
		];
	}
}

export const searchService = new SearchService();

// Initialize by loading recent searches
searchService.loadRecentSearches();
