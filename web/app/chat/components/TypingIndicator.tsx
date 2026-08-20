export default function TypingIndicator() {
  return (
    <div className="flex mb-6">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-5 py-4">
        <div className="flex gap-2">
          <span className="animate-bounce">●</span>
          <span
            className="animate-bounce"
            style={{ animationDelay: "0.15s" }}
          >
            ●
          </span>
          <span
            className="animate-bounce"
            style={{ animationDelay: "0.3s" }}
          >
            ●
          </span>
        </div>
      </div>
    </div>
  );
}