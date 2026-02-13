import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import ChatMessage, { ChatMsg } from "@/components/ChatMessage";

const welcomeMsg: ChatMsg = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I'm your retail document assistant. Ask me anything about your uploaded documents — I'll provide grounded answers with source citations.",
};

const Chat = () => {
  const [messages, setMessages] = useState<ChatMsg[]>([welcomeMsg]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Mock response — will be replaced with Lovable AI + RAG
    setTimeout(() => {
      const assistantMsg: ChatMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Based on your uploaded documents, I found relevant information. This is a demo response — once the backend is connected, I'll retrieve real chunks from your vector database and generate grounded answers using Gemini.",
        sources: [
          { filename: "Q4_Retail_Report.pdf", chunk: "Revenue increased by 12% in Q4 compared to the previous quarter..." },
          { filename: "Product_Catalog_2026.pdf", chunk: "The new product line features enhanced durability ratings..." },
        ],
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Chat</h1>
            <p className="text-xs text-muted-foreground">Ask questions about your retail documents</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-md">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-muted-foreground"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="pt-4 border-t border-border">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your retail documents..."
              className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Chat;
