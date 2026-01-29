import { AnimatePresence } from "framer-motion";
import {
  GetChatMessages200DataItemMessageType,
  GetChatMessages200DataItemStatus,
  type GetChatMessages200DataItem,
  type GetChats200DataItem,
} from "@/http/generated/connectServer.schemas";
import { ScrollArea } from "@/components/ui/scroll-area";
import useMessageHook from "./hooks/use-message-hook";
import useAudioHook from "./hooks/use-audio-hook";
import * as Ably from "ably";
import useOfflineHook from "./hooks/use-offline-hook";
import { useEffect, useState } from "react";
import useFileHook from "./hooks/use-file-hook";
import { ChatEmptyState } from "./components/chat-empty-state";
import { ChatHeader } from "./components/chat-header";
import { AudioPreview } from "./components/chat-input/audio-preview";
import { ChatInput } from "./components/chat-input/chat-input";
import { FilePreview } from "./components/chat-input/file-preview";
import { RecordingIndicator } from "./components/chat-input/recording-indicator";
import { MessageBubble } from "./components/message-bubble/message-bubble";
import useRealtimeChatMessages from "./hooks/use-realtime-chats-messages";
import { connectDatabase } from "@/database/database";
import { ChatTopOverlay } from "./components/chat-top-overlay";
import { useGetAuthenticatedUser } from "@/http/generated/user/user";

interface ChatMainProps {
  selectedChat: GetChats200DataItem | undefined;
  onBack?: () => void;
  incomingMessage: Ably.InboundMessage | undefined;
  setIncomingMessage: React.Dispatch<
    React.SetStateAction<Ably.InboundMessage | undefined>
  >;
}

