"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  GetChatMessages200DataItemMessageType,
  type GetChatMessages200DataItem,
} from "@/http/generated/connectServer.schemas";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getInitials } from "@/utils/get-initials";
import { formatInTimeZone } from "date-fns-tz";
import { AudioMessagePlayer } from "./audio-message";
import ImageMessage from "./image-message";
import TextMessage from "./text-message";
import { VideoMessage } from "./video-message";
import { DocumentMessage } from "./document-message";

interface MessageBubbleProps {
  message: GetChatMessages200DataItem;
  isCurrentUser: boolean;
  showTime: boolean;
  index: number;
}

export function MessageBubble({
  message,
  isCurrentUser,
  showTime,
  index,
}: MessageBubbleProps) {
  const initials = getInitials(message.user.name);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      {showTime && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center my-4"
        >
          <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground flex items-center gap-1.5 shadow-sm">
            <Clock className="w-3 h-3" />
            {formatInTimeZone(message.createdAt, "UTC", "dd/MM/yyyy")}
          </div>
        </motion.div>
      )}
      <div
        className={cn(
          "flex gap-2 items-end",
          isCurrentUser ? "justify-end" : "justify-start"
        )}
      >
        {!isCurrentUser && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.1,
              type: "spring",
              stiffness: 500,
              damping: 25,
            }}
          >
            <Tooltip>
              <TooltipTrigger>
                <Avatar className="w-8 h-8 bg-muted text-muted-foreground font-semibold flex items-center justify-center">
                  <span className="text-xs">{initials}</span>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{message.user.name}</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        )}

        {message.messageType === GetChatMessages200DataItemMessageType.TEXT && (
          <TextMessage isCurrentUser={isCurrentUser} message={message} />
        )}

        {message.messageType ===
          GetChatMessages200DataItemMessageType.IMAGE && (
          <ImageMessage isCurrentUser={isCurrentUser} message={message} />
        )}

        {message.messageType === GetChatMessages200DataItemMessageType.AUDIO &&
          message.file && (
            <AudioMessagePlayer
              isCurrentUser={isCurrentUser}
              message={message}
            />
          )}

        {message.messageType === GetChatMessages200DataItemMessageType.VIDEO &&
          message.file && (
            <VideoMessage isCurrentUser={isCurrentUser} message={message} />
          )}

        {message.messageType ===
          GetChatMessages200DataItemMessageType.DOCUMENT &&
          message.file && (
            <DocumentMessage isCurrentUser={isCurrentUser} message={message} />
          )}
      </div>
    </motion.div>
  );
}
