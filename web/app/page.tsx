import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";

const quickActions = [
  {
    href: "/chat",
    icon: "💬",
    title: "AI Chat",
    description: "Talk with Anvesha about ideas, coding, research, and more.",
  },
  {
    href: "/discover",
    icon: "💡",
    title: "Startup Discovery",
    description: "Research a startup opportunity using live web intelligence.",
  },
  {
    href: "/projects",
    icon: "📁",
    title: "Projects",
    description: "Organize ideas, tasks, notes, memories, and research.",
  },
  {
    href: "/reports",
    icon: "📄",
    title: "Reports",
    description: "Open your saved startup and research reports.",
  },
  {
    href: "/settings",
    icon: "⚙️",
    title: "Settings",
    description: "Configure your Anvesha workspace.",
  },
];

const popularSearches = [
  "AI Fitness Coach",
  "AI Startup for Farmers",
  "Healthcare AI",
  "AI Tutor",
  "Drone Delivery",
  "Legal AI Assistant",
];

export default function Home() {
  return (
    <MainLayout>
      <main className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black text-white">
        <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 lg:px-12">
          {/* HERO */}
          <section className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-8 md:p-12">
            <div className="max-w-4xl">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-green-400">
                Your AI Intelligence System
              </p>

              <h2 className="mt-4 text-5xl font-extrabold tracking-tight md:text-6xl">
                Welcome to Anvesha.
              </h2>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-400">
                Chat, research, discover opportunities, manage projects, and
                turn ideas into structured action from one workspace.
              </p>

              <form
                action="/chat"
                method="GET"
                className="mt-8 flex flex-col gap-3 md:flex-row"
              >
                <input
                  name="query"
                  placeholder="Ask Anvesha anything..."
                  className="flex-1 rounded-xl border border-neutral-700 bg-black px-5 py-4 text-lg outline-none transition focus:border-green-500"
                />

                <button
                  type="submit"
                  className="rounded-xl bg-green-500 px-8 py-4 font-bold text-black transition hover:bg-green-400"
                >
                  Ask Anvesha
                </button>
              </form>
            </div>
          </section>

          {/* QUICK ACTIONS */}
          <section className="mt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                  Quick Actions
                </p>
                <h3 className="mt-2 text-3xl font-bold">
                  What do you want to do?
                </h3>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition hover:border-green-500 hover:bg-neutral-900/80"
                >
                  <div className="text-4xl">{action.icon}</div>

                  <h4 className="mt-5 text-xl font-bold group-hover:text-green-400">
                    {action.title}
                  </h4>

                  <p className="mt-2 leading-7 text-neutral-400">
                    {action.description}
                  </p>

                  <p className="mt-5 text-sm font-semibold text-green-400">
                    Open →
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* DISCOVER */}
          <section className="mt-10 rounded-3xl border border-neutral-800 bg-neutral-900 p-8 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-green-400">
                  Startup Intelligence
                </p>

                <h3 className="mt-3 text-3xl font-bold md:text-4xl">
                  Discover your next opportunity.
                </h3>

                <p className="mt-4 max-w-2xl leading-7 text-neutral-400">
                  Anvesha can search the live web, analyze the market, identify
                  customer problems, and produce evidence-backed startup reports.
                </p>

                <Link
                  href="/discover"
                  className="mt-7 inline-flex rounded-xl bg-green-500 px-6 py-3 font-bold text-black transition hover:bg-green-400"
                >
                  Open Startup Discovery
                </Link>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-black p-6">
                <div className="grid grid-cols-2 gap-4">
                  <StatCard title="AI Engine" value="Ollama" />
                  <StatCard title="Web Research" value="Tavily" />
                  <StatCard title="Reports" value="∞" />
                  <StatCard title="Workspace" value="Projects" />
                </div>
              </div>
            </div>
          </section>

          {/* POPULAR SEARCHES */}
          <section className="mt-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                Explore
              </p>

              <h3 className="mt-2 text-3xl font-bold">
                Popular startup searches
              </h3>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {popularSearches.map((title) => (
                <Link
                  key={title}
                  href={`/discover?query=${encodeURIComponent(title)}`}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 transition hover:border-green-500"
                >
                  <p className="font-semibold">{title}</p>
                  <p className="mt-2 text-sm text-neutral-500">
                    Generate a research-backed report →
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* SYSTEM CAPABILITIES */}
          <section className="mt-10 pb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
              Anvesha capabilities
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <FeatureCard
                emoji="🧠"
                title="AI Assistant"
                text="Conversation, reasoning, coding, and project support."
              />

              <FeatureCard
                emoji="🌐"
                title="Live Intelligence"
                text="Use current web research when fresh information matters."
              />

              <FeatureCard
                emoji="🗂️"
                title="Long-Term Workspace"
                text="Projects, reports, notes, tasks, memories, and research runs."
              />
            </div>
          </section>
        </div>
      </main>
    </MainLayout>
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
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
      <p className="text-sm text-neutral-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-green-400">{value}</p>
    </div>
  );
}

function FeatureCard({
  emoji,
  title,
  text,
}: {
  emoji: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-7">
      <div className="text-4xl">{emoji}</div>

      <h4 className="mt-5 text-xl font-bold">{title}</h4>

      <p className="mt-2 leading-7 text-neutral-400">{text}</p>
    </div>
  );
}
