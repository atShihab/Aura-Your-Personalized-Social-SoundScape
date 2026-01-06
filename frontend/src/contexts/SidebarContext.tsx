import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
	isLeftSidebarCollapsed: boolean;
	isRightSidebarCollapsed: boolean;
	toggleLeftSidebar: () => void;
	toggleRightSidebar: () => void;
	toggleBothSidebars: () => void;
	setIsLeftSidebarCollapsed: (collapsed: boolean) => void;
	setIsRightSidebarCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
	const context = useContext(SidebarContext);
	if (context === undefined) {
		throw new Error('useSidebar must be used within a SidebarProvider');
	}
	return context;
};

interface SidebarProviderProps {
	children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
	const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
	const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);

	const toggleLeftSidebar = () => {
		setIsLeftSidebarCollapsed(prev => !prev);
	};

	const toggleRightSidebar = () => {
		setIsRightSidebarCollapsed(prev => !prev);
	};

	const toggleBothSidebars = () => {
		setIsLeftSidebarCollapsed(prev => !prev);
		setIsRightSidebarCollapsed(prev => !prev);
	};

	const value: SidebarContextType = {
		isLeftSidebarCollapsed,
		isRightSidebarCollapsed,
		toggleLeftSidebar,
		toggleRightSidebar,
		toggleBothSidebars,
		setIsLeftSidebarCollapsed,
		setIsRightSidebarCollapsed,
	};

	return (
		<SidebarContext.Provider value={value}>
			{children}
		</SidebarContext.Provider>
	);
};

