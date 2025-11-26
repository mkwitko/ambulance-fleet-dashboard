import { AnimatePresence } from "framer-motion";
import {
  type GetAuthenticatedUser200Data,
  type GetChats200DataItem,
} from "@/http/generated/connectServer.schemas";
import { ChatHeader } from "./chat-header";
import { ChatEmptyState } from "./chat-empty-state";
import { ChatInput } from "./chat-input/chat-input";
import { MessageBubble } from "./message-bubble/message-bubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import useMessageHook from "../../hooks/use-message-hook";
import { differenceInMilliseconds, addDays, parseISO } from "date-fns";
import useAudioHook from "../../hooks/use-audio-hook";
import { RecordingIndicator } from "./chat-input/recording-indicator";
import { AudioPreview } from "./chat-input/audio-preview";
import useFileHook from "../../hooks/use-file-hook";
import { FilePreview } from "./chat-input/file-preview";
import * as Ably from "ably";

interface ChatMainProps {
  selectedChat: GetChats200DataItem | undefined;
  user: GetAuthenticatedUser200Data | undefined;
  onBack?: () => void;
  incomingMessage: Ably.InboundMessage | undefined;
}

export default function Chat({
  selectedChat,
  onBack,
  user,
  incomingMessage,
}: ChatMainProps) {
  const {
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
  } = useMessageHook({
    selectedChat,
    user,
    incomingMessage,
  });

  const {
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
    user,
  });

  const {
    filePreview,
    setFilePreview,
    handleSendFile,
    handleCancelFile,
    isLoading,
  } = useFileHook({
    selectedChat,
    user,
    message,
    setMessage,
  });

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
        <div className="space-y-4 max-w-4xl mx-auto">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => {
              const isCurrentUser = msg.user.id === user?.id;
              const showTime =
                index === 0 ||
                differenceInMilliseconds(
                  addDays(parseISO(messages[index - 1].createdAt), 1),
                  addDays(parseISO(msg.createdAt), 1)
                ) > 300000;

              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isCurrentUser={isCurrentUser}
                  showTime={showTime}
                  index={index}
                />
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
                onSend={handleSendAudioMessage}
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
            )}{" "}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
