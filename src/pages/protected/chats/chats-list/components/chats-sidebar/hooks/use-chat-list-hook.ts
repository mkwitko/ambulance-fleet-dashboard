import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import { useGetChats } from "@/http/generated/chat/chat";
import { GetChatsPlatform } from "@/http/generated/connectServer.schemas";
import { useEffect } from "react";

export default function useChatListHook() {
  const { queryParams, hasSomePermission } = useGetUserPermissions();

  useEffect(() => {
    console.log("Chat List - Query Params:", queryParams);
  }, [queryParams]);

  // const isAdmin = hasPermission(user?.data, Role["sys_admin:accessAll"]);
  // const hasCompanyGroupPermission = hasPermission(
  //   user?.data,
  //   Role["companyGroup:read"]
  // );
  // const hasCompanyPermission = hasPermission(user?.data, Role["company:read"]);
  // const hasUnitPermissions = hasPermission(user?.data, Role["unit:read"]);

  // const hasSomePermission =
  //   isAdmin ||
  //   hasCompanyGroupPermission ||
  //   hasCompanyPermission ||
  //   hasUnitPermissions;

  const { data: chats, queryKey } = useGetChats(
    {
      ...queryParams,
      // companyGroupId: isAdmin
      //   ? user?.data.companyGroup?.id
      //   : hasCompanyGroupPermission
      //   ? user?.data.companyGroup?.id
      //   : undefined,
      // companiesId:
      //   isAdmin || hasCompanyGroupPermission
      //     ? undefined
      //     : hasCompanyPermission
      //     ? user?.data.companies.map((company) => company.id)
      //     : undefined,
      // unitsId:
      //   isAdmin || hasCompanyGroupPermission || hasCompanyPermission
      //     ? undefined
      //     : hasUnitPermissions
      //     ? user?.data.units.map((unit) => unit.id)
      //     : undefined,
      platform: GetChatsPlatform.WEB,
    },
    {
      query: {
        enabled: hasSomePermission,
      },
    }
  );

  return {
    chats,
    queryKey,
  };
}