export default function Chat({
  selectedChat,
  onBack,
  incomingMessage,
  setIncomingMessage,
}: ChatMainProps) {
  const { data: user } = useGetAuthenticatedUser();
  const [messages, setMessages] = useState<GetChatMessages200DataItem[]>([]);
  const [currentDateOnScreen, setCurrentDateOnScreen] = useState<string | null>(
    null
  );
  const [resendingMessageId, setResendingMessageId] = useState<string | null>(
    null
  );

  const { online } = useOfflineHook();

  const {
    handleKeyPress,
    handleSendMessage,
    setMessage,
    message,
    isFetching,
    scrollAreaRef,
    messagesEndRef,
    setPage,
    chatMessages,
    prevScrollHeightRef,
  } = useMessageHook({
    selectedChat,
    user: user?.data,
    online,
    messages,
    setMessages,
    incomingMessage,
    setIncomingMessage,
  });

  const {
    audioBlob,
    isRecording,
    startRecording,
    stopRecording,
    recordingTime,
    audioPreview,
    isPlayingPreview,
    setIsPlayingPreview,
    isPaused,
    toggleAudioPreview,
    audioPreviewRef,
    handleCancelRecording,
    handleCancelAudio,
    handleSendAudioMessage,
  } = useAudioHook({
    selectedChat,
    user: user?.data,
    online,
  });

  const {
    filePreview,
    setFilePreview,
    handleSendFile,
    handleCancelFile,
    isLoading,
  } = useFileHook({
    selectedChat,
    user: user?.data,
    message,
    setMessage,
    online,
  });

  useRealtimeChatMessages({
    incomingMessage,
    selectedChat,
    setMessages,
  });

  useEffect(() => {
    if (!selectedChat || isFetching) return;

    const offlineMessages$ = connectDatabase.messages.find({
      selector: {
        selectedChatId: selectedChat.id,
      },
    }).$;

    const subscription = offlineMessages$.subscribe((docs) => {
      // docs = RxDocument[]
      const offlineMessages = docs
        .map((d) => d.toJSON())
        .filter((d) => d.user.id === user?.data.id) // Apenas mensagens do usuário atual
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      setMessages((prev) => {
        // Filtra mensagens offline já existentes
        const filteredPrev = prev.filter(
          (m) => !offlineMessages.find((om) => om.id === m.id)
        );
        return [...filteredPrev, ...offlineMessages];
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedChat, isFetching]);

  useEffect(() => {
    const scrollEl = scrollAreaRef.current;
    if (!scrollEl || messages.length === 0) return;

    const onScroll = () => {
      const parentRect = scrollEl.getBoundingClientRect();

      const sentMessages = messages.filter(
        (msg) => msg.status !== GetChatMessages200DataItemStatus.PENDING
      );

      for (const msg of sentMessages) {
        const el = document.getElementById(`msg-${msg.id}`);
        if (!el) continue;

        const rect = el.getBoundingClientRect();

        // Está visível na viewport scrollable?
        const isVisible =
          rect.top >= parentRect.top && rect.top <= parentRect.bottom;

        if (isVisible) {
          const formatted = new Date(msg.createdAt).toLocaleDateString("pt-BR");
          setCurrentDateOnScreen(formatted);
          break;
        }
      }
    };

    scrollEl.addEventListener("scroll", onScroll);
    onScroll(); // inicial

    return () => scrollEl.removeEventListener("scroll", onScroll);
  }, [messages]);

  const onResend = async (message: GetChatMessages200DataItem) => {
    try {
      setResendingMessageId(message.id);

      let response;

      if (message.messageType === GetChatMessages200DataItemMessageType.TEXT) {
        response = await handleSendMessage(message.content as string);
      }

      if (!response) {
        console.warn("No response returned when resending message");
        setResendingMessageId(null);
        return;
      }

      // 2. Remove a mensagem offline no RxDB
      const dbMessage = await connectDatabase.messages.findOne({
        selector: { id: message.id },
      });

      if (dbMessage) {
        await dbMessage.remove();
      }

      // 3. Atualiza o estado local
      setMessages((prev) => {
        // remove a mensagem offline antiga
        const withoutOld = prev.filter((m) => m.id !== message.id);

        // Verifica se a mensagem de resposta já existe na lista (via realtime)
        if (withoutOld.some((m) => m.id === response.id)) {
          return withoutOld;
        }

        const merge = [...withoutOld, response].sort((a, b) => {
          const isA = a.status === GetChatMessages200DataItemStatus.PENDING;
          const isB = b.status === GetChatMessages200DataItemStatus.PENDING;

          if (isA && !isB) return 1; // a vai pro final
          if (!isA && isB) return -1; // b vai pro final
          return 0; // mantém a ordem
        });

        return merge;
      });
    } catch (error) {
      console.log("Failed to resend message:", error);
    } finally {
      setResendingMessageId(null);
    }
  };

  const onDelete = async (message: GetChatMessages200DataItem) => {
    const foundMessage = await connectDatabase.messages
      .findOne({
        selector: {
          id: message.id,
        },
      })
      .exec();

    if (foundMessage) {
      foundMessage.remove();
      setMessages((prev) => prev.filter((m) => m.id !== message.id));
    }
  };

  if (!selectedChat) {
    return <ChatEmptyState />;
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden rounded-xl">
      <ChatHeader selectedChat={selectedChat} onBack={onBack} />

      {/* Messages Area */}
      <ScrollArea
        onScroll={() => {
          if (!scrollAreaRef.current) return;
          if (
            scrollAreaRef.current.scrollTop === 0 &&
            !isFetching &&
            chatMessages?.pagination.hasNextPage
          ) {
            prevScrollHeightRef.current = scrollAreaRef.current.scrollHeight;
            setPage((prev) => prev + 1);
          }
        }}
        ref={scrollAreaRef}
        className="flex-1 p-4 overflow-y-auto"
      >
        <ChatTopOverlay isFetching={isFetching} value={currentDateOnScreen} />

        <div className="space-y-4 max-w-4xl mx-auto">
          <AnimatePresence mode="popLayout">
            {messages
              .sort((a, b) => {
                const isA =
                  a.status === GetChatMessages200DataItemStatus.PENDING;
                const isB =
                  b.status === GetChatMessages200DataItemStatus.PENDING;

                if (isA && !isB) return 1; // a vai pro final
                if (!isA && isB) return -1; // b vai pro final
                return 0; // mantém a ordem
              })
              .map((msg, index) => {
                const isCurrentUser = msg.user?.id === user?.data?.id;
                return (
                  <div id={`msg-${msg.id}`} key={msg.id}>
                    <MessageBubble
                      message={msg}
                      isCurrentUser={isCurrentUser}
                      index={index}
                      onResend={onResend}
                      onDelete={onDelete}
                      online={online}
                      selectedChat={selectedChat}
                      isResending={resendingMessageId === msg.id}
                    />
                  </div>
                );
              })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          {/* File Preview */}
          <AnimatePresence>
            {filePreview && (
              <FilePreview
                filePreview={filePreview}
                message={message}
                onMessageChange={setMessage}
                onSend={handleSendFile}
                onCancel={handleCancelFile}
                isLoading={isLoading}
              />
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {!audioPreview && !isRecording && !filePreview && (
              <ChatInput
                message={message}
                onMessageChange={setMessage}
                onSend={handleSendMessage}
                onKeyPress={handleKeyPress}
                onStartRecording={startRecording}
                setFilePreview={setFilePreview}
              />
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {audioPreview && (
              <AudioPreview
                audioPreview={audioPreview}
                isPlaying={isPlayingPreview}
                isPaused={isPaused}
                audioRef={audioPreviewRef}
                onTogglePlay={toggleAudioPreview}
                onSend={() => {
                  handleSendAudioMessage(audioBlob);
                }}
                onCancel={handleCancelAudio}
                onEnded={() => setIsPlayingPreview(false)}
              />
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {isRecording && (
              <RecordingIndicator
                recordingTime={recordingTime}
                onStop={stopRecording}
                onCancel={handleCancelRecording}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
