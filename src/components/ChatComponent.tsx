import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/hooks/supabase";

interface ChatComponentProps {
  messages: Tables<"chat">[] | null;
  role: "guest" | "partner";
  title: string;
  containerClass?: string;
  onSendMessage?: (message: string) => void;
}

export default function ChatComponent({
  messages,
  role,
  title,
  containerClass = "h-256",
  onSendMessage,
}: ChatComponentProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isBlinking, setIsBlinking] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [latestMessageId, setLatestMessageId] = useState<string | null>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !onSendMessage) return;
    onSendMessage(newMessage);
    setNewMessage("");
  };

  useEffect(() => {
    if (messages && messages.length > 0) {
      // Check if new messages arrived (but not on initial load)
      if (messages.length > lastMessageCount && !isInitialLoad) {
        // Trigger frame blink effect
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 1000);

        // Mark only the latest message for blinking
        const latestMessage = messages[messages.length - 1];
        setLatestMessageId(latestMessage.id);

        // Clear latest message blink after 2 seconds
        setTimeout(() => setLatestMessageId(null), 2000);
      }

      // Mark that initial load is complete
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }

      setLastMessageCount(messages.length);

      // Wait for next tick to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom();
      }, 0);
    }
  }, [messages, lastMessageCount, isInitialLoad]);

  if (!messages) {
    return (
      <div className="flex items-center justify-center text-gray-500">
        {title}
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${containerClass}`}>
      {title && <div className="text-sm font-medium text-slate-700 mb-2">{title}</div>}
      
      {/* Messages Area */}
      <div className="flex-1 min-h-0">
        <ScrollArea
          ref={scrollAreaRef}
          className={`rounded-lg p-3 transition-all duration-200 h-full ${
            isBlinking
              ? "border-2 border-blue-400 animate-pulse bg-blue-50/30"
              : "border border-slate-300 bg-white/90"
          }`}
        >
          <div className="space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg text-sm transition-all duration-300 ${
                  role === "guest"
                    ? msg.sender === "user"
                      ? "bg-blue-100 mr-8 text-blue-900"
                      : "bg-slate-100 ml-8 text-slate-800"
                    : msg.sender === "partner"
                      ? "bg-emerald-100 ml-4 text-emerald-900"
                      : "bg-slate-100 mr-4 text-slate-800"
                } ${
                  latestMessageId === msg.id
                    ? "ring-2 ring-amber-400 ring-opacity-75 animate-pulse shadow-lg"
                    : ""
                }`}
              >
                <div className="font-medium text-xs text-slate-500 mb-1 capitalize">
                  {msg.sender}
                </div>
                {msg.message}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      {onSendMessage && (
        <div className="flex-shrink-0 space-y-2 mt-3">
          <Textarea
            placeholder={`Type as ${role}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={2}
          />
          <Button onClick={handleSendMessage} className="w-full" variant="default">
            Send as {role === "guest" ? "Guest" : "Partner"}
          </Button>
        </div>
      )}
    </div>
  );
}
