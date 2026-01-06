import { create } from 'zustand';
import { axiosInstance } from '@/lib/axios';
import toast from 'react-hot-toast';

interface PlaylistSong {
	_id: string;
	title: string;
	artist: string;
	imageUrl: string;
	audioUrl: string;
	duration: number;
	genre: string;
	albumId?: string;
	addedAt: string;
}

interface Playlist {
	_id: string;
	name: string;
	description?: string;
	imageUrl?: string;
	isPublic: boolean;
	isCollaborative: boolean;
	songCount: number;
	songs: PlaylistSong[];
	createdAt: string;
	updatedAt: string;
	userId: string;
	isLiked?: boolean;
}

interface PlaylistStore {
	// State
	playlists: Playlist[];
	likedSongsPlaylist: Playlist | null;
	likedPlaylists: Playlist[];
	isLoading: boolean;
	error: string | null;

	// Actions
	createPlaylist: (name: string, description?: string, isPublic?: boolean) => Promise<void>;
	deletePlaylist: (playlistId: string) => Promise<void>;
	addSongToPlaylist: (playlistId: string, song: any) => Promise<void>;
	removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
	getPlaylists: () => Promise<void>;
	getLikedPlaylists: () => Promise<void>;
	getPlaylistById: (playlistId: string) => Promise<Playlist | null>;
	updatePlaylist: (playlistId: string, data: Partial<Playlist>) => Promise<void>;
	getLikedSongsPlaylist: () => Promise<void>;
	addToLikedSongs: (song: any) => Promise<void>;
	removeFromLikedSongs: (songId: string) => Promise<void>;
	checkLikedSongsStatus: (songId: string) => Promise<boolean>;
	initializeLikedSongsPlaylist: () => Promise<void>;
	likePlaylist: (playlistId: string) => Promise<void>;
	unlikePlaylist: (playlistId: string) => Promise<void>;
	checkPlaylistLikeStatus: (playlistId: string) => Promise<boolean>;
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
	// Initial state
	playlists: [],
	likedSongsPlaylist: null,
	likedPlaylists: [],
	isLoading: false,
	error: null,

	// Create a new playlist
	createPlaylist: async (name, description, isPublic = true) => {
		try {
			console.log('🔄 Creating playlist:', { name, description, isPublic });
			set({ isLoading: true, error: null });
			
			const response = await axiosInstance.post('/playlists', {
				name,
				description,
				isPublic
			});

			const newPlaylist = response.data.playlist;
			console.log('✅ Playlist created successfully:', newPlaylist);
			
			set(state => ({
				playlists: [newPlaylist, ...state.playlists],
				isLoading: false
			}));

			toast.success('Playlist created successfully!');
		} catch (error: any) {
			console.error('❌ Error creating playlist:', error);
			set({ 
				error: error.response?.data?.message || 'Failed to create playlist',
				isLoading: false 
			});
			toast.error(error.response?.data?.message || 'Failed to create playlist');
		}
	},

	// Delete a playlist
	deletePlaylist: async (playlistId) => {
		try {
			set({ isLoading: true, error: null });
			
			await axiosInstance.delete(`/playlists/${playlistId}`);

			set(state => ({
				playlists: state.playlists.filter(playlist => playlist._id !== playlistId),
				isLoading: false
			}));

			toast.success('Playlist deleted successfully');
		} catch (error: any) {
			set({ 
				error: error.response?.data?.message || 'Failed to delete playlist',
				isLoading: false 
			});
			toast.error(error.response?.data?.message || 'Failed to delete playlist');
		}
	},

