import * as Ably from "ably";
import { useEffect, useRef, useCallback } from "react";
import { createAblyToken } from "../http/generated/radio/radio";
import { useGetAuthenticatedUser } from "../http/generated/user/user";

export default function useAbly({
  events,
  handleMessageReceived,
}: {
  events?: string[];
  handleMessageReceived?: (message: Ably.InboundMessage) => void;
}) {
  const { data: user } = useGetAuthenticatedUser();
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
  }, [user]);

  // 2️⃣ Subscribe
  useEffect(() => {
    if (!user || !clientRef.current || !events) return;

    const channelName = `connect-${user.data?.companyGroup?.id}`;
    const channel = clientRef.current.channels.get(channelName);

    channel.subscribe(events, handleMessageReceived);

    return () => {
      if (channel && handleMessageReceived) {
        channel.unsubscribe(events, handleMessageReceived);
      }
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
    [user]
  );

  return {
    user,
    publish,
  };
}
