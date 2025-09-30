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
    <>
      <div className="text-sm font-medium">{title}</div>
      <ScrollArea
        ref={scrollAreaRef}
        className={`rounded p-2 transition-all duration-200 ${containerClass} ${
          isBlinking 
            ? "border-2 border-blue-400 animate-pulse" 
            : "border border-gray-200"
        }`}
      >
        <div className="space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded text-sm transition-all duration-300 ${
                role === "guest"
                  ? msg.sender === "user"
                    ? "bg-blue-100 mr-8"
                    : "bg-gray-100 ml-8"
                  : msg.sender === "partner"
                    ? "bg-green-100 ml-4"
                    : "bg-gray-100 mr-4"
              } ${
                latestMessageId === msg.id
                  ? "ring-2 ring-yellow-400 ring-opacity-75 animate-pulse shadow-lg"
                  : ""
              }`}
            >
              <div className="font-medium text-xs text-gray-500 mb-1">
                {msg.sender}
              </div>
              {msg.message}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      {onSendMessage && (
        <div className={role === "guest" ? "flex gap-2" : "space-y-2"}>
          {role === "guest" ? (
            <>
              <Input
                placeholder="Type as guest..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} size="sm">
                Send
              </Button>
            </>
          ) : (
            <>
              <Textarea
                placeholder="Type as partner..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={3}
              />
              <Button onClick={handleSendMessage} className="w-full">
                Send as Partner
              </Button>
            </>
          )}
        </div>
      )}
    </>
  );
}
