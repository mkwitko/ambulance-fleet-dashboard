import {
  GetChats200DataItemMessagesItemMessageType,
  type GetChats200DataItemMessagesItem,
} from "@/http/generated/connect-server.schemas";

export function getLastMessagePreview(
  message: GetChats200DataItemMessagesItem | undefined,
) {
  if (!message) return "Sem mensagens";

  // Se for texto (puro ou combinado) e existir conteúdo
  if (
    message.messageType === GetChats200DataItemMessagesItemMessageType.TEXT &&
    message.content
  ) {
    return message.content;
  }

  // Outros tipos de mídia
  switch (message.messageType) {
    case GetChats200DataItemMessagesItemMessageType.AUDIO:
      return "🎧 Áudio";
    case GetChats200DataItemMessagesItemMessageType.IMAGE:
      return "🖼️ Imagem";
    case GetChats200DataItemMessagesItemMessageType.VIDEO:
      return "📹 Vídeo";
    case GetChats200DataItemMessagesItemMessageType.DOCUMENT:
      return "📄 Documento";
    default:
      return "Mensagem";
  }
}
