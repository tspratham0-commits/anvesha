"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleDiscover = () => {
    console.log("Discover clicked:", query);

    if (!query.trim()) {
      alert("Please enter something to discover.");
      return;
    }

    router.push(`/discover?query=${encodeURIComponent(query)}`);
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-6xl font-bold">ANVESHA</h1>

      <p className="mt-4 text-xl text-gray-400">
        Accelerate Human Discovery
      </p>

      <div className="mt-10 flex gap-3 w-full max-w-xl">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to discover?"
          className="flex-1 rounded-xl border border-gray-700 bg-neutral-900 px-5 py-4"
        />

        <button
          onClick={handleDiscover}
          className="rounded-xl bg-white text-black px-6 py-4 font-semibold hover:bg-gray-200"
        >
          Discover
        </button>
      </div>
    </main>
  );
}