	// Add song to playlist
	addSongToPlaylist: async (playlistId, song) => {
		try {
			console.log('🔄 Adding song to playlist:', { playlistId, song: song.title });
			set({ isLoading: true, error: null });
			
			const response = await axiosInstance.post(`/playlists/${playlistId}/songs`, {
				songId: song._id,
				title: song.title,
				artist: song.artist,
				imageUrl: song.imageUrl,
				audioUrl: song.audioUrl,
				duration: song.duration,
				genre: song.genre,
				albumId: song.albumId
			});

			console.log('✅ Song added to playlist successfully:', response.data);

			// Update the playlist in state
			set(state => ({
				playlists: state.playlists.map(playlist => 
					playlist._id === playlistId 
						? { ...playlist, songs: response.data.songs, songCount: response.data.songs.length }
						: playlist
				),
				// Also update liked songs playlist if this is it
				likedSongsPlaylist: state.likedSongsPlaylist?._id === playlistId 
					? { ...state.likedSongsPlaylist, songs: response.data.songs, songCount: response.data.songs.length }
					: state.likedSongsPlaylist,
				isLoading: false
			}));

			toast.success('Song added to playlist!');
		} catch (error: any) {
			console.error('❌ Error adding song to playlist:', error);
			set({ 
				error: error.response?.data?.message || 'Failed to add song to playlist',
				isLoading: false 
			});
			toast.error(error.response?.data?.message || 'Failed to add song to playlist');
		}
	},

	// Remove song from playlist
	removeSongFromPlaylist: async (playlistId, songId) => {
		try {
			set({ isLoading: true, error: null });
			
			await axiosInstance.delete(`/playlists/${playlistId}/songs/${songId}`);

			// Update the playlist in state
			set(state => ({
				playlists: state.playlists.map(playlist => 
					playlist._id === playlistId 
						? { 
							...playlist, 
							songs: playlist.songs.filter(song => song._id !== songId),
							songCount: playlist.songCount - 1
						}
						: playlist
				),
				// Also update liked songs playlist if this is it
				likedSongsPlaylist: state.likedSongsPlaylist?._id === playlistId 
					? { 
						...state.likedSongsPlaylist, 
						songs: state.likedSongsPlaylist.songs.filter(song => song._id !== songId),
						songCount: state.likedSongsPlaylist.songCount - 1
					}
					: state.likedSongsPlaylist,
				isLoading: false
			}));

			toast.success('Song removed from playlist');
		} catch (error: any) {
			set({ 
				error: error.response?.data?.message || 'Failed to remove song from playlist',
				isLoading: false 
			});
			toast.error(error.response?.data?.message || 'Failed to remove song from playlist');
		}
	},

	// Get all playlists
	getPlaylists: async () => {
		try {
			console.log('🔄 Fetching playlists...');
			set({ isLoading: true, error: null });
			
			const response = await axiosInstance.get('/playlists');
			console.log('✅ Playlists fetched successfully:', response.data);
			
			set({
				playlists: response.data.playlists,
				isLoading: false
			});
		} catch (error: any) {
			console.error('❌ Error fetching playlists:', error);
			set({ 
				error: error.response?.data?.message || 'Failed to fetch playlists',
				isLoading: false 
			});
		}
	},

	// Get liked playlists (playlists added to library)
	getLikedPlaylists: async () => {
		try {
			console.log('🔄 Fetching liked playlists...');
			set({ isLoading: true, error: null });
			
			const response = await axiosInstance.get('/playlists/liked');
			console.log('✅ Liked playlists fetched successfully:', response.data);
			
			set({
				likedPlaylists: response.data.playlists,
				isLoading: false
			});
		} catch (error: any) {
			console.error('❌ Error fetching liked playlists:', error);
			set({ 
				error: error.response?.data?.message || 'Failed to fetch liked playlists',
				isLoading: false 
			});
		}
	},

	// Get playlist by ID
	getPlaylistById: async (playlistId) => {
		try {
			const response = await axiosInstance.get(`/playlists/${playlistId}`);
			return response.data.playlist;
		} catch (error: any) {
			console.error('Error fetching playlist:', error);
			return null;
		}
	},

