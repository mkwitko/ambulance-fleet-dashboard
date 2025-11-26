import {
  useState,
  useMemo,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Search,
  X,
  Volume2,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Role } from "@/@types/roles";
import { useGetChats } from "@/http/generated/chat/chat";
import { useGetAuthenticatedUser } from "@/http/generated/user/user";
import { hasPermission } from "@/utils/permissions";
import {
  getStatusStyle,
  sortByStatusOrder,
  STATUS_ORDER,
} from "@/utils/ambulance-status";
import { AppMultiSelect } from "@/components/app-multi-select";
import { Avatar } from "@/components/ui/avatar";
import { formatInTimeZone } from "date-fns-tz";
import {
  GetChats200DataItemMessagesItemMessageType,
  type GetChats200,
  type GetChats200DataItem,
  type GetChats200DataItemMessagesItem,
} from "@/http/generated/connectServer.schemas";
import { getInitials } from "@/utils/get-initials";
import { queryClient } from "@/lib/react-query";
import { CACHE_KEYS, usePersistedState } from "@/utils/cache";
import * as Ably from "ably";
import { realTimeUpdateChatMessage } from "../realtime/update-chat-message";
import { realTimeUpdateChatStatus } from "../realtime/update-chat-status";

export default function ChatsSidebar({
  selectedChat,
  setSelectedChat,
  incomingMessage,
}: {
  selectedChat: GetChats200DataItem | undefined;
  setSelectedChat: Dispatch<SetStateAction<GetChats200DataItem | undefined>>;
  incomingMessage: Ably.InboundMessage | undefined;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>(STATUS_ORDER);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const [soundEnabled, setSoundEnabled] = usePersistedState(
    CACHE_KEYS.NOTIFICATIONS,
    true
  );
  const [volume, setVolume] = usePersistedState(CACHE_KEYS.VOLUME, 70);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data: user } = useGetAuthenticatedUser();

  const isAdmin = hasPermission(user?.data, Role["sys_admin:accessAll"]);
  const hasCompanyGroupPermission = hasPermission(
    user?.data,
    Role["companyGroup:read"]
  );
  const hasCompanyPermission = hasPermission(user?.data, Role["company:read"]);
  const hasUnitPermissions = hasPermission(user?.data, Role["unit:read"]);

  const hasSomePermission =
    isAdmin ||
    hasCompanyGroupPermission ||
    hasCompanyPermission ||
    hasUnitPermissions;

  const { data: chats, queryKey } = useGetChats(
    {
      companyGroupId: isAdmin
        ? user?.data.companyGroup?.id
        : hasCompanyGroupPermission
        ? user?.data.companyGroup?.id
        : undefined,
      companiesId:
        isAdmin || hasCompanyGroupPermission
          ? undefined
          : hasCompanyPermission
          ? user?.data.companies.map((company) => company.id)
          : undefined,
      unitsId:
        isAdmin || hasCompanyGroupPermission || hasCompanyPermission
          ? undefined
          : hasUnitPermissions
          ? user?.data.units.map((unit) => unit.id)
          : undefined,

      page,
      perPage,
    },
    {
      query: {
        enabled: !!user && hasSomePermission,
      },
    }
  );

  useEffect(() => {
    if (!incomingMessage) return;
    queryClient.setQueryData(queryKey, (oldData: GetChats200 | undefined) => {
      if (!oldData) return oldData;

      if (incomingMessage.name === "messages") {
        return realTimeUpdateChatMessage({
          incomingMessage,
          oldData,
        });
      }
      if (incomingMessage.name === "status") {
        return realTimeUpdateChatStatus({
          incomingMessage,
          oldData,
          setSelectedChat,
        });
      }
    });
  }, [incomingMessage]);

  const getAmbulanceStatus = (chat: any): string | null => {
    return chat?.ambulance?.status ?? null;
  };

  // Filtros (múltiplos status)
  const filteredChats = useMemo(() => {
    let result = chats?.data || [];

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter((c: any) =>
        (c.ambulance?.name || "").toLowerCase().includes(s)
      );
    }

    // Se statusFilter incluir 'all' ou estiver vazio => não filtrar por status
    if (!statusFilter || statusFilter.length === 0) {
      return result;
    }

    const wanted = new Set(statusFilter);
    result = result.filter((c: any) => {
      const st = getAmbulanceStatus(c);
      return st && wanted.has(st);
    });

    return result;
  }, [search, statusFilter, chats?.data]);

  // Paginação
  const totalPages = Math.max(1, Math.ceil(filteredChats.length / perPage));
  const paginatedChats = filteredChats.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  function getLastMessagePreview(
    message: GetChats200DataItemMessagesItem | undefined
  ) {
    if (!message) return "Sem mensagens";

    // Se for texto (puro ou combinado) e existir conteúdo
    if (
      message.messageType === GetChats200DataItemMessagesItemMessageType.TEXT &&
      message.content
    ) {
      return message.content;
    }

    // Outros tipos de mídia
    switch (message.messageType) {
      case GetChats200DataItemMessagesItemMessageType.AUDIO:
        return "🎧 Áudio";
      case GetChats200DataItemMessagesItemMessageType.IMAGE:
        return "🖼️ Imagem";
      case GetChats200DataItemMessagesItemMessageType.VIDEO:
        return "📹 Vídeo";
      case GetChats200DataItemMessagesItemMessageType.DOCUMENT:
        return "📄 Documento";
      default:
        return "Mensagem";
    }
  }

  return (
    <div className="w-[380px] h-full border-r border-input flex flex-col relative bg-transparent">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-input">
        <div>
          <h2 className="text-sm font-semibold">Conversas</h2>
          <p className="text-xs text-muted-foreground">
            {filteredChats.length} conversa
            {filteredChats.length !== 1 ? "s" : ""}
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
                setPage(1);
              }}
              placeholder="Buscar conversa..."
              className="pl-10"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
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
            setStatusFilter(newValue);
            setPage(1);
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
          {paginatedChats.length === 0 ? (
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
              {paginatedChats
                .sort((a, b) => {
                  return sortByStatusOrder(
                    a.ambulance.status,
                    b.ambulance.status
                  );
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
                        onClick={() => setSelectedChat(chat)}
                        className={cn(
                          "px-3 py-3 rounded-xl cursor-pointer transition-all duration-150",
                          "hover:bg-accent/30",
                          isSelected ? "bg-primary/10" : "bg-transparent"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <Avatar className="w-10 h-10 bg-primary/10 text-primary font-semibold flex items-center justify-center">
                            <span>{initials || "—"}</span>
                          </Avatar>

                          <div className="flex-1 flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-sm text-foreground truncate">
                                {name}
                              </h3>
                              {/* unread badge (se existir) */}
                              {/* {chat.unreadCount > 0 && (
                                  <Badge
                                    variant="destructive"
                                    className="h-5 min-w-[20px] px-1.5 text-xs"
                                  >
                                    {chat.unreadCount}
                                  </Badge>
                                )} */}
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] px-2 py-0.5 rounded-full border",
                                  getStatusStyle(chat.ambulance.status)
                                )}
                              >
                                {chat.ambulance.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs text-muted-foreground truncate">
                                {getLastMessagePreview(lastMessage)}
                              </p>
                              <div className="text-[10px] text-muted-foreground">
                                {lastMessage?.createdAt
                                  ? formatInTimeZone(
                                      lastMessage?.createdAt as string,
                                      "UTC",
                                      "dd/MM/yyyy HH:mm"
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

      {/* Pagination */}
      {filteredChats.length > 0 && (
        <div className="border-t border-input p-4 h-24">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span>
              {(page - 1) * perPage + 1}–
              {Math.min(page * perPage, filteredChats.length)} de{" "}
              {filteredChats.length}
            </span>
            <span>
              Página {page} de {totalPages}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="flex-1"
            >
              Próxima
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

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
