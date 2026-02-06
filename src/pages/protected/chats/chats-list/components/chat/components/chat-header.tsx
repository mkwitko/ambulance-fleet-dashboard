import { motion } from "framer-motion";
import { ArrowLeft, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GetChats200DataItem } from "@/http/generated/connect-server.schemas";
import { getStatusStyle } from "@/utils/ambulance-status";
import { maskPhoneNumber } from "@/utils/masks";
import { toast } from "sonner";

interface ChatHeaderProps {
  selectedChat: GetChats200DataItem;
  onBack?: () => void;
}

export function ChatHeader({ selectedChat, onBack }: ChatHeaderProps) {
  const name = selectedChat.ambulance?.name ?? "—";
  const phone = selectedChat.currentPhone ?? "—";

  const handleCopyPhone = async () => {
    if (!phone || phone === "—") return;

    await navigator.clipboard.writeText(phone);
    toast.success("Telefone copiado para a área de transferência!", {
      duration: 2000,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="border-b border-input backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 p-4">
        {onBack && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-xl hover:bg-accent"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </motion.div>
        )}

        <div className="flex items-center min-w-0 gap-2">
          <div className="flex items-center gap-2">
            <motion.h2
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05, duration: 0.25 }}
              className="text-sm font-semibold truncate"
            >
              {name}
            </motion.h2>

            <Badge
              variant="outline"
              className={cn(
                "text-[0.625rem] whitespace-nowrap",
                getStatusStyle(selectedChat.ambulance?.status),
              )}
            >
              {selectedChat.ambulance?.status || "FA"}
            </Badge>
          </div>

          <div className="flex items-center gap-1 min-w-0">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.25 }}
              className="text-xs truncate"
            >
              {maskPhoneNumber(phone.replace("+55", ""))}
            </motion.span>

            {phone !== "—" && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyPhone}
                  className="h-6 w-6 rounded-md hover:bg-accent"
                  aria-label="Copiar telefone"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
