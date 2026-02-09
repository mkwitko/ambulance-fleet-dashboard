import { Header } from "@/components/header/header";
import { useCheckAuth } from "@/http/generated/auth/auth";
import { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import useWebSocket from "@/websocket/use-websocket";
import { useGetUserModules } from "@/http/generated/module/module";
import { hasPermission } from "@/utils/permissions";
import { Role } from "@/@types/roles";
import { hasModule } from "@/utils/modules";

export function AppLayout() {
  const { data, isFetching } = useCheckAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, userPermissions } = useWebSocket();

  const { data: userModules, isFetching: isFetchingUserModules } =
    useGetUserModules(
      {
        userId: user?.data.id as string,
      },
      {
        query: {
          enabled: !!user?.data.id,
        },
      },
    );

  useEffect(() => {
    if (isFetching || isFetchingUserModules) return;
    if (!data?.isAuthenticated) {
      navigate("/authentication");
      return;
    }

    // Se autenticado e está no path raiz
    if (location.pathname === "/") {
      if (
        hasModule(["Chat"], userModules) &&
        hasPermission(userPermissions?.data, Role["chat:read"])
      ) {
        navigate("/chats/list", { replace: true });
        return;
      }

      if (hasPermission(userPermissions?.data, Role["company:read"])) {
        navigate("/companies/list", { replace: true });
        return;
      }

      if (hasPermission(userPermissions?.data, Role["unit:read"])) {
        navigate("/units/list", { replace: true });
        return;
      }

      if (hasPermission(userPermissions?.data, Role["base:read"])) {
        navigate("/bases/list", { replace: true });
        return;
      }
    }
  }, [isFetching, isFetchingUserModules]);

  return (
    <main className="min-h-screen relative w-full max-w-8xl bg-linear-to-t from-primary/20 via-primary/10 to-primary/25">
      {/* Header flutuante */}
      <Header />

      {/* Conteúdo principal */}
      <div className="mx-auto max-w-8xl w-[95%] pt-24 pb-8">
        <Outlet />
      </div>
    </main>
  );
}
