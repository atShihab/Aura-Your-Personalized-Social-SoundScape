import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { Music, Play, Users, Headphones, ArrowRight, Mic, Star, CheckCircle, Heart, MessageCircle, TrendingUp, Award, Mail, Quote, User, Clock, Globe, Instagram, Twitter, Youtube, Facebook, Zap, Sparkles, Radio, Volume2, BarChart3, MessageSquare, Shield, Crown } from "lucide-react";
import { motion } from "framer-motion";

const LandingPage = () => {
	const navigate = useNavigate();
	
	console.log("🏠 LandingPage component rendering...");

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
			{/* Animated Background Elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-300/10 to-pink-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
			</div>

			{/* Particle Effects */}
			<div className="absolute inset-0">
				{[...Array(50)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
						style={{
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
						}}
						animate={{
							y: [0, -20, 0],
							opacity: [0.3, 1, 0.3],
						}}
						transition={{
							duration: 3 + Math.random() * 2,
							repeat: Infinity,
							delay: Math.random() * 2,
						}}
					/>
				))}
			</div>

			{/* Navigation */}
			<nav className="relative z-10 flex items-center justify-between p-4 sm:p-6 md:p-8">
				<motion.div 
					className="flex items-center space-x-2 sm:space-x-3"
					initial={{ opacity: 0, x: -50 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.8 }}
				>
					<div className="relative">
						<img 
							src="/aura.svg" 
							className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16" 
							alt="AURA MUSIC logo"
							onError={(e) => {
								console.warn('Aura logo not found');
							}}
						/>
					</div>
					<span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent text-glow-gradient">
						AURA
					</span>
				</motion.div>
				<motion.div 
					className="flex items-center space-x-2 sm:space-x-4"
					initial={{ opacity: 0, x: 50 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
				>
					<Button
						variant="outline"
						onClick={() => navigate("/sign-up")}
						className="backdrop-blur-md bg-white/10 border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/20 hover:text-white transition-all duration-300 text-xs sm:text-sm"
					>
						<Mic className="size-3 sm:size-4 mr-1 sm:mr-2" />
						<span className="hidden sm:inline">Join As Artist</span>
						<span className="sm:hidden">Artist</span>
					</Button>
					<Button
						variant="outline"
						onClick={() => navigate("/login")}
						className="backdrop-blur-md bg-white/10 border-purple-400/30 text-purple-300 hover:bg-purple-400/20 hover:text-white transition-all duration-300 text-xs sm:text-sm"
					>
						<span className="hidden sm:inline">Sign In</span>
						<span className="sm:hidden">Login</span>
					</Button>
					<Button
						onClick={() => navigate("/sign-up")}
						className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 text-xs sm:text-sm"
					>
						<Sparkles className="size-3 sm:size-4 mr-1 sm:mr-2" />
						<span className="hidden sm:inline">Get Started</span>
						<span className="sm:hidden">Start</span>
					</Button>
				</motion.div>
			</nav>

			{/* Hero Section */}
			<div className="relative z-10 text-center px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-32">
				{/* 3D Floating Elements */}
				<motion.div
					className="absolute top-20 left-4 sm:left-10 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-2xl backdrop-blur-md border border-cyan-400/30"
					animate={{
						y: [0, -20, 0],
						rotate: [0, 5, 0],
					}}
					transition={{
						duration: 4,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				>
					<div className="flex items-center justify-center h-full">
						<Music className="size-8 text-cyan-400" />
					</div>
				</motion.div>

				<motion.div
					className="absolute top-32 right-8 sm:right-16 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-400/20 to-purple-600/20 rounded-full backdrop-blur-md border border-pink-400/30"
					animate={{
						y: [0, 15, 0],
						rotate: [0, -5, 0],
					}}
					transition={{
						duration: 3,
						repeat: Infinity,
						ease: "easeInOut",
						delay: 1,
					}}
				>
					<div className="flex items-center justify-center h-full">
						<Volume2 className="size-6 text-pink-400" />
					</div>
				</motion.div>

				<motion.div
					className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-3xl backdrop-blur-md border border-blue-400/30"
					animate={{
						y: [0, -25, 0],
						rotate: [0, 10, 0],
					}}
					transition={{
						duration: 5,
						repeat: Infinity,
						ease: "easeInOut",
						delay: 2,
					}}
				>
					<div className="flex items-center justify-center h-full">
						<Radio className="size-10 text-blue-400" />
					</div>
				</motion.div>

				<motion.h1 
					className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 sm:mb-8 leading-tight"
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, delay: 0.3 }}
				>
					<span className="block">Your Music,</span>
					<span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
						Your Universe
					</span>
				</motion.h1>

				<motion.p 
					className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, delay: 0.6 }}
				>
					Experience the future of music with real-time streaming, social connections, and AI-powered discovery. 
					Join the ultimate immersive music platform.
				</motion.p>

				<motion.div 
					className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, delay: 0.9 }}
				>
					<Button
						onClick={() => navigate("/sign-up")}
						size="lg"
						className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-base sm:text-lg md:text-xl px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl shadow-2xl shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 hover:scale-105 w-full sm:w-auto"
					>
						<div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl sm:rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
						<span className="relative flex items-center justify-center">
							<Zap className="mr-2 sm:mr-3 size-4 sm:size-5 md:size-6" />
							<span className="hidden sm:inline">Start Your Journey</span>
							<span className="sm:hidden">Get Started</span>
							<ArrowRight className="ml-2 sm:ml-3 size-4 sm:size-5 md:size-6 group-hover:translate-x-1 transition-transform" />
						</span>
					</Button>

					<Button
						onClick={() => navigate("/artist/signup")}
						size="lg"
						className="group backdrop-blur-md bg-white/10 border-2 border-purple-400/30 text-purple-300 hover:bg-purple-400/20 hover:text-white text-base sm:text-lg md:text-xl px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
					>
						<Mic className="mr-2 sm:mr-3 size-4 sm:size-5 md:size-6" />
						<span className="hidden sm:inline">Become an Artist</span>
						<span className="sm:hidden">Join as Artist</span>
					</Button>

					<Button
						variant="outline"
						onClick={() => navigate("/login")}
						size="lg"
						className="backdrop-blur-md bg-white/5 border border-gray-400/30 text-gray-300 hover:bg-white/10 hover:text-white text-lg px-8 py-4 rounded-2xl transition-all duration-300"
					>
						Already have an account?
					</Button>
				</motion.div>
			</div>

			{/* Statistics Section */}
			<div className="relative px-6 md:px-8 py-20 bg-gradient-to-r from-cyan-900/10 via-purple-900/10 to-pink-900/10 backdrop-blur-sm">
				<div className="max-w-6xl mx-auto">
					<motion.div 
						className="grid grid-cols-2 md:grid-cols-4 gap-8"
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
					>
						<motion.div 
							className="text-center p-6 backdrop-blur-md bg-white/5 rounded-2xl border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300"
							whileHover={{ scale: 1.05, y: -5 }}
						>
							<div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">10M+</div>
							<div className="text-gray-300">Active Listeners</div>
						</motion.div>
						<motion.div 
							className="text-center p-6 backdrop-blur-md bg-white/5 rounded-2xl border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300"
							whileHover={{ scale: 1.05, y: -5 }}
						>
							<div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">50K+</div>
							<div className="text-gray-300">Verified Artists</div>
						</motion.div>
						<motion.div 
							className="text-center p-6 backdrop-blur-md bg-white/5 rounded-2xl border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300"
							whileHover={{ scale: 1.05, y: -5 }}
						>
							<div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">100M+</div>
							<div className="text-gray-300">Songs Streamed</div>
						</motion.div>
						<motion.div 
							className="text-center p-6 backdrop-blur-md bg-white/5 rounded-2xl border border-pink-400/20 hover:border-pink-400/40 transition-all duration-300"
							whileHover={{ scale: 1.05, y: -5 }}
						>
							<div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">24/7</div>
							<div className="text-gray-300">Music Available</div>
						</motion.div>
					</motion.div>
						</div>
						</div>

			{/* Key Features Section */}
			<div className="relative px-6 md:px-8 py-24">
				<div className="max-w-7xl mx-auto">
					<motion.div 
						className="text-center mb-20"
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
					>
						<h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
							<span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
								Revolutionary Features
							</span>
						</h2>
						<p className="text-xl text-gray-300 max-w-3xl mx-auto">
							Experience the next generation of music streaming with cutting-edge technology and immersive social features
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						<motion.div
							className="group relative p-8 backdrop-blur-md bg-white/5 rounded-3xl border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-500 hover:bg-white/10"
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							viewport={{ once: true }}
							whileHover={{ scale: 1.02, y: -10 }}
						>
							<div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
							<div className="relative">
								<div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/25">
									<Radio className="size-8 text-white" />
						</div>
								<h3 className="text-2xl font-bold text-white mb-4">Real-Time Streaming</h3>
								<p className="text-gray-300 leading-relaxed">
									Experience seamless, high-quality music streaming with instant playback and zero buffering. 
									Our advanced audio engine delivers crystal-clear sound.
								</p>
						</div>
						</motion.div>

						<motion.div
							className="group relative p-8 backdrop-blur-md bg-white/5 rounded-3xl border border-purple-400/20 hover:border-purple-400/40 transition-all duration-500 hover:bg-white/10"
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							viewport={{ once: true }}
							whileHover={{ scale: 1.02, y: -10 }}
						>
							<div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
							<div className="relative">
								<div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/25">
									<Users className="size-8 text-white" />
					</div>
								<h3 className="text-2xl font-bold text-white mb-4">Social Music Experience</h3>
								<p className="text-gray-300 leading-relaxed">
									Connect with friends, see what they're listening to in real-time, and discover new music together. 
									Share playlists and create musical memories.
								</p>
				</div>
						</motion.div>

						<motion.div
							className="group relative p-8 backdrop-blur-md bg-white/5 rounded-3xl border border-blue-400/20 hover:border-blue-400/40 transition-all duration-500 hover:bg-white/10"
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.3 }}
							viewport={{ once: true }}
							whileHover={{ scale: 1.02, y: -10 }}
						>
							<div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
							<div className="relative">
								<div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25">
									<MessageSquare className="size-8 text-white" />
								</div>
								<h3 className="text-2xl font-bold text-white mb-4">Integrated Chat System</h3>
								<p className="text-gray-300 leading-relaxed">
									Chat with friends while listening to music. Share your thoughts about songs, 
									coordinate listening sessions, and build a community around music.
								</p>
							</div>
						</motion.div>

						<motion.div
							className="group relative p-8 backdrop-blur-md bg-white/5 rounded-3xl border border-pink-400/20 hover:border-pink-400/40 transition-all duration-500 hover:bg-white/10"
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.4 }}
							viewport={{ once: true }}
							whileHover={{ scale: 1.02, y: -10 }}
						>
							<div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
							<div className="relative">
								<div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-pink-500/25">
									<BarChart3 className="size-8 text-white" />
								</div>
								<h3 className="text-2xl font-bold text-white mb-4">Advanced Analytics</h3>
								<p className="text-gray-300 leading-relaxed">
									Track your listening habits, discover your music personality, and get insights 
									into your favorite genres and artists with detailed analytics.
								</p>
							</div>
						</motion.div>

						<motion.div
							className="group relative p-8 backdrop-blur-md bg-white/5 rounded-3xl border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-500 hover:bg-white/10"
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.5 }}
							viewport={{ once: true }}
							whileHover={{ scale: 1.02, y: -10 }}
						>
							<div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
							<div className="relative">
								<div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/25">
									<Crown className="size-8 text-white" />
								</div>
								<h3 className="text-2xl font-bold text-white mb-4">Admin Dashboard</h3>
								<p className="text-gray-300 leading-relaxed">
									Comprehensive admin panel for managing albums, songs, and user content. 
									Upload, organize, and curate music with powerful management tools.
								</p>
							</div>
						</motion.div>

						<motion.div
							className="group relative p-8 backdrop-blur-md bg-white/5 rounded-3xl border border-purple-400/20 hover:border-purple-400/40 transition-all duration-500 hover:bg-white/10"
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.6 }}
							viewport={{ once: true }}
							whileHover={{ scale: 1.02, y: -10 }}
						>
							<div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
							<div className="relative">
								<div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/25">
									<Shield className="size-8 text-white" />
								</div>
								<h3 className="text-2xl font-bold text-white mb-4">Secure & Reliable</h3>
								<p className="text-gray-300 leading-relaxed">
									Enterprise-grade security with real-time status monitoring. Your data and music 
									are protected with advanced encryption and backup systems.
								</p>
							</div>
						</motion.div>
					</div>
				</div>
			</div>

			{/* Featured Artists Carousel */}
			<div className="relative px-6 md:px-8 py-24 bg-gradient-to-r from-purple-900/10 via-pink-900/10 to-cyan-900/10">
				<div className="max-w-6xl mx-auto">
					<motion.div 
						className="text-center mb-20"
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
					>
						<h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
							<span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
							Featured Artists
							</span>
						</h2>
						<p className="text-xl text-gray-300 max-w-3xl mx-auto">
							Discover amazing talent and trending artists on Aura. Connect with verified musicians and explore their latest releases.
						</p>
					</motion.div>
					
					<Carousel
						opts={{
							align: "start",
							loop: true,
						}}
						className="w-full"
					>
						<CarouselContent className="-ml-2 md:-ml-4">
							{[
								{
									name: "Luna Nova",
									genre: "Synthwave",
									followers: "2.5M",
									image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
									verified: true,
									latest: "Neon Dreams"
								},
								{
									name: "Cyber Pulse",
									genre: "Electronic",
									followers: "1.8M",
									image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
									verified: true,
									latest: "Digital Waves"
								},
								{
									name: "Aurora Beats",
									genre: "Future Bass",
									followers: "3.2M",
									image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
									verified: true,
									latest: "Cosmic Vibes"
								},
								{
									name: "Neon Shadow",
									genre: "Dark Synth",
									followers: "1.5M",
									image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
									verified: false,
									latest: "Midnight City"
								},
								{
									name: "Quantum Echo",
									genre: "Ambient",
									followers: "890K",
									image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
									verified: false,
									latest: "Infinite Space"
								}
							].map((artist, index) => (
								<CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
									<HoverCard>
										<HoverCardTrigger asChild>
											<motion.div
												initial={{ opacity: 0, y: 50 }}
												whileInView={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.6, delay: index * 0.1 }}
												viewport={{ once: true }}
											>
												<Card className="group backdrop-blur-md bg-white/5 border border-purple-400/20 hover:border-purple-400/40 cursor-pointer transition-all duration-500 hover:bg-white/10 hover:scale-105">
												<CardContent className="p-6">
													<div className="flex flex-col items-center text-center space-y-4">
															<div className="relative">
																<Avatar className="w-20 h-20 ring-2 ring-purple-400/30 group-hover:ring-purple-400/60 transition-all duration-300">
															<AvatarImage src={artist.image} alt={artist.name} />
																	<AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-xl font-bold">
																{artist.name.split(' ').map(n => n[0]).join('')}
															</AvatarFallback>
														</Avatar>
																<div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center">
																	<Music className="size-3 text-white" />
																</div>
															</div>
														<div className="space-y-2">
															<div className="flex items-center justify-center space-x-2">
																<h3 className="text-lg font-semibold text-white">{artist.name}</h3>
																{artist.verified && (
																		<Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs">
																		<CheckCircle className="w-3 h-3 mr-1" />
																		Verified
																	</Badge>
																)}
															</div>
																<p className="text-gray-400 text-sm">{artist.genre}</p>
																<p className="text-cyan-400 text-sm font-medium">{artist.followers} followers</p>
														</div>
													</div>
												</CardContent>
											</Card>
											</motion.div>
										</HoverCardTrigger>
										<HoverCardContent className="w-80 backdrop-blur-md bg-white/10 border border-purple-400/30">
											<div className="flex justify-between space-x-4">
												<Avatar className="w-16 h-16 ring-2 ring-purple-400/30">
													<AvatarImage src={artist.image} alt={artist.name} />
													<AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
														{artist.name.split(' ').map(n => n[0]).join('')}
													</AvatarFallback>
												</Avatar>
												<div className="space-y-1">
													<h4 className="text-sm font-semibold text-white">{artist.name}</h4>
													<p className="text-xs text-gray-400">{artist.genre} • {artist.followers} followers</p>
													<div className="flex items-center pt-2">
														<Badge variant="outline" className="text-xs border-cyan-500 text-cyan-400">
															Latest: {artist.latest}
														</Badge>
													</div>
												</div>
											</div>
											<div className="flex items-center justify-between pt-4">
												<Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white">
													<Heart className="w-4 h-4 mr-2" />
													Follow
												</Button>
												<div className="flex space-x-2">
													<Button size="sm" variant="outline" className="border-purple-400/30 text-purple-300 hover:bg-purple-400/20">
														<Play className="w-4 h-4" />
													</Button>
													<Button size="sm" variant="outline" className="border-purple-400/30 text-purple-300 hover:bg-purple-400/20">
														<MessageCircle className="w-4 h-4" />
													</Button>
												</div>
											</div>
										</HoverCardContent>
									</HoverCard>
								</CarouselItem>
							))}
						</CarouselContent>
						<CarouselPrevious className="backdrop-blur-md bg-white/10 border-purple-400/30 text-purple-300 hover:bg-purple-400/20" />
						<CarouselNext className="backdrop-blur-md bg-white/10 border-purple-400/30 text-purple-300 hover:bg-purple-400/20" />
					</Carousel>
				</div>
			</div>

			{/* Artist Section */}
			<div className="relative px-6 md:px-8 py-24 bg-gradient-to-r from-blue-900/10 via-purple-900/10 to-pink-900/10">
				<div className="max-w-6xl mx-auto">
					<motion.div 
						className="text-center mb-20"
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
					>
						<div className="relative w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-blue-400/30">
							<Mic className="size-12 text-blue-400" />
							<div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-3xl blur opacity-50 animate-pulse"></div>
						</div>
						<h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
							<span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
							For Artists & Musicians
							</span>
						</h2>
						<p className="text-xl text-gray-300 max-w-3xl mx-auto">
							Share your music with the world, get verified, and build your fanbase on Aura. 
							Join the next generation of music creators.
						</p>
					</motion.div>
					
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
						<motion.div 
							className="group text-center p-8 backdrop-blur-md bg-white/5 rounded-3xl border border-blue-400/20 hover:border-blue-400/40 transition-all duration-500 hover:bg-white/10"
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							viewport={{ once: true }}
							whileHover={{ scale: 1.02, y: -10 }}
						>
							<div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
								<CheckCircle className="size-10 text-white" />
							</div>
							<h3 className="text-2xl font-bold text-white mb-4">Get Verified</h3>
							<p className="text-gray-300 leading-relaxed">
								Earn the blue verification badge and build trust with your audience. 
								Stand out as a legitimate artist in the Aura community.
							</p>
						</motion.div>
						<motion.div 
							className="group text-center p-8 backdrop-blur-md bg-white/5 rounded-3xl border border-purple-400/20 hover:border-purple-400/40 transition-all duration-500 hover:bg-white/10"
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							viewport={{ once: true }}
							whileHover={{ scale: 1.02, y: -10 }}
						>
							<div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
								<Users className="size-10 text-white" />
						</div>
							<h3 className="text-2xl font-bold text-white mb-4">Grow Your Fanbase</h3>
							<p className="text-gray-300 leading-relaxed">
								Connect with listeners, share your story, and expand your reach. 
								Build meaningful relationships with your audience.
							</p>
						</motion.div>
						<motion.div 
							className="group text-center p-8 backdrop-blur-md bg-white/5 rounded-3xl border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-500 hover:bg-white/10"
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.3 }}
							viewport={{ once: true }}
							whileHover={{ scale: 1.02, y: -10 }}
						>
							<div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/25">
								<Star className="size-10 text-white" />
						</div>
							<h3 className="text-2xl font-bold text-white mb-4">Professional Profile</h3>
							<p className="text-gray-300 leading-relaxed">
								Showcase your music, bio, and social media in a professional profile. 
								Present yourself as a serious artist with our advanced tools.
							</p>
						</motion.div>
					</div>

					<motion.div 
						className="text-center"
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.4 }}
						viewport={{ once: true }}
					>
						<Button
							onClick={() => navigate("/sign-up")}
							size="lg"
							className="group relative bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xl px-12 py-8 rounded-2xl shadow-2xl shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-105"
						>
							<div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
							<span className="relative flex items-center">
								<Mic className="mr-3 size-6" />
							Start Your Artist Journey
								<ArrowRight className="ml-3 size-6 group-hover:translate-x-1 transition-transform" />
							</span>
						</Button>
					</motion.div>
				</div>
			</div>

			{/* Why Choose Aura Section */}
			<div className="relative px-6 md:px-8 py-24">
				<div className="max-w-6xl mx-auto">
					<motion.div 
						className="text-center mb-20"
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
					>
						<h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
							<span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
								Why Choose Aura?
							</span>
					</h2>
						<p className="text-xl text-gray-300 max-w-3xl mx-auto">
							Experience the future of music streaming with cutting-edge technology and immersive features
						</p>
					</motion.div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<motion.div 
							className="text-center p-8 backdrop-blur-md bg-white/5 rounded-3xl border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-500 hover:bg-white/10"
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							viewport={{ once: true }}
							whileHover={{ scale: 1.02, y: -10 }}
						>
							<div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/25">
								<Play className="size-10 text-white" />
							</div>
							<h3 className="text-2xl font-bold text-white mb-4">Unlimited Music</h3>
							<p className="text-gray-300 leading-relaxed">
								Access millions of songs from your favorite artists. Stream high-quality music anytime, anywhere with our advanced audio engine.
							</p>
						</motion.div>
						<motion.div 
							className="text-center p-8 backdrop-blur-md bg-white/5 rounded-3xl border border-purple-400/20 hover:border-purple-400/40 transition-all duration-500 hover:bg-white/10"
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							viewport={{ once: true }}
							whileHover={{ scale: 1.02, y: -10 }}
						>
							<div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
								<Users className="size-10 text-white" />
						</div>
							<h3 className="text-2xl font-bold text-white mb-4">Social Experience</h3>
							<p className="text-gray-300 leading-relaxed">
								See what your friends are listening to in real-time, share playlists, and discover new music together in our immersive social environment.
							</p>
						</motion.div>
						<motion.div 
							className="text-center p-8 backdrop-blur-md bg-white/5 rounded-3xl border border-blue-400/20 hover:border-blue-400/40 transition-all duration-500 hover:bg-white/10"
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.3 }}
							viewport={{ once: true }}
							whileHover={{ scale: 1.02, y: -10 }}
						>
							<div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
								<Headphones className="size-10 text-white" />
						</div>
							<h3 className="text-2xl font-bold text-white mb-4">AI-Powered Discovery</h3>
							<p className="text-gray-300 leading-relaxed">
								Get personalized recommendations powered by advanced AI. Discover your next favorite song based on your listening history and preferences.
							</p>
						</motion.div>
					</div>
				</div>
			</div>

			{/* Testimonials Section */}
			<div className="relative px-6 md:px-8 py-24 bg-gradient-to-r from-purple-900/10 via-pink-900/10 to-cyan-900/10">
				<div className="max-w-6xl mx-auto">
					<motion.div 
						className="text-center mb-20"
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
					>
						<h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
							<span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
							What Our Users Say
							</span>
						</h2>
						<p className="text-xl text-gray-300 max-w-3xl mx-auto">
							Join thousands of satisfied music lovers and artists who have found their perfect platform on Aura
						</p>
					</motion.div>
					
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<motion.div
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							viewport={{ once: true }}
						>
							<Card className="group backdrop-blur-md bg-white/5 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-500 hover:bg-white/10">
							<CardHeader>
								<div className="flex items-center space-x-2">
									<Quote className="size-5 text-purple-400" />
									<div className="flex space-x-1">
										{[...Array(5)].map((_, i) => (
											<Star key={i} className="size-4 text-yellow-400 fill-current" />
										))}
									</div>
								</div>
							</CardHeader>
							<CardContent>
									<p className="text-gray-300 mb-6 leading-relaxed">
										"Aura has completely transformed how I discover music. The social features make it so much fun to share and explore new artists with friends."
								</p>
								<div className="flex items-center space-x-3">
										<div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center ring-2 ring-purple-400/30">
											<User className="size-6 text-white" />
									</div>
									<div>
										<div className="text-white font-semibold">Sarah Johnson</div>
											<div className="text-gray-400 text-sm">Music Enthusiast</div>
									</div>
								</div>
							</CardContent>
						</Card>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							viewport={{ once: true }}
						>
							<Card className="group backdrop-blur-md bg-white/5 border border-blue-400/20 hover:border-blue-400/40 transition-all duration-500 hover:bg-white/10">
							<CardHeader>
								<div className="flex items-center space-x-2">
									<Quote className="size-5 text-blue-400" />
									<div className="flex space-x-1">
										{[...Array(5)].map((_, i) => (
											<Star key={i} className="size-4 text-yellow-400 fill-current" />
										))}
									</div>
								</div>
							</CardHeader>
							<CardContent>
									<p className="text-gray-300 mb-6 leading-relaxed">
										"As an independent artist, Aura has given me the platform I needed to reach new audiences. The verification process was smooth and professional."
								</p>
								<div className="flex items-center space-x-3">
										<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center ring-2 ring-blue-400/30">
											<Mic className="size-6 text-white" />
									</div>
									<div>
										<div className="text-white font-semibold">Alex Chen</div>
											<div className="text-gray-400 text-sm">Verified Artist</div>
									</div>
								</div>
							</CardContent>
						</Card>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.3 }}
							viewport={{ once: true }}
						>
							<Card className="group backdrop-blur-md bg-white/5 border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-500 hover:bg-white/10">
							<CardHeader>
								<div className="flex items-center space-x-2">
										<Quote className="size-5 text-cyan-400" />
									<div className="flex space-x-1">
										{[...Array(5)].map((_, i) => (
											<Star key={i} className="size-4 text-yellow-400 fill-current" />
										))}
									</div>
								</div>
							</CardHeader>
							<CardContent>
									<p className="text-gray-300 mb-6 leading-relaxed">
										"The AI-powered recommendations are spot-on! I've discovered so many amazing artists I never would have found otherwise."
								</p>
								<div className="flex items-center space-x-3">
										<div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center ring-2 ring-cyan-400/30">
											<Heart className="size-6 text-white" />
									</div>
									<div>
										<div className="text-white font-semibold">Maria Rodriguez</div>
											<div className="text-gray-400 text-sm">Playlist Creator</div>
									</div>
								</div>
							</CardContent>
						</Card>
						</motion.div>
					</div>
				</div>
			</div>

			{/* Pricing Section */}
			<div className="relative px-6 md:px-8 py-24">
				<div className="max-w-6xl mx-auto">
					<motion.div 
						className="text-center mb-20"
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
					>
						<h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
							<span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
							Choose Your Plan
							</span>
						</h2>
						<p className="text-xl text-gray-300 max-w-3xl mx-auto">
							Start free and upgrade when you're ready. No hidden fees, cancel anytime. Experience the future of music streaming.
						</p>
					</motion.div>
					
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<motion.div
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							viewport={{ once: true }}
						>
							<Card className="group backdrop-blur-md bg-white/5 border border-gray-400/20 hover:border-gray-400/40 transition-all duration-500 hover:bg-white/10 relative">
							<CardHeader className="text-center">
									<Badge variant="secondary" className="mb-4 bg-gray-600/50 text-gray-300">Free</Badge>
									<CardTitle className="text-white text-4xl">$0</CardTitle>
									<CardDescription className="text-gray-400">Perfect for getting started</CardDescription>
							</CardHeader>
								<CardContent className="space-y-6">
									<div className="space-y-3">
										<div className="flex items-center space-x-3">
											<CheckCircle className="size-5 text-cyan-400" />
											<span className="text-gray-300">Unlimited music streaming</span>
									</div>
										<div className="flex items-center space-x-3">
											<CheckCircle className="size-5 text-cyan-400" />
											<span className="text-gray-300">Basic social features</span>
									</div>
										<div className="flex items-center space-x-3">
											<CheckCircle className="size-5 text-cyan-400" />
											<span className="text-gray-300">Create playlists</span>
									</div>
										<div className="flex items-center space-x-3">
											<CheckCircle className="size-5 text-cyan-400" />
											<span className="text-gray-300">Standard audio quality</span>
									</div>
								</div>
									<Button className="w-full bg-gray-600/50 hover:bg-gray-600 text-white border border-gray-500/30">
									Get Started Free
								</Button>
							</CardContent>
						</Card>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							viewport={{ once: true }}
						>
							<Card className="group backdrop-blur-md bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-400/40 hover:border-cyan-400/60 transition-all duration-500 hover:bg-cyan-500/20 relative">
								<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
									<Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25">Most Popular</Badge>
							</div>
								<CardHeader className="text-center pt-8">
									<CardTitle className="text-white text-4xl">$9.99</CardTitle>
									<CardDescription className="text-gray-300">Premium experience</CardDescription>
							</CardHeader>
								<CardContent className="space-y-6">
									<div className="space-y-3">
										<div className="flex items-center space-x-3">
											<CheckCircle className="size-5 text-cyan-400" />
											<span className="text-gray-300">Everything in Free</span>
									</div>
										<div className="flex items-center space-x-3">
											<CheckCircle className="size-5 text-cyan-400" />
											<span className="text-gray-300">High-quality audio</span>
									</div>
										<div className="flex items-center space-x-3">
											<CheckCircle className="size-5 text-cyan-400" />
											<span className="text-gray-300">Offline downloads</span>
									</div>
										<div className="flex items-center space-x-3">
											<CheckCircle className="size-5 text-cyan-400" />
											<span className="text-gray-300">Advanced analytics</span>
									</div>
										<div className="flex items-center space-x-3">
											<CheckCircle className="size-5 text-cyan-400" />
											<span className="text-gray-300">Priority support</span>
									</div>
								</div>
									<Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25">
									Start Premium Trial
								</Button>
							</CardContent>
						</Card>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.3 }}
							viewport={{ once: true }}
						>
							<Card className="group backdrop-blur-md bg-white/5 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-500 hover:bg-white/10 relative">
							<CardHeader className="text-center">
									<Badge variant="outline" className="mb-4 border-purple-500 text-purple-400 bg-purple-500/10">Artist</Badge>
									<CardTitle className="text-white text-4xl">$19.99</CardTitle>
									<CardDescription className="text-gray-400">For professional artists</CardDescription>
							</CardHeader>
								<CardContent className="space-y-6">
									<div className="space-y-3">
										<div className="flex items-center space-x-3">
											<CheckCircle className="size-5 text-purple-400" />
											<span className="text-gray-300">Everything in Premium</span>
									</div>
										<div className="flex items-center space-x-3">
											<CheckCircle className="size-5 text-purple-400" />
											<span className="text-gray-300">Artist verification</span>
									</div>
										<div className="flex items-center space-x-3">
											<CheckCircle className="size-5 text-purple-400" />
											<span className="text-gray-300">Advanced analytics</span>
									</div>
										<div className="flex items-center space-x-3">
											<CheckCircle className="size-5 text-purple-400" />
											<span className="text-gray-300">Direct fan messaging</span>
									</div>
										<div className="flex items-center space-x-3">
											<CheckCircle className="size-5 text-purple-400" />
											<span className="text-gray-300">Revenue sharing</span>
									</div>
								</div>
									<Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25">
									<Mic className="mr-2 size-4" />
									Become an Artist
								</Button>
							</CardContent>
						</Card>
						</motion.div>
					</div>
				</div>
			</div>

			{/* FAQ Section */}
			<div className="relative px-6 md:px-8 py-24 bg-gradient-to-r from-slate-900/50 via-purple-900/20 to-slate-900/50">
				<div className="max-w-4xl mx-auto">
					<motion.div 
						className="text-center mb-20"
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
					>
						<h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
							<span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
							Frequently Asked Questions
							</span>
						</h2>
						<p className="text-xl text-gray-300 max-w-3xl mx-auto">
							Everything you need to know about Aura
						</p>
					</motion.div>
					
					<Accordion type="single" collapsible className="space-y-4">
						<AccordionItem value="item-1" className="backdrop-blur-md bg-white/5 border border-cyan-400/20 rounded-2xl px-6 hover:border-cyan-400/40 transition-all duration-300">
							<AccordionTrigger className="text-white hover:text-cyan-400 text-left">
								How much does Aura cost?
							</AccordionTrigger>
							<AccordionContent className="text-gray-300 leading-relaxed">
								Aura offers a free tier with unlimited music streaming and basic features. We also offer Premium ($9.99/month) and Artist ($19.99/month) plans with additional features like high-quality audio, offline downloads, and advanced analytics.
							</AccordionContent>
						</AccordionItem>
						
						<AccordionItem value="item-2" className="backdrop-blur-md bg-white/5 border border-purple-400/20 rounded-2xl px-6 hover:border-purple-400/40 transition-all duration-300">
							<AccordionTrigger className="text-white hover:text-purple-400 text-left">
								How do I become a verified artist?
							</AccordionTrigger>
							<AccordionContent className="text-gray-300 leading-relaxed">
								To become a verified artist, sign up for an Artist account, complete your profile with your music and bio, and submit verification documents. Our team will review your application and grant verification to legitimate artists.
							</AccordionContent>
						</AccordionItem>
						
						<AccordionItem value="item-3" className="backdrop-blur-md bg-white/5 border border-blue-400/20 rounded-2xl px-6 hover:border-blue-400/40 transition-all duration-300">
							<AccordionTrigger className="text-white hover:text-blue-400 text-left">
								Can I download music for offline listening?
							</AccordionTrigger>
							<AccordionContent className="text-gray-300 leading-relaxed">
								Yes! Premium and Artist subscribers can download songs and playlists for offline listening. Simply tap the download button next to any song or playlist to save it to your device.
							</AccordionContent>
						</AccordionItem>
						
						<AccordionItem value="item-4" className="backdrop-blur-md bg-white/5 border border-pink-400/20 rounded-2xl px-6 hover:border-pink-400/40 transition-all duration-300">
							<AccordionTrigger className="text-white hover:text-pink-400 text-left">
								How does the social music experience work?
							</AccordionTrigger>
							<AccordionContent className="text-gray-300 leading-relaxed">
								Connect with friends to see what they're listening to in real-time, share playlists, and discover new music together. You can also follow your favorite artists and get notified when they release new music.
							</AccordionContent>
						</AccordionItem>
						
						<AccordionItem value="item-5" className="backdrop-blur-md bg-white/5 border border-cyan-400/20 rounded-2xl px-6 hover:border-cyan-400/40 transition-all duration-300">
							<AccordionTrigger className="text-white hover:text-cyan-400 text-left">
								What audio quality do you support?
							</AccordionTrigger>
							<AccordionContent className="text-gray-300 leading-relaxed">
								Free users get standard quality (128kbps), while Premium and Artist subscribers enjoy high-quality audio (320kbps) for the best listening experience possible.
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
			</div>

			{/* Social Media Integration */}
			<div className="px-6 md:px-8 py-20">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
							Connect Everywhere
						</h2>
						<p className="text-xl text-zinc-300 max-w-2xl mx-auto">
							Follow your favorite artists and share your music across all your favorite platforms
						</p>
					</div>
					
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						<Card className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-300">
							<CardContent className="p-6 text-center">
								<div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
									<Instagram className="size-8 text-white" />
								</div>
								<h3 className="text-xl font-semibold text-white mb-2">Instagram</h3>
								<p className="text-zinc-400 mb-4">Share your music moments and connect with fans</p>
								<Button variant="outline" className="border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-white">
									Connect Instagram
								</Button>
							</CardContent>
						</Card>
						
						<Card className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-300">
							<CardContent className="p-6 text-center">
								<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
									<Twitter className="size-8 text-white" />
								</div>
								<h3 className="text-xl font-semibold text-white mb-2">Twitter</h3>
								<p className="text-zinc-400 mb-4">Share updates and engage with your audience</p>
								<Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white">
									Connect Twitter
								</Button>
							</CardContent>
						</Card>
						
						<Card className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-300">
							<CardContent className="p-6 text-center">
								<div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
									<Youtube className="size-8 text-white" />
								</div>
								<h3 className="text-xl font-semibold text-white mb-2">YouTube</h3>
								<p className="text-zinc-400 mb-4">Share music videos and behind-the-scenes content</p>
								<Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white">
									Connect YouTube
								</Button>
							</CardContent>
						</Card>
						
						<Card className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-300">
							<CardContent className="p-6 text-center">
								<div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
									<Facebook className="size-8 text-white" />
								</div>
								<h3 className="text-xl font-semibold text-white mb-2">Facebook</h3>
								<p className="text-zinc-400 mb-4">Connect with friends and share your music journey</p>
								<Button variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white">
									Connect Facebook
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			{/* Newsletter Section */}
			<div className="px-6 md:px-8 py-20 bg-gradient-to-r from-emerald-900/20 to-blue-900/20">
				<div className="max-w-4xl mx-auto text-center">
					<div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
						<Mail className="size-10 text-emerald-400" />
					</div>
					<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
						Stay in the Loop
					</h2>
					<p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
						Get the latest updates on new features, artist releases, and exclusive content delivered to your inbox.
					</p>
					
					<Card className="bg-zinc-800/50 border-zinc-700 max-w-md mx-auto">
						<CardContent className="pt-6">
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="email" className="text-white">Email Address</Label>
									<Input 
										id="email" 
										type="email" 
										placeholder="Enter your email" 
										className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400"
									/>
								</div>
								<Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
									<Mail className="mr-2 size-4" />
									Subscribe to Newsletter
								</Button>
								<p className="text-xs text-zinc-400">
									We respect your privacy. Unsubscribe at any time.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Mobile App Showcase */}
			<div className="px-6 md:px-8 py-20 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
				<div className="max-w-6xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<div className="space-y-6">
							<h2 className="text-3xl md:text-4xl font-bold text-white">
								Take Your Music Everywhere
							</h2>
							<p className="text-xl text-zinc-300">
								Download the Aura mobile app and enjoy your favorite music on the go. Available for iOS and Android devices.
							</p>
							
							<div className="space-y-4">
								<div className="flex items-center space-x-3">
									<div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
										<Headphones className="size-6 text-emerald-400" />
									</div>
									<div>
										<h3 className="text-white font-semibold">Offline Listening</h3>
										<p className="text-zinc-400 text-sm">Download your favorite songs and listen without internet</p>
									</div>
								</div>
								
								<div className="flex items-center space-x-3">
									<div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
										<Users className="size-6 text-blue-400" />
									</div>
									<div>
										<h3 className="text-white font-semibold">Social Features</h3>
										<p className="text-zinc-400 text-sm">See what friends are listening to and share your music</p>
									</div>
								</div>
								
								<div className="flex items-center space-x-3">
									<div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
										<Star className="size-6 text-purple-400" />
									</div>
									<div>
										<h3 className="text-white font-semibold">Personalized Experience</h3>
										<p className="text-zinc-400 text-sm">Get recommendations based on your listening history</p>
									</div>
								</div>
							</div>
							
							<div className="flex flex-col sm:flex-row gap-4">
								<Button className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600">
									<Globe className="mr-2 size-5" />
									Download for iOS
								</Button>
								<Button className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600">
									<Globe className="mr-2 size-5" />
									Download for Android
								</Button>
							</div>
						</div>
						
						<div className="relative">
							<div className="relative mx-auto w-80 h-96 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl border border-zinc-700 shadow-2xl">
								{/* Mock phone screen */}
								<div className="absolute inset-4 bg-gradient-to-br from-emerald-900/50 to-blue-900/50 rounded-2xl p-6">
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-2">
												<div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
													<Music className="size-5 text-white" />
												</div>
												<span className="text-white font-bold text-glow">AURA</span>
											</div>
											<div className="w-6 h-6 bg-emerald-500 rounded-full"></div>
										</div>
										
										<div className="space-y-3">
											<div className="bg-zinc-800/50 rounded-lg p-3">
												<div className="flex items-center space-x-3">
													<div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
													<div className="flex-1">
														<div className="text-white text-sm font-medium">Latest Release</div>
														<div className="text-zinc-400 text-xs">Featured Artist 1</div>
													</div>
													<Play className="size-5 text-emerald-400" />
												</div>
											</div>
											
											<div className="bg-zinc-800/50 rounded-lg p-3">
												<div className="flex items-center space-x-3">
													<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg"></div>
													<div className="flex-1">
														<div className="text-white text-sm font-medium">New Track</div>
														<div className="text-zinc-400 text-xs">Featured Artist 2</div>
													</div>
													<Play className="size-5 text-emerald-400" />
												</div>
											</div>
											
											<div className="bg-zinc-800/50 rounded-lg p-3">
												<div className="flex items-center space-x-3">
													<div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg"></div>
													<div className="flex-1">
														<div className="text-white text-sm font-medium">Fresh Sound</div>
														<div className="text-zinc-400 text-xs">Featured Artist 3</div>
													</div>
													<Play className="size-5 text-emerald-400" />
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="relative px-6 md:px-8 py-24 bg-gradient-to-r from-cyan-900/10 via-purple-900/10 to-pink-900/10">
				<div className="max-w-4xl mx-auto text-center">
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
					>
						<h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
							<span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
						Ready to Start Your Musical Journey?
							</span>
					</h2>
						<p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
						Join thousands of music lovers who are already discovering new sounds every day.
							Experience the future of music streaming with Aura.
					</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-6">
						<Button
							onClick={() => navigate("/sign-up")}
							size="lg"
								className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xl px-12 py-8 rounded-2xl shadow-2xl shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 hover:scale-105"
						>
								<div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
								<span className="relative flex items-center">
									<Sparkles className="mr-3 size-6" />
							Create Free Account
									<ArrowRight className="ml-3 size-6 group-hover:translate-x-1 transition-transform" />
								</span>
						</Button>
						<Button
							onClick={() => navigate("/artist/signup")}
							variant="outline"
							size="lg"
								className="group backdrop-blur-md bg-white/10 border-2 border-purple-400/30 text-purple-300 hover:bg-purple-400/20 hover:text-white text-xl px-12 py-8 rounded-2xl transition-all duration-300 hover:scale-105"
						>
								<Mic className="mr-3 size-6" />
							Join as Artist
						</Button>
					</div>
					</motion.div>
				</div>
			</div>

			{/* Footer */}
			<footer className="relative border-t border-purple-400/20 px-6 md:px-8 py-12 bg-gradient-to-r from-slate-900/50 via-purple-900/20 to-slate-900/50">
				<div className="max-w-6xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
						<div className="space-y-6">
							<div className="flex items-center space-x-3">
								<div className="relative">
									<div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
										<Headphones className="size-6 text-white" />
									</div>
									<div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl blur opacity-30 animate-pulse"></div>
								</div>
								<span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent text-glow-gradient">AURA</span>
							</div>
							<p className="text-gray-400 text-sm leading-relaxed">
								Your ultimate social music platform for discovering, streaming, and sharing music with friends. 
								Experience the future of music streaming.
							</p>
						</div>
						
						<div className="space-y-6">
							<h3 className="text-white font-semibold text-lg">For Listeners</h3>
							<ul className="space-y-3 text-sm text-gray-400">
								<li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">Discover Music</a></li>
								<li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">Create Playlists</a></li>
								<li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">Follow Friends</a></li>
								<li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">Premium Features</a></li>
							</ul>
						</div>
						
						<div className="space-y-6">
							<h3 className="text-white font-semibold text-lg">For Artists</h3>
							<ul className="space-y-3 text-sm text-gray-400">
								<li><a href="/sign-up" className="hover:text-purple-400 transition-colors duration-300">Join As Artist</a></li>
								<li><a href="#" className="hover:text-purple-400 transition-colors duration-300">Get Verified</a></li>
								<li><a href="#" className="hover:text-purple-400 transition-colors duration-300">Upload Music</a></li>
								<li><a href="#" className="hover:text-purple-400 transition-colors duration-300">Analytics</a></li>
							</ul>
						</div>
						
						<div className="space-y-6">
							<h3 className="text-white font-semibold text-lg">Support</h3>
							<ul className="space-y-3 text-sm text-gray-400">
								<li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Help Center</a></li>
								<li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Contact Us</a></li>
								<li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Privacy Policy</a></li>
								<li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Terms of Service</a></li>
							</ul>
						</div>
					</div>
					
					<Separator className="bg-gradient-to-r from-transparent via-purple-400/30 to-transparent mb-8" />
					
					<div className="flex flex-col md:flex-row items-center justify-between">
						<div className="text-gray-400 text-sm mb-4 md:mb-0">
							© 2025 Aura. All rights reserved.
						</div>
						<div className="flex items-center space-x-4 text-sm text-gray-400">
							<span>Made with <span className="text-pink-400">❤️</span> for music lovers</span>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default LandingPage;
