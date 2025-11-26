import { useGetAuthenticatedUser } from "@/http/generated/user/user";
import { realtimeClient } from "@/utils/ably";
import { useEffect } from "react";
import * as Ably from "ably";

export default function useAbly({
  events,
  handleMessageReceived,
}: {
  events: string[];
  handleMessageReceived: (message: Ably.InboundMessage) => void;
}) {
  const { data: user } = useGetAuthenticatedUser();
  useEffect(() => {
    if (!user) return;

    const channel = realtimeClient.channels.get(
      `connect-${user?.data?.companyGroup?.id}`
    );

    channel.subscribe(events, (message) => {
      handleMessageReceived(message);
    });

    return () => channel.unsubscribe();
  }, [user]);

  return {
    user,
  };
}
