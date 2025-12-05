import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useCheckAuth } from "@/http/generated/auth/auth";

export function PublicLayout() {
  const { data, isLoading } = useCheckAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!data) return;
    if (data.isAuthenticated) {
      navigate("/chats/list");
      return;
    }

    navigate("/authentication");
  }, [data]);

  if (isLoading) return null;

  return (
    <main className="flex h-screen w-full items-center justify-center bg-muted">
      <Outlet />
    </main>
  );
}
