"use client";

import React from "react";
import "../globals.css";



export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <div className="flex flex-col h-screen overflow-hidden bg-background text-text">
          {children}
        </div>
  );
}