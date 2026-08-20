"use client";

import { useCallback, useEffect, useState } from "react";

type Chat = {
  id: number;
  title: string;
  createdAt: string;
};

type Props = {
  onSelectChat: (id: number) => void;
  onNewChat: () => void;
};

export default function HistorySidebar({
  onSelectChat,
  onNewChat,
}: Props) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const loadChats = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/history", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to load chats.");
      }

      const data = await res.json();

      setChats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  return (
    <aside className="flex w-72 flex-col border-r border-neutral-800 bg-neutral-950 p-4">
      <button
        onClick={() => {
          onNewChat();
          loadChats();
        }}
        className="mb-4 w-full rounded-lg bg-green-600 px-4 py-3 font-semibold transition hover:bg-green-500"
      >
        + New Chat
      </button>

      <h2 className="mb-4 text-xl font-bold">
        💬 Chat History
      </h2>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center text-neutral-500">
            Loading chats...
          </div>
        ) : chats.length === 0 ? (
          <div className="py-8 text-center text-neutral-500">
            No chats yet.
          </div>
        ) : (
          chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className="w-full rounded-lg bg-neutral-900 p-3 text-left transition hover:bg-neutral-800"
            >
              <div className="truncate font-medium">
                {chat.title}
              </div>

              <div className="mt-1 text-xs text-neutral-500">
                {new Date(chat.createdAt).toLocaleString()}
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}