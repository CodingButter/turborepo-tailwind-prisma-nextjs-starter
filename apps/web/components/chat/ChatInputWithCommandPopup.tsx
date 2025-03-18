// src/components/chat/ChatInputWithCommandPopup.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Command, Smile } from 'lucide-react';
import EmotesPicker from './EmotesPicker';
import { Channel } from '@repo/tirc'; // Import the Channel type from tirc

// Extend Window interface to include ircClient for debug purposes
interface CustomWindow extends Window {
	ircClient?: {
		sendMessage: (channel: Channel, message: string) => void;
	};
}

// Use the extended window type
declare const window: CustomWindow;

interface ChatInputWithCommandPopupProps {
	channelName: Channel | null; // Use Channel type from tirc
	onSendMessage?: (message: string) => void;
}

// Common Twitch chat commands
const TWITCH_COMMANDS = [
	{ command: '/me', description: 'Send an action message' },
	{ command: '/clear', description: 'Clear chat (mod/broadcaster only)' },
	{ command: '/color', description: 'Change your username color' },
	{ command: '/w', description: 'Whisper to another user' },
	{ command: '/ban', description: 'Ban a user (mod/broadcaster only)' },
	{ command: '/unban', description: 'Unban a user (mod/broadcaster only)' },
	{ command: '/timeout', description: 'Timeout a user (mod/broadcaster only)' },
	{ command: '/mods', description: 'Display the moderators of the channel' },
	{ command: '/vips', description: 'Display the VIPs of the channel' },
	{ command: '/help', description: 'Display a list of commands' },
];

const ChatInputWithCommandPopup: React.FC<ChatInputWithCommandPopupProps> = ({
	channelName,
	onSendMessage,
}) => {
	const [message, setMessage] = useState('');
	const [showCommands, setShowCommands] = useState(false);
	const [showEmotes, setShowEmotes] = useState(false);
	const [filteredCommands, setFilteredCommands] = useState(TWITCH_COMMANDS);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const commandsRef = useRef<HTMLDivElement>(null);

	// Filter commands based on input
	useEffect(() => {
		if (message.startsWith('/')) {
			const search = message.toLowerCase();
			setFilteredCommands(
				TWITCH_COMMANDS.filter((cmd) =>
					cmd.command.toLowerCase().includes(search),
				),
			);
			setShowCommands(true);
		} else {
			setShowCommands(false);
		}
	}, [message]);

	// Close commands dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				commandsRef.current &&
				!commandsRef.current.contains(event.target as Node) &&
				inputRef.current &&
				!inputRef.current.contains(event.target as Node)
			) {
				setShowCommands(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (message.trim() && !isSubmitting) {
			setIsSubmitting(true);

			try {
				// Call the parent handler if provided, otherwise use IRC client directly
				if (onSendMessage) {
					onSendMessage(message);
				} else if (channelName) {
					// Use the global IRC client from window (added by the debug utility)
					const client = window.ircClient;
					if (client) {
						try {
							client.sendMessage(channelName, message);
							console.log(`Sent message to ${channelName}: ${message}`);
						} catch (error) {
							console.error(`Failed to send message to ${channelName}:`, error);
						}
					}
				}

				// Clear input immediately after sending
				setMessage('');
			} catch (error) {
				console.error('Error sending message:', error);
			} finally {
				// Reset submitting state after a short delay to prevent double-sends
				setTimeout(() => {
					setIsSubmitting(false);
				}, 500);
			}
		}
	};

	const selectCommand = (command: string) => {
		setMessage(command + ' ');
		setShowCommands(false);
		inputRef.current?.focus();
	};

	const handleEmoteSelect = (emoteCode: string) => {
		// Add the emote to the message, with a space if needed
		const newMessage =
			message.endsWith(' ') || message === ''
				? message + emoteCode + ' '
				: message + ' ' + emoteCode + ' ';

		setMessage(newMessage);
		inputRef.current?.focus();
	};

	const toggleEmotesPicker = (e: React.MouseEvent) => {
		// Prevent defaults to avoid form submission
		e.preventDefault();
		setShowEmotes((prev) => !prev);
		// If closing, focus back on the input
		if (showEmotes) {
			setTimeout(() => inputRef.current?.focus(), 0);
		}
	};

	return (
		<div className="p-4 bg-surface border-t border-border relative">
			<form onSubmit={handleSubmit} className="flex space-x-2">
				<div className="relative flex-1">
					<div className="relative flex items-center">
						<input
							ref={inputRef}
							type="text"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							placeholder={`Message ${channelName || 'chat'}`}
							className="w-full pl-4 pr-12 py-3 bg-background-tertiary rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
							disabled={isSubmitting}
						/>

						{/* Emote button */}
						<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
							<button
								type="button"
								onClick={toggleEmotesPicker}
								className={`p-2 rounded-full hover:bg-background ${
									showEmotes
										? 'text-primary bg-background'
										: 'text-text-secondary'
								}`}
								aria-label="Insert Emote"
								disabled={isSubmitting}
							>
								<Smile size={20} />
							</button>
						</div>
					</div>

					{/* Command suggestions popup */}
					{showCommands && filteredCommands.length > 0 && (
						<div
							ref={commandsRef}
							className="absolute bottom-full left-0 w-full bg-surface border border-border rounded-md shadow-lg mb-1 max-h-60 overflow-y-auto z-10"
						>
							{filteredCommands.map((cmd) => (
								<div
									key={cmd.command}
									onClick={() => selectCommand(cmd.command)}
									className="px-3 py-2 hover:bg-background-tertiary cursor-pointer flex items-start"
								>
									<div className="flex-shrink-0 mr-2 mt-1">
										<Command size={14} className="text-primary" />
									</div>
									<div>
										<div className="font-mono text-primary">{cmd.command}</div>
										<div className="text-xs text-text-secondary">
											{cmd.description}
										</div>
									</div>
								</div>
							))}
						</div>
					)}

					{/* Emotes picker popup */}
					{showEmotes && (
						<EmotesPicker
							onClose={() => setShowEmotes(false)}
							onSelectEmote={handleEmoteSelect}
							channelName={channelName}
						/>
					)}
				</div>
				<button
					type="submit"
					disabled={!message.trim() || isSubmitting}
					className="px-6 py-3 bg-primary hover:bg-primary-dark rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
				>
					{isSubmitting ? (
						<span className="inline-block w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></span>
					) : (
						<Send size={18} className="mr-2" />
					)}
					Send
				</button>
			</form>
		</div>
	);
};

export default ChatInputWithCommandPopup;
