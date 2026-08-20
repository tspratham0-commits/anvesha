"use client";

import MainLayout from "@/components/layout/MainLayout";
import Header from "@/components/layout/Header";

import HistorySidebar from "./components/HistorySidebar";
import ChatWindow from "./components/ChatWindow";

import { useChat } from "./hooks/useChat";

export default function ChatPage() {
  const {
    messages,
    query,
    loading,

    documentText,
    documentName,

    webSearch,

    setQuery,
    setDocumentText,
    setDocumentName,
    setWebSearch,

    sendMessage,
    regenerateResponse,
    stopGenerating,

    loadChat,
    newChat,
  } = useChat();

  return (
    <MainLayout>
      <div className="flex h-screen min-h-0">
        <HistorySidebar
          onSelectChat={loadChat}
          onNewChat={newChat}
        />

        <div className="flex min-w-0 flex-1 flex-col p-6">
          <div className="shrink-0">
            <Header
              title="💬 AI Chat"
              subtitle="Talk with Anvesha like ChatGPT"
            />
          </div>

          <div className="min-h-0 flex-1 pt-4">
            <ChatWindow
              messages={messages}
              query={query}
              loading={loading}
              onChange={setQuery}
              onSend={sendMessage}
              onStop={stopGenerating}
              onRegenerate={regenerateResponse}
              documentText={documentText}
              documentName={documentName}
              setDocumentText={setDocumentText}
              setDocumentName={setDocumentName}
              webSearch={webSearch}
              setWebSearch={setWebSearch}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
