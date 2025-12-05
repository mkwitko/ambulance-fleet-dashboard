import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface ChatTopOverlayProps {
  isFetching: boolean;
  value?: string | null;
  loadingText?: string;
  minDuration?: number;
}

export function ChatTopOverlay({
  isFetching,
  value,
  loadingText = "Carregando...",
  minDuration = 600,
}: ChatTopOverlayProps) {
  const [showLoading, setShowLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isFetching) {
      setShowLoading(true);
      if (timerRef.current) clearTimeout(timerRef.current);
    } else {
      timerRef.current = setTimeout(() => {
        setShowLoading(false);
      }, minDuration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isFetching, minDuration]);

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50">
      <AnimatePresence mode="wait">
        {showLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="
              p-2
              rounded-full
              text-xs font-medium
              text-foreground/80
              backdrop-blur-xl
              bg-background/95
              border border-input
              shadow-lg shadow-black/5
              flex items-center gap-2
              min-w-[110px]
            "
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            <span>{loadingText}</span>
          </motion.div>
        ) : (
          value && (
            <motion.div
              key={value}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="
                p-2
                rounded-full
                text-xs font-medium
                text-foreground/80
                backdrop-blur-xl
                bg-background/95
                border border-input
                shadow-lg shadow-black/5
                min-w-[110px]
                text-center
              "
            >
              {value}
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
