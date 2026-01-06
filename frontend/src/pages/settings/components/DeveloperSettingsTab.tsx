import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { Code, Zap, Settings, Bug, Activity, Database, ExternalLink } from "lucide-react";

const DeveloperSettingsTab: React.FC = () => {
	const { settings, updateDeveloperSettings } = useSettingsStore();

	const handleDeveloperChange = (type: keyof typeof settings.developer.developer, value: boolean) => {
		updateDeveloperSettings({
			developer: {
				...settings.developer.developer,
				[type]: value,
			},
		});
	};

	const handlePerformanceChange = (type: keyof typeof settings.developer.performance, value: any) => {
		updateDeveloperSettings({
			performance: {
				...settings.developer.performance,
				[type]: value,
			},
		});
	};

	const handleIntegrationChange = (type: keyof typeof settings.developer.integration, value: boolean) => {
		updateDeveloperSettings({
			integration: {
				...settings.developer.integration,
				[type]: value,
			},
		});
	};

	return (
		<div className="space-y-6">
			{/* Developer Settings */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Code className="h-5 w-5" />
						Developer Options
					</CardTitle>
					<CardDescription>
						Advanced settings for developers and power users
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="debug-mode">Debug Mode</Label>
								<p className="text-sm text-muted-foreground">
									Enable detailed logging and debugging information
								</p>
							</div>
							<Switch
								id="debug-mode"
								checked={settings.advanced.developer.debugMode}
								onCheckedChange={(checked) => handleDeveloperChange("debugMode", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="analytics">Analytics</Label>
								<p className="text-sm text-muted-foreground">
									Help improve the app by sharing usage analytics
								</p>
							</div>
							<Switch
								id="analytics"
								checked={settings.advanced.developer.analytics}
								onCheckedChange={(checked) => handleDeveloperChange("analytics", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="crash-reporting">Crash Reporting</Label>
								<p className="text-sm text-muted-foreground">
									Automatically report crashes to help fix issues
								</p>
							</div>
							<Switch
								id="crash-reporting"
								checked={settings.advanced.developer.crashReporting}
								onCheckedChange={(checked) => handleDeveloperChange("crashReporting", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="beta-features">Beta Features</Label>
								<p className="text-sm text-muted-foreground">
									Try experimental features before they're released
								</p>
							</div>
							<Switch
								id="beta-features"
								checked={settings.advanced.developer.betaFeatures}
								onCheckedChange={(checked) => handleDeveloperChange("betaFeatures", checked)}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Performance Settings */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Zap className="h-5 w-5" />
						Performance & Optimization
					</CardTitle>
					<CardDescription>
						Optimize app performance and resource usage
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="cache-size">
								Cache Size: {settings.advanced.performance.cacheSize} MB
							</Label>
							<Slider
								id="cache-size"
								min={100}
								max={2000}
								step={100}
								value={[settings.advanced.performance.cacheSize]}
								onValueChange={([value]) => handlePerformanceChange("cacheSize", value)}
								className="w-full"
							/>
							<p className="text-sm text-muted-foreground">
								Amount of storage used for caching music and data
							</p>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="background-playback">Background Playback</Label>
								<p className="text-sm text-muted-foreground">
									Continue playing music when app is in background
								</p>
							</div>
							<Switch
								id="background-playback"
								checked={settings.advanced.performance.backgroundPlayback}
								onCheckedChange={(checked) => handlePerformanceChange("backgroundPlayback", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="high-performance-mode">High Performance Mode</Label>
								<p className="text-sm text-muted-foreground">
									Use more resources for better performance
								</p>
							</div>
							<Switch
								id="high-performance-mode"
								checked={settings.advanced.performance.highPerformanceMode}
								onCheckedChange={(checked) => handlePerformanceChange("highPerformanceMode", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="data-saver">Data Saver Mode</Label>
								<p className="text-sm text-muted-foreground">
									Reduce data usage by limiting quality and preloading
								</p>
							</div>
							<Switch
								id="data-saver"
								checked={settings.advanced.performance.dataSaver}
								onCheckedChange={(checked) => handlePerformanceChange("dataSaver", checked)}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Integration Settings */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ExternalLink className="h-5 w-5" />
						External Integrations
					</CardTitle>
					<CardDescription>
						Connect with external services and platforms
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="lastfm-scrobbling">Last.fm Scrobbling</Label>
								<p className="text-sm text-muted-foreground">
									Track your listening history on Last.fm
								</p>
							</div>
							<Switch
								id="lastfm-scrobbling"
								checked={settings.advanced.integration.lastFmScrobbling}
								onCheckedChange={(checked) => handleIntegrationChange("lastFmScrobbling", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="aura-sync">Aura Sync</Label>
								<p className="text-sm text-muted-foreground">
									Synchronize playlists and favorites with Aura
								</p>
							</div>
							<Switch
								id="aura-sync"
								checked={settings.advanced.integration.auraSync}
								onCheckedChange={(checked) => handleIntegrationChange("auraSync", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="apple-music-sync">Apple Music Sync</Label>
								<p className="text-sm text-muted-foreground">
									Synchronize with Apple Music library
								</p>
							</div>
							<Switch
								id="apple-music-sync"
								checked={settings.advanced.integration.appleMusicSync}
								onCheckedChange={(checked) => handleIntegrationChange("appleMusicSync", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="youtube-music-sync">YouTube Music Sync</Label>
								<p className="text-sm text-muted-foreground">
									Synchronize with YouTube Music playlists
								</p>
							</div>
							<Switch
								id="youtube-music-sync"
								checked={settings.advanced.integration.youtubeMusicSync}
								onCheckedChange={(checked) => handleIntegrationChange("youtubeMusicSync", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="discord-rich-presence">Discord Rich Presence</Label>
								<p className="text-sm text-muted-foreground">
									Show what you're listening to on Discord
								</p>
							</div>
							<Switch
								id="discord-rich-presence"
								checked={settings.advanced.integration.discordRichPresence}
								onCheckedChange={(checked) => handleIntegrationChange("discordRichPresence", checked)}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Network & API Settings */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Settings className="h-5 w-5" />
						Network & API Configuration
					</CardTitle>
					<CardDescription>
						Advanced network and API settings
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="api-timeout">API Timeout (seconds)</Label>
							<Input
								id="api-timeout"
								type="number"
								placeholder="30"
								className="w-full"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="retry-attempts">Retry Attempts</Label>
							<Input
								id="retry-attempts"
								type="number"
								placeholder="3"
								className="w-full"
							/>
						</div>
					</div>
					<div className="p-4 border rounded-lg bg-muted/50">
						<div className="flex items-center gap-2 mb-2">
							<Bug className="h-4 w-4 text-orange-500" />
							<h4 className="font-medium">Advanced Features</h4>
						</div>
						<p className="text-sm text-muted-foreground">
							These settings are for advanced users. Incorrect configuration may affect app functionality.
						</p>
					</div>
				</CardContent>
			</Card>

			{/* System Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Activity className="h-5 w-5" />
						System Information
					</CardTitle>
					<CardDescription>
						Current system status and app information
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="p-3 border rounded-lg">
							<div className="text-sm font-medium">App Version</div>
							<div className="text-sm text-muted-foreground">1.0.0</div>
						</div>
						<div className="p-3 border rounded-lg">
							<div className="text-sm font-medium">Build Number</div>
							<div className="text-sm text-muted-foreground">2024.1.0</div>
						</div>
						<div className="p-3 border rounded-lg">
							<div className="text-sm font-medium">Cache Usage</div>
							<div className="text-sm text-muted-foreground">245 MB / 500 MB</div>
						</div>
						<div className="p-3 border rounded-lg">
							<div className="text-sm font-medium">Last Sync</div>
							<div className="text-sm text-muted-foreground">2 minutes ago</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default DeveloperSettingsTab;
