import { Shield, Users, Zap, Search } from "lucide-react";
import { Role, RolesData } from "@/@types/roles";
import type { PresetRole } from "./@types/user-permissions-types";

export const actionTranslations: Record<string, string> = {
  read: "Visualizar",
  create: "Criar",
  update: "Editar",
  delete: "Excluir",
  assignRole: "Atribuir Função",
  createPhoneNumber: "Criar Telefone",
  deletePhoneNumber: "Excluir Telefone",
  updatePhoneNumber: "Editar Telefone",
  switchBase: "Trocar Base",
  switchStatus: "Alterar Status",
  bulkUpdate: "Edição em Massa",
  accessAll: "Acesso Total",
  sendMessage: "Enviar Mensagem",
};

export const resourceTranslations: Record<string, string> = {
  companyGroup: "Grupo Empresarial",
  company: "Empresa",
  unit: "Unidade",
  base: "Base",
  user: "Usuário",
  ambulance: "Ambulância",
  ambulanceDocuments: "Documentos de Ambulância",
  sys_admin: "Administrador do Sistema",
  chat: "Chat",
};

export const presetRoles: PresetRole[] = [
  {
    id: "admin",
    name: "Administrador",
    description: "Acesso total ao sistema",
    icon: Shield,
    color: "from-purple-500 to-pink-500",
    permissions: RolesData.filter((permission) => permission !== Role["sys_admin:accessAll"]),
  },
  {
    id: "manager",
    name: "Gerente",
    description: "Gerenciar unidades e usuários",
    icon: Users,
    color: "from-blue-500 to-cyan-500",
    permissions: [
      "unit:read",
      "unit:create",
      "unit:update",
      "user:read",
      "user:create",
      "user:update",
      "base:read",
      "base:switchBase",
      "ambulance:read",
      "ambulance:update",
    ],
  },
  {
    id: "operator",
    name: "Operador",
    description: "Operações básicas do dia a dia",
    icon: Zap,
    color: "from-green-500 to-emerald-500",
    permissions: [
      "ambulance:read",
      "ambulance:update",
      "base:read",
      "base:switchBase",
      "chat:read",
      "chat:sendMessage",
    ],
  },
  {
    id: "viewer",
    name: "Visualizador",
    description: "Apenas leitura",
    icon: Search,
    color: "from-orange-500 to-amber-500",
    permissions: [
      "companyGroup:read",
      "company:read",
      "unit:read",
      "base:read",
      "user:read",
      "ambulance:read",
      "chat:read",
    ],
  },
];