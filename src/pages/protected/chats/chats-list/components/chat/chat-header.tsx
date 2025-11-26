import { motion } from "framer-motion";
import { ArrowLeft, Phone, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GetChats200DataItem } from "@/http/generated/connectServer.schemas";
import { getStatusStyle } from "@/utils/ambulance-status";

interface ChatHeaderProps {
  selectedChat: GetChats200DataItem;
  onBack?: () => void;
}

export function ChatHeader({ selectedChat, onBack }: ChatHeaderProps) {
  const name = selectedChat.ambulance?.name ?? "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="border-b border-input backdrop-blur-sm"
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="hover:bg-accent rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-sm font-semibold"
          >
            {name}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Badge
              variant="outline"
              className={cn(
                "text-[0.625rem]",
                getStatusStyle(selectedChat.ambulance?.status)
              )}
            >
              {selectedChat.ambulance?.status || "FA"}
            </Badge>
          </motion.div>
        </div>
        <div className="flex items-center gap-1">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent rounded-xl transition-colors"
            >
              <Phone className="w-5 h-5" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent rounded-xl transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
