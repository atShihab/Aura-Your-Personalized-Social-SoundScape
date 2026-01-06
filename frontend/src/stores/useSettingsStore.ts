import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

// Settings Types
export interface CommonSettings {
	language: string;
	theme: "light" | "dark" | "auto";
	notifications: {
		email: boolean;
		push: boolean;
		sms: boolean;
	};
	privacy: {
		profileVisibility: "public" | "private" | "friends";
		showOnlineStatus: boolean;
		showListeningActivity: boolean;
		allowMessages: "everyone" | "friends" | "none";
	};
}

export interface EnhancedSettings {
	audio: {
		quality: "low" | "medium" | "high" | "lossless";
		normalization: boolean;
		crossfade: boolean;
		crossfadeDuration: number; // seconds
		equalizer: {
			enabled: boolean;
			preset: "flat" | "bass" | "treble" | "vocal" | "custom";
			bands: number[]; // 10-band EQ values
		};
	};
	playback: {
		autoplay: boolean;
		shuffle: boolean;
		repeat: "off" | "one" | "all";
		gaplessPlayback: boolean;
		preloadNext: boolean;
	};
	interface: {
		compactMode: boolean;
		showLyrics: boolean;
		showVisualizer: boolean;
		animations: boolean;
		reducedMotion: boolean;
	};
}

export interface UniqueSettings {
	discovery: {
		recommendationEngine: "ai" | "collaborative" | "hybrid";
		showNewReleases: boolean;
		showTrending: boolean;
		showFriendsActivity: boolean;
		personalizedPlaylists: boolean;
	};
	social: {
		shareListeningActivity: boolean;
		allowFriendRequests: boolean;
		showInSearch: boolean;
		activityFeed: boolean;
		groupListening: boolean;
	};
	content: {
		explicitContent: boolean;
		showAds: boolean;
		downloadQuality: "low" | "medium" | "high";
		offlineMode: boolean;
	};
	unique?: {
		[key: string]: any;
	};
}

export interface AdvancedSettings {
	developer: {
		debugMode: boolean;
		analytics: boolean;
		crashReporting: boolean;
		betaFeatures: boolean;
	};
	performance: {
		cacheSize: number; // MB
		backgroundPlayback: boolean;
		highPerformanceMode: boolean;
		dataSaver: boolean;
	};
	integration: {
		lastFmScrobbling: boolean;
		auraSync: boolean;
		appleMusicSync: boolean;
		youtubeMusicSync: boolean;
		discordRichPresence: boolean;
	};
	advanced?: {
		[key: string]: any;
	};
}

export interface PlatformSettings {
	aura: {
		enabled: boolean;
		showInLibrary: boolean;
		syncPlaylists: boolean;
	};
	appleMusic: {
		enabled: boolean;
		showInLibrary: boolean;
		syncPlaylists: boolean;
	};
	youtubeMusic: {
		enabled: boolean;
		showInLibrary: boolean;
		syncPlaylists: boolean;
	};
	tidal: {
		enabled: boolean;
		showInLibrary: boolean;
		syncPlaylists: boolean;
	};
	deezer: {
		enabled: boolean;
		showInLibrary: boolean;
		syncPlaylists: boolean;
	};
	amazonMusic: {
		enabled: boolean;
		showInLibrary: boolean;
		syncPlaylists: boolean;
	};
}

export interface Settings {
	general: CommonSettings;
	audio: EnhancedSettings;
	discovery: UniqueSettings;
	developer: AdvancedSettings;
	platforms: PlatformSettings;
	advanced?: {
		[key: string]: any;
	};
	unique?: {
		[key: string]: any;
	};
}

interface SettingsStore {
	settings: Settings;
	isLoading: boolean;
	error: string | null;
	
	// Actions
	loadSettings: () => Promise<void>;
	saveSettings: (settings: Partial<Settings>) => Promise<void>;
	updateGeneralSettings: (settings: Partial<CommonSettings>) => void;
	updateAudioSettings: (settings: Partial<EnhancedSettings>) => void;
	updateDiscoverySettings: (settings: Partial<UniqueSettings>) => void;
	updateDeveloperSettings: (settings: Partial<AdvancedSettings>) => void;
	updatePlatformSettings: (settings: Partial<PlatformSettings>) => void;
	resetToDefaults: () => void;
	exportSettings: () => void;
	importSettings: (settings: Settings) => void;
}

