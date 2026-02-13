import { useState, useRef } from "react";
import { Send, Upload, Loader2, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! Upload retail documents (PDF) or images of reports. I can analyze them for you." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      // NOTE: Using relative path /api/upload for Vercel
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      
      toast({
        title: "File Indexed",
        description: `Successfully added ${data.chunks_added} chunks from ${file.name} to knowledge base.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "Could not process file. Ensure it is a valid PDF or Image.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage }),
      });

      if (!response.ok) throw new Error("Failed to get response");
      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, sources: data.sources },
      ]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate response.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Retail RAG Assistant</h1>
            <p className="text-sm text-slate-500">Upload reports & ask questions</p>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {isUploading ? "Processing..." : "Upload Document"}
            </Button>
          </div>
        </div>

        {/* Chat Interface */}
        <Card className="flex flex-1 flex-col overflow-hidden border-none shadow-md">
          <CardContent className="flex flex-1 flex-col p-0 bg-white dark:bg-slate-900">
            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-col gap-6">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 border-t border-slate-200/20 pt-2 text-xs opacity-70">
                          <span className="font-semibold">Sources:</span> {msg.sources.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-4 dark:bg-slate-800">
                      <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                      <span className="text-sm text-slate-500">Analyzing context...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            {/* Input */}
            <div className="border-t p-4 bg-white dark:bg-slate-900">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about sales, inventory, or uploaded reports..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;