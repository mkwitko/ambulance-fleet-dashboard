import { AblyEvents } from "@/@types/ably-events";
import useAbly from "@/hooks/use-ably";
import useGlobalPageTitle from "@/hooks/use-global-page-title";
import type { GetChatMessages200DataItem } from "@/http/generated/connect-server.schemas";
import { playNotification } from "@/utils/notification";
import { updateChatUnreadMessages } from "./use-cases/messages/update-chat-unread-messages";
import { updateAmbulanceControlStatus } from "./use-cases/status/update-ambulance-control-status";
import { updateChatStatus } from "./use-cases/status/update-chat-status";
import { updateAmbulanceControlShift } from "./use-cases/shift-status/update-ambulance-control-shift";
import { updateChatReadAt } from "./use-cases/read-chat/update-chat-read-at";
import { updateCommsActivenessResponse } from "./use-cases/activeness-response/update-comms-activeness-response";
import { updateDriverAssociation } from "./use-cases/driver-association/update-driver-association";
import { updateChatPhone } from "./use-cases/update-phone/update-chat-phone";
import { Role } from "@/@types/roles";

export default function useWebSocket() {
  const { user, userPermissions } = useAbly({
    events: [
      {
        event: AblyEvents.messages,
        permissions: [Role["chat:read"]],
      },
      {
        event: AblyEvents.status,
      },
      {
        event: AblyEvents.shiftStatus,
      },
      {
        event: AblyEvents.readChat,
      },
      {
        event: AblyEvents.activenessResponse,
        permissions: [Role["comms:read"]],
      },
      {
        event: AblyEvents.driverAssociation,
        permissions: [Role["driver:read"]],
      },
      {
        event: AblyEvents.updatePhone,
        permissions: [Role["chat:read"]],
      },
    ],
    handleMessageReceived: async (incomingMessage) => {
      if (incomingMessage.name === AblyEvents.messages) {
        const message = incomingMessage.data as GetChatMessages200DataItem;

        // Notificação sonora quando chega alguma mensagem
        playNotification(message, user);

        // Atualiza as mensagens totais não lidas no header do site
        refetchUnreadMessages();

        // Atualiza as mensagens não lidas no chat lateral
        updateChatUnreadMessages({ message });
      }

      if (incomingMessage.name === AblyEvents.status) {
        // Atualiza o status das ambulancias na tela de Controle de VTR
        updateAmbulanceControlStatus({
          incomingMessage,
        });

        // Atualiza o status das ambulancias na tela de conversas
        updateChatStatus({
          incomingMessage,
        });
      }

      if (incomingMessage.name === AblyEvents.shiftStatus) {
        // Atualiza o turno das ambulancias na tela de Controle de VTR
        updateAmbulanceControlShift({
          incomingMessage,
        });
      }

      if (incomingMessage.name === AblyEvents.readChat) {
        // Atualiza o readAt das conversas na tela de conversas
        updateChatReadAt({
          incomingMessage,
        });
      }

      if (incomingMessage.name === AblyEvents.activenessResponse) {
        updateCommsActivenessResponse({
          incomingMessage,
        });
      }

      if (incomingMessage.name === AblyEvents.driverAssociation) {
        updateDriverAssociation({
          incomingMessage,
        });
      }

      if (incomingMessage.name === AblyEvents.updatePhone) {
        updateChatPhone({
          incomingMessage,
        });
      }
    },
  });

  // Atualiza o título da aba com notificações não lidas em todas as páginas protegidas
  const { refetchUnreadMessages } = useGlobalPageTitle({ userPermissions });

  return {
    user,
    userPermissions,
  };
}
