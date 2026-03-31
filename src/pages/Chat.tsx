// src/pages/Chat.tsx

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/services/chat.service";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { Card } from "@/components/ui/Card";
import { MessageSquare, Menu } from "lucide-react";

export default function Chat() {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | undefined
  >();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentMessages, setCurrentMessages] = useState<any[]>([]);

  // Queries
  const { data: conversations = [], isLoading: isLoadingConversations } =
    useQuery({
      queryKey: ["conversations"],
      queryFn: chatService.getConversations,
    });

  const { data: conversationDetail, isLoading: isLoadingConversation } =
    useQuery({
      queryKey: ["conversation", selectedConversationId],
      queryFn: () => chatService.getConversation(selectedConversationId!),
      enabled: !!selectedConversationId,
      retry: false,
    });

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: ({
      message,
      conversationId,
    }: {
      message: string;
      conversationId?: number;
    }) => chatService.sendMessage(message, conversationId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      if (data.conversationId) {
        setSelectedConversationId(data.conversationId);
        queryClient.invalidateQueries({
          queryKey: ["conversation", data.conversationId],
        });
      }
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: chatService.deleteConversation,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      if (selectedConversationId === deletedId) {
        setSelectedConversationId(undefined);
        setCurrentMessages([]);
      }
    },
  });

  const renameConversationMutation = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) =>
      chatService.renameConversation(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({
        queryKey: ["conversation", selectedConversationId],
      });
    },
  });

  // Update current messages when conversation loads
  useEffect(() => {
    if (conversationDetail) {
      setCurrentMessages(conversationDetail.messages);
    } else if (!selectedConversationId) {
      setCurrentMessages([]);
    }
  }, [conversationDetail, selectedConversationId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const handleSendMessage = async (message: string) => {
    // Optimistically add user message
    const tempUserMessage = {
      id: Date.now(),
      role: "user" as const,
      content: message,
      createdAt: new Date().toISOString(),
    };
    setCurrentMessages((prev) => [...prev, tempUserMessage]);

    try {
      const result = await sendMessageMutation.mutateAsync({
        message,
        conversationId: selectedConversationId,
      });
      console.log("Message sent successfully:", result);
    } catch (error) {
      console.error("Failed to send message:", error);
      setCurrentMessages((prev) =>
        prev.filter((m) => m.id !== tempUserMessage.id),
      );
    }
  };

  const handleNewConversation = () => {
    setSelectedConversationId(undefined);
    setCurrentMessages([]);
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: number) => {
    setSelectedConversationId(id);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = (id: number) => {
    deleteConversationMutation.mutate(id);
  };

  const handleRenameConversation = (id: number, newTitle: string) => {
    renameConversationMutation.mutate({ id, title: newTitle });
  };

  const isLoading = sendMessageMutation.isPending || isLoadingConversation;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        isLoading={isLoadingConversations}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Chat Assistant
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ask questions about your epilepsy data and get personalized
              insights
            </p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {currentMessages.length === 0 && !isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Card className="max-w-md text-center p-8">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Welcome to AI Chat Assistant
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  I can help you understand your seizure patterns, medication
                  adherence, and provide personalized insights. Try asking:
                </p>
                <div className="space-y-2 text-left">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      💬 "What patterns do you see in my seizures?"
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      💊 "How am I doing with my medication adherence?"
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      📊 "What are my most common triggers?"
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      ⚠️ "When am I at highest risk for a seizure?"
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {currentMessages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onFeedback={(messageId, feedback) => {
                    console.log("Feedback for message", messageId, feedback);
                  }}
                />
              ))}

              {/* Loading indicator for AI response */}
              {sendMessageMutation.isPending && (
                <div className="flex justify-start mb-4">
                  <div className="flex flex-row">
                    <div className="mr-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={sendMessageMutation.isPending}
        />
      </div>
    </div>
  );
}
