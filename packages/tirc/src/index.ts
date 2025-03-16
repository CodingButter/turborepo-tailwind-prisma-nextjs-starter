// packages/tirc/src/index.ts

// Context Providers
export { TIRCClientProvider } from "./context/TIRCClientProvider";
export { EmoteProvider } from "./context/EmoteProvider";
export { TIRCProvider } from "./context";

// Hooks
export { useTIRC } from "./hooks/useTIRC";
export { useEmotes } from "./hooks/useEmotes";

// Components
export { Message } from "./components/Message";
export { MessageInput } from "./components/MessageInput";

// Utility Functions
export { 
  fetchBTTVGlobalEmotes, 
  fetchBTTVChannelEmotes,
  fetchFFZGlobalEmotes, 
  fetchFFZChannelEmotes,
  fetchTwitchEmotes,
  formatMessageWithEmotes,
  extractEmotesFromMessage,
  parseEmotes,
  getTwitchEmoteUrl,
  splitMessageWithEmotes
} from "./utils/emoteUtils";

// Types 
export type { ITIRCClientConfig } from "./lib/TIRCClient";
export type { IMessage } from "./hooks/useTIRC";
export type { 
  IEmote,
  IBTTVEmote,
  IFFZEmote,
  ITwitchEmote,
  EmotePosition,
  EmoteInfo,
  MessagePart
} from "./utils/emoteUtils";

// Re-export types from typings directory
export * from "../typings";