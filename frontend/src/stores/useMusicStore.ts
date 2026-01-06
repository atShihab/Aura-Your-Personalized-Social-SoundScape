import { axiosInstance } from "@/lib/axios";
import { Album, Song, Stats } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";

interface MusicStore {
	songs: Song[];
	albums: Album[];
	isLoading: boolean;
	error: string | null;
	currentAlbum: Album | null;
	featuredSongs: Song[];
	madeForYouSongs: Song[];
	trendingSongs: Song[];
	stats: Stats;
	libraryAlbums: Album[];

	fetchAlbums: () => Promise<void>;
	fetchAlbumById: (id: string) => Promise<void>;
	getLibraryAlbums: () => Promise<void>;
	fetchFeaturedSongs: () => Promise<void>;
	fetchMadeForYouSongs: () => Promise<void>;
	fetchTrendingSongs: () => Promise<void>;
	fetchStats: () => Promise<void>;
	fetchSongs: () => Promise<void>;
	deleteSong: (id: string) => Promise<void>;
	deleteAlbum: (id: string) => Promise<void>;
	updateSong: (id: string, data: FormData) => Promise<void>;
	updateAlbum: (id: string, data: FormData) => Promise<void>;
	searchSongs: (query: string) => Promise<Song[]>;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
	albums: [],
	songs: [],
	libraryAlbums: [],
	isLoading: false,
	error: null,
	currentAlbum: null,
	madeForYouSongs: [],
	featuredSongs: [],
	trendingSongs: [],
	stats: {
		totalSongs: 0,
		totalAlbums: 0,
		totalUsers: 0,
		totalArtists: 0,
		activeUsers: 0,
	},

	deleteSong: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/songs/${id}`);

			set((state) => ({
				songs: state.songs.filter((song) => song._id !== id),
			}));
			toast.success("Song deleted successfully");
		} catch (error: any) {
			console.error("Error in deleteSong", error);
			toast.error("Error deleting song: " + (error.response?.data?.message || error.message));
		} finally {
			set({ isLoading: false });
		}
	},

	updateSong: async (id, data) => {
		set({ isLoading: true, error: null });
		try {
			console.log("🔄 Updating song:", id);
			const response = await axiosInstance.put(`/admin/songs/${id}`, data, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			console.log("✅ Backend response:", response.data);

			// The backend returns { message: "...", song: {...} }
			const updatedSong = response.data.song || response.data;
			console.log("📝 Updated song data:", updatedSong);

			set((state) => {
				const newSongs = state.songs.map((song) =>
					song._id === id ? updatedSong : song
				);
				console.log("🔄 Updated songs state:", newSongs.find(s => s._id === id));
				return { songs: newSongs };
			});
			toast.success("Song updated successfully");
		} catch (error: any) {
			console.error("Error in updateSong", error);
			toast.error("Error updating song: " + (error.response?.data?.message || error.message));
			throw error; // Re-throw to let the component handle it
		} finally {
			set({ isLoading: false });
		}
	},

	updateAlbum: async (id, data) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.put(`/admin/albums/${id}`, data, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			set((state) => ({
				albums: state.albums.map((album) =>
					album._id === id ? response.data : album
				),
			}));
			toast.success("Album updated successfully");
		} catch (error: any) {
			console.log("Error in updateAlbum", error);
			toast.error("Error updating album");
		} finally {
			set({ isLoading: false });
		}
	},

	deleteAlbum: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/albums/${id}`);
			set((state) => ({
				albums: state.albums.filter((album) => album._id !== id),
				songs: state.songs.map((song) =>
					song.albumId === state.albums.find((a) => a._id === id)?.title ? { ...song, album: null } : song
				),
			}));
			toast.success("Album deleted successfully");
		} catch (error: any) {
			toast.error("Failed to delete album: " + error.message);
		} finally {
			set({ isLoading: false });
		}
	},

	fetchSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs");
			set({ songs: response.data });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchStats: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/stats");
			set({ stats: response.data });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchAlbums: async () => {
		set({ isLoading: true, error: null });

		try {
			const response = await axiosInstance.get("/albums");
			set({ albums: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchAlbumById: async (id) => {
		console.log("🎵 fetchAlbumById called with id:", id);
		set({ isLoading: true, error: null });
		try {
			console.log("🎵 Making API call to:", `/albums/${id}`);
			const response = await axiosInstance.get(`/albums/${id}`);
			console.log("🎵 API response:", response.data);
			console.log("🎵 Album songs:", response.data.songs?.map((s: any) => ({ title: s.title, audioUrl: s.audioUrl })));
			set({ currentAlbum: response.data });
		} catch (error: any) {
			console.error("🎵 API error:", error);
			console.error("🎵 Error response:", error.response?.data);
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	getLibraryAlbums: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/albums/library");
			// Backend returns { albums: [...], total: number }
			const albums = response.data.albums || response.data;
			set({ libraryAlbums: albums });
		} catch (error: any) {
			console.error("Error fetching library albums:", error);
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchFeaturedSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/featured");
			set({ featuredSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchMadeForYouSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/made-for-you");
			set({ madeForYouSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchTrendingSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/trending");
			set({ trendingSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	searchSongs: async (query: string) => {
		try {
			// First try to search in the backend if there's a search endpoint
			try {
				const response = await axiosInstance.get(`/songs/search?q=${encodeURIComponent(query)}`);
				if (response.data && response.data.length > 0) {
					console.log(`🔍 Backend search found ${response.data.length} songs for: "${query}"`);
					return response.data;
				}
			} catch (error) {
				// If backend search fails, fall back to client-side search
				console.log("Backend search failed, using client-side search");
			}

			// Client-side search fallback
			const searchQuery = query.toLowerCase();
			const state = get();
			const allSongs = [
				...state.featuredSongs,
				...state.madeForYouSongs,
				...state.trendingSongs,
				...state.songs
			];

			// Remove duplicates based on song ID
			const uniqueSongs = allSongs.filter((song, index, self) => 
				index === self.findIndex(s => s._id === song._id)
			);

			// Search in title and artist with more flexible matching
			const results = uniqueSongs.filter(song => {
				const titleMatch = song.title.toLowerCase().includes(searchQuery);
				const artistMatch = song.artist.toLowerCase().includes(searchQuery);
				
				// Also try splitting the query and matching parts
				const queryParts = searchQuery.split(' ');
				const partialMatches = queryParts.some(part => 
					song.title.toLowerCase().includes(part) || 
					song.artist.toLowerCase().includes(part)
				);
				
				return titleMatch || artistMatch || partialMatches;
			});

			console.log(`🔍 Client-side search found ${results.length} songs for query: "${query}"`);
			return results;
		} catch (error) {
			console.error("Error searching songs:", error);
			return [];
		}
	},
}));
