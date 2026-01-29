import {
  type GetChatMessages200DataItem,
  GetChatMessages200DataItemMessageType,
  type GetChats200DataItem,
} from "@/http/generated/connectServer.schemas";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { linkify } from "@/utils/chat";
import MessageFooter from "./message-footer";

export default function TextMessage({
  isCurrentUser,
  message,
  selectedChat,
}: {
  isCurrentUser: boolean;
  message: GetChatMessages200DataItem;
  selectedChat: GetChats200DataItem;
}) {
  return (
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{
        scale: { delay: 0.15, type: "spring", stiffness: 400, damping: 25 },
      }}
      className={cn(
        "relative max-w-full min-w-0 rounded-2xl px-4 py-3 shadow-md hover:shadow-lg transition-shadow overflow-hidden",
        isCurrentUser
          ? "bg-primary text-primary-foreground rounded-br-md"
          : "bg-white/70 border border-input rounded-bl-md"
      )}
    >
      {message.messageType === GetChatMessages200DataItemMessageType.TEXT && (
        <p 
          className="text-sm break-words min-w-[50px] whitespace-pre-wrap"
          style={{ 
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            maxWidth: '100%'
          }}
        >
          {linkify(message.content as string)}
        </p>
      )}

      <MessageFooter
        isCurrentUser={isCurrentUser}
        message={message}
        selectedChat={selectedChat}
      />
    </motion.div>
  );
}
