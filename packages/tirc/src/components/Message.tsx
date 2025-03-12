import React from "react";
import { IMessage } from "../context/TIRCClientProvider";

/**
 * Props for the Message component.
 */
interface MessageProps {
  message: IMessage;
  emoteSize?: "1x" | "2x" | "3x"; // Allow emote size customization
  className?: string;
}

export const Message: React.FC<MessageProps> = ({ message, emoteSize = "1x", className }) => {
  /**
   * Replaces emote placeholders with properly sized `<img>` tags.
   */
  const formatMessageWithEmoteSize = (formattedMessage: string) => {
    return formattedMessage.replace(
      /<img src="([^"]+)" class="message-emote" data-name="([^"]+)" \/>/g,
      `<img src="$1" class="message-emote" data-name="$2" style="width: ${getSize(emoteSize)}px; height: ${getSize(emoteSize)}px;" />`
    );
  };

  /**
   * Maps the emote size option to actual pixel values.
   */
  const getSize = (size: "1x" | "2x" | "3x") => {
    return size === "1x" ? 28 : size === "2x" ? 56 : 112;
  };

  return (
    <div className={`message ${className || ""}`}>
      <strong>{message.user}:</strong>{" "}
      <span dangerouslySetInnerHTML={{ __html: formatMessageWithEmoteSize(message.formattedMessage) }} />
    </div>
  );
};
