type Props = {
  role: "user" | "assistant";
  message: string;
};

export default function ChatBubble({ role, message }: Props) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-4`}>
      <div
        className={`max-w-3xl rounded-2xl px-5 py-4 whitespace-pre-wrap ${
          isUser
            ? "bg-green-500 text-black"
            : "bg-neutral-900 border border-neutral-800 text-white"
        }`}
      >
        {message}
      </div>
    </div>
  );
}