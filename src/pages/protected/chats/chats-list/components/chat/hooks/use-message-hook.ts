import { connectDatabase } from "@/database/database";
import { useGetChatMessages, useSendMessage } from "@/http/generated/chat/chat";
import {
  type GetChats200DataItem,
  type GetAuthenticatedUser200Data,
  type GetChatMessages200DataItem,
  SendMessageBodyMessageType,
  SendMessageBodyPlatform,
  GetChatMessages200DataItemStatus,
} from "@/http/generated/connectServer.schemas";
import type { InboundMessage } from "ably";
import React, { useEffect, useRef, useState } from "react";

export default function useMessageHook({
  selectedChat,
  user,
  online,
  messages,
  setMessages,
  incomingMessage,
  setIncomingMessage,
}: {
  selectedChat: GetChats200DataItem | undefined;
  user: GetAuthenticatedUser200Data | undefined;
  online: boolean;
  messages: GetChatMessages200DataItem[];
  setMessages: React.Dispatch<
    React.SetStateAction<GetChatMessages200DataItem[]>
  >;
  incomingMessage: InboundMessage | undefined;

  setIncomingMessage: React.Dispatch<
    React.SetStateAction<InboundMessage | undefined>
  >;
}) {
  const [message, setMessage] = useState("");

  const [page, setPage] = useState(1);

  const { data: chatMessages, isFetching } = useGetChatMessages(
    selectedChat?.id as string,
    {
      page,
      perPage: 20,
    },
    {
      query: {
        enabled: !!selectedChat,
      },
    }
  );

  const prevScrollHeightRef = useRef<number>(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { mutateAsync: sendMessage } = useSendMessage();

  // ▶️ Carregar mensagens e fazer merge
  useEffect(() => {
    if (!chatMessages) return;

    // primeira página → substitui
    if (page === 1) {
      setMessages(chatMessages.data);
      return;
    }

    // páginas seguintes → prepend
    setMessages((prev) => {
      const merged = [...chatMessages.data, ...prev];

      const map = new Map(merged.map((m) => [m.id, m]));
      return Array.from(map.values()).sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });
  }, [chatMessages]);

  useEffect(() => {
    const latestMessage = messages[messages.length - 1];

    if (page === 1) {
      // scroll to bottom on first load
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      return;
    }

    if (latestMessage.id === incomingMessage?.data.id) {
      // scroll to bottom on first load
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      setIncomingMessage(undefined);
      return;
    }

    if (page > 1 && prevScrollHeightRef.current > 0 && scrollAreaRef.current) {
      const newScrollHeight = scrollAreaRef.current.scrollHeight;

      const diff = newScrollHeight - prevScrollHeightRef.current;

      // reposiciona o scroll no ponto anterior
      scrollAreaRef.current.scrollTop = diff;

      return;
    }
  }, [messages]);

  // ▶️ Reset ao trocar de chat
  useEffect(() => {
    setPage(1);
  }, [selectedChat?.id]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    setMessage("");

    const offlineId = crypto.randomUUID();

    if (!online) {
      const offlineMessage = {
        id: offlineId,
        selectedChatId: selectedChat?.id as string,
        content: message,
        messageType: SendMessageBodyMessageType.TEXT,
        user: {
          id: user?.id as string,
          name: user?.name as string,
          avatarUrl: user?.avatarUrl || "",
        },
        createdAt: new Date().toISOString(),
        status: GetChatMessages200DataItemStatus.PENDING,
      };
      await connectDatabase.messages.insert(offlineMessage);
      return;
    }

    return await sendMessage({
      id: selectedChat?.id as string,
      data: {
        content: message,
        messageType: SendMessageBodyMessageType.TEXT,
        user: {
          id: user?.id as string,
          name: user?.name as string,
          avatarUrl: user?.avatarUrl || null,
        },
        platform: SendMessageBodyPlatform.WEB,
        offlineId,
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(message);
    }
  };

  return {
    handleKeyPress,
    handleSendMessage,
    setMessage,
    message,
    messages,
    isFetching,
    scrollAreaRef,
    messagesEndRef,
    setPage,
    chatMessages,
    prevScrollHeightRef,
  };
}
