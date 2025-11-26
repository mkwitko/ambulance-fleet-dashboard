import { Header } from "@/components/header/header";
import { useCheckAuth } from "@/http/generated/auth/auth";
import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";

export function AppLayout() {
  const { data, isLoading } = useCheckAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!data) return;
    if (!data.isAuthenticated) {
      navigate("/authentication");
      return;
    }
  }, [isLoading]);

  return (
    <main className="min-h-screen relative w-full max-w-8xl bg-linear-to-t from-primary/20 via-primary/10 to-primary/25">
      {/* Header flutuante */}
      <Header />

      {/* Conteúdo principal */}
      <div className="mx-auto max-w-8xl w-[95%] pt-28 pb-8">
        <Outlet />
      </div>
    </main>
  );
}
