import { env } from "@/env";
import * as Ably from "ably";

export const realtimeClient = new Ably.Realtime({
  key: env.VITE_ABLY_API_KEY,
});
