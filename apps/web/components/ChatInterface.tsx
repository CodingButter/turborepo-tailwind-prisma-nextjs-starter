'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTIRC, useEmotes, Channel, IMessage } from '@repo/tirc';
import { useStorage } from '@repo/storage';
import { useSearchParams } from 'next/navigation';
import { useSidebarState } from '../hooks/useSidebarState';

// Import components correctly
import * as MessageListModule from './chat/MessageList';
import ChannelList from './chat/ChannelList';
import Header from './chat/Header';
import ChatInputWithCommandPopup from './chat/ChatInputWithCommandPopup';
import UserMessagesPopup from './chat/UserMessagesPopup';

// Extract the component from the module if it's not a default export
const MessageList = MessageListModule.default || MessageListModule.MessageList;

const ChatInterface: React.FC = () => {
	const {
		client,
		sendMessage: tircSendMessage,
		messages: tircMessages,
	} = useTIRC();
	const { isLoading: emoteLoading } = useEmotes();
	const [sidebarCollapsed, setSidebarCollapsed] = useSidebarState(false);
	const searchParams = useSearchParams();

	const [messages, setMessages] = useState<IMessage[]>([]);
	const [channels, setChannels] = useState<Channel[]>([]);
	const [currentChannel, setCurrentChannel] = useStorage<Channel>(null);
	const [messageInput, setMessageInput] = useState('');
	const [isConnected, setIsConnected] = useState(false);
	const [newChannelInput, setNewChannelInput] = useState('');
	const [connectionStatus, setConnectionStatus] = useState('Connecting...');
	const [initialChannelsJoined, setInitialChannelsJoined] = useState(false);
	const [joinAttemptInProgress, setJoinAttemptInProgress] = useState(false);

	// User popup state
	const [selectedUser, setSelectedUser] = useStorage<string | null>(null);
	const [showUserPopup, setShowUserPopup] = useState(false);
	const initialJoinTimeoutRef = useRef<number | null>(null);

	// Generate a unique ID for messages
	const generateUniqueId = () => {
		return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	};

	// Force a string to be a valid channel - ensures we never return undefined
	const asChannel = useCallback((value: string): Channel => {
		if (!value || typeof value !== 'string') {
			return '#default' as Channel; // Fallback to a default channel
		}
		if (!value.startsWith('#')) {
			return `#${value}` as Channel;
		}
		return value as Channel;
	}, []);

	// Join a channel safely - correctly handle Channel typing
	const joinChannelSafely = useCallback(
		async (channelToJoin: Channel) => {
			if (!client || !isConnected || !channelToJoin) {
				console.log(
					'Cannot join channel - client not available or not connected or invalid channel',
				);
				return false;
			}

			try {
				console.log(`Safely joining channel: ${channelToJoin}`);
				// Use a constant Channel value for the default channel
				const defaultChannel: Channel = '#default';
				// Send a raw JOIN command directly to the server
				client.sendMessage(defaultChannel, `/JOIN ${channelToJoin}`);
				console.log(`Join command sent for: ${channelToJoin}`);
				return true;
			} catch (error) {
				console.error(`Error joining channel ${channelToJoin}:`, error);
				return false;
			}
		},
		[client, isConnected],
	);

	// Process TIRC messages into our app format
	useEffect(() => {
		if (!tircMessages || tircMessages.length === 0) return;

		// Get the most recent message with proper null checking
		const latestMessage = tircMessages[tircMessages.length - 1];
		if (!latestMessage) return;

		console.log('New IRC message:', latestMessage);

		// Convert to our app's message format
		const newMessage: IMessage = {
			id: latestMessage.id || generateUniqueId(),
			channel: latestMessage.channel,
			username: latestMessage.username.toLowerCase(),
			displayName: latestMessage.username,
			content: latestMessage.rawMessage,
			color: '#FFFFFF', // Default color
			timestamp: new Date(),
			isCurrentUser: false,
			badges: '',
			profileImage: null,
			tags: latestMessage.tags || {}, // Use tags if available
			rawMessage: latestMessage.rawMessage,
			formattedMessage:
				latestMessage.formattedMessage || latestMessage.rawMessage,
			emotes: [],
		};

		setMessages((prev) => [...prev, newMessage]);
	}, [tircMessages]);

	// Handle initial connection setup
	useEffect(() => {
		if (!client) {
			console.log('No IRC client available');
			return;
		}

		console.log('IRC client is available, setting up event handlers');

		// Set initial connection state
		setConnectionStatus('Connected');
		setIsConnected(true);

		const handleConnect = () => {
			console.log('CONNECTED event received');
			setIsConnected(true);
			setConnectionStatus('Connected');
		};

		const handleDisconnect = () => {
			console.log('DISCONNECTED event received');
			setIsConnected(false);
			setConnectionStatus('Disconnected');
			setInitialChannelsJoined(false);
			setJoinAttemptInProgress(false);
		};

		const handleError = (data: { message: string }) => {
			console.log('ERROR event received:', data);
			setConnectionStatus(`Error: ${data.message}`);
		};

		// Updated event handler to handle Channel type correctly
		const handleUserJoined = (data: { user: string; channel: Channel }) => {
			if (!data.channel) return;

			console.log('USER JOINED event received:', data);
			// Add system message for user join
			const joinMessage: IMessage = {
				id: generateUniqueId(),
				channel: data.channel,
				username: 'system',
				displayName: 'System',
				content: `${data.user} joined the channel`,
				color: 'var(--color-success)',
				timestamp: new Date(),
				isCurrentUser: false,
				tags: {},
				rawMessage: `${data.user} joined the channel`,
				formattedMessage: `${data.user} joined the channel`,
				emotes: [],
			};
			setMessages((prev) => [...prev, joinMessage]);
		};

		// Updated event handler to handle Channel type correctly
		const handleUserLeft = (data: { user: string; channel: Channel }) => {
			if (!data.channel) return;

			console.log('USER LEFT event received:', data);
			// Add system message for user leave
			const leftMessage: IMessage = {
				id: generateUniqueId(),
				channel: data.channel,
				username: 'system',
				displayName: 'System',
				content: `${data.user} left the channel`,
				color: 'var(--color-error)',
				timestamp: new Date(),
				isCurrentUser: false,
				tags: {},
				rawMessage: `${data.user} left the channel`,
				formattedMessage: `${data.user} left the channel`,
				emotes: [],
			};
			setMessages((prev) => [...prev, leftMessage]);
		};

		// Register event handlers properly
		client.on('connected', handleConnect);
		client.on('disconnected', handleDisconnect);
		client.on('error', handleError);
		client.on('userJoined', handleUserJoined);
		client.on('userLeft', handleUserLeft);

		return () => {
			client.off('connected', handleConnect);
			client.off('disconnected', handleDisconnect);
			client.off('error', handleError);
			client.off('userJoined', handleUserJoined);
			client.off('userLeft', handleUserLeft);
		};
	}, [client]);

	// Handle channel join/leave events with improved stability
	const handleChannelJoined = useCallback(
		(channelName: Channel) => {
			if (!channelName) {
				console.log('Invalid channel name received:', channelName);
				return;
			}

			console.log(`JOINED event received for channel: ${channelName}`);

			// Ensure it's a properly formatted channel
			const validChannel: Channel = channelName;

			console.log(`Chat interface noticed channel joined: ${validChannel}`);

			setChannels((prev) => {
				console.log('Current channels:', prev);
				// Normalize channel names for comparison
				const normalizedExisting = prev.map((ch) =>
					ch ? ch.toLowerCase() : '',
				);
				const normalizedNew = validChannel ? validChannel.toLowerCase() : '';

				if (!normalizedExisting.includes(normalizedNew)) {
					console.log(`Adding new channel ${validChannel} to list`);
					const newChannels = [...prev, validChannel];

					// If this is the first channel, set it as current
					if (newChannels.length === 1 || !currentChannel) {
						console.log(`Setting current channel to: ${validChannel}`);
						setCurrentChannel(validChannel);
					}

					return newChannels;
				}

				console.log(`Channel ${validChannel} already in list, not adding`);
				return prev;
			});

			// Add system message about joining
			const joinMessage: IMessage = {
				id: generateUniqueId(),
				channel: validChannel,
				username: 'system',
				displayName: 'System',
				content: `Joined channel ${validChannel}`,
				color: 'var(--color-success)',
				timestamp: new Date(),
				isCurrentUser: false,
				tags: {},
				rawMessage: `Joined channel ${validChannel}`,
				formattedMessage: `Joined channel ${validChannel}`,
				emotes: [],
			};
			setMessages((prev) => [...prev, joinMessage]);
		},
		[currentChannel, setCurrentChannel],
	);

	const handleChannelLeft = useCallback(
		(channelName: Channel) => {
			if (!channelName) {
				console.log('Invalid channel name received:', channelName);
				return;
			}

			console.log(`LEFT event received for channel: ${channelName}`);

			// Ensure it's a properly formatted channel
			const validChannel: Channel = channelName;

			// Make a copy of channels for use in the callback
			const currentChannelsCopy = [...channels];

			setChannels((prev) => {
				const updatedChannels = prev.filter((ch) => {
					if (!ch || !validChannel) return true;
					return ch.toLowerCase() !== validChannel.toLowerCase();
				});
				console.log(
					`Removing channel ${validChannel}, updated list:`,
					updatedChannels,
				);
				// Save to localStorage
				return updatedChannels;
			});

			// Update current channel if needed - fixed to never return undefined
			setCurrentChannel((current: Channel) => {
				// If the current channel is the one being left, find another
				if (
					current &&
					validChannel &&
					current.toLowerCase() === validChannel.toLowerCase()
				) {
					// Get channels that will remain
					const remainingChannels = currentChannelsCopy.filter((ch) => {
						if (!ch || !validChannel) return true;
						return ch.toLowerCase() !== validChannel.toLowerCase();
					});
					// Return either the first remaining channel or null (never undefined)
					return remainingChannels.length > 0 ? remainingChannels[0] : null;
				}
				// Otherwise, keep the current channel
				return current;
			});

			// Add system message about leaving
			const leaveMessage: IMessage = {
				id: generateUniqueId(),
				channel: validChannel,
				username: 'system',
				displayName: 'System',
				content: `Left channel ${validChannel}`,
				color: 'var(--color-error)',
				timestamp: new Date(),
				isCurrentUser: false,
				tags: {},
				rawMessage: `Left channel ${validChannel}`,
				formattedMessage: `Left channel ${validChannel}`,
				emotes: [],
			};
			setMessages((prev) => [...prev, leaveMessage]);
		},
		[channels, setCurrentChannel],
	);

	// Register channel event handlers separately with stable references
	useEffect(() => {
		if (!client) return;

		console.log('Setting up channel event handlers');

		// Register event handlers with stable function references
		client.on('joined', handleChannelJoined);
		client.on('left', handleChannelLeft);

		return () => {
			client.off('joined', handleChannelJoined);
			client.off('left', handleChannelLeft);
		};
	}, [client, handleChannelJoined, handleChannelLeft]);

	// Handle initial joining of channels from URL parameters or localStorage
	useEffect(() => {
		if (
			!client ||
			!isConnected ||
			initialChannelsJoined ||
			joinAttemptInProgress
		)
			return;

		const joinChannelsFromUrl = async () => {
			console.log('Attempting to join initial channels');
			setJoinAttemptInProgress(true);

			// Get channels from URL
			const channelsParam = searchParams.get('channels');
			let channelsToJoin: Channel[] = [];

			if (channelsParam) {
				console.log('Found channels in URL:', channelsParam);
				// Split by comma and format as channels
				channelsToJoin = channelsParam
					.split(',')
					.map((channel) => channel.trim())
					.filter((channel) => channel.length > 0)
					.map(asChannel);

				console.log('Parsed channels to join:', channelsToJoin);
			}

			// If no channels in URL, try to get from localStorage
			if (channelsToJoin.length === 0) {
				try {
					const savedChannels = localStorage.getItem('twitchJoinedChannels');
					if (savedChannels) {
						const parsed = JSON.parse(savedChannels);
						if (Array.isArray(parsed)) {
							channelsToJoin = parsed
								.filter((ch): ch is string => typeof ch === 'string')
								.map(asChannel);
						}
						console.log('Using channels from localStorage:', channelsToJoin);
					}
				} catch (error) {
					console.error('Failed to load channels from localStorage:', error);
				}
			}

			// Join each channel with a delay
			if (channelsToJoin.length > 0) {
				console.log('Will join these channels:', channelsToJoin);
				setInitialChannelsJoined(true); // Mark as joined immediately to prevent duplicate attempts

				for (let i = 0; i < channelsToJoin.length; i++) {
					// IIFE to capture the current index
					((index) => {
						setTimeout(async () => {
							// Safe to access - we've checked array.length > 0
							const channel = channelsToJoin[index];
							if (channel) {
								const joined = await joinChannelSafely(channel);
								if (joined) setChannels((prev) => [...prev, channel]);
							}

							// If this is the last channel, clear the flag
							if (index === channelsToJoin.length - 1) {
								setJoinAttemptInProgress(false);
							}
						}, index * 2000); // 2 second delay between each join
					})(i);
				}
			} else {
				setJoinAttemptInProgress(false);
			}
		};

		// Wait a bit after connection before joining channels to ensure WebSocket is fully ready
		initialJoinTimeoutRef.current = window.setTimeout(() => {
			joinChannelsFromUrl();
		}, 3000); // Allow 3 seconds for connection to fully establish

		return () => {
			if (initialJoinTimeoutRef.current) {
				clearTimeout(initialJoinTimeoutRef.current);
				initialJoinTimeoutRef.current = null;
			}
		};
	}, [
		client,
		isConnected,
		initialChannelsJoined,
		searchParams,
		joinChannelSafely,
		joinAttemptInProgress,
		asChannel,
	]);

	// Send message function
	const sendMessage = (content: string = messageInput) => {
		// Early return if no content, no channel, or no client
		if (!content.trim() || !currentChannel || !client) return;

		console.log(`Attempting to send message to ${currentChannel}: ${content}`);

		try {
			// Make sure we have a valid channel
			tircSendMessage(currentChannel, content);

			// Add self message to the UI
			const username = client.getNick?.() || 'butterbot';

			const selfMessage: IMessage = {
				id: generateUniqueId(),
				channel: currentChannel,
				username: username,
				displayName: username,
				content: content,
				color: 'var(--color-chat-self)',
				timestamp: new Date(),
				isCurrentUser: true,
				tags: {},
				rawMessage: content,
				formattedMessage: content,
				emotes: [],
			};
			setMessages((prev) => [...prev, selfMessage]);

			// Clear input field
			setMessageInput('');
		} catch (error) {
			console.error('Error sending message:', error);

			// Add error message to chat
			const errorMessage: IMessage = {
				id: generateUniqueId(),
				channel: currentChannel,
				username: 'system',
				displayName: 'System',
				content: `Failed to send message: ${
					error instanceof Error ? error.message : String(error)
				}`,
				color: 'var(--color-error)',
				timestamp: new Date(),
				isCurrentUser: false,
				tags: {},
				rawMessage: `Failed to send message: ${
					error instanceof Error ? error.message : String(error)
				}`,
				formattedMessage: `Failed to send message: ${
					error instanceof Error ? error.message : String(error)
				}`,
				emotes: [],
			};
			setMessages((prev) => [...prev, errorMessage]);
		}
	};
	// Replace the existing joinChannel function in apps/web/components/ChatInterface.tsx
	// with this implementation

	const joinChannel = async () => {
		// Early return if requirements not met
		if (!newChannelInput.trim() || !isConnected || !client) return;

		// Create a properly typed channel
		const channelToJoin: Channel = asChannel(newChannelInput);

		try {
			// Use the validated channel and await the result
			const joined = await joinChannelSafely(channelToJoin);

			// If joined successfully, update the channels list directly
			if (joined) {
				console.log(`Directly updating channels list with: ${channelToJoin}`);
				setChannels((prev) => {
					// Avoid duplicates
					if (
						!prev.some(
							(ch) =>
								ch &&
								channelToJoin &&
								ch.toLowerCase() === channelToJoin.toLowerCase(),
						)
					) {
						return [...prev, channelToJoin];
					}
					return prev;
				});

				// If this is the first channel, set it as current
				if (!currentChannel) {
					setCurrentChannel(channelToJoin);
				}

				// Add system message about joining
				const joinMessage: IMessage = {
					id: generateUniqueId(),
					channel: channelToJoin,
					username: 'system',
					displayName: 'System',
					content: `Joined channel ${channelToJoin}`,
					color: 'var(--color-success)',
					timestamp: new Date(),
					isCurrentUser: false,
					tags: {},
					rawMessage: `Joined channel ${channelToJoin}`,
					formattedMessage: `Joined channel ${channelToJoin}`,
					emotes: [],
				};
				setMessages((prev) => [...prev, joinMessage]);
			}

			setNewChannelInput('');
		} catch (error) {
			console.error('Failed to join channel:', error);

			// Use a literal to ensure we have a valid Channel for system messages
			const systemChannel: Channel = currentChannel || '#system';
			const errorMessage: IMessage = {
				id: generateUniqueId(),
				channel: systemChannel,
				username: 'system',
				displayName: 'System',
				content: `Failed to join channel: ${
					error instanceof Error ? error.message : String(error)
				}`,
				color: 'var(--color-error)',
				timestamp: new Date(),
				isCurrentUser: false,
				tags: {},
				rawMessage: `Failed to join channel: ${
					error instanceof Error ? error.message : String(error)
				}`,
				formattedMessage: `Failed to join channel: ${
					error instanceof Error ? error.message : String(error)
				}`,
				emotes: [],
			};
			setMessages((prev) => [...prev, errorMessage]);
		}
	};

	// Leave a specific channel
	const leaveChannel = (channelToLeave: Channel) => {
		if (!isConnected || !client || !channelToLeave) return;

		try {
			// Correct way to send a PART command - use a constant for the default Channel
			const defaultChannel: Channel = '#default';
			console.log(`Leaving channel: ${channelToLeave}`);
			client.sendMessage(defaultChannel, `/PART ${channelToLeave}`);
		} catch (error) {
			console.error('Failed to leave channel:', error);
		}
	};

	// Move a channel up in the list
	const moveChannelUp = (channelToMove: Channel) => {
		if (!channelToMove) return;

		setChannels((prevChannels) => {
			const index = prevChannels.findIndex(
				(channel) =>
					channel &&
					channelToMove &&
					channel.toLowerCase() === channelToMove.toLowerCase(),
			);

			if (index <= 0) return prevChannels; // Already at the top or not found

			const newChannels = [...prevChannels];
			// Swap the channel with the one above it
			[newChannels[index - 1], newChannels[index]] = [
				newChannels[index],
				newChannels[index - 1],
			];

			return newChannels;
		});
	};

	// Move a channel down in the list
	const moveChannelDown = (channelToMove: Channel) => {
		if (!channelToMove) return;

		setChannels((prevChannels) => {
			const index = prevChannels.findIndex(
				(channel) =>
					channel &&
					channelToMove &&
					channel.toLowerCase() === channelToMove.toLowerCase(),
			);

			if (index === -1 || index === prevChannels.length - 1) {
				return prevChannels; // Not found or already at the bottom
			}

			const newChannels = [...prevChannels];
			// Swap the channel with the one below it
			[newChannels[index], newChannels[index + 1]] = [
				newChannels[index + 1],
				newChannels[index],
			];

			return newChannels;
		});
	};

	// Handle username click to show user popup
	const handleUsernameClick = (username: string) => {
		setSelectedUser(username);
		setShowUserPopup(true);
	};

	// Close user popup
	const handleCloseUserPopup = () => {
		setShowUserPopup(false);
		setSelectedUser(null);
	};

	// Format messages for UserMessagesPopup
	const formatMessagesForUserPopup = (username: string) => {
		if (!username) return [];

		return messages
			.filter((msg) => msg.username === username && msg.username !== 'system')
			.map((msg) => ({
				id: msg.id,
				nickname: msg.username,
				content: msg.content,
				timestamp: msg.timestamp,
				isAction: msg.content.startsWith('\u0001ACTION'), // Check for /me messages
				tags: msg.tags, // Include tags for emote parsing
			}));
	};

	// Show loading state if client is not yet available
	if (!client) {
		return (
			<div className="flex items-center justify-center h-screen bg-background text-text">
				<div className="text-center p-8 bg-surface rounded-lg">
					<div className="animate-spin h-12 w-12 border-4 border-t-transparent border-primary rounded-full mx-auto mb-4"></div>
					<p className="text-xl">Connecting to IRC server...</p>
					<p className="text-sm text-text-secondary mt-2">
						This may take a moment
					</p>
				</div>
			</div>
		);
	}

	// Show status message if joining channels is in progress
	const statusMessage = joinAttemptInProgress
		? 'Joining channels... This may take a moment'
		: emoteLoading
			? 'Loading emotes...'
			: connectionStatus;

	// Toggle sidebar
	const toggleSidebar = () => {
		setSidebarCollapsed(!sidebarCollapsed);
	};

	console.log('Current channels:', channels);
	console.log('Current selected channel:', currentChannel);

	return (
		<div className="flex flex-col h-screen bg-background text-text">
			{/* App header with connection status */}
			<Header
				isConnected={isConnected}
				connectionStatus={statusMessage}
				currentChannel={currentChannel}
				onToggleSidebar={toggleSidebar}
				sidebarCollapsed={sidebarCollapsed}
			/>

			<div className="flex flex-1 overflow-hidden">
				{/* Sidebar with channels */}
				<ChannelList
					channels={channels}
					currentChannel={currentChannel}
					setCurrentChannel={setCurrentChannel}
					newChannelInput={newChannelInput}
					setNewChannelInput={setNewChannelInput}
					joinChannel={joinChannel}
					leaveChannel={leaveChannel}
					moveChannelUp={moveChannelUp}
					moveChannelDown={moveChannelDown}
					isConnected={isConnected}
					collapsed={sidebarCollapsed}
				/>

				{/* Main chat area */}
				<main className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
					{/* Messages area */}
					<MessageList
						messages={messages}
						currentChannel={currentChannel}
						onUsernameClick={handleUsernameClick}
					/>

					{/* Message input with command popup */}
					<ChatInputWithCommandPopup
						channelName={currentChannel}
						onSendMessage={sendMessage}
					/>
				</main>
			</div>

			{/* User messages popup */}
			{showUserPopup && selectedUser && (
				<UserMessagesPopup
					username={selectedUser}
					messages={formatMessagesForUserPopup(selectedUser)}
					onClose={handleCloseUserPopup}
				/>
			)}
		</div>
	);
};

export default ChatInterface;
