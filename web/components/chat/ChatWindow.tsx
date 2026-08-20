import ChatBubble from "./ChatBubble";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  messages: Message[];
};

export default function ChatWindow({ messages }: Props) {
  return (
    <div className="space-y-2">
      {messages.map((message, index) => (
        <ChatBubble
          key={index}
          role={message.role}
          message={message.content}
        />
      ))}
    </div>
  );
}