import type { GetChatMessages200DataItemMessageType } from "@/http/generated/connectServer.schemas";

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  type?: "text" | "audio" | "image" | "video";
  fileUrl?: string;
  status?: "sending" | "sent" | "delivered" | "read";
}

export interface FilePreview {
  type: GetChatMessages200DataItemMessageType;
  url: string;
  file: File;
}

export interface AudioPreview {
  url: string;
  blob: Blob;
}
