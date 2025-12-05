"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRecordingTime } from "../../../../utils/chat-utils";

interface RecordingIndicatorProps {
  recordingTime: number;
  onStop: () => void;
  onCancel: () => void;
}

export function RecordingIndicator({
  recordingTime,
  onStop,
  onCancel,
}: RecordingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="flex items-center gap-3 bg-card border border-input rounded-xl p-4 shadow-lg"
    >
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"
      />
      <div className="flex-1">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm font-medium"
        >
          Gravando áudio
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xs text-muted-foreground font-mono"
        >
          {formatRecordingTime(recordingTime)}
        </motion.div>
      </div>
      <motion.div
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="rounded-xl hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="w-5 h-5" />
        </Button>
      </motion.div>
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button onClick={onStop} size="icon" className="rounded-xl">
          <Check className="w-5 h-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
