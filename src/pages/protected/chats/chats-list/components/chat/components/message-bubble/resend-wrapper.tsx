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
}: {
  isCurrentUser: boolean;
  message: GetChatMessages200DataItem;
  onResend: (msg: GetChatMessages200DataItem) => void;
  onDelete: (msg: GetChatMessages200DataItem) => void;
  children: React.ReactNode;
  online: boolean;
}) {
  const notSent = message.status === GetChatMessages200DataItemStatus.PENDING;

  return (
    <div
      className={cn(
        "flex items-center gap-4 max-w-[70%]",
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
                onClick={() => online && onResend(message)}
                disabled={!online}
                className="p-2 rounded-full bg-white/70 border border-input hover:bg-white active:scale-90 transition shadow-sm disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:bg-white/70 disabled:active:scale-100"
              >
                <RefreshCw size={14} className="text-muted-foreground" />
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
          "flex items-center justify-end ",
          notSent && "opacity-60"
        )}
      >
        {children}
      </div>
    </div>
  );
}
