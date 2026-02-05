import type { GetChatsStatusItem } from "@/http/generated/connect-server.schemas";
import { STATUS_ORDER } from "@/utils/ambulance-status";
import React, { useContext, useState } from "react";

interface StatusFilterContextProps {
  statusFilter: GetChatsStatusItem[];
  setStatusFilter: React.Dispatch<React.SetStateAction<GetChatsStatusItem[]>>;
}

const StatusFilterContext = React.createContext({} as StatusFilterContextProps);

export function StatusFilterContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [statusFilter, setStatusFilter] = useState<GetChatsStatusItem[]>(
    STATUS_ORDER.filter(
      (s) => s !== "FA" && s !== "MN",
    ) as GetChatsStatusItem[],
  );
  return (
    <StatusFilterContext.Provider value={{ statusFilter, setStatusFilter }}>
      {children}
    </StatusFilterContext.Provider>
  );
}

export const useStatusFilterContext = () => {
  const context = useContext(StatusFilterContext);

  return context;
};
