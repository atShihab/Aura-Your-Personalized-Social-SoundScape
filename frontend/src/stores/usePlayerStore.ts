import { create } from "zustand";
import { Song } from "@/types";
import { useChatStore } from "./useChatStore";
import { useSettingsStore } from "./useSettingsStore";
import { useListeningHistoryStore } from "./useListeningHistoryStore";
import { useMusicStore } from "./useMusicStore";
import { fisherYatesShuffle } from "@/lib/shuffle";

interface PlayerStore {
	currentSong: Song | null;
	isPlaying: boolean;
	queue: Song[];
	currentIndex: number;
	isShuffled: boolean;
	repeatMode: 'off' | 'one' | 'all';
	originalQueue: Song[];

	initializeQueue: (songs: Song[]) => void;
	playAlbum: (songs: Song[], startIndex?: number) => void;
	setCurrentSong: (song: Song | null) => void;
	togglePlay: () => void;
	playNext: () => void;
	playPrevious: () => void;
	toggleShuffle: () => void;
	toggleRepeat: () => void;
	syncWithSettings: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	currentSong: null,
	isPlaying: false,
	queue: [],
	currentIndex: -1,
	isShuffled: false,
	repeatMode: 'off',
	originalQueue: [],

	initializeQueue: (songs: Song[]) => {
		const { isShuffled } = get();
		let queue = songs;
		
		// If shuffle is enabled, shuffle the new queue
		if (isShuffled && songs.length > 0) {
			queue = fisherYatesShuffle(songs);
		}
		
		set({
			queue: queue,
			originalQueue: songs,
			currentSong: get().currentSong || songs[0],
			currentIndex: get().currentIndex === -1 ? 0 : get().currentIndex,
		});
	},

