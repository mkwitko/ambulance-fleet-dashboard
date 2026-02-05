import { cn } from "@/lib/utils";
import { formatTime } from "../../../../utils/chat-utils";
import { Check, CheckCheck } from "lucide-react";
import type {
  GetChatMessages200DataItem,
  GetChats200DataItem,
} from "@/http/generated/connect-server.schemas";
import { useEffect } from "react";

export default function MessageFooter({
  isCurrentUser,
  message,
  className,
  selectedChat,
}: {
  isCurrentUser: boolean;
  message: GetChatMessages200DataItem;
  className?: string;
  selectedChat: GetChats200DataItem;
}) {
  const selectedChatReadAt = selectedChat?.readByAppAt;
  const messageCreatedAt = message.createdAt;

  // Verifica se a mensagem foi lida comparando as datas
  const isRead =
    selectedChatReadAt && messageCreatedAt
      ? new Date(selectedChatReadAt) >= new Date(messageCreatedAt)
      : false;

  useEffect(() => {
    console.log("selectedChatReadAt:", selectedChat);
  }, [selectedChat]);

  return (
    <div className="flex items-center justify-between mt-1">
      <div className="flex items-center gap-1">
        <span
          className={cn(
            "text-[10px]",
            isCurrentUser
              ? "text-primary-foreground/70"
              : "text-muted-foreground",
            className,
          )}
        >
          {formatTime(message.createdAt)}
        </span>

        {isCurrentUser && (
          <span
            className={cn(
              "text-primary-foreground/70",
              isRead && "text-blue-400",
            )}
          >
            {isRead ? <CheckCheck size={12} /> : <Check size={12} />}
          </span>
        )}
      </div>
    </div>
  );
}
