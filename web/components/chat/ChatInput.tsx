type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  loading: boolean;
};

export default function ChatInput({
  value,
  onChange,
  onSend,
  loading,
}: Props) {
  return (
    <div className="sticky bottom-0 mt-8 flex gap-4 border-t border-neutral-800 bg-black pt-6">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
        placeholder="Ask Anvesha anything..."
        className="flex-1 rounded-xl border border-neutral-700 bg-neutral-900 px-5 py-4 text-white"
      />

      <button
        onClick={onSend}
        disabled={loading}
        className="rounded-xl bg-green-500 px-8 font-bold text-black transition hover:opacity-90"
      >
        {loading ? "Thinking..." : "Send"}
      </button>
    </div>
  );
}