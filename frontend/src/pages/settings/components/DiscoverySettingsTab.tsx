import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { Compass, Users, Music2, TrendingUp, Heart, Share2, Activity } from "lucide-react";

const DiscoverySettingsTab: React.FC = () => {
	const { settings, updateDiscoverySettings } = useSettingsStore();

	const handleDiscoveryChange = (type: keyof typeof settings.discovery.discovery, value: any) => {
		updateDiscoverySettings({
			discovery: {
				...settings.discovery.discovery,
				[type]: value,
			},
		});
	};

	const handleSocialChange = (type: keyof typeof settings.discovery.social, value: boolean) => {
		updateDiscoverySettings({
			social: {
				...settings.discovery.social,
				[type]: value,
			},
		});
	};

	const handleContentChange = (type: keyof typeof settings.discovery.content, value: any) => {
		updateDiscoverySettings({
			content: {
				...settings.discovery.content,
				[type]: value,
			},
		});
	};

	return (
		<div className="space-y-6">
			{/* Discovery Settings */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Compass className="h-5 w-5" />
						Music Discovery
					</CardTitle>
					<CardDescription>
						Customize how you discover new music and artists
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="recommendation-engine">Recommendation Engine</Label>
						<Select
															value={settings.discovery.discovery.recommendationEngine}
							onValueChange={(value: "ai" | "collaborative" | "hybrid") =>
								handleDiscoveryChange("recommendationEngine", value)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select recommendation engine" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ai">AI-Powered - Machine learning recommendations</SelectItem>
								<SelectItem value="collaborative">Collaborative - Based on similar users</SelectItem>
								<SelectItem value="hybrid">Hybrid - Best of both approaches</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="show-new-releases">Show New Releases</Label>
								<p className="text-sm text-muted-foreground">
									Display newly released songs and albums
								</p>
							</div>
							<Switch
								id="show-new-releases"
								checked={settings.discovery.discovery.showNewReleases}
								onCheckedChange={(checked) => handleDiscoveryChange("showNewReleases", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="show-trending">Show Trending</Label>
								<p className="text-sm text-muted-foreground">
									Display trending songs and popular content
								</p>
							</div>
							<Switch
								id="show-trending"
								checked={settings.discovery.discovery.showTrending}
								onCheckedChange={(checked) => handleDiscoveryChange("showTrending", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="show-friends-activity">Show Friends Activity</Label>
								<p className="text-sm text-muted-foreground">
									See what your friends are listening to
								</p>
							</div>
							<Switch
								id="show-friends-activity"
								checked={settings.discovery.discovery.showFriendsActivity}
								onCheckedChange={(checked) => handleDiscoveryChange("showFriendsActivity", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="personalized-playlists">Personalized Playlists</Label>
								<p className="text-sm text-muted-foreground">
									Generate playlists based on your taste
								</p>
							</div>
							<Switch
								id="personalized-playlists"
								checked={settings.discovery.discovery.personalizedPlaylists}
								onCheckedChange={(checked) => handleDiscoveryChange("personalizedPlaylists", checked)}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Social Features */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Social Features
					</CardTitle>
					<CardDescription>
						Control your social interactions and sharing preferences
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="share-listening-activity">Share Listening Activity</Label>
								<p className="text-sm text-muted-foreground">
									Let friends see what you're currently listening to
								</p>
							</div>
							<Switch
								id="share-listening-activity"
								checked={settings.discovery.social.shareListeningActivity}
								onCheckedChange={(checked) => handleSocialChange("shareListeningActivity", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="allow-friend-requests">Allow Friend Requests</Label>
								<p className="text-sm text-muted-foreground">
									Let other users send you friend requests
								</p>
							</div>
							<Switch
								id="allow-friend-requests"
								checked={settings.discovery.social.allowFriendRequests}
								onCheckedChange={(checked) => handleSocialChange("allowFriendRequests", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="show-in-search">Show in Search</Label>
								<p className="text-sm text-muted-foreground">
									Allow others to find you in user search
								</p>
							</div>
							<Switch
								id="show-in-search"
								checked={settings.unique.social.showInSearch}
								onCheckedChange={(checked) => handleSocialChange("showInSearch", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="activity-feed">Activity Feed</Label>
								<p className="text-sm text-muted-foreground">
									Show your music activity in the feed
								</p>
							</div>
							<Switch
								id="activity-feed"
								checked={settings.unique.social.activityFeed}
								onCheckedChange={(checked) => handleSocialChange("activityFeed", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="group-listening">Group Listening</Label>
								<p className="text-sm text-muted-foreground">
									Allow friends to join your listening sessions
								</p>
							</div>
							<Switch
								id="group-listening"
								checked={settings.unique.social.groupListening}
								onCheckedChange={(checked) => handleSocialChange("groupListening", checked)}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Content Preferences */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Music2 className="h-5 w-5" />
						Content Preferences
					</CardTitle>
					<CardDescription>
						Control content filtering and download preferences
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="explicit-content">Allow Explicit Content</Label>
								<p className="text-sm text-muted-foreground">
									Show songs with explicit lyrics
								</p>
							</div>
							<Switch
								id="explicit-content"
								checked={settings.unique.content.explicitContent}
								onCheckedChange={(checked) => handleContentChange("explicitContent", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="show-ads">Show Advertisements</Label>
								<p className="text-sm text-muted-foreground">
									Display ads to support free music
								</p>
							</div>
							<Switch
								id="show-ads"
								checked={settings.unique.content.showAds}
								onCheckedChange={(checked) => handleContentChange("showAds", checked)}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="download-quality">Download Quality</Label>
							<Select
								value={settings.unique.content.downloadQuality}
								onValueChange={(value: "low" | "medium" | "high") =>
									handleContentChange("downloadQuality", value)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select download quality" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="low">Low (96 kbps) - Save storage</SelectItem>
									<SelectItem value="medium">Medium (192 kbps) - Balanced</SelectItem>
									<SelectItem value="high">High (320 kbps) - Best quality</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="offline-mode">Offline Mode</Label>
								<p className="text-sm text-muted-foreground">
									Allow playback without internet connection
								</p>
							</div>
							<Switch
								id="offline-mode"
								checked={settings.unique.content.offlineMode}
								onCheckedChange={(checked) => handleContentChange("offlineMode", checked)}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Regional Features */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						Regional & Cultural Features
					</CardTitle>
					<CardDescription>
						Special features for South Asian music and culture
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="p-4 border rounded-lg">
							<div className="flex items-center gap-2 mb-2">
								<Heart className="h-4 w-4 text-red-500" />
								<h4 className="font-medium">Bengali Music Focus</h4>
							</div>
							<p className="text-sm text-muted-foreground">
								Prioritize Bengali songs and artists in recommendations
							</p>
						</div>
						<div className="p-4 border rounded-lg">
							<div className="flex items-center gap-2 mb-2">
								<Activity className="h-4 w-4 text-blue-500" />
								<h4 className="font-medium">Cultural Events</h4>
							</div>
							<p className="text-sm text-muted-foreground">
								Get notified about cultural music events and festivals
							</p>
						</div>
					</div>
					<div className="p-4 border rounded-lg">
						<div className="flex items-center gap-2 mb-2">
							<Share2 className="h-4 w-4 text-green-500" />
							<h4 className="font-medium">Community Features</h4>
						</div>
						<p className="text-sm text-muted-foreground">
							Connect with other music lovers in your region and share cultural music experiences
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default DiscoverySettingsTab;
