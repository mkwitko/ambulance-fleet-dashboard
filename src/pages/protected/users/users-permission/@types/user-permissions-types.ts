import type { Role } from "@/@types/roles";

export interface PermissionGroup {
  resource: string;
  displayName: string;
  permissions: Array<{
    key: string;
    action: string;
    displayAction: string;
  }>;
}

export interface PresetRole {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  permissions: Role[];
  showTo?: Role[];
  module: string[];
}
