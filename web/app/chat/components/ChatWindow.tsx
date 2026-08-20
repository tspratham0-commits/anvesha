"use client";

import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";

import { Message } from "../hooks/useChat";

type Props = {
  messages: Message[];
  query: string;
  loading: boolean;

  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  onRegenerate: () => void;

  documentText: string;
  documentName: string;

  setDocumentText: (text: string) => void;
  setDocumentName: (name: string) => void;

  webSearch: boolean;
  setWebSearch: (value: boolean) => void;
};

export default function ChatWindow({
  messages,
  query,
  loading,
  onChange,
  onSend,
  onStop,
  onRegenerate,

  documentText,
  documentName,

  setDocumentText,
  setDocumentName,

  webSearch,
  setWebSearch,
}: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* MESSAGE AREA */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="mt-16 text-center">
            <h2 className="text-4xl font-bold">
              👋 Welcome to Anvesha
            </h2>

            <p className="mt-4 text-neutral-400">
              Ask anything about AI, coding, startups,
              business or research.
            </p>
          </div>
        ) : (
          <>
            <MessageList
              messages={messages.filter(
                (m) => m.role !== "system"
              )}
              onRegenerate={onRegenerate}
              loading={loading}
            />

            {loading && <TypingIndicator />}
          </>
        )}
      </div>

      {/* CHAT INPUT — ALWAYS VISIBLE */}
      <div className="shrink-0 pt-4">
        <ChatInput
          value={query}
          onChange={onChange}
          onSend={onSend}
          onStop={onStop}
          loading={loading}
          setDocumentText={setDocumentText}
          setDocumentName={setDocumentName}
          webSearch={webSearch}
          setWebSearch={setWebSearch}
        />
      </div>
    </div>
  );
}
