import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white">

      <div className="max-w-7xl mx-auto px-8 py-12">

        {/* Header */}

        <div className="text-center">

          <h1 className="text-6xl font-extrabold">
            🧠 ANVESHA AI
          </h1>

          <p className="mt-4 text-xl text-gray-400">
            Discover AI Startup Opportunities using Live Web Research +
            Local AI
          </p>

        </div>

        {/* Search */}

        <div className="mt-12 max-w-3xl mx-auto">

          <form
            action="/discover"
            method="GET"
            className="flex gap-4"
          >

            <input
              name="query"
              placeholder="Search startup ideas..."
              className="flex-1 rounded-xl bg-neutral-800 border border-neutral-700 px-6 py-5 text-lg outline-none focus:border-green-500"
            />

            <button
              className="rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold px-8"
            >
              Discover
            </button>

          </form>

        </div>

        {/* Stats */}

        <div className="grid md:grid-cols-4 gap-6 mt-16">

          <StatCard
            title="Reports"
            value="∞"
          />

          <StatCard
            title="AI Engine"
            value="Ollama"
          />

          <StatCard
            title="Research"
            value="Tavily"
          />

          <StatCard
            title="Cost"
            value="$0"
          />

        </div>

        {/* Recent Searches */}

        <div className="mt-16">

          <h2 className="text-3xl font-bold">
            Popular Searches
          </h2>

          <div className="grid md:grid-cols-2 gap-5 mt-6">

            <SearchCard
              title="AI Fitness Coach"
            />

            <SearchCard
              title="AI Startup for Farmers"
            />

            <SearchCard
              title="Drone Delivery"
            />

            <SearchCard
              title="AI Tutor"
            />

            <SearchCard
              title="Healthcare AI"
            />

            <SearchCard
              title="Legal AI Assistant"
            />

          </div>

        </div>

        {/* Features */}

        <div className="mt-20">

          <h2 className="text-3xl font-bold">
            Why Anvesha?
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mt-8">

            <Feature
              emoji="🌐"
              title="Live Research"
              text="Searches the latest web using Tavily."
            />

            <Feature
              emoji="🤖"
              title="Local AI"
              text="Powered completely by Ollama."
            />

            <Feature
              emoji="📊"
              title="Business Reports"
              text="Generates investor-ready startup reports."
            />

          </div>

        </div>

      </div>

    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-700 p-6">

      <p className="text-gray-400">
        {title}
      </p>

      <h2 className="mt-3 text-4xl font-bold text-green-400">
        {value}
      </h2>

    </div>
  );
}

function SearchCard({
  title,
}: {
  title: string;
}) {
  return (
    <Link
      href={`/discover?query=${encodeURIComponent(title)}`}
      className="rounded-2xl bg-neutral-900 border border-neutral-700 p-6 hover:border-green-500 transition block"
    >

      <h3 className="text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-gray-400">
        Generate complete AI startup report →
      </p>

    </Link>
  );
}

function Feature({
  emoji,
  title,
  text,
}: {
  emoji: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-700 p-8">

      <div className="text-5xl">
        {emoji}
      </div>

      <h3 className="mt-5 text-2xl font-bold">
        {title}
      </h3>

      <p className="mt-3 text-gray-400 leading-7">
        {text}
      </p>

    </div>
  );
}