// src/components/chat/MessageBubble.tsx

import { Message } from "@/types";
import { format } from "date-fns";
import { User, Bot, ThumbsUp, ThumbsDown, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface MessageBubbleProps {
  message: Message;
  onFeedback?: (messageId: number, feedback: "positive" | "negative") => void;
}

export const MessageBubble = ({ message, onFeedback }: MessageBubbleProps) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "h:mm a");
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`flex max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? "ml-3" : "mr-3"}`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isUser
                ? "bg-primary-100 dark:bg-primary-900"
                : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            {isUser ? (
              <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            ) : (
              <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex-1 ${isUser ? "items-end" : "items-start"}`}>
          <div
            className={`rounded-lg px-4 py-2 ${
              isUser
                ? "bg-primary-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{formatTime(message.createdAt)}</span>

            {/* Action buttons for assistant messages */}
            {!isUser && (
              <>
                <button
                  onClick={handleCopy}
                  className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  title="Copy response"
                >
                  {copied ? (
                    <span className="text-green-500">Copied!</span>
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>

                {onFeedback && (
                  <>
                    <button
                      onClick={() => onFeedback(message.id, "positive")}
                      className="hover:text-green-500 transition-colors"
                      title="Helpful"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onFeedback(message.id, "negative")}
                      className="hover:text-red-500 transition-colors"
                      title="Not helpful"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Suggested Actions (if any) */}
          {!isUser && message.metadata?.suggestedActions && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.metadata.suggestedActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Handle suggested action
                    console.log("Suggested action clicked:", action);
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
