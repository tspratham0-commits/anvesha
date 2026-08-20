"use client";

import { useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  loading: boolean;

  setDocumentText: (text: string) => void;
  setDocumentName: (name: string) => void;

  webSearch: boolean;
  setWebSearch: (value: boolean) => void;
};

export default function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  loading,
  setDocumentText,
  setDocumentName,
  webSearch,
  setWebSearch,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  async function uploadFile(file: File) {
    const formData = new FormData();

    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      alert("Upload failed.");
      return;
    }

    const data = await res.json();

    setDocumentName(data.filename);
    setDocumentText(data.text ?? "");

    console.log(data);
  }

  return (
    <div className="border-t border-neutral-800 bg-black pt-4">
      {selectedFile && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-green-400">
          <span>📄 {selectedFile.name}</span>

          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              setDocumentName("");
              setDocumentText("");
            }}
            className="text-neutral-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* FILE UPLOAD */}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.doc,.docx,.csv"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];

            if (!file) return;

            setSelectedFile(file);

            await uploadFile(file);

            e.target.value = "";
          }}
        />

        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-4 text-white transition hover:bg-neutral-800"
          title="Upload document"
        >
          📎
        </button>

        {/* WEB SEARCH */}

        <button
          type="button"
          onClick={() =>
            setWebSearch(!webSearch)
          }
          className={`rounded-xl border px-4 py-4 text-sm font-medium transition ${
            webSearch
              ? "border-blue-500 bg-blue-500/20 text-blue-400"
              : "border-neutral-700 bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white"
          }`}
          title="Toggle web search"
        >
          🌐

          <span className="ml-2 hidden sm:inline">
            {webSearch
              ? "Search ON"
              : "Web Search"}
          </span>
        </button>

        {/* INPUT */}

        <input
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {
              e.preventDefault();

              if (loading) {
                onStop();
              } else {
                onSend();
              }
            }
          }}
          placeholder={
            webSearch
              ? "Search the web with Anvesha..."
              : "Ask Anvesha anything..."
          }
          disabled={loading}
          className="min-w-0 flex-1 rounded-xl border border-neutral-700 bg-neutral-900 px-5 py-4 text-white outline-none transition focus:border-green-500 disabled:opacity-60"
        />

        {/* SEND / STOP */}

        {loading ? (
          <button
            type="button"
            onClick={onStop}
            className="rounded-xl bg-red-600 px-8 py-4 font-bold text-white transition hover:bg-red-500"
          >
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={onSend}
            className="rounded-xl bg-green-500 px-8 py-4 font-bold text-black transition hover:bg-green-400"
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}