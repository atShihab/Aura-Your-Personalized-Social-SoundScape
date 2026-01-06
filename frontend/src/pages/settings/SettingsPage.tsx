import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { Settings, Save, RotateCcw, Download, Upload, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

// Import setting components
import GeneralSettingsTab from "./components/GeneralSettingsTab";
import AudioSettingsTab from "./components/AudioSettingsTab";
import DiscoverySettingsTab from "./components/DiscoverySettingsTab";
import DeveloperSettingsTab from "./components/DeveloperSettingsTab";
import PlatformSettingsTab from "./components/PlatformSettingsTab";
import EmailPreferencesTab from "./components/EmailPreferencesTab";

const SettingsPage: React.FC = () => {
	const { settings, isLoading, error, loadSettings, saveSettings, resetToDefaults, exportSettings, importSettings } = useSettingsStore();
	const [activeTab, setActiveTab] = useState("general");
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [originalSettings, setOriginalSettings] = useState(settings);

	useEffect(() => {
		loadSettings();
	}, [loadSettings]);

	useEffect(() => {
		setOriginalSettings(settings);
	}, [settings]);

	useEffect(() => {
		const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
		setHasUnsavedChanges(hasChanges);
	}, [settings, originalSettings]);

	const handleSave = async () => {
		try {
			await saveSettings(settings);
			setOriginalSettings(settings);
			setHasUnsavedChanges(false);
		} catch (error) {
			console.error("Failed to save settings:", error);
		}
	};

	const handleReset = () => {
		resetToDefaults();
		setOriginalSettings(settings);
		setHasUnsavedChanges(false);
	};

	const handleImport = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".json";
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (e) => {
					try {
						const importedSettings = JSON.parse(e.target?.result as string);
						importSettings(importedSettings);
						setOriginalSettings(importedSettings);
						setHasUnsavedChanges(false);
					} catch (error) {
						toast.error("Invalid settings file");
					}
				};
				reader.readAsText(file);
			}
		};
		input.click();
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 max-w-6xl">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Settings className="h-8 w-8" />
						Settings
					</h1>
					<p className="text-muted-foreground mt-2">
						Customize your Aura experience with comprehensive settings
					</p>
				</div>
				<div className="flex items-center gap-2">
					{hasUnsavedChanges && (
						<Badge variant="destructive" className="flex items-center gap-1">
							<AlertTriangle className="h-3 w-3" />
							Unsaved Changes
						</Badge>
					)}
					<Button variant="outline" onClick={handleImport} disabled={isLoading}>
						<Upload className="h-4 w-4 mr-2" />
						Import
					</Button>
					<Button variant="outline" onClick={exportSettings} disabled={isLoading}>
						<Download className="h-4 w-4 mr-2" />
						Export
					</Button>
					<Button variant="outline" onClick={handleReset} disabled={isLoading}>
						<RotateCcw className="h-4 w-4 mr-2" />
						Reset
					</Button>
					<Button onClick={handleSave} disabled={isLoading || !hasUnsavedChanges}>
						<Save className="h-4 w-4 mr-2" />
						Save Changes
					</Button>
				</div>
			</div>

			{error && (
				<Card className="mb-6 border-destructive">
					<CardContent className="pt-6">
						<div className="flex items-center gap-2 text-destructive">
							<AlertTriangle className="h-4 w-4" />
							{error}
						</div>
					</CardContent>
				</Card>
			)}

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<TabsList className="grid w-full grid-cols-6">
					<TabsTrigger value="general" className="flex items-center gap-2">
						<span className="hidden sm:inline">General</span>
						<Badge variant="secondary" className="text-xs">Basic</Badge>
					</TabsTrigger>
					<TabsTrigger value="audio" className="flex items-center gap-2">
						<span className="hidden sm:inline">Audio</span>
						<Badge variant="secondary" className="text-xs">Playback</Badge>
					</TabsTrigger>
					<TabsTrigger value="discovery" className="flex items-center gap-2">
						<span className="hidden sm:inline">Discovery</span>
						<Badge variant="secondary" className="text-xs">Social</Badge>
					</TabsTrigger>
					<TabsTrigger value="email" className="flex items-center gap-2">
						<span className="hidden sm:inline">Email</span>
						<Badge variant="secondary" className="text-xs">Notifications</Badge>
					</TabsTrigger>
					<TabsTrigger value="developer" className="flex items-center gap-2">
						<span className="hidden sm:inline">Developer</span>
						<Badge variant="secondary" className="text-xs">Advanced</Badge>
					</TabsTrigger>
					<TabsTrigger value="platforms" className="flex items-center gap-2">
						<span className="hidden sm:inline">Platforms</span>
						<Badge variant="secondary" className="text-xs">Sync</Badge>
					</TabsTrigger>
				</TabsList>

				<ScrollArea className="h-[calc(100vh-300px)]">
					<TabsContent value="general" className="space-y-6">
						<GeneralSettingsTab />
					</TabsContent>

					<TabsContent value="audio" className="space-y-6">
						<AudioSettingsTab />
					</TabsContent>

					<TabsContent value="discovery" className="space-y-6">
						<DiscoverySettingsTab />
					</TabsContent>

					<TabsContent value="email" className="space-y-6">
						<EmailPreferencesTab />
					</TabsContent>

					<TabsContent value="developer" className="space-y-6">
						<DeveloperSettingsTab />
					</TabsContent>

					<TabsContent value="platforms" className="space-y-6">
						<PlatformSettingsTab />
					</TabsContent>
				</ScrollArea>
			</Tabs>
		</div>
	);
};

export default SettingsPage;
