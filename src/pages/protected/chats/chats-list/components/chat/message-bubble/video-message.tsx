import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GetChatMessages200DataItem } from "@/http/generated/connectServer.schemas";
import { formatTime } from "../../../utils/chat-utils";
import { linkify } from "@/utils/chat";

interface VideoMessageProps {
  message: GetChatMessages200DataItem;
  isCurrentUser?: boolean;
}

export function VideoMessage({ message, isCurrentUser }: VideoMessageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fullscreenVideoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const file = message.file;

  const togglePlay = () => {
    const video = isFullscreen ? fullscreenVideoRef.current : videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setIsPlaying(false);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (!video.duration) return;
      setProgress((video.currentTime / video.duration) * 100);
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("loadeddata", () => setIsLoaded(true));

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
    };
  }, []);

  return (
    <>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{
          scale: { delay: 0.15, type: "spring", stiffness: 400, damping: 25 },
          opacity: { delay: 0.15, duration: 0.2 },
        }}
        className={cn(
          "relative rounded-2xl overflow-hidden shadow-md border border-input max-w-[70%] hover:shadow-lg transition-shadow",
          isCurrentUser
            ? "bg-primary text-primary-foreground p-1"
            : "bg-white/70 rounded-bl-md"
        )}
      >
        {/* =============================
              VIDEO + OVERLAY (apenas aqui)
        ============================== */}
        <div className="relative overflow-hidden">
          {/* THUMBNAIL LOADING */}
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
              <div className="h-6 w-6 animate-pulse rounded-full bg-white/60" />
            </div>
          )}

          {/* VIDEO */}
          <video
            ref={videoRef}
            src={file as string}
            playsInline
            onClick={togglePlay}
            className="h-48 w-full object-cover"
          />

          {/* --- OVERLAY SÓ SOBRE O VÍDEO --- */}
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-3 pointer-events-none">
            {/* PLAY/PAUSE */}
            <button
              onClick={togglePlay}
              className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur pointer-events-auto"
            >
              {isPlaying ? (
                <Pause size={20} className="text-white" />
              ) : (
                <Play size={20} className="text-white" />
              )}
            </button>

            {/* PROGRESS BAR */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/30 pointer-events-auto">
              <motion.div
                className="h-full bg-white"
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 90, damping: 20 }}
              />
            </div>

            {/* FULLSCREEN BUTTON */}
            <button
              onClick={toggleFullscreen}
              className="absolute right-2 top-2 rounded-full bg-black/40 p-1 pointer-events-auto"
            >
              <Maximize2 className="text-white" size={18} />
            </button>
          </div>
        </div>

        {/* =============================
                 CAPTION (texto)
        ============================== */}
        {message.content && (
          <div
            className={cn(
              "p-2 pb-0 text-sm",
              isCurrentUser ? "text-primary-foreground" : "text-foreground"
            )}
          >
            {linkify(message.content as string)}
          </div>
        )}

        {/* =============================
                 TIMESTAMP
        ============================== */}
        <div
          className={cn(
            "flex items-center justify-start gap-1 mt-1 text-[10px]",
            isCurrentUser
              ? "text-primary-foreground/70"
              : "text-muted-foreground",
            "px-2 pb-2"
          )}
        >
          <span>{formatTime(message.createdAt)}</span>
        </div>
      </motion.div>

      {/* =============================
           FULLSCREEN VIDEO
      ============================== */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 z-999 flex items-center justify-center bg-black/90 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleFullscreen}
          >
            <motion.video
              ref={fullscreenVideoRef}
              src={file as string}
              controls
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
