import { env } from "@/env";
import { useSendMessage } from "@/http/generated/chat/chat";
import {
  GetChatMessages200DataItemMessageType,
  SendMessageBodyPlatform,
  type GetAuthenticatedUser200Data,
  type GetChats200DataItem,
} from "@/http/generated/connectServer.schemas";
import { useGetPressignedUrl } from "@/http/generated/upload/upload";
import { generateNewFileWithCustomName } from "@/utils/get-file-name";
import axios from "axios";
import { useEffect, useState } from "react";
import type { FilePreviewType } from "../../../types/chat.types";
import { toast } from "sonner";

export default function useFileHook({
  selectedChat,
  user,
  message,
  setMessage,
  online,
}: {
  selectedChat: GetChats200DataItem | undefined;
  user: GetAuthenticatedUser200Data | undefined;
  message: string;
  setMessage: (value: string) => void;
  online: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [filePreview, setFilePreview] = useState<FilePreviewType | null>(null);

  const { mutateAsync: sendMessage } = useSendMessage();
  const { mutateAsync: getPressignedUrl } = useGetPressignedUrl();

  const handleSendFile = async () => {
    if (!filePreview) return;
    if (!online) {
      toast.error(
        "Você está offline. Não é possível enviar arquivos no momento."
      );
      return;
    }

    setIsLoading(true);

    const file = filePreview.file;
    const fileName = generateNewFileWithCustomName(file);
    const folder =
      filePreview.type === GetChatMessages200DataItemMessageType.IMAGE
        ? "image"
        : filePreview.type === GetChatMessages200DataItemMessageType.VIDEO
        ? "video"
        : "document";

    const { pressignedUrl } = await getPressignedUrl({
      data: {
        folder,
        fileSize: file?.size || 0,
        fileType: file?.type || "",
        fileName: `${selectedChat?.id}/${folder}/${fileName}`,
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
        content: message,
        messageType: filePreview.type,
        file: `${env.VITE_STORAGE_URL}/${selectedChat?.id}/${folder}/${fileName}`,
        user: {
          id: user?.id as string,
          name: user?.name as string,
          avatarUrl: user?.avatarUrl || null,
        },
        platform: SendMessageBodyPlatform.WEB,
      },
    });

    setFilePreview(null);
    setMessage("");
    setIsLoading(false);
  };

  const handleCancelFile = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview.url);
      setFilePreview(null);
    }
  };

  useEffect(() => {
    console.log("File Preview Changed:", filePreview);
  }, [filePreview]);

  return {
    filePreview,
    setFilePreview,
    handleSendFile,
    handleCancelFile,
    isLoading,
  };
}
