import { AmbulanceIcon, Building2, Group, Home, Users } from "lucide-react";
import { SheetContent } from "../ui/sheet";
import { motion } from "framer-motion";

import { useGetAuthenticatedUser } from "@/http/generated/user/user";
import { hasPermission } from "@/utils/permissions";
import { SidebarItem, type NavLinkItem } from "./nav-item";
import { Separator } from "../ui/separator";
import { UserCard } from "./user-card";
import LogoInline from "@/assets/svg/inline.svg";
import { Role } from "@/@types/roles";

interface SidebarProps {
  handleClose: () => void;
}

export function Sidebar({ handleClose }: SidebarProps) {
  const { data: user } = useGetAuthenticatedUser();

  const navItems = [
    {
      type: "link",
      role: Role["companyGroup:read"],
      icon: Building2,
      title: "Grupo Empresarial",
      children: [
        {
          type: "link",
          role: Role["companyGroup:read"],
          to: "/company-group/list",
          icon: Home,
          title: "Detalhes",
        },
        {
          type: "link",
          role: Role["sys_admin:accessAll"],
          to: "/company-group/admin",
          icon: Home,
          title: "Administração",
        },
      ],
    },
    {
      type: "link",
      role: Role["company:read"],
      icon: Group,
      to: "companies/list",
      title: "Empresas",
    },
    {
      type: "link",
      role: Role["unit:read"],
      to: "/units/list",
      icon: Home,
      title: "Unidades",
    },
    {
      type: "link",
      role: Role["base:read"],
      to: "/bases/list",
      icon: Home,
      title: "Bases",
    },
    { type: "separator" },
    {
      type: "link",
      role: Role["user:read"],
      to: "/users",
      icon: Users,
      title: "Usuários",
    },
    {
      type: "link",
      role: Role["ambulance:read"],
      to: "/ambulances",
      icon: AmbulanceIcon,
      title: "Ambulâncias",
    },
  ];

  return (
    <SheetContent
      className="w-[320px] bg-background flex flex-col p-0 border-r border-border/50"
      side="left"
    >
      {/* Decorative linear overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-primary/20 via-transparent to-primary/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Header with logo/brand (opcional) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative px-6 pt-6 pb-2"
      >
        <div className="flex flex-col items-start gap-2">
          <img src={LogoInline} alt="Logo" className="w-20 h-auto" />
          <p className="text-xs leading-0 text-muted-foreground">
            Sistema de Gestão Empresarial
          </p>
        </div>
      </motion.div>

      {/* User Info */}
      <div className="relative">
        {user?.data && <UserCard user={user.data} />}
      </div>

      {/* Navigation */}
      <motion.nav
        className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent hover:scrollbar-thumb-primary/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="space-y-1">
          {navItems.map((item, idx) => {
            if (item.type === "separator") {
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className="my-4 px-3"
                >
                  <Separator className="bg-linear-to-r from-transparent via-border to-transparent" />
                </motion.div>
              );
            }

            if (!hasPermission(user?.data, item.role as string)) return null;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: idx * 0.05,
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <SidebarItem
                  item={item as NavLinkItem}
                  handleClose={handleClose}
                  user={user?.data}
                />
              </motion.div>
            );
          })}
        </div>
      </motion.nav>

      {/* Footer (opcional - versão do sistema, etc) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="relative px-6 py-4 border-t border-border/50 bg-muted/30 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">v2.0.1</span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>Sistema Online</span>
          </div>
        </div>
      </motion.div>
    </SheetContent>
  );
}
