"use client";

import { useState } from "react";
import MarkdownMessage from "./MarkdownMessage";

type Props = {
  role: "user" | "assistant";
  content: string;
};

export default function MessageBubble({
  role,
  content,
}: Props) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(content);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div
      className={`mb-6 flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-3xl rounded-2xl px-5 py-4 ${
          isUser
            ? "bg-green-500 text-black"
            : "border border-neutral-800 bg-neutral-900 text-white"
        }`}
      >
        {!isUser && (
          <div className="mb-3 flex justify-end">
            <button
              onClick={copyToClipboard}
              className="rounded-lg border border-neutral-700 px-3 py-1 text-xs transition hover:bg-neutral-800"
            >
              {copied ? "✓ Copied!" : "📋 Copy"}
            </button>
          </div>
        )}

        <MarkdownMessage content={content} />
      </div>
    </div>
  );
}