const defaultSettings: Settings = {
	general: {
		language: "en",
		theme: "auto",
		notifications: {
			email: true,
			push: true,
			sms: false,
		},
		privacy: {
			profileVisibility: "public",
			showOnlineStatus: true,
			showListeningActivity: true,
			allowMessages: "everyone",
		},
	},
	audio: {
		audio: {
			quality: "high",
			normalization: true,
			crossfade: false,
			crossfadeDuration: 3,
			equalizer: {
				enabled: false,
				preset: "flat",
				bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			},
		},
		playback: {
			autoplay: true,
			shuffle: false,
			repeat: "off",
			gaplessPlayback: true,
			preloadNext: true,
		},
		interface: {
			compactMode: false,
			showLyrics: true,
			showVisualizer: false,
			animations: true,
			reducedMotion: false,
		},
	},
	discovery: {
		discovery: {
			recommendationEngine: "hybrid",
			showNewReleases: true,
			showTrending: true,
			showFriendsActivity: true,
			personalizedPlaylists: true,
		},
		social: {
			shareListeningActivity: true,
			allowFriendRequests: true,
			showInSearch: true,
			activityFeed: true,
			groupListening: false,
		},
		content: {
			explicitContent: false,
			showAds: true,
			downloadQuality: "high",
			offlineMode: false,
		},
	},
	developer: {
		developer: {
			debugMode: false,
			analytics: true,
			crashReporting: true,
			betaFeatures: false,
		},
		performance: {
			cacheSize: 500,
			backgroundPlayback: true,
			highPerformanceMode: false,
			dataSaver: false,
		},
		integration: {
			lastFmScrobbling: false,
			auraSync: false,
			appleMusicSync: false,
			youtubeMusicSync: false,
			discordRichPresence: false,
		},
	},
	platforms: {
		aura: {
			enabled: false,
			showInLibrary: false,
			syncPlaylists: false,
		},
		appleMusic: {
			enabled: false,
			showInLibrary: false,
			syncPlaylists: false,
		},
		youtubeMusic: {
			enabled: false,
			showInLibrary: false,
			syncPlaylists: false,
		},
		tidal: {
			enabled: false,
			showInLibrary: false,
			syncPlaylists: false,
		},
		deezer: {
			enabled: false,
			showInLibrary: false,
			syncPlaylists: false,
		},
		amazonMusic: {
			enabled: false,
			showInLibrary: false,
			syncPlaylists: false,
		},
	},
};

export const useSettingsStore = create<SettingsStore>()(
	persist(
		(set, get) => ({
			settings: defaultSettings,
			isLoading: false,
			error: null,

			loadSettings: async () => {
				set({ isLoading: true, error: null });
				try {
					const response = await axiosInstance.get("/users/settings");
					set({ settings: { ...defaultSettings, ...response.data } });
				} catch (error: any) {
					console.error("Failed to load settings:", error);
					set({ error: error.response?.data?.message || "Failed to load settings" });
				} finally {
					set({ isLoading: false });
				}
			},

			saveSettings: async (newSettings: Partial<Settings>) => {
				set({ isLoading: true, error: null });
				try {
					const updatedSettings = { ...get().settings, ...newSettings };
					await axiosInstance.put("/users/settings", updatedSettings);
					set({ settings: updatedSettings });
					toast.success("Settings saved successfully");
				} catch (error: any) {
					console.error("Failed to save settings:", error);
					set({ error: error.response?.data?.message || "Failed to save settings" });
					toast.error("Failed to save settings");
				} finally {
					set({ isLoading: false });
				}
			},

			updateGeneralSettings: (settings: Partial<CommonSettings>) => {
				const currentSettings = get().settings;
				const updatedSettings = {
					...currentSettings,
					general: { ...currentSettings.general, ...settings },
				};
				set({ settings: updatedSettings });
			},

			updateAudioSettings: (settings: Partial<EnhancedSettings>) => {
				const currentSettings = get().settings;
				const updatedSettings = {
					...currentSettings,
					audio: { ...currentSettings.audio, ...settings },
				};
				set({ settings: updatedSettings });
			},

			updateDiscoverySettings: (settings: Partial<UniqueSettings>) => {
				const currentSettings = get().settings;
				const updatedSettings = {
					...currentSettings,
					discovery: { ...currentSettings.discovery, ...settings },
				};
				set({ settings: updatedSettings });
			},

			updateDeveloperSettings: (settings: Partial<AdvancedSettings>) => {
				const currentSettings = get().settings;
				const updatedSettings = {
					...currentSettings,
					developer: { ...currentSettings.developer, ...settings },
				};
				set({ settings: updatedSettings });
			},

			updatePlatformSettings: (settings: Partial<PlatformSettings>) => {
				const currentSettings = get().settings;
				const updatedSettings = {
					...currentSettings,
					platforms: { ...currentSettings.platforms, ...settings },
				};
				set({ settings: updatedSettings });
			},

			resetToDefaults: () => {
				set({ settings: defaultSettings });
				toast.success("Settings reset to defaults");
			},

			exportSettings: () => {
				const settings = get().settings;
				const dataStr = JSON.stringify(settings, null, 2);
				const dataBlob = new Blob([dataStr], { type: "application/json" });
				const url = URL.createObjectURL(dataBlob);
				const link = document.createElement("a");
				link.href = url;
				link.download = "amar-gaan-settings.json";
				link.click();
				URL.revokeObjectURL(url);
				toast.success("Settings exported successfully");
			},

			importSettings: (settings: Settings) => {
				set({ settings });
				toast.success("Settings imported successfully");
			},
		}),
		{
			name: "amar-gaan-settings",
			partialize: (state) => ({ settings: state.settings }),
		}
	)
);