	playAlbum: (songs: Song[], startIndex = 0) => {
		if (songs.length === 0) return;

		const { isShuffled } = get();
		let queue = songs;
		let actualStartIndex = startIndex;
		
		// If shuffle is enabled, shuffle the new queue
		if (isShuffled && songs.length > 0) {
			queue = fisherYatesShuffle(songs);
			// Find the new index of the song we wanted to start with
			const targetSong = songs[startIndex];
			actualStartIndex = queue.findIndex(s => s._id === targetSong._id);
			if (actualStartIndex === -1) actualStartIndex = 0;
		}

		const song = queue[actualStartIndex];

		// Track listening history
		const listeningStore = useListeningHistoryStore.getState();
		listeningStore.addListeningActivity({
			songId: song._id,
			songTitle: song.title,
			artistName: song.artist,
			artistId: song.artistId,
			albumId: song.albumId,
			albumTitle: song.albumTitle,
			imageUrl: song.imageUrl,
			duration: song.duration || 0,
			completed: false,
			playCount: 1
		});

		const socket = useChatStore.getState().socket;
		const chatStore = useChatStore.getState();
		if (socket.auth && chatStore.isConnected) {
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity: `Playing ${song.title} by ${song.artist}`,
			});
		} else if (socket.auth && !chatStore.isConnected) {
			console.warn('🎵 Socket not connected, cannot update activity');
		}
		set({
			queue: queue,
			originalQueue: songs,
			currentSong: song,
			currentIndex: actualStartIndex,
			isPlaying: true,
		});
	},

	setCurrentSong: (song: Song | null) => {
		if (!song) return;

		const state = get();
		
		// If queue is empty or song not in queue, try to get more songs from music store
		if (state.queue.length === 0 || !state.queue.find((s) => s._id === song._id)) {
			console.log('🎵 Queue empty or song not in queue, initializing queue');
			// Try to get more songs from music store to populate queue
			const musicStore = useMusicStore.getState();
			const allSongs = [...musicStore.featuredSongs, ...musicStore.madeForYouSongs, ...musicStore.trendingSongs, ...musicStore.songs];
			
			// Remove duplicates
			const uniqueSongs = allSongs.filter((songItem, index, self) => 
				index === self.findIndex(s => s._id === songItem._id)
			);
			
			// If we have the current song in the list, use that list, otherwise just use the single song
			const currentSongIndex = uniqueSongs.findIndex(s => s._id === song._id);
			if (currentSongIndex !== -1 && uniqueSongs.length > 1) {
				state.initializeQueue(uniqueSongs);
				const songIndex = uniqueSongs.findIndex((s) => s._id === song._id);
				set({
					currentSong: song,
					isPlaying: true,
					currentIndex: songIndex !== -1 ? songIndex : 0,
				});
			} else {
				// Just initialize with the single song
				state.initializeQueue([song]);
				set({
					currentSong: song,
					isPlaying: true,
					currentIndex: 0,
				});
			}
		}

		// Track listening history
		const listeningStore = useListeningHistoryStore.getState();
		listeningStore.addListeningActivity({
			songId: song._id,
			songTitle: song.title,
			artistName: song.artist,
			artistId: song.artistId,
			albumId: song.albumId,
			albumTitle: song.albumTitle,
			imageUrl: song.imageUrl,
			duration: song.duration || 0,
			completed: false,
			playCount: 1
		});

		const socket = useChatStore.getState().socket;
		const chatStore = useChatStore.getState();
		if (socket.auth && chatStore.isConnected) {
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity: `Playing ${song.title} by ${song.artist}`,
			});
		} else if (socket.auth && !chatStore.isConnected) {
			console.warn('🎵 Socket not connected, cannot update activity');
		}

		// Update currentIndex if song is already in queue
		if (state.queue.length > 0) {
			const songIndex = state.queue.findIndex((s) => s._id === song._id);
			if (songIndex !== -1) {
				set({
					currentSong: song,
					isPlaying: true,
					currentIndex: songIndex,
				});
			}
		}
	},

	togglePlay: () => {
		const currentState = get();
		const willStartPlaying = !currentState.isPlaying;
		const currentSong = currentState.currentSong;

		console.log('🎵 togglePlay called:', {
			currentIsPlaying: currentState.isPlaying,
			willStartPlaying,
			currentSong: currentSong?.title
		});

		set({
			isPlaying: willStartPlaying,
		});

		// Update activity after state is set
		const socket = useChatStore.getState().socket;
		const chatStore = useChatStore.getState();
		if (socket.auth && chatStore.isConnected) {
			// Small delay to ensure state is updated
			setTimeout(() => {
				const activity = willStartPlaying && currentSong 
					? `Playing ${currentSong.title} by ${currentSong.artist}` 
					: "Idle";
				socket.emit("update_activity", {
					userId: socket.auth.userId,
					activity: activity,
				});
				console.log('📱 Activity updated via togglePlay:', activity);
			}, 100);
		} else if (socket.auth && !chatStore.isConnected) {
			console.warn('🎵 Socket not connected, cannot update activity');
		}

		console.log('🎵 togglePlay - state updated to isPlaying:', willStartPlaying);
	},

	toggleShuffle: () => {
		const { isShuffled, originalQueue, currentSong } = get();
		const newShuffled = !isShuffled;
		
		console.log('🔀 Toggle shuffle - Current state:', isShuffled, '-> New state:', newShuffled);
		
		if (newShuffled) {
			// Proper Fisher-Yates shuffle algorithm
			const shuffledQueue = fisherYatesShuffle(originalQueue);
			const currentSongIndex = shuffledQueue.findIndex(s => s._id === currentSong?._id);
			
			console.log('🔀 Shuffled queue created, current song index:', currentSongIndex);
			
			set({
				queue: shuffledQueue,
				isShuffled: true,
				currentIndex: currentSongIndex !== -1 ? currentSongIndex : 0,
			});
		} else {
			// Restore original order
			const currentSongIndex = originalQueue.findIndex(s => s._id === currentSong?._id);
			
			console.log('🔀 Restoring original order, current song index:', currentSongIndex);
			
			set({
				queue: originalQueue,
				isShuffled: false,
				currentIndex: currentSongIndex !== -1 ? currentSongIndex : 0,
			});
		}
		
		// Sync with settings store
		const settingsStore = useSettingsStore.getState();
		settingsStore.updateAudioSettings({
			playback: {
				...settingsStore.settings.audio.playback,
				shuffle: newShuffled,
			},
		});
	},

	toggleRepeat: () => {
		const currentState = get();
		const { repeatMode } = currentState;
		let newMode: 'off' | 'one' | 'all';
		
		console.log('🔁 Toggle Repeat - Current mode:', repeatMode);
		
		switch (repeatMode) {
			case 'off':
				newMode = 'all';
				break;
			case 'all':
				newMode = 'one';
				break;
			case 'one':
				newMode = 'off';
				break;
			default:
				newMode = 'off';
		}
		
		console.log('🔁 Toggle Repeat - New mode:', newMode);
		
		// Update state immediately with the new repeat mode
		set({
			...currentState,
			repeatMode: newMode
		});
	},

	playNext: () => {
		const { currentIndex, queue, repeatMode, currentSong } = get();
		
		// If queue is empty, try to get songs from current context
		if (queue.length === 0) {
			console.log('🎵 Queue is empty, cannot play next');
			// If we have a current song but no queue, we can't play next
			if (!currentSong) {
				console.log('🎵 No current song, cannot play next');
				return;
			}
			// Try to get more songs from the music store
			const musicStore = useMusicStore.getState();
			const allSongs = [...musicStore.featuredSongs, ...musicStore.madeForYouSongs, ...musicStore.trendingSongs, ...musicStore.songs];
			if (allSongs.length > 0) {
				// Remove duplicates
				const uniqueSongs = allSongs.filter((song, index, self) => 
					index === self.findIndex(s => s._id === song._id)
				);
				const currentSongIndex = uniqueSongs.findIndex(s => s._id === currentSong._id);
				if (currentSongIndex !== -1 && currentSongIndex < uniqueSongs.length - 1) {
					const nextSong = uniqueSongs[currentSongIndex + 1];
					get().playAlbum(uniqueSongs, currentSongIndex + 1);
					return;
				}
			}
			return;
		}
		
		const nextIndex = currentIndex + 1;

		// if there is a next song to play, let's play it
		if (nextIndex < queue.length) {
			const nextSong = queue[nextIndex];

			const socket = useChatStore.getState().socket;
			const chatStore = useChatStore.getState();
			if (socket.auth && chatStore.isConnected) {
				socket.emit("update_activity", {
					userId: socket.auth.userId,
					activity: `Playing ${nextSong.title} by ${nextSong.artist}`,
				});
			}

			set({
				currentSong: nextSong,
				currentIndex: nextIndex,
				isPlaying: true,
			});
		} else {
			// Handle repeat modes
			if (repeatMode === 'all') {
				// Repeat all - start from beginning
				const firstSong = queue[0];
				if (firstSong) {
					const socket = useChatStore.getState().socket;
					const chatStore = useChatStore.getState();
					if (socket.auth && chatStore.isConnected) {
						socket.emit("update_activity", {
							userId: socket.auth.userId,
							activity: `Playing ${firstSong.title} by ${firstSong.artist}`,
						});
					}
					set({
						currentSong: firstSong,
						currentIndex: 0,
						isPlaying: true,
					});
				} else {
					set({ isPlaying: false });
				}
			} else if (repeatMode === 'one') {
				// Repeat one - restart current song
				const currentSong = get().currentSong;
				if (currentSong) {
					set({ isPlaying: true });
				} else {
					set({ isPlaying: false });
				}
			} else {
				// No repeat - stop playing
				set({ isPlaying: false });

				const socket = useChatStore.getState().socket;
				const chatStore = useChatStore.getState();
				if (socket.auth && chatStore.isConnected) {
					socket.emit("update_activity", {
						userId: socket.auth.userId,
						activity: `Idle`,
					});
				}
			}
		}
	},
	playPrevious: () => {
		const { currentIndex, queue, repeatMode, currentSong } = get();
		
		// If queue is empty, try to get songs from current context
		if (queue.length === 0) {
			console.log('🎵 Queue is empty, cannot play previous');
			// If we have a current song but no queue, we can't play previous
			if (!currentSong) {
				console.log('🎵 No current song, cannot play previous');
				return;
			}
			// Try to get more songs from the music store
			const musicStore = useMusicStore.getState();
			const allSongs = [...musicStore.featuredSongs, ...musicStore.madeForYouSongs, ...musicStore.trendingSongs, ...musicStore.songs];
			if (allSongs.length > 0) {
				// Remove duplicates
				const uniqueSongs = allSongs.filter((song, index, self) => 
					index === self.findIndex(s => s._id === song._id)
				);
				const currentSongIndex = uniqueSongs.findIndex(s => s._id === currentSong._id);
				if (currentSongIndex > 0) {
					const prevSong = uniqueSongs[currentSongIndex - 1];
					get().playAlbum(uniqueSongs, currentSongIndex - 1);
					return;
				}
			}
			return;
		}
		
		const prevIndex = currentIndex - 1;

		// theres a prev song
		if (prevIndex >= 0) {
			const prevSong = queue[prevIndex];

			const socket = useChatStore.getState().socket;
			const chatStore = useChatStore.getState();
			if (socket.auth && chatStore.isConnected) {
				socket.emit("update_activity", {
					userId: socket.auth.userId,
					activity: `Playing ${prevSong.title} by ${prevSong.artist}`,
				});
			}

			set({
				currentSong: prevSong,
				currentIndex: prevIndex,
				isPlaying: true,
			});
		} else {
			// Handle repeat modes when going backwards
			if (repeatMode === 'all') {
				// Repeat all - go to last song
				const lastSong = queue[queue.length - 1];
				if (lastSong) {
					const socket = useChatStore.getState().socket;
					const chatStore = useChatStore.getState();
					if (socket.auth && chatStore.isConnected) {
						socket.emit("update_activity", {
							userId: socket.auth.userId,
							activity: `Playing ${lastSong.title} by ${lastSong.artist}`,
						});
					}
					set({
						currentSong: lastSong,
						currentIndex: queue.length - 1,
						isPlaying: true,
					});
				} else {
					set({ isPlaying: false });
				}
			} else if (repeatMode === 'one') {
				// Repeat one - restart current song
				const currentSong = get().currentSong;
				if (currentSong) {
					set({ isPlaying: true });
				} else {
					set({ isPlaying: false });
				}
			} else {
				// No repeat - stop playing
				set({ isPlaying: false });

				const socket = useChatStore.getState().socket;
				const chatStore = useChatStore.getState();
				if (socket.auth && chatStore.isConnected) {
					socket.emit("update_activity", {
						userId: socket.auth.userId,
						activity: `Idle`,
					});
				}
			}
		}
	},

	syncWithSettings: () => {
		const settingsStore = useSettingsStore.getState();
		const { isShuffled, repeatMode } = get();
		const settingsShuffled = settingsStore.settings.audio.playback.shuffle;
		const settingsRepeat = settingsStore.settings.audio.playback.repeat;
		
		// Sync shuffle state if different
		if (isShuffled !== settingsShuffled) {
			set({ isShuffled: settingsShuffled });
		}
		
		// Sync repeat mode if different
		if (repeatMode !== settingsRepeat) {
			set({ repeatMode: settingsRepeat });
		}
	},
}));
