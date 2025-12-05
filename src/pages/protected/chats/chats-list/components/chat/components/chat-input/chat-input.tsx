import type React from "react";

import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Mic, Paperclip, Send, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import type { FilePreview } from "../../../../types/chat.types";
import { GetChatMessages200DataItemMessageType } from "@/http/generated/connectServer.schemas";

interface ChatInputProps {
  message: string;
  onMessageChange: (value: string) => void;
  onSend: (message: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onStartRecording: () => void;
  setFilePreview: (preview: FilePreview | null) => void;
}

export function ChatInput({
  message,
  onMessageChange,
  onSend,
  onKeyPress,
  onStartRecording,
  setFilePreview,
}: ChatInputProps) {
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (type: GetChatMessages200DataItemMessageType) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept =
        type === GetChatMessages200DataItemMessageType.IMAGE
          ? "image/*"
          : type === GetChatMessages200DataItemMessageType.VIDEO
          ? "video/*"
          : "application/pdf";
      fileInputRef.current.click();
    }
    setShowAttachMenu(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const type = file.type.startsWith("image/")
      ? GetChatMessages200DataItemMessageType.IMAGE
      : file.type.startsWith("video/")
      ? GetChatMessages200DataItemMessageType.VIDEO
      : GetChatMessages200DataItemMessageType.DOCUMENT;
    setFilePreview({ type, url, file });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="flex items-end gap-2"
    >
      {/* Attach Button */}
      <div className="relative">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="hover:bg-accent rounded-xl transition-colors"
          >
            <motion.div
              animate={{ rotate: showAttachMenu ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Paperclip className="w-5 h-5" />
            </motion.div>
          </Button>
        </motion.div>

        <AnimatePresence>
          {showAttachMenu && (
            <>
              <div
                onClick={() => setShowAttachMenu(false)}
                className="fixed inset-0 z-40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="absolute bottom-full left-0 mb-2 bg-card border border-input rounded-xl p-2 z-50 min-w-40 shadow-xl"
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    onClick={() =>
                      handleFileSelect(
                        GetChatMessages200DataItemMessageType.IMAGE
                      )
                    }
                    className="w-full justify-start hover:bg-accent"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Imagem
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    onClick={() =>
                      handleFileSelect(
                        GetChatMessages200DataItemMessageType.VIDEO
                      )
                    }
                    className="w-full justify-start hover:bg-accent"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Vídeo
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    onClick={() =>
                      handleFileSelect(
                        GetChatMessages200DataItemMessageType.DOCUMENT
                      )
                    }
                    className="w-full justify-start hover:bg-accent"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Documentos
                  </Button>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* {/* Text Input */}
      <div className="flex-1 relative">
        <Input
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Digite uma mensagem..."
          className="pr-4 rounded-xl transition-all focus:shadow-md"
        />
      </div>

      {/* Send or Record Button */}
      <AnimatePresence mode="wait">
        {message.trim() ? (
          <motion.div
            key="send"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              onClick={() => {
                onSend(message);
              }}
              size="icon"
              className="rounded-xl"
            >
              <Send className="w-5 h-5" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="mic"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onStartRecording}
              className="rounded-xl hover:bg-accent"
            >
              <Mic className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
