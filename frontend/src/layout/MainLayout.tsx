import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./components/LeftSidebar";
import FriendsActivity from "./components/FriendsActivity";
import AudioPlayer from "./components/AudioPlayer";
import { PlaybackControls } from "./components/PlaybackControls";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useSidebar } from "@/contexts/SidebarContext";
import { motion, AnimatePresence } from "framer-motion";

const MainLayout = () => {
	const [isMobile, setIsMobile] = useState(false);
	const { 
		isLeftSidebarCollapsed, 
		isRightSidebarCollapsed,
		setIsLeftSidebarCollapsed,
		setIsRightSidebarCollapsed
	} = useSidebar();
	const { syncWithSettings } = usePlayerStore();
	const { loadSettings } = useSettingsStore();

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Initialize settings and sync player state on mount
	useEffect(() => {
		const initializeApp = async () => {
			try {
				await loadSettings();
				syncWithSettings();
			} catch (error) {
				console.error('Failed to initialize app settings:', error);
			}
		};
		
		initializeApp();
	}, [loadSettings, syncWithSettings]);

	// Mobile layout
	if (isMobile) {
		return (
			<motion.div 
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.3 }}
				className="h-screen bg-black text-white flex flex-col"
			>
				<AudioPlayer />
				<motion.div 
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.4, delay: 0.1 }}
					className="flex-1 flex flex-col overflow-hidden"
				>
					<Outlet />
				</motion.div>
				<PlaybackControls />
			</motion.div>
		);
	}

	// Desktop layout with resizable panels
	return (
		<motion.div 
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
			className="h-screen bg-black text-white flex flex-col relative"
		>
			<AudioPlayer />
			<ResizablePanelGroup direction="horizontal" className="flex-1 w-full">
				{/* Left Sidebar */}
				<AnimatePresence>
					{!isLeftSidebarCollapsed && (
						<ResizablePanel
							defaultSize={20}
							minSize={15}
							maxSize={25}
							collapsible
							collapsedSize={0}
							onCollapse={() => setIsLeftSidebarCollapsed(true)}
							onExpand={() => setIsLeftSidebarCollapsed(false)}
							className="transition-all duration-300 ease-in-out"
						>
							<motion.div
								initial={{ x: -300, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								exit={{ x: -300, opacity: 0 }}
								transition={{ duration: 0.3, ease: "easeInOut" }}
								className="h-full"
							>
								<LeftSidebar />
							</motion.div>
						</ResizablePanel>
					)}
				</AnimatePresence>
				{!isLeftSidebarCollapsed && (
					<ResizableHandle className="group w-2 relative">
						<div className="w-full h-full bg-transparent group-hover:bg-green-500/50 transition-colors duration-300 data-[resize-handle-state=drag]:bg-green-500" />
						<button
							onClick={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
							className="absolute top-1/2 left-1/2 z-50 p-1 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-all duration-300 shadow-lg border border-zinc-600 -translate-x-1/2 -translate-y-1/2"
							title={isLeftSidebarCollapsed ? "Show Library" : "Hide Library"}
						>
							{isLeftSidebarCollapsed ? (
								<ChevronRight className="w-4 h-4" />
							) : (
								<ChevronLeft className="w-4 h-4" />
							)}
						</button>
					</ResizableHandle>
				)}

				{/* Main Content */}
				<ResizablePanel defaultSize={60} minSize={30}>
					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.4, delay: 0.2 }}
						className="h-full"
					>
						<Outlet />
					</motion.div>
				</ResizablePanel>
				<AnimatePresence>
					{!isRightSidebarCollapsed && (
						<ResizableHandle className="group w-2 relative">
							<div className="w-full h-full bg-transparent group-hover:bg-green-500/50 transition-colors duration-300 data-[resize-handle-state=drag]:bg-green-500" />
							<button
								onClick={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
								className="absolute top-1/2 left-1/2 z-50 p-1 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-all duration-300 shadow-lg border border-zinc-600 -translate-x-1/2 -translate-y-1/2"
								title={
									isRightSidebarCollapsed
										? "Show Friends Activity"
										: "Hide Friends Activity"
								}
							>
								{isRightSidebarCollapsed ? (
									<ChevronLeft className="w-4 h-4" />
								) : (
									<ChevronRight className="w-4 h-4" />
								)}
							</button>
						</ResizableHandle>
					)}
				</AnimatePresence>
				{/* Right Sidebar */}
				<AnimatePresence>
					{!isRightSidebarCollapsed && (
						<ResizablePanel
							defaultSize={20}
							minSize={15}
							maxSize={25}
							collapsible
							collapsedSize={0}
							onCollapse={() => setIsRightSidebarCollapsed(true)}
							onExpand={() => setIsRightSidebarCollapsed(false)}
							className="transition-all duration-300 ease-in-out"
						>
							<motion.div
								initial={{ x: 300, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								exit={{ x: 300, opacity: 0 }}
								transition={{ duration: 0.3, ease: "easeInOut" }}
								className="h-full"
							>
								<FriendsActivity />
							</motion.div>
						</ResizablePanel>
					)}
				</AnimatePresence>
			</ResizablePanelGroup>
			<PlaybackControls />
		</motion.div>
	);
};

export default MainLayout;
