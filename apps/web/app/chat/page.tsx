"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import ChatInterface with no SSR to avoid hydration issues
const ChatInterface = dynamic(
  () => import("../../components/ChatInterface").then((mod) => mod.default),
  { ssr: false }
);

export default function ChatPage() {

  return (
    <div className="h-full w-full">
      <ChatInterface />
    </div>
  );
}