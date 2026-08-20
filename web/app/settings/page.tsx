export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-5xl font-bold">
          ⚙️ Settings
        </h1>

        <p className="mt-3 text-gray-400">
          Configure your AI assistant.
        </p>

        <div className="mt-10 space-y-6">

          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-8">

            <h2 className="text-2xl font-bold">
              AI Model
            </h2>

            <p className="mt-2 text-gray-400">
              Ollama (Local)
            </p>

          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-8">

            <h2 className="text-2xl font-bold">
              Theme
            </h2>

            <p className="mt-2 text-gray-400">
              Dark Mode
            </p>

          </div>

        </div>

      </div>
    </main>
  );
}