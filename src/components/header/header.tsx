import { Menu, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useMemo } from "react";

import Logo from "@/assets/svg/inline.svg";
import { getInitials } from "@/utils/get-initials";
import { queryClient } from "@/lib/react-query";

import { useSignOut } from "@/http/generated/auth/auth";
import { useGetAuthenticatedUser } from "@/http/generated/user/user";

import { Sheet, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Dialog } from "../ui/dialog";
import { Sidebar } from "../sidebar/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useGetAuthenticatedUser();
  const { mutateAsync: signOut } = useSignOut();

  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    queryClient.invalidateQueries();
    queryClient.clear();
    navigate("/authentication");
  };

  // Divide o pathname em partes, ignorando vazios (ex: "" antes do primeiro /)
  const segments = useMemo(
    () => location.pathname.split("/").filter(Boolean),
    [location.pathname]
  );

  // Exibe o botão de voltar apenas se houver 3 ou mais segmentos
  const showBackButton = segments.length >= 3;

  // Calcula o caminho base com 2 segmentos (ex: /company-group/admin)
  const backPath = "/" + segments.slice(0, 2).join("/");

  return (
    <Dialog>
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-8xl h-16 flex items-center gap-4 bg-connect px-6 z-50 transition-all rounded-2xl shadow-md">
        {/* Botão Voltar se tiver 3+ segmentos */}
        {showBackButton ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(backPath)}
            className="hover:bg-white/20"
          >
            <ArrowLeft className="size-5" />
          </Button>
        ) : (
          // Mobile Sidebar Button
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <Sidebar handleClose={() => setOpen(false)} />
          </Sheet>
        )}

        {/* Logo */}
        <img src={Logo} alt="Logo" className="h-10" />

        <div className="flex-1" />

        {/* User */}
        {!user ? (
          <Skeleton className="h-10 w-32 rounded-full" />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="bg-connect cursor-pointer hover:shadow-lg transition-all duration-300">
                {user.data.avatarUrl ? (
                  <AvatarImage src={user.data.avatarUrl} />
                ) : (
                  <AvatarFallback>{getInitials(user.data.name)}</AvatarFallback>
                )}
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="bg-white border border-white shadow-lg space-y-2"
            >
              <DropdownMenuItem onClick={handleSignOut}>
                Sair da conta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>
    </Dialog>
  );
}
