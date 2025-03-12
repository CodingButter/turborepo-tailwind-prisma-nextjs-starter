import React, { useState } from "react";
import { useEmotes } from "../hooks/useEmotes";
import { formatMessageWithEmotes } from "../utils/emoteUtils";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  emoteSize?: "1x" | "2x" | "3x";
  className?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  emoteSize = "1x",
  className,
}) => {
  const { emotes } = useEmotes();
  const [preview, setPreview] = useState<string>("");

  /**
   * Updates the preview of the formatted message with emotes.
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    onChange(text);
    setPreview(formatMessageWithEmotes(text, emotes));
  };

  /**
   * Handles message submission.
   */
  const handleSend = () => {
    if (value.trim()) {
      onSend();
      onChange(""); // Clear input after sending
      setPreview("");
    }
  };

  return (
    <div className={`message-input ${className || ""}`}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder="Type a message..."
        className="message-input-field"
      />
      <button onClick={handleSend} className="message-input-send">Send</button>
      {preview && (
        <div className="message-preview" dangerouslySetInnerHTML={{ __html: preview }} />
      )}
    </div>
  );
};
