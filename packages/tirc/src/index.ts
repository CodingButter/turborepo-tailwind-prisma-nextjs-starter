// Context Providers
export { TIRCClientProvider } from "./context/TIRCClientProvider";
export { EmoteProvider } from "./context/EmoteProvider";

// Hooks
export { useTIRC } from "./hooks/useTIRC";
export { useEmotes } from "./hooks/useEmotes";

// Components
export { Message } from "./components/Message";
export { MessageInput } from "./components/MessageInput";

// Utility Functions (optional, for manual usage)
export { fetchBTTVGlobalEmotes, fetchFFZGlobalEmotes, fetchTwitchEmotes } from "./utils/emoteUtils";

export type { ITIRCClientConfig } from "./lib/TIRCClient";
export type { IMessage } from "./hooks/useTIRC";
export type { IEmote } from "../typings/index";