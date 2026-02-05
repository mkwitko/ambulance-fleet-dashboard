import { type Dispatch, type SetStateAction, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Search, X, Volume2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getStatusStyle,
  sortByStatusOrder,
  STATUS_ORDER,
} from "@/utils/ambulance-status";
import { AppMultiSelect } from "@/components/app-multi-select";
import { Avatar } from "@/components/ui/avatar";
import { formatInTimeZone } from "date-fns-tz";
import {
  ReadChatBodyPlatform,
  type GetChats200DataItem,
  type GetChatsStatusItem,
} from "@/http/generated/connect-server.schemas";
import { getInitials } from "@/utils/get-initials";
import * as Ably from "ably";
import useChatListHook from "./hooks/use-chat-list-hook";
import useSearchChatListHook from "./hooks/use-search-chat-list-hook";
import useSettingsHook from "./hooks/use-settings-hook";
import useChatsSidebarRealtimeUpdateHook from "./hooks/use-chats-sidebar-realtime-updates-hook";
import { getLastMessagePreview } from "./utils/get-last-message-preview";
import { useReadChat } from "@/http/generated/chat/chat";

export default function ChatsSidebar({
  selectedChat,
  setSelectedChat,
  incomingMessage,
}: {
  selectedChat: GetChats200DataItem | undefined;
  setSelectedChat: Dispatch<SetStateAction<GetChats200DataItem | undefined>>;
  incomingMessage: Ably.InboundMessage | undefined;
}) {
  const {
    soundEnabled,
    setSoundEnabled,
    volume,
    setVolume,
    settingsOpen,
    setSettingsOpen,
  } = useSettingsHook();

  // Primeiro, precisamos definir o statusFilter inicial
  const [statusFilter, setStatusFilter] = useState<GetChatsStatusItem[]>(
    STATUS_ORDER.filter(
      (s) => s !== "FA" && s !== "MN",
    ) as GetChatsStatusItem[],
  );

  const { chats, queryKey } = useChatListHook({ statusFilter });

  // Agora usamos o hook de busca com os chats carregados
  const {
    search,
    setSearch,
    filteredChats: actualFilteredChats,
  } = useSearchChatListHook({
    chats,
  });

  useChatsSidebarRealtimeUpdateHook({
    incomingMessage,
    queryKey,
    setSelectedChat,
  });

  const { mutateAsync: readChat } = useReadChat();

  return (
    <div className="w-95 h-full border-r border-input flex flex-col relative bg-transparent">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-input">
        <div>
          <h2 className="text-sm font-semibold">Conversas</h2>
          <p className="text-xs text-muted-foreground">
            {actualFilteredChats.length} conversa
            {actualFilteredChats.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSettingsOpen(true)}
          className="hover:bg-accent transition-all duration-200 rounded-xl"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative w-full hover:scale-[1.02] transition-all duration-200">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              placeholder="Buscar conversa..."
              className={cn("pl-10", search && "pr-10")}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Multi-select de status */}
        <AppMultiSelect
          value={statusFilter}
          onValueChange={(value) => {
            // garante array
            const newValue = Array.isArray(value) ? value : [value];
            setStatusFilter(newValue as typeof statusFilter);
          }}
          items={STATUS_ORDER.map((status) => ({
            value: status,
            label: status,
          }))}
          placeholder="Todos os status"
        />
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 px-2">
        <AnimatePresence mode="wait">
          {actualFilteredChats.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center h-[400px] text-center px-4"
            >
              <div className="w-16 h-16 rounded-full bg-accent/50 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                Nenhum chat encontrado
              </h3>
              <p className="text-xs text-muted-foreground">
                Tente ajustar sua busca ou filtros
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2 pb-2">
              {actualFilteredChats
                .sort((a, b) => {
                  return sortByStatusOrder(
                    a.ambulance.status,
                    b.ambulance.status,
                  );
                })
                .sort((a, b) => {
                  return a.lastMessageAt && b.lastMessageAt
                    ? new Date(b.lastMessageAt).getTime() -
                        new Date(a.lastMessageAt).getTime()
                    : 0;
                })
                .map((chat, index: number) => {
                  const isSelected = chat.id === selectedChat?.id;
                  const lastMessage = chat.messages?.[0];

                  // avatar initials
                  const name = chat.ambulance?.name ?? "—";
                  const initials = getInitials(name);

                  return (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.18, delay: index * 0.02 }}
                    >
                      {/* Card estilo WhatsApp: plano, hover leve */}
                      <div
                        onClick={() => {
                          setSelectedChat(chat);
                          if (
                            chat?.unreadCountWeb &&
                            chat?.unreadCountWeb > 0
                          ) {
                            readChat({
                              id: chat.id,
                              data: {
                                platform: ReadChatBodyPlatform.WEB,
                                unitId: chat.ambulance.unitId,
                              },
                            });
                          }
                        }}
                        className={cn(
                          "px-3 py-3 rounded-xl cursor-pointer transition-all duration-150",
                          "hover:bg-accent/30",
                          isSelected ? "bg-primary/10" : "bg-transparent",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <Avatar className="w-10 h-10 bg-primary/10 text-primary font-semibold flex items-center justify-center">
                            <span>{initials || "—"}</span>
                          </Avatar>

                          <div className="flex-1 flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm text-foreground truncate flex-1">
                                {name}
                              </h3>

                              <div className="flex items-center gap-2">
                                {/* Unread badge */}
                                {chat.unreadCountWeb > 0 && (
                                  <Badge variant="default">
                                    {chat.unreadCountWeb > 99
                                      ? "99+"
                                      : chat.unreadCountWeb}
                                  </Badge>
                                )}

                                {/* Status badge */}
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] px-2 py-0.5 rounded-full border",
                                    getStatusStyle(chat.ambulance.status),
                                  )}
                                >
                                  {chat.ambulance.status}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs text-muted-foreground truncate flex-1">
                                {getLastMessagePreview(lastMessage)}
                              </p>
                              <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                                {lastMessage?.createdAt
                                  ? formatInTimeZone(
                                      lastMessage?.createdAt as string,
                                      "UTC",
                                      "dd/MM/yyyy HH:mm",
                                    )
                                  : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* Settings Drawer */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
              className="absolute inset-0 backdrop-blur-sm z-40 rounded-xl"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 w-full h-full bg-white/70 z-50 flex flex-col rounded-l-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4">
                <h3 className="text-sm font-semibold">Configurações</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSettingsOpen(false)}
                  className="hover:bg-accent rounded-xl"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                  {/* Volume */}
                  <div className="p-6 bg-white/70 rounded-xl border border-input">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Volume2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Volume</p>
                        <p className="text-xs text-muted-foreground">
                          Ajuste o volume das notificações
                        </p>
                      </div>
                    </div>
                    <Slider
                      value={[volume]}
                      onValueChange={(v) => setVolume(v[0])}
                      max={100}
                      step={10}
                      className="mb-2"
                    />
                    <p className="text-sm font-medium text-right text-primary">
                      {volume}%
                    </p>
                  </div>

                  {/* Sound */}
                  <div className="p-6 bg-white/70 rounded-xl border border-input">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Bell className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            Som das notificações
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Ativar alertas sonoros
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={soundEnabled}
                        onCheckedChange={setSoundEnabled}
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <p className="text-xs text-muted-foreground mb-2 text-center">
                As configurações são salvas automaticamente.
              </p>

              {/* Footer */}
              <div className="p-4 border-t border-input">
                <Button
                  onClick={() => setSettingsOpen(false)}
                  className="w-full"
                >
                  Fechar
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
