"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "🏠",
  },
  {
    name: "AI Chat",
    href: "/chat",
    icon: "💬",
  },
  {
    name: "Discover",
    href: "/discover",
    icon: "💡",
  },
  {
    name: "Projects",
    href: "/projects",
    icon: "📁",
  },
  {
    name: "Reports",
    href: "/reports",
    icon: "📄",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: "⚙️",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950">

      <div className="border-b border-neutral-800 p-6">
        <h1 className="text-3xl font-bold text-white">
          🧠 Anvesha
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          Your AI Startup Co-Founder
        </p>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {menu.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                active
                  ? "bg-green-500 font-bold text-black"
                  : "text-gray-300 hover:bg-neutral-800"
              }`}
            >
              <span className="text-xl">
                {item.icon}
              </span>

              <span>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-neutral-800 p-4 text-xs text-gray-500">
        Anvesha AI v2
      </div>

    </aside>
  );
}
