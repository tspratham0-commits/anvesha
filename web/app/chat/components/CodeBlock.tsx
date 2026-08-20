"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

type Props = {
  language: string;
  value: string;
};

export default function CodeBlock({
  language,
  value,
}: Props) {
  async function copyCode() {
    await navigator.clipboard.writeText(value);
  }

  return (
    <div className="relative my-4">
      <button
        onClick={copyCode}
        className="absolute right-3 top-3 rounded bg-neutral-800 px-3 py-1 text-xs hover:bg-neutral-700"
      >
        Copy
      </button>

      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          borderRadius: "12px",
          padding: "20px",
          fontSize: "14px",
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}