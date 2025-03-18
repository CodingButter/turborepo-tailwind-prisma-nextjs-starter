'use client';

import React from 'react';
import Image from 'next/image';

import {
	parseEmotes,
	getTwitchEmoteUrl,
	splitMessageWithEmotes,
	useEmotes,
	IMessage,
} from '@repo/tirc';

interface MessageItemProps {
	message: IMessage;
	onUsernameClick: (username: string) => void;
	showTimestamp?: boolean;
	highlightMentions?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
	message,
	onUsernameClick,
	showTimestamp = true,
	highlightMentions = false,
}) => {
	// Add useEmotes hook to access emotes
	const { getEmote } = useEmotes();

	// If it's a system message, render differently
	if (message.username === 'system') {
		return (
			<div className="text-text-tertiary text-sm">
				{showTimestamp && (
					<span className="mr-2 text-xs">
						{message.timestamp.toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit',
						})}
					</span>
				)}
				{message.content}
			</div>
		);
	}

	// Parse Twitch emotes from the tags
	const twEmotes = message.tags?.emotes
		? parseEmotes(message.tags.emotes, message.content)
		: [];

	// Create a memoization cache for this render cycle
	const emoteCache = new Map<string, React.ReactNode>();

	// Render message content with emotes
	const renderMessageContent = () => {
		// If there are Twitch emotes, process them
		if (twEmotes && twEmotes.length > 0) {
			// Split the message into parts (text and emotes)
			const messageParts = splitMessageWithEmotes(message.content, twEmotes);

			return (
				<p className="break-words flex flex-wrap items-center">
					{messageParts.map((part, index) => {
						if (typeof part === 'string') {
							// Process text part for third-party emotes
							const words = part.split(' ');

							return (
								<React.Fragment key={index}>
									{words.map((word, wordIndex) => {
										// Check if word is an emote
										const emote = getEmote?.(word);

										if (emote) {
											// It's an emote
											const cacheKey = `emote-${emote.id}-${word}`;

											if (!emoteCache.has(cacheKey)) {
												emoteCache.set(
													cacheKey,
													<span
														key={`${index}-${wordIndex}`}
														className="inline-block mx-1 align-middle relative w-7 h-7"
													>
														<Image
															src={emote.urls['1x'] || ''}
															alt={word}
															title={word}
															width={28}
															height={28}
															loading="lazy"
														/>
													</span>,
												);
											}

											return (
												<span key={`${index}-${wordIndex}`}>
													{emoteCache.get(cacheKey)}
												</span>
											);
										}

										// Regular word
										return wordIndex > 0 ? (
											<span key={`${index}-${wordIndex}`}> {word}</span>
										) : (
											<span key={`${index}-${wordIndex}`}>{word}</span>
										);
									})}
								</React.Fragment>
							);
						} else {
							// It's a Twitch emote
							const cacheKey = `tw-${part.id}-${part.code}`;

							if (!emoteCache.has(cacheKey)) {
								emoteCache.set(
									cacheKey,
									<span className="inline-block mx-1 align-middle relative w-7 h-7">
										<Image
											src={getTwitchEmoteUrl(part.id, '1.0')}
											alt={part.code}
											title={part.code}
											width={28}
											height={28}
											loading="lazy"
										/>
									</span>,
								);
							}

							return <span key={index}>{emoteCache.get(cacheKey)}</span>;
						}
					})}
				</p>
			);
		} else {
			// No Twitch emotes, check each word for third-party emotes
			const words = message.content.split(' ');

			return (
				<p className="break-words flex flex-wrap items-center">
					{words.map((word, index) => {
						// Check if word is an emote
						const emote = getEmote?.(word);

						if (emote) {
							// It's an emote
							return (
								<span
									key={index}
									className="inline-block mx-1 align-middle relative w-7 h-7"
								>
									<Image
										src={emote.urls['1x'] || ''}
										alt={word}
										title={word}
										width={28}
										height={28}
										loading="lazy"
									/>
								</span>
							);
						}

						// Regular word
						return index > 0 ? (
							<span key={index}> {word}</span>
						) : (
							<span key={index}>{word}</span>
						);
					})}
				</p>
			);
		}
	};

	return (
		<div
			className={`flex items-start space-x-2 p-4 rounded-md ${
				message.isCurrentUser ? 'bg-chat-self/10' : 'bg-background-secondary'
			} ${highlightMentions && message.content.includes('@') ? 'border-l-4 border-l-chat-mention' : ''}`}
		>
			{/* Profile Picture with Click Handler */}
			{message.profileImage ? (
				<div className="w-8 h-8 relative rounded-full overflow-hidden">
					<Image
						src={message.profileImage}
						alt={`${message.username || 'User'}'s profile`}
						fill
						sizes="32px"
						className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
						onClick={() => onUsernameClick(message.username)}
					/>
				</div>
			) : (
				<div
					className="w-8 h-8 rounded-full bg-background-tertiary flex items-center justify-center text-text-secondary cursor-pointer hover:opacity-80 transition-opacity"
					onClick={() => onUsernameClick(message.username)}
				>
					{message.username?.[0]?.toUpperCase() || '?'}
				</div>
			)}

			{/* Message Content */}
			<div className="flex-1">
				{/* Username */}
				<div className="flex items-center space-x-2">
					<span
						className="font-semibold cursor-pointer hover:text-primary"
						onClick={() => onUsernameClick(message.username)}
						style={{ color: message.color || 'inherit' }}
					>
						{message.displayName || message.username || 'Unknown User'}
					</span>
					{/* Timestamp */}
					{showTimestamp && (
						<span className="text-xs text-text-secondary">
							{message.timestamp.toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit',
							})}
						</span>
					)}
				</div>

				{/* Message Text */}
				{renderMessageContent()}
			</div>
		</div>
	);
};

export default MessageItem;
