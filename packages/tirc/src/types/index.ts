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
  
  export interface TIRCEvents {
    connected: Record<string, never>;
    disconnected: Record<string, never>;
    error: ErrorEvent;
    userJoined: UserJoinedEvent;
    userLeft: UserLeftEvent;
    messageReceived: TIRCMessage;
    joined: string;
    left: string;
  }
  
  // Type-safe client interface
  export interface TIRCClient {
    on<K extends keyof TIRCEvents>(event: K, callback: (data: TIRCEvents[K]) => void): void;
    off<K extends keyof TIRCEvents>(event: K, callback: (data: TIRCEvents[K]) => void): void;
    sendMessage(channel: `#${string}`, message: string): void;
    getNick(): string;
  }