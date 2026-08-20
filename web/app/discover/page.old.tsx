export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const params = await searchParams;
  const query = params.query ?? "";

  const response = await fetch("http://localhost:3000/api/discover", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });

  const data = await response.json();

  if (data.error) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-4xl">
          <h1 className="text-4xl font-bold text-red-500">
            AI Error
          </h1>

          <p className="mt-4">{data.error}</p>

          <pre className="mt-6 text-left whitespace-pre-wrap text-green-400">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </main>
    );
  }

  const toArray = (value: any): string[] => {
    if (Array.isArray(value)) return value;
    if (value == null) return [];
    if (typeof value === "string") return [value];
    return [JSON.stringify(value)];
  };

  const renderValue = (value: any) => {
    if (value == null) return "Not available";

    if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      return value;
    }

    return JSON.stringify(value, null, 2);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white">

      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="rounded-3xl border border-neutral-700 bg-neutral-900/80 p-10 shadow-2xl">

          <div className="flex flex-col md:flex-row justify-between gap-10">

            <div>

              <p className="uppercase tracking-widest text-green-400 text-sm">
                ANVESHA AI
              </p>

              <h1 className="mt-3 text-5xl font-bold">
                {renderValue(data.title)}
              </h1>

              <p className="mt-6 text-lg text-gray-300 leading-8">
                {renderValue(data.summary)}
              </p>

            </div>

            <div className="w-72">

              <div className="rounded-2xl bg-neutral-800 border border-neutral-700 p-6">

                <p className="text-gray-400">
                  Opportunity Score
                </p>

                <h2 className="mt-3 text-6xl font-bold text-green-400">
                  {renderValue(data.score)}
                </h2>

                <div className="mt-5 h-4 bg-neutral-700 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${data.score ?? 0}%`,
                    }}
                  />

                </div>

              </div>

            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-10">

            <Card
              title="🔥 Problem"
              content={renderValue(data.problem)}
            />

            <Card
              title="💡 AI Solution"
              content={renderValue(data.solution)}
            />

            <ArrayCard
              title="👥 Customers"
              items={toArray(data.customers)}
            />

            <Card
              title="📈 Market"
              content={renderValue(data.market)}
            />

            <ArrayCard
              title="⚔️ Competitors"
              items={toArray(data.competitors)}
            />

            <Card
              title="🏆 Competitive Advantage"
              content={renderValue(data.advantage)}
            />

            <Card
              title="💰 Business Model"
              content={renderValue(data.businessModel)}
            />

            <ArrayCard
              title="📢 Marketing"
              items={toArray(data.marketing)}
            />

            <ArrayCard
              title="⚠️ Risks"
              items={toArray(data.risks)}
            />

            <Card
              title="💵 Revenue"
              content={renderValue(data.revenue)}
            />

            <ArrayCard
              title="👨‍💻 Tech Stack"
              items={toArray(data.techStack)}
              wide
            />

            <div className="rounded-2xl bg-neutral-800 p-6 md:col-span-2">

              <h3 className="text-xl font-bold">
                🚀 MVP Roadmap
              </h3>

              <div className="mt-6 space-y-5">

                {toArray(data.mvp).map((step, index) => (

                  <div
                    key={index}
                    className="flex gap-4 items-start"
                  >

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-black font-bold">

                      {index + 1}

                    </div>

                    <div className="flex-1 rounded-xl bg-neutral-900 p-4">

                      {step}

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      </div>

    <div className="max-w-7xl mx-auto px-6 pb-12">
  <a
    href="/chat"
    className="inline-flex items-center rounded-xl bg-green-500 px-6 py-3 font-bold text-black hover:bg-green-400"
  >
    🤖 Ask Anvesha
  </a>
</div></main>
  );
}

function Card({
  title,
  content,
}: {
  title: string;
  content: any;
}) {
  return (
    <div className="rounded-2xl bg-neutral-800 p-6">

      <h3 className="text-xl font-bold">
        {title}
      </h3>

      <p className="mt-4 text-gray-300 whitespace-pre-wrap leading-7">
        {content}
      </p>

    </div>
  );
}

function ArrayCard({
  title,
  items,
  wide = false,
}: {
  title: string;
  items: string[];
  wide?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl bg-neutral-800 p-6 ${
        wide ? "md:col-span-2" : ""
      }`}
    >

      <h3 className="text-xl font-bold">
        {title}
      </h3>

      <div className="mt-4 flex flex-wrap gap-3">

        {items.map((item, index) => (

          <span
            key={index}
            className="rounded-full bg-green-500/20 border border-green-500/40 px-4 py-2"
          >
            {item}
          </span>

        ))}

      </div>

    </div>
  );
}