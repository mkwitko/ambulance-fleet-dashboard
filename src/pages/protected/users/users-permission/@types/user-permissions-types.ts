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
  permissions: string[];
}