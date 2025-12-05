import { useEffect, useState } from "react";

export default function useOfflineHook() {
  const [online, setOnline] = useState(true);

  // const handleOnline = async () => {
  //   const offlineData = offlineMessages.map((m) => m.toJSON());

  //   for (const offlineMessage of offlineData) {
  //     try {
  //       await sendMessage({
  //         id: offlineMessage.chatId as string,
  //         data: {
  //           content: offlineMessage.content,
  //           messageType:
  //             offlineMessage.messageType as SendMessageBodyMessageType,
  //           user: {
  //             id: offlineMessage.user.id,
  //             name: offlineMessage.user.name,
  //             avatarUrl: offlineMessage.user.avatarUrl || null,
  //           },
  //           platform: SendMessageBodyPlatform.WEB,
  //           offlineId: offlineMessage.id,
  //         },
  //       });
  //       // Se enviado com sucesso, remova a mensagem offline do banco de dados
  //       await connectDatabase.messages
  //         .findOne(offlineMessage.id)
  //         .exec()
  //         .then((doc) => doc?.remove());

  //       setMessages((prev) => prev.filter((m) => m.id !== offlineMessage.id));
  //     } catch (error) {
  //       console.log("Failed to send offline message:", error);
  //     }
  //   }
  // };

  useEffect(() => {
    window.addEventListener("online", () => setOnline(true));
    window.addEventListener("offline", () => setOnline(false));

    return () => {
      window.removeEventListener("online", () => setOnline(true));
      window.removeEventListener("offline", () => setOnline(false));
    };
  }, []);

  return {
    online,
  };
}
