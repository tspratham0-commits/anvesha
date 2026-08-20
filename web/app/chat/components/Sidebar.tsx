type SidebarProps = {
  chats?: string[];
};

export default function Sidebar({
  chats = [],
}: SidebarProps) {
  return (
    <aside className="w-72 border-r border-neutral-800 bg-neutral-950 h-screen flex flex-col">

      <div className="p-6 border-b border-neutral-800">

        <h1 className="text-2xl font-bold text-white">
          🧠 Anvesha
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          AI Startup Consultant
        </p>

        <button className="mt-6 w-full rounded-xl bg-green-500 py-3 font-bold text-black hover:bg-green-400 transition">
          + New Chat
        </button>

      </div>

      <div className="flex-1 overflow-y-auto p-4">

        <p className="mb-4 text-sm font-semibold text-gray-500">
          Recent Chats
        </p>

        {chats.length === 0 ? (
          <p className="text-sm text-gray-600">
            No chats yet.
          </p>
        ) : (
          <div className="space-y-2">
            {chats.map((chat, index) => (
              <button
                key={index}
                className="w-full rounded-lg bg-neutral-900 px-4 py-3 text-left text-gray-300 hover:bg-neutral-800"
              >
                {chat}
              </button>
            ))}
          </div>
        )}

      </div>

      <div className="border-t border-neutral-800 p-4 text-xs text-gray-500">
        Anvesha AI v2
      </div>

    </aside>
  );
}