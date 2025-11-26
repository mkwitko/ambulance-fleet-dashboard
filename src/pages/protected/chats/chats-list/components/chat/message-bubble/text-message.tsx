import {
  type GetChatMessages200DataItem,
  GetChatMessages200DataItemMessageType,
} from "@/http/generated/connectServer.schemas";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { formatTime } from "../../../utils/chat-utils";
import { linkify } from "@/utils/chat";

export default function TextMessage({
  isCurrentUser,
  message,
}: {
  isCurrentUser: boolean;
  message: GetChatMessages200DataItem;
}) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{
        scale: { delay: 0.15, type: "spring", stiffness: 400, damping: 25 },
        opacity: { delay: 0.15, duration: 0.2 },
      }}
      className={cn(
        "max-w-[70%] rounded-2xl px-4 py-2.5 shadow-md hover:shadow-lg transition-shadow",
        isCurrentUser
          ? "bg-primary text-primary-foreground rounded-br-md"
          : "bg-white/70 border border-input rounded-bl-md"
      )}
    >
      {message.messageType === GetChatMessages200DataItemMessageType.TEXT && (
        <p className="text-sm wrap-break-word">
          {linkify(message.content as string)}
        </p>
      )}
      <div
        className={cn(
          "flex items-center justify-start gap-1 mt-1 text-[10px]",
          isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
        )}
      >
        <span>{formatTime(message.createdAt)}</span>
      </div>
    </motion.div>
  );
}
