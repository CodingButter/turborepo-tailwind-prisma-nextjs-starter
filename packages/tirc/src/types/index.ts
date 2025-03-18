// Create this file at packages/tirc/src/types/index.ts

// Custom type augmentation for TIRC message
export interface TIRCMessage {
    id: string;
    user: string;
    channel: string;
    rawMessage: string;
    formattedMessage: string;
    tags?: Record<string, string>;
    emotes?: Array<{
      id: string;
      code: string;
      positions?: Array<{
        start: number;
        end: number;
      }>;
    }>;
  }
  
  // Export TIRC event types
  export interface UserJoinedEvent {
    channel: string;
    user: string;
  }
  
  export interface UserLeftEvent {
    channel: string;
    user: string;
  }
  
  export interface ErrorEvent {
    message: string;
  }
  
export type TIRCEvents = {
  messageReceived: { user: string; message: string; channel: Channel; tags?: Tags };
  userJoined: { user: string; channel: Channel };
  userLeft: { user: string; channel: Channel };
  error: { message: string };
  disconnected: { reason?: string };
  connected: { timestamp: number };
  joined: Channel;  // Using Channel type here
  left: Channel;    // Using Channel type here
};

  
  // Type-safe client interface
  export interface TIRCClient {
    on<K extends keyof TIRCEvents>(event: K, callback: (data: TIRCEvents[K]) => void): void;
    off<K extends keyof TIRCEvents>(event: K, callback: (data: TIRCEvents[K]) => void): void;
    sendMessage(channel: `#${string}`, message: string): void;
    getNick(): string;
  }
  // types/Message.ts
export type ChannelName = `#${string}`;
export type Channel = ChannelName | undefined | null;
export interface Tags {
  "badge-info"?: string
  badges?: string
  color?: string
  "display-name"?: string
  emotes?: string
  id?: string
  mod?: string
  subscriber?: string
  turbo?: string
  "user-id"?: string
  "user-type"?: string
  [key: string]: string | undefined
}

export interface IMessage  {
  id: string
  channel: Channel
  username: string
  displayName: string
  rawMessage: string
  formattedMessage: string  
  content: string
  color: string
  emotes: IEmote[]
  timestamp: Date
  isCurrentUser: boolean
  badges?: string
  profileImage?: string | null
  tags?: Tags
}



export interface IEmote {
    id: string;
    code: string;
    url_1x?: string;
    url_2x?: string;
    url_3x?: string;
    positions?: Array<{
      start: number;
      end: number;
    }>;
  }
  
  export interface IUseEmotesOptions {
    fetchGlobal?: boolean;
    fetchChannel?: boolean;
    fetchShared?: boolean;
    fetchTwitch?: boolean;
    provider?: string;
    providerId?: string;
  }
  
  export interface IEmoteContext {
    globalEmotes: IEmote[];
    channelEmotes: IEmote[];
    sharedEmotes: IEmote[];
    twitchEmotes: IEmote[];
    isLoading: boolean;
    fetchEmotes: (options: IUseEmotesOptions) => Promise<void>;
  }
  
/**
 * Defines the structure of an emote.
 */
export interface IEmote {
  id: string;
  name: string;
  urls: {
    "1x"?: string;
    "2x"?: string;
    "3x"?: string;
    "4x"?: string;
  };
}

export interface IBTTVEmote {
  id: string;
  code: string;
}

export interface IFFZEmote {
  id: number;
  name: string;
  urls: {
    "1": string;
    "2"?: string;
    "3"?: string;
    "4"?: string;
  };
}

export interface ITwitchEmote {
  id: string;
  name: string;
  images: {
    url_1x: string;
    url_2x?: string;
    url_3x?: string;
    url_4x?: string;
  };
}

export interface EmotePosition {
  start: number;
  end: number;
}

export interface EmoteInfo {
  id: string;
  code: string;
}

export type MessagePart = string | EmoteInfo;