import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { Globe, Moon, Bell, Shield, Eye, MessageSquare } from "lucide-react";

const GeneralSettingsTab: React.FC = () => {
	const { settings, updateGeneralSettings } = useSettingsStore();

	const handleLanguageChange = (value: string) => {
		updateGeneralSettings({ language: value });
	};

	const handleThemeChange = (value: "light" | "dark" | "auto") => {
		updateGeneralSettings({ theme: value });
	};

	const handleNotificationChange = (type: keyof typeof settings.general.notifications, value: boolean) => {
		updateGeneralSettings({
			notifications: {
				...settings.general.notifications,
				[type]: value,
			},
		});
	};

	const handlePrivacyChange = (type: keyof typeof settings.general.privacy, value: any) => {
		updateGeneralSettings({
			privacy: {
				...settings.general.privacy,
				[type]: value,
			},
		});
	};

	return (
		<div className="space-y-6">
			{/* Language & Theme */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Globe className="h-5 w-5" />
						Language & Appearance
					</CardTitle>
					<CardDescription>
						Customize your language and visual preferences
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="language">Language</Label>
							<Select value={settings.general.language} onValueChange={handleLanguageChange}>
								<SelectTrigger>
									<SelectValue placeholder="Select language" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="en">English</SelectItem>
									<SelectItem value="bn">বাংলা (Bengali)</SelectItem>
									<SelectItem value="hi">हिंदी (Hindi)</SelectItem>
									<SelectItem value="ur">اردو (Urdu)</SelectItem>
									<SelectItem value="ar">العربية (Arabic)</SelectItem>
									<SelectItem value="es">Español (Spanish)</SelectItem>
									<SelectItem value="fr">Français (French)</SelectItem>
									<SelectItem value="de">Deutsch (German)</SelectItem>
									<SelectItem value="ja">日本語 (Japanese)</SelectItem>
									<SelectItem value="ko">한국어 (Korean)</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="theme">Theme</Label>
							<Select value={settings.general.theme} onValueChange={handleThemeChange}>
								<SelectTrigger>
									<SelectValue placeholder="Select theme" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="light">Light</SelectItem>
									<SelectItem value="dark">Dark</SelectItem>
									<SelectItem value="auto">Auto (System)</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Notifications */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Bell className="h-5 w-5" />
						Notifications
					</CardTitle>
					<CardDescription>
						Choose how you want to receive notifications
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="email-notifications">Email Notifications</Label>
								<p className="text-sm text-muted-foreground">
									Receive notifications via email
								</p>
							</div>
							<Switch
								id="email-notifications"
								checked={settings.general.notifications.email}
								onCheckedChange={(checked) => handleNotificationChange("email", checked)}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="push-notifications">Push Notifications</Label>
								<p className="text-sm text-muted-foreground">
									Receive push notifications in your browser
								</p>
							</div>
							<Switch
								id="push-notifications"
								checked={settings.general.notifications.push}
								onCheckedChange={(checked) => handleNotificationChange("push", checked)}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="sms-notifications">SMS Notifications</Label>
								<p className="text-sm text-muted-foreground">
									Receive notifications via SMS (requires phone number)
								</p>
							</div>
							<Switch
								id="sms-notifications"
								checked={settings.general.notifications.sms}
								onCheckedChange={(checked) => handleNotificationChange("sms", checked)}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Privacy */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Shield className="h-5 w-5" />
						Privacy & Visibility
					</CardTitle>
					<CardDescription>
						Control your privacy and profile visibility
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="profile-visibility">Profile Visibility</Label>
							<Select
								value={settings.general.privacy.profileVisibility}
								onValueChange={(value: "public" | "private" | "friends") =>
									handlePrivacyChange("profileVisibility", value)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select visibility" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="public">Public - Anyone can see your profile</SelectItem>
									<SelectItem value="friends">Friends - Only friends can see your profile</SelectItem>
									<SelectItem value="private">Private - Only you can see your profile</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="online-status">Show Online Status</Label>
								<p className="text-sm text-muted-foreground">
									Let others see when you're online
								</p>
							</div>
							<Switch
								id="online-status"
								checked={settings.general.privacy.showOnlineStatus}
								onCheckedChange={(checked) => handlePrivacyChange("showOnlineStatus", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="listening-activity">Show Listening Activity</Label>
								<p className="text-sm text-muted-foreground">
									Share what you're currently listening to
								</p>
							</div>
							<Switch
								id="listening-activity"
								checked={settings.general.privacy.showListeningActivity}
								onCheckedChange={(checked) => handlePrivacyChange("showListeningActivity", checked)}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="allow-messages">Who Can Message You</Label>
							<Select
								value={settings.general.privacy.allowMessages}
								onValueChange={(value: "everyone" | "friends" | "none") =>
									handlePrivacyChange("allowMessages", value)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select who can message you" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="everyone">Everyone - Anyone can send you messages</SelectItem>
									<SelectItem value="friends">Friends - Only friends can send you messages</SelectItem>
									<SelectItem value="none">None - No one can send you messages</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default GeneralSettingsTab;
