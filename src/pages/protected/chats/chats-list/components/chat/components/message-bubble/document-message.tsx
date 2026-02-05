import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Maximize2, Minimize2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  GetChatMessages200DataItem,
  GetChats200DataItem,
} from "@/http/generated/connect-server.schemas";
import { linkify } from "@/utils/chat";
import MessageFooter from "./message-footer";

interface DocumentMessageProps {
  message: GetChatMessages200DataItem;
  isCurrentUser?: boolean;
  selectedChat: GetChats200DataItem;
}

export function DocumentMessage({
  message,
  isCurrentUser,
  selectedChat,
}: DocumentMessageProps) {
  const file = message.file;
  const [fullscreen, setFullscreen] = useState(false);

  const openFullscreen = () => setFullscreen(true);
  const closeFullscreen = () => setFullscreen(false);

  const fileName = file?.split("/").pop() || "documento.pdf";

  return (
    <>
      {/* =============================
           BUBBLE
      ============================== */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{
          scale: { delay: 0.15, type: "spring", stiffness: 400, damping: 25 },
          opacity: { delay: 0.15, duration: 0.2 },
        }}
        className={cn(
          "relative rounded-2xl overflow-hidden shadow-md border border-input hover:shadow-lg transition-shadow",
          isCurrentUser
            ? "bg-primary text-primary-foreground"
            : "bg-white/70 rounded-bl-md",
        )}
      >
        {/* --- DOCUMENT PREVIEW AREA --- */}
        <div
          className="flex items-center gap-3 p-3 cursor-pointer"
          onClick={openFullscreen}
        >
          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-red-500/10">
            <FileText className="text-red-600" size={26} />
          </div>

          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-medium truncate">{fileName}</span>
            <span className="text-xs opacity-70">Documento PDF</span>
          </div>

          <button className="rounded-full bg-black/10 p-1">
            <Maximize2 size={16} className="opacity-70" />
          </button>
        </div>

        {message.content && (
          <div
            className={cn(
              "p-4 pb-0 pt-2 text-sm",
              isCurrentUser ? "text-primary-foreground" : "text-foreground",
            )}
          >
            {linkify(message.content as string)}
          </div>
        )}

        <MessageFooter
          isCurrentUser={isCurrentUser || false}
          message={message}
          selectedChat={selectedChat}
          className="px-4 pt-0 pb-3"
        />
      </motion.div>

      {/* =============================
           FULLSCREEN PDF VIEWER (NO PDF.js)
      ============================== */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* TOP BAR */}
            <div className="flex items-center gap-4 p-4 text-white bg-black/60 backdrop-blur border-b border-white/10">
              <div className="flex-1 font-medium truncate">{fileName}</div>

              {/* DOWNLOAD */}
              <a
                href={file!}
                target="_blank"
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <Download size={20} />
              </a>
              <button
                onClick={closeFullscreen}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <Minimize2 size={20} />
              </button>
            </div>

            {/* PDF VIEWER */}
            <div className="flex-1 bg-black flex justify-center">
              <iframe
                src={file!}
                className="w-full h-full"
                style={{ border: "none" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
