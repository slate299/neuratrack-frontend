// src/services/chat.service.ts

import { axiosInstance } from "@/lib/axios";
import {
  ChatRequest,
  ChatResponse,
  Conversation,
  ConversationDetail,
  ConversationsResponse,
  ConversationResponse,
} from "@/types";

export const chatService = {
  /**
   * Get all conversations for the current user
   */
  getConversations: async (): Promise<Conversation[]> => {
    try {
      const response = await axiosInstance.get<ConversationsResponse>(
        "/api/ai/conversations",
        { timeout: 60000 }, // 60 seconds timeout
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      throw error;
    }
  },

  /**
   * Get a specific conversation with all messages
   */
  getConversation: async (
    conversationId: number,
  ): Promise<ConversationDetail> => {
    try {
      const response = await axiosInstance.get<ConversationResponse>(
        `/api/ai/conversations/${conversationId}`,
        { timeout: 60000 }, // 60 seconds timeout
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
      throw error;
    }
  },

  /**
   * Send a message to the AI chat
   * If conversationId is not provided, a new conversation will be created
   */
  sendMessage: async (
    message: string,
    conversationId?: number,
  ): Promise<{ message: any; conversationId: number }> => {
    try {
      const request: ChatRequest = {
        message,
        conversationId,
      };

      const response = await axiosInstance.post<ChatResponse>(
        "/api/ai/chat",
        request,
        { timeout: 60000 }, // 60 seconds timeout
      );

      return response.data.data;
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  },

  /**
   * Delete a conversation
   */
  deleteConversation: async (conversationId: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/ai/conversations/${conversationId}`);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      throw error;
    }
  },

  /**
   * Rename a conversation
   */
  renameConversation: async (
    conversationId: number,
    title: string,
  ): Promise<Conversation> => {
    try {
      const response = await axiosInstance.patch<ConversationResponse>(
        `/api/ai/conversations/${conversationId}`,
        { title },
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to rename conversation:", error);
      throw error;
    }
  },
};
