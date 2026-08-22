"use client";

import { useRef, useState } from "react";

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export function useChat() {
  const [messages, setMessages] =
    useState<Message[]>([]);

  const [query, setQuery] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [chatId, setChatId] =
    useState<number | null>(null);

  const [documentText, setDocumentText] =
    useState("");

  const [documentName, setDocumentName] =
    useState("");

  const [webSearch, setWebSearch] =
    useState(false);

  const abortController =
    useRef<AbortController | null>(null);

  function newChat() {
    setMessages([]);
    setQuery("");
    setChatId(null);
    setDocumentText("");
    setDocumentName("");
    setWebSearch(false);
  }

  async function loadChat(id: number) {
    try {
      const res = await fetch(
        `/api/messages?chatId=${id}`
      );

      if (!res.ok) {
        throw new Error(
          "Failed to load chat"
        );
      }

      const data = await res.json();

      setChatId(id);
      setMessages(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function createChat() {
    if (chatId) {
      return chatId;
    }

    const res = await fetch(
      "/api/history",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          title: "New Chat",
        }),
      }
    );

    if (!res.ok) {
      throw new Error(
        "Failed to create chat."
      );
    }

    const chat = await res.json();

    setChatId(chat.id);

    return chat.id as number;
  }

  async function saveMessage(
    id: number,
    role: Message["role"],
    content: string
  ) {
    const res = await fetch(
      "/api/messages",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          chatId: id,
          role,
          content,
        }),
      }
    );

    if (!res.ok) {
      throw new Error(
        "Failed to save message."
      );
    }

    return res.json();
  }

  async function renameChat(
    id: number,
    title: string
  ) {
    const res = await fetch(
      "/api/history",
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          id,
          title,
        }),
      }
    );

    if (!res.ok) {
      throw new Error(
        "Failed to rename chat."
      );
    }

    return res.json();
  }

  async function generateResponse(
    currentChatId: number,
    conversation: Message[]
  ) {
    abortController.current =
      new AbortController();

    const res = await fetch(
      "/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        signal:
          abortController.current.signal,
        body: JSON.stringify({
          chatId: currentChatId,
          messages: conversation,
          document: {
            name: documentName,
            text: documentText,
          },
          webSearch,
        }),
      }
    );

    if (!res.ok || !res.body) {
      throw new Error(
        "Failed to connect to chat API."
      );
    }

    const reader =
      res.body.getReader();

    const decoder =
      new TextDecoder();

    let assistantReply = "";

    while (true) {
      const {
        done,
        value,
      } = await reader.read();

      if (done) {
        break;
      }

      const chunk =
        decoder.decode(value);

      const lines = chunk
        .split("\n")
        .filter(
          (line) => line.trim()
        );

      for (const line of lines) {
        try {
          const json =
            JSON.parse(line);

          if (json.response) {
            assistantReply +=
              json.response;

            setMessages([
              ...conversation,
              {
                role: "assistant",
                content:
                  assistantReply,
              },
            ]);
          }
        } catch {
          // Ignore incomplete JSON chunks
        }
      }
    }

  }

  async function sendMessage() {
    if (
      !query.trim() ||
      loading
    ) {
      return;
    }

    try {
      setLoading(true);

      const currentChatId =
        await createChat();

      const userMessage: Message = {
        role: "user",
        content: query.trim(),
      };

      const conversation = [
        ...messages,
        userMessage,
      ];

      setMessages([
        ...conversation,
        {
          role: "assistant",
          content: "",
        },
      ]);

      await saveMessage(
        currentChatId,
        "user",
        query.trim()
      );

      if (messages.length === 0) {
        const title =
          query.length > 40
            ? query.slice(0, 40) + "..."
            : query;

        await renameChat(
          currentChatId,
          title
        );
      }

      setQuery("");

      await generateResponse(
        currentChatId,
        conversation
      );
    } catch (error: any) {
      if (
        error.name !==
        "AbortError"
      ) {
        console.error(error);
      }
    } finally {
      abortController.current =
        null;

      setLoading(false);
    }
  }

  async function regenerateResponse() {
    if (
      loading ||
      messages.length === 0
    ) {
      return;
    }

    const lastAssistantIndex =
      messages
        .map(
          (message) =>
            message.role
        )
        .lastIndexOf(
          "assistant"
        );

    const previousMessages =
      lastAssistantIndex >= 0
        ? messages.slice(
            0,
            lastAssistantIndex
          )
        : messages;

    const lastUserMessage =
      [...previousMessages]
        .reverse()
        .find(
          (message) =>
            message.role ===
            "user"
        );

    if (!lastUserMessage) {
      return;
    }

    try {
      setLoading(true);

      const currentChatId =
        await createChat();

      setMessages([
        ...previousMessages,
        {
          role: "assistant",
          content: "",
        },
      ]);

      await generateResponse(
        currentChatId,
        previousMessages
      );
    } catch (error: any) {
      if (
        error.name !==
        "AbortError"
      ) {
        console.error(error);
      }
    } finally {
      abortController.current =
        null;

      setLoading(false);
    }
  }

  function stopGenerating() {
    abortController.current?.abort();

    abortController.current =
      null;

    setLoading(false);
  }

  return {
    messages,
    query,
    loading,
    chatId,

    documentText,
    documentName,

    webSearch,

    setDocumentText,
    setDocumentName,
    setWebSearch,

    setMessages,
    setQuery,
    setLoading,
    setChatId,

    newChat,
    loadChat,
    createChat,
    saveMessage,
    renameChat,
    sendMessage,
    regenerateResponse,
    stopGenerating,
  };
}