	// Get liked songs playlist
	getLikedSongsPlaylist: async () => {
		try {
			console.log("🔍 Fetching liked songs playlist...");
			set({ isLoading: true, error: null });
			
			const response = await axiosInstance.get('/playlists/liked-songs');
			
			if (response.data.playlist) {
				console.log("✅ Fetched liked songs playlist:", response.data.playlist._id);
				set({
					likedSongsPlaylist: response.data.playlist,
					isLoading: false
				});
			} else {
				console.log("⚠️ No liked songs playlist found, initializing...");
				await get().initializeLikedSongsPlaylist();
			}
		} catch (error: any) {
			console.error('❌ Error fetching liked songs playlist:', error);
			set({ 
				error: error.response?.data?.message || 'Failed to fetch liked songs playlist',
				isLoading: false 
			});
			
			// If it's a 404, try to initialize the playlist
			if (error.response?.status === 404) {
				console.log("📝 Liked songs playlist not found, initializing...");
				await get().initializeLikedSongsPlaylist();
			}
		}
	},

	// Update playlist
	updatePlaylist: async (playlistId, data) => {
		try {
			set({ isLoading: true, error: null });
			
			const response = await axiosInstance.put(`/playlists/${playlistId}`, data);

			set(state => ({
				playlists: state.playlists.map(playlist => 
					playlist._id === playlistId ? response.data.playlist : playlist
				),
				// Also update liked songs playlist if this is it
				likedSongsPlaylist: state.likedSongsPlaylist?._id === playlistId 
					? response.data.playlist
					: state.likedSongsPlaylist,
				isLoading: false
			}));

			toast.success('Playlist updated successfully');
		} catch (error: any) {
			set({ 
				error: error.response?.data?.message || 'Failed to update playlist',
				isLoading: false 
			});
			toast.error(error.response?.data?.message || 'Failed to update playlist');
		}
	},

	// Add song to liked songs playlist
	addToLikedSongs: async (song) => {
		try {
			const { likedSongsPlaylist } = get();
			
			if (likedSongsPlaylist) {
				// Check if song is already in the playlist
				const isAlreadyInPlaylist = likedSongsPlaylist.songs.some(s => s._id === song._id);
				
				if (isAlreadyInPlaylist) {
					console.log('✅ Song already in Liked Songs playlist, skipping add');
					return; // Don't add if already there
				}
				
				// Add song to playlist via API
				const response = await axiosInstance.post(`/playlists/${likedSongsPlaylist._id}/songs`, {
					songId: song._id,
					title: song.title,
					artist: song.artist,
					imageUrl: song.imageUrl,
					audioUrl: song.audioUrl,
					duration: song.duration,
					genre: song.genre,
					albumId: song.albumId
				});
				
				// Update local state to add the song to liked songs playlist
				set(state => ({
					likedSongsPlaylist: state.likedSongsPlaylist ? {
						...state.likedSongsPlaylist,
						songs: response.data.songs,
						songCount: response.data.songs.length
					} : null
				}));
			} else {
				// If liked songs playlist doesn't exist, create it first
				await get().initializeLikedSongsPlaylist();
				// Then add the song
				const updatedLikedSongsPlaylist = get().likedSongsPlaylist;
				if (updatedLikedSongsPlaylist) {
					// Recursive call to add the song
					await get().addToLikedSongs(song);
				} else {
					console.error('❌ Failed to create or get Liked Songs playlist');
				}
			}
		} catch (error: any) {
			// Don't show error toast for "already in playlist" - this is expected behavior
			if (error.response?.data?.message === 'Song already in playlist') {
				console.log('✅ Song already in Liked Songs playlist, skipping add');
				return;
			}
			console.error('❌ Error adding song to Liked Songs playlist:', error);
		}
	},

