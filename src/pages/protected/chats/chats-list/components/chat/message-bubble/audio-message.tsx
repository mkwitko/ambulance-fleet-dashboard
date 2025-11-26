import { Play, Pause } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { GetChatMessages200DataItem } from "@/http/generated/connectServer.schemas";
import { formatTime } from "../../../utils/chat-utils";

interface Props {
  isCurrentUser: boolean;
  message: GetChatMessages200DataItem;
}

export function AudioMessagePlayer({ isCurrentUser, message }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.paused ? audio.play() : audio.pause();
  };

  // Handlers reutilizados
  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setProgress(audio.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration || 0);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setProgress(0);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [handleTimeUpdate, handleLoadedMetadata, handleEnded]);

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setProgress(value[0]);
  };

  const btnBase =
    "p-2 rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center";
  const btnColors = isCurrentUser
    ? "bg-primary-foreground/20 hover:bg-primary-foreground/30"
    : "bg-primary/60 hover:bg-primary/80 text-white";

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{
        scale: { delay: 0.15, type: "spring", stiffness: 400, damping: 25 },
        opacity: { delay: 0.15, duration: 0.2 },
      }}
      className={cn(
        "max-w-[70%] rounded-2xl px-4 py-2.5 shadow-md hover:shadow-lg transition-shadow",
        isCurrentUser
          ? "bg-primary text-primary-foreground rounded-br-md"
          : "bg-white/70 border border-input rounded-bl-md"
      )}
    >
      <div
        className={`
        w-full min-w-[240px] flex items-center gap-3
        ${isCurrentUser ? "text-primary-foreground" : "text-foreground"}
      `}
      >
        <audio ref={audioRef} src={message.file as string} preload="metadata" />

        <button onClick={togglePlay} className={`${btnBase} ${btnColors}`}>
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        <div className="flex-1 flex flex-col gap-1 pt-3">
          <Slider
            value={[progress]}
            min={0}
            max={duration || 1}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
            sliderPrimitiveClassName="bg-primary/60"
          />

          <div
            className={`
            flex justify-between text-[10px] font-medium tabular-nums
            ${
              isCurrentUser
                ? "text-primary-foreground/70"
                : "text-muted-foreground"
            }
          `}
          >
            <span>{formatSeconds(progress)}</span>
            <span>{formatSeconds(duration)}</span>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "flex items-center justify-start gap-1 mt-1 text-[10px]",
          isCurrentUser
            ? "text-primary-foreground/70"
            : "text-muted-foreground",
          "pl-1.5 pt-1"
        )}
      >
        <span>{formatTime(message.createdAt)}</span>
      </div>
    </motion.div>
  );
}

function formatSeconds(sec: number) {
  if (!sec || Number.isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}
