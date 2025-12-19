import type {
  GetAuthenticatedUserAssociations200,
  GetChatMessages200DataItem,
} from "@/http/generated/connectServer.schemas";
import { CACHE_KEYS, getCachedItem } from "./cache";

export const playNotification = (
  message: GetChatMessages200DataItem,
  user: GetAuthenticatedUserAssociations200 | undefined
) => {
  if (message.user.id === user?.data?.id) return; // Don't play sound for own messages

  const notificationsEnabled = getCachedItem(CACHE_KEYS.NOTIFICATIONS, true);
  const volume = getCachedItem(CACHE_KEYS.VOLUME, 100) / 100;

  if (!notificationsEnabled) return;

  try {
    const audio = new Audio("/notification.mp3");
    audio.load();
    audio.volume = volume;
    audio.play().catch((err) => {
      console.error("Erro ao tocar áudio:", err);
    });
  } catch (error) {
    console.error("Erro ao tocar notificação:", error);
  }
};
