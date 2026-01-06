import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Volume2, Play, Monitor, Music } from "lucide-react";

const AudioSettingsTab: React.FC = () => {
	const { settings, updateAudioSettings } = useSettingsStore();
	const { toggleShuffle, isShuffled } = usePlayerStore();

	const handleAudioChange = (type: keyof typeof settings.audio.audio, value: any) => {
		updateAudioSettings({
			audio: {
				...settings.audio.audio,
				[type]: value,
			},
		});
	};

	const handlePlaybackChange = (type: keyof typeof settings.audio.playback, value: any) => {
		// Special handling for shuffle to sync with player store
		if (type === 'shuffle' && value !== isShuffled) {
			toggleShuffle();
		} else {
			updateAudioSettings({
				playback: {
					...settings.audio.playback,
					[type]: value,
				},
			});
		}
	};

	const handleInterfaceChange = (type: keyof typeof settings.audio.interface, value: boolean) => {
		updateAudioSettings({
			interface: {
				...settings.audio.interface,
				[type]: value,
			},
		});
	};

	const handleEqualizerChange = (type: keyof typeof settings.audio.audio.equalizer, value: any) => {
		updateAudioSettings({
			audio: {
				...settings.audio.audio,
				equalizer: {
					...settings.audio.audio.equalizer,
					[type]: value,
				},
			},
		});
	};

	return (
		<div className="space-y-6">
			{/* Audio Settings */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Volume2 className="h-5 w-5" />
						Audio Quality & Processing
					</CardTitle>
					<CardDescription>
						Configure audio quality and processing options
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="audio-quality">Audio Quality</Label>
							<Select
								value={settings.audio.audio.quality}
								onValueChange={(value: "low" | "medium" | "high" | "lossless") =>
									handleAudioChange("quality", value)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select audio quality" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="low">Low (96 kbps) - Save data</SelectItem>
									<SelectItem value="medium">Medium (192 kbps) - Balanced</SelectItem>
									<SelectItem value="high">High (320 kbps) - Best quality</SelectItem>
									<SelectItem value="lossless">Lossless - Studio quality</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="equalizer-preset">Equalizer Preset</Label>
							<Select
								value={settings.audio.audio.equalizer.preset}
								onValueChange={(value: "flat" | "bass" | "treble" | "vocal" | "custom") =>
									handleEqualizerChange("preset", value)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select equalizer preset" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="flat">Flat - Natural sound</SelectItem>
									<SelectItem value="bass">Bass Boost - Enhanced low frequencies</SelectItem>
									<SelectItem value="treble">Treble Boost - Enhanced high frequencies</SelectItem>
									<SelectItem value="vocal">Vocal Boost - Enhanced mid frequencies</SelectItem>
									<SelectItem value="custom">Custom - Manual adjustment</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="audio-normalization">Audio Normalization</Label>
								<p className="text-sm text-muted-foreground">
									Automatically adjust volume levels for consistent playback
								</p>
							</div>
							<Switch
								id="audio-normalization"
								checked={settings.audio.audio.normalization}
								onCheckedChange={(checked) => handleAudioChange("normalization", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="crossfade">Crossfade</Label>
								<p className="text-sm text-muted-foreground">
									Smoothly transition between songs
								</p>
							</div>
							<Switch
								id="crossfade"
								checked={settings.audio.audio.crossfade}
								onCheckedChange={(checked) => handleAudioChange("crossfade", checked)}
							/>
						</div>

						{settings.audio.audio.crossfade && (
							<div className="space-y-2">
								<Label htmlFor="crossfade-duration">
									Crossfade Duration: {settings.audio.audio.crossfadeDuration}s
								</Label>
								<Slider
									id="crossfade-duration"
									min={1}
									max={10}
									step={1}
									value={[settings.audio.audio.crossfadeDuration]}
									onValueChange={([value]) => handleAudioChange("crossfadeDuration", value)}
									className="w-full"
								/>
							</div>
						)}

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="equalizer-enabled">Enable Equalizer</Label>
								<p className="text-sm text-muted-foreground">
									Customize audio frequencies
								</p>
							</div>
							<Switch
								id="equalizer-enabled"
								checked={settings.audio.audio.equalizer.enabled}
								onCheckedChange={(checked) => handleEqualizerChange("enabled", checked)}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Playback Settings */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Play className="h-5 w-5" />
						Playback Behavior
					</CardTitle>
					<CardDescription>
						Configure how music plays and transitions
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="repeat-mode">Repeat Mode</Label>
							<Select
								value={settings.audio.playback.repeat}
								onValueChange={(value: "off" | "one" | "all") =>
									handlePlaybackChange("repeat", value)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select repeat mode" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="off">Off - Don't repeat</SelectItem>
									<SelectItem value="one">One - Repeat current song</SelectItem>
									<SelectItem value="all">All - Repeat playlist</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="autoplay">Autoplay</Label>
								<p className="text-sm text-muted-foreground">
									Automatically start playing when app opens
								</p>
							</div>
							<Switch
								id="autoplay"
								checked={settings.audio.playback.autoplay}
								onCheckedChange={(checked) => handlePlaybackChange("autoplay", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="shuffle">Shuffle</Label>
								<p className="text-sm text-muted-foreground">
									Play songs in random order
								</p>
							</div>
													<Switch
							id="shuffle"
							checked={isShuffled}
							onCheckedChange={(checked) => handlePlaybackChange("shuffle", checked)}
						/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="gapless-playback">Gapless Playback</Label>
								<p className="text-sm text-muted-foreground">
									Seamless transition between songs without gaps
								</p>
							</div>
							<Switch
								id="gapless-playback"
								checked={settings.audio.playback.gaplessPlayback}
								onCheckedChange={(checked) => handlePlaybackChange("gaplessPlayback", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="preload-next">Preload Next Song</Label>
								<p className="text-sm text-muted-foreground">
									Load next song in advance for smoother playback
								</p>
							</div>
							<Switch
								id="preload-next"
								checked={settings.audio.playback.preloadNext}
								onCheckedChange={(checked) => handlePlaybackChange("preloadNext", checked)}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Interface Settings */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Monitor className="h-5 w-5" />
						Interface & Display
					</CardTitle>
					<CardDescription>
						Customize the user interface and display options
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="compact-mode">Compact Mode</Label>
								<p className="text-sm text-muted-foreground">
									Use a more compact interface layout
								</p>
							</div>
							<Switch
								id="compact-mode"
								checked={settings.audio.interface.compactMode}
								onCheckedChange={(checked) => handleInterfaceChange("compactMode", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="show-lyrics">Show Lyrics</Label>
								<p className="text-sm text-muted-foreground">
									Display song lyrics when available
								</p>
							</div>
							<Switch
								id="show-lyrics"
								checked={settings.audio.interface.showLyrics}
								onCheckedChange={(checked) => handleInterfaceChange("showLyrics", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="show-visualizer">Show Visualizer</Label>
								<p className="text-sm text-muted-foreground">
									Display audio visualizer during playback
								</p>
							</div>
							<Switch
								id="show-visualizer"
								checked={settings.audio.interface.showVisualizer}
								onCheckedChange={(checked) => handleInterfaceChange("showVisualizer", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="animations">Enable Animations</Label>
								<p className="text-sm text-muted-foreground">
									Show smooth animations and transitions
								</p>
							</div>
							<Switch
								id="animations"
								checked={settings.audio.interface.animations}
								onCheckedChange={(checked) => handleInterfaceChange("animations", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="reduced-motion">Reduced Motion</Label>
								<p className="text-sm text-muted-foreground">
									Reduce animations for accessibility
								</p>
							</div>
							<Switch
								id="reduced-motion"
								checked={settings.audio.interface.reducedMotion}
								onCheckedChange={(checked) => handleInterfaceChange("reducedMotion", checked)}
							/>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default AudioSettingsTab;
