import type React from "react";

import { motion } from "framer-motion";
import { Send, X, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRecordingTime } from "../../../../utils/chat-utils";
import type { AudioPreview } from "../../../../types/chat.types";
import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";

interface AudioPreviewProps {
  audioPreview: AudioPreview;
  isPlaying: boolean;
  isPaused: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onTogglePlay: () => void;
  onSend: (audioBlob: Blob | null) => void;
  onCancel: () => void;
  onEnded: () => void;
}

export function AudioPreview({
  audioPreview,
  isPlaying,
  isPaused,
  audioRef,
  onTogglePlay,
  onSend,
  onCancel,
  onEnded,
}: AudioPreviewProps) {
  const [progress, setProgress] = useState(0); // 0–100 slider progress
  const [duration, setDuration] = useState(0);

  // Captura duração real do áudio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoaded = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener("loadedmetadata", handleLoaded);
    return () => audio.removeEventListener("loadedmetadata", handleLoaded);
  }, [audioRef]);

  // Atualiza progresso em tempo real
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (!audio.duration) return;
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, [audioRef]);

  // Voltar / avançar no slider
  const handleSeek = (val: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const sliderValue = val[0];
    const newTime = (sliderValue / 100) * audio.duration;

    audio.currentTime = newTime;
    setProgress(sliderValue);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="p-4 bg-card border border-input rounded-xl shadow-lg"
    >
      <div className="flex items-center gap-3">
        {/* Botão play/pause */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="icon"
            onClick={onTogglePlay}
            className="bg-transparent"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isPlaying && !isPaused ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isPlaying && !isPaused ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </motion.div>
          </Button>
        </motion.div>

        {/* Slider + duração */}
        <div className="flex-1 flex items-center gap-3">
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full"
          />

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground font-mono w-12 text-right"
          >
            {formatRecordingTime(Math.floor(duration))}
          </motion.span>
        </div>

        {/* Botão cancelar */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="hover:bg-destructive/10 hover:text-destructive rounded-xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-end gap-2 mt-3"
      >
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>

        <Button
          onClick={() => {
            onSend(audioPreview.blob);
          }}
          animated
        >
          <Send className="w-4 h-4 mr-2" />
          Enviar
        </Button>
      </motion.div>

      <audio
        ref={audioRef}
        src={audioPreview.url}
        onEnded={onEnded}
        className="hidden"
      />
    </motion.div>
  );
}
