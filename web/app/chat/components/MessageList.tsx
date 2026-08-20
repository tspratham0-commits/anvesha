"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Message } from "../hooks/useChat";

type Props = {
  messages: Message[];
  onRegenerate: () => void;
  loading: boolean;
};

export default function MessageList({
  messages,
  onRegenerate,
  loading,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function copyMessage(
    content: string,
    index: number
  ) {
    try {
      await navigator.clipboard.writeText(content);

      setCopiedIndex(index);

      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  }

  const lastAssistantIndex =
    messages
      .map((message) => message.role)
      .lastIndexOf("assistant");

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      {messages.map((message, index) => {
        const isUser = message.role === "user";

        const isLatestAssistant =
          message.role === "assistant" &&
          index === lastAssistantIndex;

        return (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${
              isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                isUser
                  ? "bg-green-500 text-black"
                  : "border border-neutral-800 bg-neutral-900 text-white"
              }`}
            >
              <div className="mb-3 text-xs font-semibold opacity-60">
                {isUser ? "You" : "Anvesha"}
              </div>

              <div
                className={`prose max-w-none text-[15px] leading-7 ${
                  isUser
                    ? "prose-p:text-black prose-headings:text-black prose-strong:text-black"
                    : "prose-invert"
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                >
                  {message.content}
                </ReactMarkdown>
              </div>

              {isLatestAssistant &&
                message.content && (
                  <div className="mt-4 flex gap-4 border-t border-neutral-800 pt-3">
                    <button
                      type="button"
                      onClick={() =>
                        copyMessage(
                          message.content,
                          index
                        )
                      }
                      className="text-sm text-neutral-400 transition hover:text-white"
                    >
                      {copiedIndex === index
                        ? "✓ Copied"
                        : "📋 Copy"}
                    </button>

                    {!loading && (
                      <button
                        type="button"
                        onClick={onRegenerate}
                        className="text-sm text-neutral-400 transition hover:text-white"
                      >
                        🔄 Regenerate
                      </button>
                    )}
                  </div>
                )}
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
