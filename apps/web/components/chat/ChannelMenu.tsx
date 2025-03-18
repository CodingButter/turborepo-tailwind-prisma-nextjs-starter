import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, ArrowUp, ArrowDown, LogOut } from 'lucide-react';

interface ChannelMenuProps {
	channel: `#${string}`;
	onLeave: (channel: `#${string}`) => void;
	onMoveUp: (channel: `#${string}`) => void;
	onMoveDown: (channel: `#${string}`) => void;
}

const ChannelMenu: React.FC<ChannelMenuProps> = ({
	channel,
	onLeave,
	onMoveUp,
	onMoveDown,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// Handle menu item clicks
	const handleMoveUp = (e: React.MouseEvent) => {
		e.stopPropagation();
		onMoveUp(channel);
		setIsOpen(false);
	};

	const handleMoveDown = (e: React.MouseEvent) => {
		e.stopPropagation();
		onMoveDown(channel);
		setIsOpen(false);
	};

	const handleLeave = (e: React.MouseEvent) => {
		e.stopPropagation();
		onLeave(channel);
		setIsOpen(false);
	};

	// Toggle menu
	const toggleMenu = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsOpen(!isOpen);
	};

	return (
		<div ref={menuRef} className="relative">
			<button
				onClick={toggleMenu}
				className="p-1 text-text-secondary hover:text-text rounded-full hover:bg-background-tertiary transition-colors"
				aria-label="Channel options"
			>
				<MoreVertical size={16} />
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-surface border border-border z-10">
					<div className="py-1">
						<button
							onClick={handleMoveUp}
							className="flex items-center w-full px-4 py-2 text-sm text-text-secondary hover:text-text hover:bg-background-tertiary"
						>
							<ArrowUp size={14} className="mr-2" />
							Move Up
						</button>
						<button
							onClick={handleMoveDown}
							className="flex items-center w-full px-4 py-2 text-sm text-text-secondary hover:text-text hover:bg-background-tertiary"
						>
							<ArrowDown size={14} className="mr-2" />
							Move Down
						</button>
						<div className="border-t border-border my-1"></div>
						<button
							onClick={handleLeave}
							className="flex items-center w-full px-4 py-2 text-sm text-error hover:bg-background-tertiary"
						>
							<LogOut size={14} className="mr-2" />
							Leave Channel
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default ChannelMenu;
