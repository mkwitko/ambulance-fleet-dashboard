import { useGetChatMessages, useSendMessage } from "@/http/generated/chat/chat";
import {
  type GetChats200DataItem,
  type GetAuthenticatedUser200Data,
  type GetChatMessages200DataItem,
  SendMessageBodyMessageType,
  SendMessageBodyPlatform,
} from "@/http/generated/connectServer.schemas";
import React, { useEffect, useRef, useState } from "react";
import * as Ably from "ably";

export default function useMessageHook({
  selectedChat,
  user,
  incomingMessage,
}: {
  selectedChat: GetChats200DataItem | undefined;
  user: GetAuthenticatedUser200Data | undefined;
  incomingMessage: Ably.InboundMessage | undefined;
}) {
  const [message, setMessage] = useState("");

  const [page, setPage] = useState(1);
  const [messages, setMessages] = useState<GetChatMessages200DataItem[]>([]);

  const { data: chatMessages, isFetching } = useGetChatMessages(
    selectedChat?.id as string,
    {
      page,
      perPage: 10,
    },
    {
      query: {
        enabled: !!selectedChat?.id,
      },
    }
  );

  useEffect(() => {
    if (!incomingMessage) return;
    if (incomingMessage.name === "messages") {
      const message = incomingMessage.data as GetChatMessages200DataItem;
      setMessages((prevMessages) => {
        // Verifica se a mensagem já existe na lista
        if (
          message &&
          message.chatId === selectedChat?.id &&
          !prevMessages.some((msg) => msg.id === message.id)
        ) {
          return [...prevMessages, message];
        }
        return prevMessages;
      });
    }
  }, [incomingMessage]);

  const prevScrollHeightRef = useRef<number>(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { mutateAsync: sendMessage } = useSendMessage({
    mutation: {
      onSuccess: async (response) => {},
      onError: (error) => {
        console.error("Erro ao enviar mensagem:", error);
      },
    },
  });

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
    if (page === 1) {
      // scroll to bottom on first load
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      return;
    }
    if (page > 1 && prevScrollHeightRef.current > 0 && scrollAreaRef.current) {
      const newScrollHeight = scrollAreaRef.current.scrollHeight;

      const diff = newScrollHeight - prevScrollHeightRef.current;

      // reposiciona o scroll no ponto anterior
      scrollAreaRef.current.scrollTop = diff;
    }
  }, [messages]);

  // ▶️ Reset ao trocar de chat
  useEffect(() => {
    setPage(1);
  }, [selectedChat?.id]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const offlineId = crypto.randomUUID();
    // connectDatabase.messages.insert({
    //   id: offlineId,
    //   chatId: selectedChat?.id as string,
    //   userId: user?.id as string,
    //   platform: SendMessageBodyPlatform.WEB,
    //   messageType: SendMessageBodyMessageType.TEXT,
    //   createdAt: new Date().toISOString(),
    //   content: message,
    //   status: "PENDING",
    // });

    sendMessage({
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

    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
