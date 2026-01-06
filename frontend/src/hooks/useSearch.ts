import { useState, useEffect, useCallback, useRef } from 'react';
import { searchService, SearchResults, SearchFilters, SearchSuggestion } from '@/lib/searchService';

interface UseSearchReturn {
	query: string;
	setQuery: (query: string) => void;
	searchResults: SearchResults;
	suggestions: SearchSuggestion[];
	isSearching: boolean;
	isLoadingSuggestions: boolean;
	activeFilter: string;
	setActiveFilter: (filter: string) => void;
	sortBy: string;
	setSortBy: (sort: string) => void;
	showSuggestions: boolean;
	setShowSuggestions: (show: boolean) => void;
	performSearch: (query: string) => Promise<void>;
	performRealtimeSearch: (query: string) => Promise<() => void>;
	handleSuggestionClick: (suggestion: SearchSuggestion) => void;
	clearSearch: () => void;
	clearRecentSearches: () => void;
}

export const useSearch = (): UseSearchReturn => {
	const [query, setQuery] = useState('');
	const [searchResults, setSearchResults] = useState<SearchResults>({
		songs: [],
		artists: [],
		albums: [],
		playlists: [],
		users: [],
		genres: []
	});
	const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
	const [activeFilter, setActiveFilter] = useState('all');
	const [sortBy, setSortBy] = useState('relevance');
	const [showSuggestions, setShowSuggestions] = useState(false);

	const searchTimeoutRef = useRef<NodeJS.Timeout>();
	const suggestionsTimeoutRef = useRef<NodeJS.Timeout>();

	// Load suggestions when query changes
	useEffect(() => {
		if (query.length === 0) {
			setSuggestions([]);
			setShowSuggestions(false);
			return;
		}

		// Clear existing timeout
		if (suggestionsTimeoutRef.current) {
			clearTimeout(suggestionsTimeoutRef.current);
		}

		// Debounce suggestions loading
		suggestionsTimeoutRef.current = setTimeout(async () => {
			setIsLoadingSuggestions(true);
			try {
				const newSuggestions = await searchService.getSearchSuggestions(query);
				setSuggestions(newSuggestions);
				setShowSuggestions(true);
			} catch (error) {
				console.error('Error loading suggestions:', error);
			} finally {
				setIsLoadingSuggestions(false);
			}
		}, 300);

		return () => {
			if (suggestionsTimeoutRef.current) {
				clearTimeout(suggestionsTimeoutRef.current);
			}
		};
	}, [query]);

	// Perform search with filters
	const performSearch = useCallback(async (searchQuery: string) => {
		if (!searchQuery.trim()) {
			setSearchResults({
				songs: [],
				artists: [],
				albums: [],
				playlists: [],
				users: [],
				genres: []
			});
			return;
		}

		setIsSearching(true);
		try {
			const filters: SearchFilters = {
				type: activeFilter as any,
				sortBy: sortBy as any
			};

			const results = await searchService.searchAll(searchQuery, filters);
			setSearchResults(results);
		} catch (error) {
			console.error('Error performing search:', error);
		} finally {
			setIsSearching(false);
		}
	}, [activeFilter, sortBy]);

	// Real-time search with debouncing
	const performRealtimeSearch = useCallback(async (searchQuery: string) => {
		// Clear existing timeout
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		// Debounce real-time search
		searchTimeoutRef.current = setTimeout(async () => {
			if (searchQuery.length >= 2) {
				setIsSearching(true);
				try {
					const filters: SearchFilters = {
						type: activeFilter as any,
						sortBy: sortBy as any
					};

					const results = await searchService.searchRealtime(searchQuery, filters);
					setSearchResults(results);
				} catch (error) {
					console.error('Error performing real-time search:', error);
				} finally {
					setIsSearching(false);
				}
			} else {
				setSearchResults({
					songs: [],
					artists: [],
					albums: [],
					playlists: [],
					users: [],
					genres: []
				});
			}
		}, 500);

		// Return cleanup function for timeout
		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, [activeFilter, sortBy]);

	// Handle suggestion click
	const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
		setQuery(suggestion.text);
		setShowSuggestions(false);
		performSearch(suggestion.text);
	}, [performSearch]);

	// Clear search
	const clearSearch = useCallback(() => {
		setQuery('');
		setSearchResults({
			songs: [],
			artists: [],
			albums: [],
			playlists: [],
			users: [],
			genres: []
		});
		setShowSuggestions(false);
		setSuggestions([]);
	}, []);

	// Clear recent searches
	const clearRecentSearches = useCallback(() => {
		searchService.clearRecentSearches();
		// Reload suggestions to reflect the change
		searchService.getSearchSuggestions(query).then(setSuggestions);
	}, [query]);

	// Cleanup timeouts on unmount
	useEffect(() => {
		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
			if (suggestionsTimeoutRef.current) {
				clearTimeout(suggestionsTimeoutRef.current);
			}
		};
	}, []);

	return {
		query,
		setQuery,
		searchResults,
		suggestions,
		isSearching,
		isLoadingSuggestions,
		activeFilter,
		setActiveFilter,
		sortBy,
		setSortBy,
		showSuggestions,
		setShowSuggestions,
		performSearch,
		performRealtimeSearch,
		handleSuggestionClick,
		clearSearch,
		clearRecentSearches
	};
};
