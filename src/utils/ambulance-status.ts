// statusConfig.ts

export const STATUS_COLORS: Record<string, string> = {
  QAP: "#82d612", // Pronto para ocorrência
  OCP: "#0048f7", // Ocupado
  EVT: "#e500fc", // Evento
  J4:  "#FF8C0B", // Em alimentação
  J5:  "#ff8700", // Em abastecimento
  FA:  "#000000", // Fora de ação
  MN:  "#f40b38", // Manutenção
};

/**
 * BADGES AJUSTADOS
 * Os tons foram aproximados para a paleta Tailwind mais próxima das cores originais.
 */
export const BADGE_STATUS_COLOR: Record<string, string> = {
  QAP: "bg-lime-500/10 text-lime-700 border-lime-500/30",        // #82d612
  OCP: "bg-blue-600/10 text-blue-700 border-blue-600/30",        // #0048f7
  EVT: "bg-fuchsia-600/10 text-fuchsia-700 border-fuchsia-600/30", // #e500fc
  J4:  "bg-orange-500/10 text-orange-700 border-orange-500/30",  // #FF8C0B
  J5:  "bg-amber-500/10 text-amber-700 border-amber-500/30",     // #ff8700
  FA:  "bg-neutral-800/10 text-neutral-900 border-neutral-800/30", // #000000
  MN:  "bg-red-600/10 text-red-700 border-red-600/30",           // #f40b38
};

export function getStatusStyle(status?: string) {
  if (!status) return "bg-muted/10 text-muted-foreground border-border";
  return (
    BADGE_STATUS_COLOR[status] ??
    "bg-muted/10 text-muted-foreground border-border"
  );
}

export const STATUS_LABELS: Record<string, string> = {
  QAP: "Pronto para ocorrência",
  OCP: "Ocupado",
  EVT: "Evento",
  J4:  "Em alimentação",
  J5:  "Em abastecimento",
  FA:  "Fora de ação",
  MN:  "Manutenção",
};

// Ordem oficial (sorting)
export const STATUS_ORDER = [
  "QAP",
  "OCP",
  "EVT",
  "J4",
  "J5",
  "FA",
  "MN",
];

// =============== FUNÇÕES UTILITÁRIAS ====================

// Cor HEX pelo status
export function getStatusColor(status: string): string {
  return STATUS_COLORS[status] ?? "#999999"; // fallback cinza
}

// Nome traduzido
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

// Sorting baseado na ordem STATUS_ORDER
export function sortByStatusOrder(a: string, b: string): number {
  return STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b);
}