	// Remove song from liked songs playlist
	removeFromLikedSongs: async (songId) => {
		try {
			const { likedSongsPlaylist } = get();
			
			if (likedSongsPlaylist) {
				// Check if song is in the playlist
				const isInPlaylist = likedSongsPlaylist.songs.some(s => s._id === songId);
				
				if (!isInPlaylist) {
					console.log('✅ Song not in Liked Songs playlist, skipping remove');
					return; // Don't remove if not there
				}
				
				// Remove song from playlist via API
				await axiosInstance.delete(`/playlists/${likedSongsPlaylist._id}/songs/${songId}`);
				
				// Update local state to remove the song from liked songs playlist
				set(state => ({
					likedSongsPlaylist: state.likedSongsPlaylist ? {
						...state.likedSongsPlaylist,
						songs: state.likedSongsPlaylist.songs.filter(song => song._id !== songId),
						songCount: state.likedSongsPlaylist.songCount - 1
					} : null
				}));
			} else {
				console.error('❌ Liked Songs playlist not found');
			}
		} catch (error: any) {
			console.error('❌ Error removing song from Liked Songs playlist:', error);
		}
	},

	// Check if song is in liked songs
	checkLikedSongsStatus: async (songId) => {
		const { likedSongsPlaylist } = get();
		
		if (likedSongsPlaylist) {
			return likedSongsPlaylist.songs.some(song => song._id === songId);
		}
		return false;
	},

	// Initialize liked songs playlist
	initializeLikedSongsPlaylist: async () => {
		try {
			console.log("🔍 Initializing liked songs playlist...");
			
			// First try to get existing liked songs playlist
			const response = await axiosInstance.get('/playlists/liked-songs');
			
			if (response.data.playlist) {
				console.log("✅ Found existing liked songs playlist:", response.data.playlist._id);
				set({ likedSongsPlaylist: response.data.playlist });
			} else {
				console.log("📝 Creating new liked songs playlist...");
				// Create new liked songs playlist if it doesn't exist
				const createResponse = await axiosInstance.post('/playlists', {
					name: 'Liked Songs',
					description: 'Your favorite songs',
					isPublic: false,
					isLikedSongs: true
				});
				
				console.log("✅ Created new liked songs playlist:", createResponse.data.playlist._id);
				set({ likedSongsPlaylist: createResponse.data.playlist });
			}
		} catch (error: any) {
			console.error('❌ Error initializing liked songs playlist:', error);
			
			// If the error is 404 (not found), try to create the playlist
			if (error.response?.status === 404) {
				try {
					console.log("📝 Creating liked songs playlist after 404...");
					const createResponse = await axiosInstance.post('/playlists', {
						name: 'Liked Songs',
						description: 'Your favorite songs',
						isPublic: false,
						isLikedSongs: true
					});
					
					console.log("✅ Created liked songs playlist after 404:", createResponse.data.playlist._id);
					set({ likedSongsPlaylist: createResponse.data.playlist });
				} catch (createError: any) {
					console.error('❌ Error creating liked songs playlist:', createError);
				}
			}
		}
	},

	// Like a playlist (add to library)
	likePlaylist: async (playlistId) => {
		try {
			await axiosInstance.post(`/playlists/${playlistId}/like`);
			// Refresh liked playlists list
			await get().getLikedPlaylists();
		} catch (error: any) {
			console.error('Error liking playlist:', error);
			throw error;
		}
	},

	// Unlike a playlist (remove from library)
	unlikePlaylist: async (playlistId) => {
		try {
			await axiosInstance.delete(`/playlists/${playlistId}/like`);
			// Refresh liked playlists list
			await get().getLikedPlaylists();
		} catch (error: any) {
			console.error('Error unliking playlist:', error);
			throw error;
		}
	},

	checkPlaylistLikeStatus: async (playlistId: string) => {
		try {
			const response = await axiosInstance.get(`/playlists/${playlistId}/like-status`);
			return response.data.isLiked || false;
		} catch (error: any) {
			console.error('Error checking playlist like status:', error);
			return false;
		}
	}
}));
