export default async function AIPage() {
  const response = await fetch("http://localhost:3000/api/discover", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: "Drone Delivery",
    }),
    cache: "no-store",
  });

  const data = await response.json();

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-black text-white p-10">
      <div className="max-w-5xl mx-auto rounded-3xl border border-neutral-700 bg-neutral-900/80 p-10 shadow-2xl">

        <h1 className="text-5xl font-bold">🧠 Anvesha AI</h1>
        <p className="text-gray-400 mt-2">
          AI Opportunity Report
        </p>

        <div className="mt-10">
          <h2 className="text-4xl font-bold">
            {data.title}
          </h2>

          <p className="mt-4 text-green-400 text-xl">
            Opportunity Score: {data.score}/100
          </p>

          <div className="mt-3 h-4 rounded-full bg-neutral-700 overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{ width: `${data.score}%` }}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-10">

          <div className="rounded-2xl bg-neutral-800 p-6">
            <h3 className="text-xl font-semibold">🔥 Problem</h3>
            <p className="mt-3 text-gray-300">
              {data.problem}
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-800 p-6">
            <h3 className="text-xl font-semibold">
              💡 AI Opportunity
            </h3>
            <p className="mt-3 text-gray-300">
              {data.idea}
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-800 p-6">
            <h3 className="text-xl font-semibold">
              📈 Market
            </h3>
            <p className="mt-3 text-green-400">
              {data.market}
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-800 p-6">
            <h3 className="text-xl font-semibold">
              💰 Business Model
            </h3>
            <p className="mt-3">
              {data.businessModel}
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-800 p-6 md:col-span-2">
            <h3 className="text-xl font-semibold">
              👥 Target Users
            </h3>

            <p className="mt-3">
              {data.targetUsers}
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-800 p-6 md:col-span-2">
            <h3 className="text-xl font-semibold">
              🚀 MVP Roadmap
            </h3>

            <ul className="mt-5 space-y-4">
              {data.mvp.map((step: string, index: number) => (
                <li
                  key={index}
                  className="flex items-center gap-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-black font-bold">
                    {index + 1}
                  </div>

                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </main>
  );
}