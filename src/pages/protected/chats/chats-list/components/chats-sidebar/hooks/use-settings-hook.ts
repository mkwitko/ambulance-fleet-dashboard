import { CACHE_KEYS, usePersistedState } from "@/utils/cache";
import { useState } from "react";

export default function useSettingsHook() {
  const [soundEnabled, setSoundEnabled] = usePersistedState(
    CACHE_KEYS.NOTIFICATIONS,
    true
  );
  const [volume, setVolume] = usePersistedState(CACHE_KEYS.VOLUME, 70);

  const [settingsOpen, setSettingsOpen] = useState(false);

  return {
    soundEnabled,
    setSoundEnabled,
    volume,
    setVolume,
    settingsOpen,
    setSettingsOpen,
  };
}
