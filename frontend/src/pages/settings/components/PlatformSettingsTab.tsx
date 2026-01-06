import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { Music, ExternalLink, Link, Unlink, AlertCircle, CheckCircle } from "lucide-react";

const PlatformSettingsTab: React.FC = () => {
	const { settings, updatePlatformSettings } = useSettingsStore();

	const handlePlatformChange = (platform: keyof typeof settings.platforms, type: keyof typeof settings.platforms.aura, value: boolean) => {
		updatePlatformSettings({
			[platform]: {
				...settings.platforms[platform],
				[type]: value,
			},
		});
	};

	const platforms = [
		{
			id: "aura",
			name: "Aura",
			description: "Connect your Aura account to sync playlists and favorites",
			icon: "🎵",
			color: "bg-green-500",
			available: true,
			features: ["Playlist Sync", "Favorites Sync", "Listening History"],
		},
		{
			id: "appleMusic",
			name: "Apple Music",
			description: "Sync with your Apple Music library and playlists",
			icon: "🍎",
			color: "bg-pink-500",
			available: true,
			features: ["Library Sync", "Playlist Import", "iCloud Integration"],
		},
		{
			id: "youtubeMusic",
			name: "YouTube Music",
			description: "Import playlists and favorites from YouTube Music",
			icon: "📺",
			color: "bg-red-500",
			available: true,
			features: ["Playlist Import", "Video Integration", "Offline Sync"],
		},
		{
			id: "tidal",
			name: "Tidal",
			description: "High-fidelity music streaming with lossless quality",
			icon: "🌊",
			color: "bg-blue-500",
			available: true,
			features: ["Lossless Audio", "HiFi Quality", "Exclusive Content"],
		},
		{
			id: "deezer",
			name: "Deezer",
			description: "French music streaming service with Flow recommendations",
			icon: "🎧",
			color: "bg-purple-500",
			available: true,
			features: ["Flow Recommendations", "Lyrics Integration", "Podcast Support"],
		},
		{
			id: "amazonMusic",
			name: "Amazon Music",
			description: "Amazon's music streaming service with Prime integration",
			icon: "📦",
			color: "bg-orange-500",
			available: true,
			features: ["Prime Integration", "Alexa Support", "HD Audio"],
		},
	];

	// Platforms not available in Aura but available in other services
	const uniquePlatforms = [
		{
			id: "wynk",
			name: "Wynk Music",
			description: "Airtel's music streaming service with Indian content focus",
			icon: "🇮🇳",
			color: "bg-red-600",
			available: true,
			features: ["Indian Music", "Regional Content", "Airtel Integration"],
		},
		{
			id: "gaana",
			name: "Gaana",
			description: "Indian music streaming with extensive Bollywood and regional content",
			icon: "🎭",
			color: "bg-yellow-500",
			available: true,
			features: ["Bollywood Music", "Regional Languages", "Radio Stations"],
		},
		{
			id: "jioSaavn",
			name: "JioSaavn",
			description: "Reliance's music platform with Jio integration",
			icon: "📱",
			color: "bg-green-600",
			available: true,
			features: ["Jio Integration", "Indian Music", "Podcasts"],
		},
		{
			id: "hungama",
			name: "Hungama Music",
			description: "Indian music streaming with movie soundtracks",
			icon: "🎬",
			color: "bg-purple-600",
			available: true,
			features: ["Movie Soundtracks", "Indian Classical", "Kids Content"],
		},
		{
			id: "soundcloud",
			name: "SoundCloud",
			description: "Platform for independent artists and creators",
			icon: "☁️",
			color: "bg-orange-400",
			available: true,
			features: ["Independent Artists", "User Uploads", "Community Features"],
		},
		{
			id: "bandcamp",
			name: "Bandcamp",
			description: "Direct support for independent artists and labels",
			icon: "🎸",
			color: "bg-teal-500",
			available: true,
			features: ["Direct Artist Support", "Lossless Downloads", "Merchandise"],
		},
	];

	const handleConnect = (platformId: string) => {
		// Simulate connection process
		console.log(`Connecting to ${platformId}...`);
		// In a real app, this would open OAuth flow
	};

	const handleDisconnect = (platformId: string) => {
		// Simulate disconnection
		console.log(`Disconnecting from ${platformId}...`);
		updatePlatformSettings({
			[platformId]: {
				enabled: false,
				showInLibrary: false,
				syncPlaylists: false,
			},
		});
	};

	return (
		<div className="space-y-6">
			{/* Major Platforms */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Music className="h-5 w-5" />
						Major Music Platforms
					</CardTitle>
					<CardDescription>
						Connect with popular music streaming services
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{platforms.map((platform) => (
						<div key={platform.id} className="border rounded-lg p-4">
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-3">
									<div className={`w-10 h-10 rounded-full ${platform.color} flex items-center justify-center text-white text-lg`}>
										{platform.icon}
									</div>
									<div>
										<h3 className="font-medium">{platform.name}</h3>
										<p className="text-sm text-muted-foreground">{platform.description}</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									{settings.platforms[platform.id as keyof typeof settings.platforms]?.enabled ? (
										<>
											<Badge variant="secondary" className="flex items-center gap-1">
												<CheckCircle className="h-3 w-3" />
												Connected
											</Badge>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleDisconnect(platform.id)}
											>
												<Unlink className="h-4 w-4 mr-1" />
												Disconnect
											</Button>
										</>
									) : (
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleConnect(platform.id)}
										>
											<Link className="h-4 w-4 mr-1" />
											Connect
										</Button>
									)}
								</div>
							</div>
							
							{settings.platforms[platform.id as keyof typeof settings.platforms]?.enabled && (
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor={`${platform.id}-library`}>Show in Library</Label>
											<p className="text-sm text-muted-foreground">
												Display {platform.name} content in your library
											</p>
										</div>
										<Switch
											id={`${platform.id}-library`}
											checked={settings.platforms[platform.id as keyof typeof settings.platforms]?.showInLibrary}
											onCheckedChange={(checked) => handlePlatformChange(platform.id as keyof typeof settings.platforms, "showInLibrary", checked)}
										/>
									</div>
									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor={`${platform.id}-sync`}>Sync Playlists</Label>
											<p className="text-sm text-muted-foreground">
												Automatically sync playlists between platforms
											</p>
										</div>
										<Switch
											id={`${platform.id}-sync`}
											checked={settings.platforms[platform.id as keyof typeof settings.platforms]?.syncPlaylists}
											onCheckedChange={(checked) => handlePlatformChange(platform.id as keyof typeof settings.platforms, "syncPlaylists", checked)}
										/>
									</div>
								</div>
							)}
							
							<div className="mt-3 flex flex-wrap gap-1">
								{platform.features.map((feature, index) => (
									<Badge key={index} variant="outline" className="text-xs">
										{feature}
									</Badge>
								))}
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			{/* Unique Platforms */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ExternalLink className="h-5 w-5" />
						Unique & Regional Platforms
					</CardTitle>
					<CardDescription>
						Platforms with unique content not available on major services
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{uniquePlatforms.map((platform) => (
						<div key={platform.id} className="border rounded-lg p-4">
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-3">
									<div className={`w-10 h-10 rounded-full ${platform.color} flex items-center justify-center text-white text-lg`}>
										{platform.icon}
									</div>
									<div>
										<h3 className="font-medium">{platform.name}</h3>
										<p className="text-sm text-muted-foreground">{platform.description}</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									{settings.platforms[platform.id as keyof typeof settings.platforms]?.enabled ? (
										<>
											<Badge variant="secondary" className="flex items-center gap-1">
												<CheckCircle className="h-3 w-3" />
												Connected
											</Badge>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleDisconnect(platform.id)}
											>
												<Unlink className="h-4 w-4 mr-1" />
												Disconnect
											</Button>
										</>
									) : (
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleConnect(platform.id)}
										>
											<Link className="h-4 w-4 mr-1" />
											Connect
										</Button>
									)}
								</div>
							</div>
							
							{settings.platforms[platform.id as keyof typeof settings.platforms]?.enabled && (
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor={`${platform.id}-library`}>Show in Library</Label>
											<p className="text-sm text-muted-foreground">
												Display {platform.name} content in your library
											</p>
										</div>
										<Switch
											id={`${platform.id}-library`}
											checked={settings.platforms[platform.id as keyof typeof settings.platforms]?.showInLibrary}
											onCheckedChange={(checked) => handlePlatformChange(platform.id as keyof typeof settings.platforms, "showInLibrary", checked)}
										/>
									</div>
									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor={`${platform.id}-sync`}>Sync Playlists</Label>
											<p className="text-sm text-muted-foreground">
												Automatically sync playlists between platforms
											</p>
										</div>
										<Switch
											id={`${platform.id}-sync`}
											checked={settings.platforms[platform.id as keyof typeof settings.platforms]?.syncPlaylists}
											onCheckedChange={(checked) => handlePlatformChange(platform.id as keyof typeof settings.platforms, "syncPlaylists", checked)}
										/>
									</div>
								</div>
							)}
							
							<div className="mt-3 flex flex-wrap gap-1">
								{platform.features.map((feature, index) => (
									<Badge key={index} variant="outline" className="text-xs">
										{feature}
									</Badge>
								))}
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			{/* Platform Sync Status */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertCircle className="h-5 w-5" />
						Sync Status & Information
					</CardTitle>
					<CardDescription>
						Monitor the status of your platform connections
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="p-4 border rounded-lg">
							<div className="text-sm font-medium">Connected Platforms</div>
							<div className="text-2xl font-bold text-green-600">
								{Object.values(settings.platforms).filter(p => p.enabled).length}
							</div>
							<div className="text-sm text-muted-foreground">out of 12 available</div>
						</div>
						<div className="p-4 border rounded-lg">
							<div className="text-sm font-medium">Last Sync</div>
							<div className="text-sm text-muted-foreground">2 minutes ago</div>
							<div className="text-sm text-muted-foreground">All platforms up to date</div>
						</div>
					</div>
					
					<div className="p-4 border rounded-lg bg-muted/50">
						<div className="flex items-center gap-2 mb-2">
							<AlertCircle className="h-4 w-4 text-blue-500" />
							<h4 className="font-medium">Platform Integration Tips</h4>
						</div>
						<ul className="text-sm text-muted-foreground space-y-1">
							<li>• Connect multiple platforms to access a wider variety of music</li>
							<li>• Regional platforms offer unique content not available elsewhere</li>
							<li>• Sync playlists to keep your music organized across platforms</li>
							<li>• Some platforms may require premium subscriptions for full access</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default PlatformSettingsTab;
