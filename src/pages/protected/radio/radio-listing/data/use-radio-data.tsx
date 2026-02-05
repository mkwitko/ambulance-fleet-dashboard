import { useEffect, useMemo, useState } from "react";
import type { Column } from "@/components/ui/data-table/data-table-types";
import type { GetAmbulances200DataItem } from "@/http/generated/connect-server.schemas";
import { useCreateRadioMeeting } from "@/http/generated/radio/radio";
import { Radio, PhoneOff, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BADGE_STATUS_COLOR } from "@/utils/ambulance-status";
import { useAgora } from "@/utils/agora";
import { AblyEvents, RadioCallTypeEvents } from "@/@types/ably-events";
import useAbly from "@/hooks/use-ably";

export default function useRadioData() {
  const [tryingToConnectToChannel, setTryingToConnectToChannel] = useState<
    string | null
  >(null);
  const [currentAmbulanceId, setCurrentAmbulanceId] = useState<string | null>(
    null,
  );
  const [channelStartTime, setChannelStartTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number>(0);

  const { join, leave, connectionState, isJoined, client, remoteUsers } =
    useAgora({
      onExpire: () => {
        handleLeave(currentAmbulanceId as string);
      },
    });
  const { publish } = useAbly({});
  const { mutateAsync: createRadioMeeting } = useCreateRadioMeeting();

  // Timer para atualizar o tempo restante
  useEffect(() => {
    if (!channelStartTime || !isJoined) {
      setRemainingTime(null);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - channelStartTime) / 1000);
      const channelDuration = tokenExpiresAt; // 1 hora em segundos
      const remaining = Math.max(0, channelDuration - elapsed);

      setRemainingTime(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [channelStartTime, isJoined]);

  useEffect(() => {
    if (connectionState === "CONNECTED") {
      setTryingToConnectToChannel(null);
      setChannelStartTime(Date.now());
    } else if (connectionState === "DISCONNECTED") {
      setChannelStartTime(null);
    }
  }, [connectionState]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calcula total de usuários no canal (remoteUsers + usuário local se conectado)
  const getTotalUsers = (item: GetAmbulances200DataItem) => {
    const isCurrentChannel = client?.channelName === item.id;
    if (isCurrentChannel && isJoined) {
      return remoteUsers.length + 1; // +1 para o usuário local
    }
    return 0;
  };

  const getConnectionStatus = (item: GetAmbulances200DataItem) => {
    if (
      connectionState === "CONNECTING" &&
      item.id === tryingToConnectToChannel
    ) {
      return { status: "connecting", label: "Conectando" };
    }
    const isCurrentChannel = client?.channelName === item.id;
    if (isCurrentChannel && connectionState === "CONNECTED") {
      return { status: "connected", label: "Conectado" };
    }
    return { status: "disconnected", label: "Desligado" };
  };

  const handleCall = async (ambulanceId: string) => {
    try {
      setTryingToConnectToChannel(ambulanceId);
      setCurrentAmbulanceId(ambulanceId);
      if (isJoined) await leave();

      const response = await createRadioMeeting({
        data: { ambulanceId },
      });

      setTokenExpiresAt(response.expirationSeconds);

      await join({
        appId: response.appId,
        channel: ambulanceId,
        token: response.rtcToken,
        uid: response.uid as string,
      });

      publish(AblyEvents.radioCall, {
        ambulanceId,
        type: RadioCallTypeEvents.calling,
      });
    } catch (error: any) {
      console.error("Error calling:", error);
      setTryingToConnectToChannel(null);
    }
  };

  const handleLeave = async (ambulanceId: string) => {
    try {
      await leave();
      setTryingToConnectToChannel(null);
      setChannelStartTime(null);
      setRemainingTime(null);
      publish(AblyEvents.radioCall, {
        ambulanceId,
        type: RadioCallTypeEvents.ended,
      });
    } catch (error) {
      console.error("Error leaving:", error);
    }
  };

  const columns: Column<GetAmbulances200DataItem>[] = useMemo(
    () => [
      {
        key: "name",
        label: "Nome",
        search: true,
      },
      {
        key: "status",
        label: "Status",
        render: (item) => {
          return (
            <Badge className={BADGE_STATUS_COLOR[item.status]}>
              {item.status}
            </Badge>
          );
        },
      },
      {
        label: "Conexão",
        render: (item) => {
          const { status, label } = getConnectionStatus(item);

          const variants = {
            connected: "bg-primary text-white",
            connecting: "bg-warning text-white",
            disconnected: "bg-gray-200 text-gray-700",
          };

          return (
            <Badge
              className={cn(
                variants[status as keyof typeof variants],
                "transition-all duration-300",
              )}
            >
              {label}
            </Badge>
          );
        },
      },
      {
        label: "Tempo Restante",
        render: (item) => {
          const { status } = getConnectionStatus(item);

          if (status === "connected" && remainingTime !== null) {
            return (
              <Badge
                variant="outline"
                className={cn(
                  "flex items-center gap-1 w-fit",
                  remainingTime < 300
                    ? "border-destructive text-destructive bg-destructive/10 animate-pulse"
                    : "border-primary text-primary",
                )}
              >
                <Clock className="h-3 w-3" />
                {formatTime(remainingTime)}
              </Badge>
            );
          }

          return <span className="text-gray-400 text-sm">-</span>;
        },
      },
      {
        label: "Usuários",
        render: (item) => {
          const { status } = getConnectionStatus(item);
          const totalUsers = getTotalUsers(item);
          const isChannelFull = totalUsers >= 2;

          if (status === "connected") {
            return (
              <Badge
                variant="outline"
                className={cn(
                  "flex items-center gap-1 w-fit",
                  isChannelFull
                    ? "border-red-500 text-red-600 bg-red-50"
                    : "bg-primary text-white",
                )}
              >
                <Users className="h-3 w-3" />
                {totalUsers}/2
              </Badge>
            );
          }

          return <span className="text-gray-400 text-sm">-</span>;
        },
      },
      {
        label: "Ligação",
        render: (item) => {
          const { status } = getConnectionStatus(item);
          const isConnected = status === "connected";
          const isConnecting = status === "connecting";

          if (isConnected || isConnecting) {
            return (
              <button
                onClick={() => {
                  handleLeave(item.id);
                }}
                disabled={isConnecting}
                className="min-w-[120px] bg-destructive text-white px-4 py-2 rounded-md flex items-center justify-center hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <PhoneOff className="h-4 w-4 mr-2" />
                Desligar
              </button>
            );
          }

          return (
            <button
              onClick={() => handleCall(item.id)}
              className="min-w-[120px] bg-primary text-white px-4 py-2 rounded-md flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Radio className="h-4 w-4 mr-2" />
              Ligar
            </button>
          );
        },
      },
      {
        label: "Microfone",
        align: "center",
        render: (item) => {
          const { status } = getConnectionStatus(item);
          const isConnected = status === "connected";
          const totalUsers = getTotalUsers(item);
          const isChannelFull = totalUsers >= 2;
          return (
            <div
              className={cn("w-4 h-4 rounded-full", {
                "bg-red-500": !isChannelFull,
                "bg-green-500": isConnected && isChannelFull,
                "bg-gray-500": !isConnected,
              })}
            />
          );
        },
      },
    ],
    [
      connectionState,
      isJoined,
      client,
      tryingToConnectToChannel,
      remainingTime,
      remoteUsers,
    ],
  );

  return {
    columns,
    connectionState,
    isJoined,
    remainingTime,
    formattedTime: remainingTime !== null ? formatTime(remainingTime) : null,
    totalUsers: isJoined && client ? remoteUsers.length + 1 : 0,
  };
}
