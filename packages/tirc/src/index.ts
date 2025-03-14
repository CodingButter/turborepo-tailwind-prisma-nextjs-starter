// Context Providers
export { TIRCClientProvider } from "./context/TIRCClientProvider";
export { EmoteProvider } from "./context/EmoteProvider";

// Hooks
export { useTIRC } from "./hooks/useTIRC";
export { useEmotes } from "./hooks/useEmotes";

// Components
export { Message } from "./components/Message";
export { MessageInput } from "./components/MessageInput";

// Utility Functions (expanded with new exports)
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

export type { ITIRCClientConfig } from "./lib/TIRCClient";
export type { IMessage } from "./hooks/useTIRC";
export type { 
  IEmote,
  IBTTVEmote,
  IFFZEmote,
  ITwitchEmote
} from "./utils/emoteUtils";