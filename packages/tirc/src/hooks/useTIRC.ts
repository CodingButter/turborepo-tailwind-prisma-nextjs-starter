'use client';

import { useContext, createContext } from 'react';
import { TIRCClient } from '../lib/TIRCClient';
import { IMessage, Channel } from '../types';

/**
 * Defines the structure of a chat message.
 */

export interface TIRCContextType {
	client: TIRCClient | null;
	sendMessage: (channel: Channel, message: string) => void;
	messages: IMessage[];
	clientId: string;
	oauthToken?: string;
}

export const TIRCContext = createContext<TIRCContextType | null>(null);

export const useTIRC = () => {
	const context = useContext(TIRCContext);

	if (!context) {
		throw new Error('useTIRC must be used within a TIRCProvider');
	}

	return context; // Exposes { messages, sendMessage, clientId, client, oauthToken }
};
