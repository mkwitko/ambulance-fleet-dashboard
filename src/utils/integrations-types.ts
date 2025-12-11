import { GetIntegrationsId200DataIntegrationType } from "@/http/generated/connectServer.schemas";

export function translateIntegrationType(
  type?: keyof typeof GetIntegrationsId200DataIntegrationType
): string {
  if (!type) return "-";

  const map: Record<
    keyof typeof GetIntegrationsId200DataIntegrationType,
    string
  > = {
    DRIVERS: "Motoristas",
    IRIS: "Iris",
  };

  return map[type] ?? type;
}
