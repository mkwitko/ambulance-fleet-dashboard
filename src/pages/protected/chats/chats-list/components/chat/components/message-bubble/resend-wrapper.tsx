import {
  type GetChatMessages200DataItem,
  GetChatMessages200DataItemStatus,
} from "@/http/generated/connectServer.schemas";
import { RefreshCw, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function ResendWrapper({
  isCurrentUser,
  message,
  onResend,
  onDelete,
  children,
  online,
  isResending,
}: {
  isCurrentUser: boolean;
  message: GetChatMessages200DataItem;
  onResend: (msg: GetChatMessages200DataItem) => void;
  onDelete: (msg: GetChatMessages200DataItem) => void;
  children: React.ReactNode;
  online: boolean;
  isResending?: boolean;
}) {
  const notSent = message.status === GetChatMessages200DataItemStatus.PENDING;

  return (
    <div
      className={cn(
        "flex items-center gap-4 max-w-[70%] min-w-0",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Botão de reenvio à esquerda (mensagens de outros usuários) */}
      {notSent && isCurrentUser && onResend && (
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onDelete(message)}
                className="p-2 rounded-full bg-destructive/70 border border-input hover:bg-destructive active:scale-90 transition shadow-sm disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:bg-destructive/70 disabled:active:scale-100"
              >
                <Trash size={14} className="text-white" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clique para excluir a mensagem offline.</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => online && !isResending && onResend(message)}
                disabled={!online || isResending}
                className={cn(
                  "p-2 rounded-full bg-white/70 border border-input hover:bg-white active:scale-90 transition shadow-sm disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:bg-white/70 disabled:active:scale-100",
                  isResending && "opacity-50 cursor-wait"
                )}
              >
                <RefreshCw
                  size={14}
                  className={cn(
                    "text-muted-foreground",
                    isResending && "animate-spin"
                  )}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {online
                  ? "Clique para tentar reenviar a mensagem."
                  : "Você está offline. Conecte-se para reenviar a mensagem."}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      <div
        className={cn(
          "flex items-center justify-end min-w-0 flex-1",
          notSent && "opacity-60"
        )}
      >
        {children}
      </div>
    </div>
  );
}
