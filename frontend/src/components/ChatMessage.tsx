import { Bot, User, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { filename: string; chunk: string }[];
}

const ChatMessage = ({ message }: { message: ChatMsg }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-primary/20" : "bg-muted"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary" />
        ) : (
          <Bot className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
      <div className={`max-w-[75%] space-y-2 ${isUser ? "text-right" : ""}`}>
        <div
          className={`inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-md"
              : "glass-card rounded-tl-md text-card-foreground"
          }`}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">Sources:</p>
            {message.sources.map((src, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 text-left"
              >
                <FileText className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">{src.filename}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{src.chunk}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
