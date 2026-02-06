import * as Ably from "ably";
import { useEffect, useRef, useCallback } from "react";
import { createAblyToken } from "../http/generated/radio/radio";
import {
  useGetAuthenticatedUserAssociations,
  useGetAuthenticatedUserPermissions,
} from "../http/generated/user/user";
import type { Role } from "@/@types/roles";
import { hasPermission } from "@/utils/permissions";

export interface EventsType {
  event: string;
  permissions?: Role[];
}

export default function useAbly({
  events,
  handleMessageReceived,
}: {
  events?: EventsType[];
  handleMessageReceived?: (message: Ably.InboundMessage) => void;
}) {
  const { data: user } = useGetAuthenticatedUserAssociations();
  const { data: userPermissions } = useGetAuthenticatedUserPermissions({
    query: {
      enabled: events?.some(({ permissions }) => !!permissions),
    },
  });
  const clientRef = useRef<Ably.Realtime | null>(null);

  // 1️⃣ Create client ONLY when user exists
  useEffect(() => {
    if (!user || clientRef.current || !user.data?.companyGroup?.id) return;

    clientRef.current = new Ably.Realtime({
      autoConnect: true,
      authCallback: async (_, callback) => {
        const tokenRequest = await createAblyToken({
          channel: `connect-${user.data.companyGroup?.id}`,
        });
        callback(null, tokenRequest.tokenRequest as any);
      },

      echoMessages: false,
      closeOnUnload: true,
      recover: (_, cb) => cb(true),
      disconnectedRetryTimeout: 2000,
      suspendedRetryTimeout: 5000,
      transportParams: { remainActive: true },
    });

    return () => {
      clientRef.current?.close();
      clientRef.current = null;
    };
  }, [user]);

  // 2️⃣ Subscribe
  useEffect(() => {
    if (
      !clientRef.current ||
      !user ||
      !events?.length ||
      !handleMessageReceived
    ) {
      return;
    }

    const channelName = `connect-${user.data?.companyGroup?.id}`;
    const channel = clientRef.current.channels.get(channelName);

    const allowedEvents = events.filter(
      ({ permissions }) =>
        !permissions || hasPermission(userPermissions?.data, permissions),
    );

    allowedEvents.forEach(({ event }) => {
      channel.subscribe(event, handleMessageReceived);
    });

    return () => {
      allowedEvents.forEach(({ event }) => {
        channel.unsubscribe(event, handleMessageReceived);
      });
    };
  }, [user, events]);

  // 3️⃣ SAFE publish helper
  const publish = useCallback(
    async (event: string, payload: unknown) => {
      if (!clientRef.current || !user) {
        throw new Error("Ably not ready");
      }

      const channelName = `connect-${user.data?.companyGroup?.id}`;
      const channel = clientRef.current.channels.get(channelName);

      // Ensure connection
      if (clientRef.current.connection.state !== "connected") {
        await new Promise<void>((resolve) => {
          clientRef.current!.connection.once("connected", () => resolve());
        });
      }

      channel.publish(event, payload);
    },
    [user],
  );

  return {
    user,
    userPermissions,
    publish,
  };
}
