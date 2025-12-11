import { useState, useEffect, useRef, useCallback } from "react";
import AgoraRTC, {
  type ConnectionState,
  type IAgoraRTCClient,
  type IAgoraRTCRemoteUser,
  type ILocalAudioTrack,
} from "agora-rtc-sdk-ng";
import { toast } from "sonner";

export function useAgora({ onExpire }: { onExpire?: () => void }) {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrackRef = useRef<ILocalAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("DISCONNECTED");
  const [isJoined, setIsJoined] = useState(false);

  // -------------------------
  // INIT CLIENT ONCE
  // -------------------------
  useEffect(() => {
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    AgoraRTC.setLogLevel(2);
    clientRef.current = client;
    return () => {
      clientRef.current?.removeAllListeners();
    };
  }, []);

  // -------------------------
  // JOIN
  // -------------------------
  const join = useCallback(
    async ({
      appId,
      channel,
      token,
      uid,
    }: {
      appId: string;
      channel: string;
      token: string;
      uid: string;
    }) => {
      if (!clientRef.current) return;

      try {
        // Antes de entrar, verifica quantos usuários já estão no canal
        const remoteUsersInChannel = clientRef.current.remoteUsers || [];

        if (remoteUsersInChannel.length >= 2) {
          toast.error("Canal cheio. Máximo de 2 usuários permitidos.");
          return;
        }

        await clientRef.current.join(appId, channel, token, uid);

        // Após entrar, verifica novamente o número de usuários
        // Se já tem 2 usuários remotos (sem contar o local), canal está cheio
        const currentRemoteUsers = clientRef.current.remoteUsers || [];
        if (currentRemoteUsers.length >= 2) {
          await clientRef.current.leave();
          throw new Error("Canal cheio. Máximo de 2 usuários permitidos.");
        }

        // create local audio track
        const localTrack = await AgoraRTC.createMicrophoneAudioTrack();
        localAudioTrackRef.current = localTrack;
        await clientRef.current.publish([localTrack]);
        setIsJoined(true);
      } catch (err) {
        console.error("[AGORA] Join error:", err);
        throw err;
      }
    },
    []
  );

  // -------------------------
  // LEAVE
  // -------------------------
  const leave = useCallback(async () => {
    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      await clientRef.current?.leave();
      setIsJoined(false);
      setRemoteUsers([]);
    } catch (err) {
      console.error("[AGORA] Leave error:", err);
    }
  }, []);

  // -------------------------
  // EVENT HANDLERS
  // -------------------------
  const handleUserPublished = useCallback(
    async (user: IAgoraRTCRemoteUser, mediaType: any) => {
      console.log("User published:", user.uid, mediaType);
      if (!clientRef.current) return;

      // Verifica se já tem 2 usuários (incluindo o local)
      const totalUsers = clientRef.current.remoteUsers.length + 1; // +1 para o usuário local
      if (totalUsers > 2) {
        toast.error("Canal cheio. Máximo de 2 usuários permitidos.");
        return;
      }

      await clientRef.current.subscribe(user, mediaType);
      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.play();
      }
      setRemoteUsers((prev) => {
        // Evita duplicatas
        if (prev.find((u) => u.uid === user.uid)) return prev;
        return [...prev, user];
      });
    },
    []
  );

  const handleUserJoined = useCallback(
    async (user: IAgoraRTCRemoteUser, mediaType: any) => {
      console.log("User joined:", user.uid, mediaType);
      if (!clientRef.current) return;

      // Verifica se já tem 2 usuários (incluindo o local)
      const totalUsers = clientRef.current.remoteUsers.length + 1; // +1 para o usuário local
      if (totalUsers > 2) {
        toast.error("Canal cheio. Máximo de 2 usuários permitidos.");
        return;
      }

      setRemoteUsers((prev) => {
        // Evita duplicatas
        if (prev.find((u) => u.uid === user.uid)) return prev;
        return [...prev, user];
      });
    },
    []
  );

  const handleUserLeft = useCallback((user: IAgoraRTCRemoteUser) => {
    console.log("User left:", user.uid);
    setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
  }, []);

  const handleConnectionStateChange = useCallback(
    (curState: ConnectionState) => {
      setConnectionState(curState);
    },
    []
  );

  const handleWillExpire = useCallback(() => {
    toast.info("Sua sessão está prestes a expirar.");
  }, []);

  const handleDidExpire = useCallback(() => {
    if (onExpire) {
      onExpire();
      return;
    }
    leave();
  }, []);

  // -------------------------
  // REGISTER LISTENERS
  // -------------------------
  useEffect(() => {
    const client = clientRef.current;
    if (!client) return;

    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);
    client.on("connection-state-change", handleConnectionStateChange);
    client.on("token-privilege-will-expire", handleWillExpire);
    client.on("token-privilege-did-expire", handleDidExpire);

    return () => {
      client.on("user-joined", handleUserJoined);
      client.off("user-left", handleUserLeft);
      client.off("connection-state-change", handleConnectionStateChange);
      client.off("token-privilege-will-expire", handleWillExpire);
      client.off("token-privilege-did-expire", handleDidExpire);
    };
  }, [
    handleUserPublished,
    handleUserLeft,
    handleConnectionStateChange,
    handleWillExpire,
    handleDidExpire,
  ]);

  return {
    join,
    leave,
    remoteUsers,
    connectionState,
    isJoined,
    client: clientRef.current,
    localAudioTrack: localAudioTrackRef.current,
  };
}
