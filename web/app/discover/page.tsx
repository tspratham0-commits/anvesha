export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const params = await searchParams;
  const query = params.query ?? "Unknown";

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold">Discovery Page</h1>

        <p className="mt-6 text-2xl">
          Query: <span className="text-green-400">{query}</span>
        </p>
      </div>
    </main>
  );
}