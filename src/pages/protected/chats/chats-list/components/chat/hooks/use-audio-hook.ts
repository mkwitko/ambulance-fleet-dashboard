import { useRef, useState } from "react";
import type { AudioPreview } from "../../../types/chat.types";
import { useSendMessage } from "@/http/generated/chat/chat";
import {
  type GetAuthenticatedUser200Data,
  type GetChats200DataItem,
  SendMessageBodyMessageType,
  SendMessageBodyPlatform,
} from "@/http/generated/connectServer.schemas";
import { generateNewFileWithCustomName } from "@/utils/get-file-name";
import { useGetPressignedUrl } from "@/http/generated/upload/upload";
import { env } from "@/env";
import axios from "axios";
import { toast } from "sonner";

export default function useAudioHook({
  selectedChat,
  user,
  online,
}: {
  selectedChat: GetChats200DataItem | undefined;
  user: GetAuthenticatedUser200Data | undefined;
  online: boolean;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioPreview, setAudioPreview] = useState<AudioPreview | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null); // 🔥 NOVO: controlar se cancelou a gravação
  const cancelledRecordingRef = useRef(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const { mutateAsync: sendMessage } = useSendMessage();
  const { mutateAsync: getPressignedUrl } = useGetPressignedUrl();

  const startRecording = async () => {
    try {
      cancelledRecordingRef.current = false; // 🔥 Reset cancel flag
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        // 🔥 Se foi cancelado, NÃO criar preview
        if (cancelledRecordingRef.current) {
          cancelledRecordingRef.current = false;
          stream.getTracks().forEach((track) => track.stop());
          return;
        } // 🔥 Somente finalização normal → criar preview
        const mimeTypes = ["audio/wav", "audio/webm", "audio/ogg"];
        const selectedMimeType =
          mimeTypes.find((mimeType) =>
            MediaRecorder.isTypeSupported(mimeType)
          ) || "audio/wav";
        const audioBlob = new Blob(audioChunksRef.current, {
          type: selectedMimeType,
        });
        setAudioBlob(audioBlob);
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioPreview({
          url: audioUrl,
          blob: audioBlob,
        });
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Erro ao acessar o microfone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      cancelledRecordingRef.current = false; // 🔥 Não é cancelamento
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleCancelAudio = () => {
    if (audioPreview) {
      setIsPlayingPreview(false);
      URL.revokeObjectURL(audioPreview.url);
      setAudioPreview(null);
      setRecordingTime(0);
    }
  };

  const handleSendAudioMessage = async (audioBlob: Blob | null) => {
    if (!audioBlob) return;

    if (!online) {
      toast.error("Você está offline. Ainda não é possível enviar áudio.");
      return;
      // const offlineId = crypto.randomUUID();
      // const offlineMessage = {
      //   id: offlineId,
      //   selectedChatId: selectedChat?.id as string,
      //   content: "",
      //   messageType: SendMessageBodyMessageType.AUDIO,
      //   user: {
      //     id: user?.id as string,
      //     name: user?.name as string,
      //     avatarUrl: user?.avatarUrl || "",
      //   },
      //   createdAt: new Date().toISOString(),
      //   status: GetChatMessages200DataItemStatus.PENDING,
      //   file: audioBlob,
      // };
      // await connectDatabase.messages.insert(offlineMessage);
      // return;
    }

    setAudioPreview(null);
    setIsPlayingPreview(false);
    setRecordingTime(0);

    const file = new File([audioBlob], "recording.wav", {
      type: audioBlob.type,
    });
    const fileName = generateNewFileWithCustomName(file);

    const { pressignedUrl } = await getPressignedUrl({
      data: {
        folder: "audio",
        fileSize: file?.size || 0,
        fileType: file?.type || "",
        fileName: `${selectedChat?.id}/audio/${fileName}`,
      },
    });

    await axios.put(pressignedUrl, file, {
      headers: {
        "Content-Type": file?.type,
      },
    });

    await sendMessage({
      id: selectedChat?.id as string,
      data: {
        content: "",
        messageType: SendMessageBodyMessageType.AUDIO,
        file: `${env.VITE_STORAGE_URL}/${selectedChat?.id}/audio/${fileName}`,
        user: {
          id: user?.id as string,
          name: user?.name as string,
          avatarUrl: user?.avatarUrl || null,
        },
        platform: SendMessageBodyPlatform.WEB,
      },
    });

    setAudioBlob(null);
  };

  const handleCancelRecording = () => {
    cancelledRecordingRef.current = true; // 🔥 Marcou como cancelado
    setIsRecording(false);
    setAudioPreview(null);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
    setRecordingTime(0);
  };

  const toggleAudioPreview = () => {
    if (!audioPreviewRef.current) return;
    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPaused(true);
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.play();
      setIsPaused(false);
      setIsPlayingPreview(true);
    }
  };

  return {
    audioBlob,
    isRecording,
    startRecording,
    stopRecording,
    recordingTime,
    audioPreview,
    setAudioPreview,
    isPlayingPreview,
    setIsPlayingPreview,
    isPaused,
    setIsPaused,
    toggleAudioPreview,
    audioPreviewRef,
    handleCancelRecording,
    handleCancelAudio,
    handleSendAudioMessage,
  };
}
