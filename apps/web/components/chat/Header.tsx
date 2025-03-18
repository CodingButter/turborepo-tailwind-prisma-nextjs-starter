'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, ChevronsLeft, Hash, Home } from 'lucide-react';
import { ThemeSwitcher } from '@repo/theme';
import { Channel } from '@repo/tirc';

interface HeaderProps {
	isConnected: boolean;
	connectionStatus: string;
	currentChannel: Channel;
	onToggleSidebar: () => void;
	sidebarCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({
	isConnected,
	connectionStatus,
	currentChannel,
	onToggleSidebar,
	sidebarCollapsed,
}) => {
	const AppHeader = () => (
		<header className="bg-background-secondary p-4 shadow-lg border-b border-primary/20">
			<div className="container mx-auto flex justify-between items-center">
				<div className="flex items-center space-x-4">
					<button
						onClick={onToggleSidebar}
						className="text-text-secondary hover:text-primary transition-colors p-1 rounded-md hover:bg-background-tertiary"
						aria-label={
							sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
						}
						title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
					>
						{sidebarCollapsed ? <Menu size={24} /> : <ChevronsLeft size={24} />}
					</button>
					<Link
						href="/"
						className="text-text hover:text-primary transition-colors"
						title="Home"
					>
						<Home size={24} />
					</Link>
					<h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
						Twitch Chat Client
					</h1>
				</div>
				<div className="flex items-center space-x-4">
					<ThemeSwitcher />
					<div className="flex items-center space-x-2">
						<div
							className={`w-3 h-3 rounded-full ${
								isConnected ? 'bg-success animate-pulse' : 'bg-error'
							}`}
						></div>
						<span className="text-sm font-medium">{connectionStatus}</span>
					</div>
				</div>
			</div>
		</header>
	);

	const ChannelHeader = () => {
		if (!currentChannel) return null;

		return (
			<div className="bg-background-secondary p-4 border-b border-border flex items-center">
				<Hash size={18} className="text-primary mr-2" />
				<h2 className="text-xl font-bold">{currentChannel.substring(1)}</h2>
			</div>
		);
	};

	return (
		<>
			<AppHeader />
			{currentChannel && <ChannelHeader />}
		</>
	);
};

export default Header;
