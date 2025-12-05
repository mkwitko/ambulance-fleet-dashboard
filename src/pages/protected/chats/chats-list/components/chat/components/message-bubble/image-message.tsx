import { useState, useEffect } from "react";
import type {
  GetChatMessages200DataItem,
  GetChats200DataItem,
} from "@/http/generated/connectServer.schemas";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { linkify } from "@/utils/chat";
import MessageFooter from "./message-footer";

export default function ImageMessage({
  isCurrentUser,
  message,
  selectedChat,
}: {
  isCurrentUser: boolean;
  message: GetChatMessages200DataItem;
  selectedChat: GetChats200DataItem;
}) {
  const [fullscreen, setFullscreen] = useState(false);

  const openFullscreen = () => setFullscreen(true);
  const closeFullscreen = () => setFullscreen(false);

  // Fechar com ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFullscreen();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* ==========================
          BOLHA NORMAL DA IMAGEM
      =========================== */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{
          scale: { delay: 0.15, type: "spring", stiffness: 400, damping: 25 },
          opacity: { delay: 0.15, duration: 0.2 },
        }}
        className={cn(
          "rounded-2xl overflow-hidden shadow-md border border-input hover:shadow-lg transition-shadow",
          isCurrentUser
            ? "bg-primary text-primary-foreground p-1"
            : "bg-white/70 rounded-bl-md"
        )}
      >
        <motion.div whileHover={{ scale: 1.01 }} className="relative group">
          <img
            src={message.file!}
            alt="Imagem"
            loading="lazy"
            className="w-full max-h-72 object-cover cursor-zoom-in transition-all group-hover:brightness-105 rounded-t-md"
            onClick={openFullscreen}
          />

          {/* Ícone de zoom */}
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Ver maior
          </div>
        </motion.div>

        {message.content && (
          <div
            className={cn(
              "p-2 pb-0 text-sm",
              isCurrentUser ? "text-primary-foreground" : "text-foreground"
            )}
          >
            {linkify(message.content as string)}
          </div>
        )}

        <MessageFooter
          isCurrentUser={isCurrentUser}
          message={message}
          selectedChat={selectedChat}
          className="px-2"
        />
      </motion.div>

      {/* ==========================
          FULLSCREEN VIEWER
      =========================== */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            className="fixed inset-0 z-999 bg-black/90 backdrop-blur flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeFullscreen}
          >
            {/* IMAGEM EM FULLSCREEN */}
            <motion.img
              src={message.file!}
              alt="Fullscreen"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-[95vw] max-h-[90vh] object-contain rounded-xl shadow-xl"
              onClick={(e) => e.stopPropagation()} // evita fechar clicando na imagem
            />

            {/* BOTÃO X */}
            <button
              className="absolute top-6 right-6 p-2 rounded-full bg-black/50 backdrop-blur text-white hover:bg-black/70 transition"
              onClick={closeFullscreen}
            >
              <X size={22} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
