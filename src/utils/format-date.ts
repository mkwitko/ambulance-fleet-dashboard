/**
 * Formata uma data no formato brasileiro: DD/MM/AAAA às HH:mm
 */
export function formatDateBrazilian(value: any): string {
  if (value === null || value === undefined) {
    return "—";
  }

  let date: Date;

  // Detecta se é uma data válida
  if (value instanceof Date) {
    date = value;
    if (isNaN(date.getTime())) {
      return "—";
    }
  } else if (typeof value === "string") {
    // Tenta fazer parse da string
    if (value.trim() === "") {
      return "—";
    }
    date = new Date(value);
    if (isNaN(date.getTime())) {
      // Se não for uma data válida, retorna o valor original
      return value;
    }
  } else if (typeof value === "number") {
    // Pode ser um timestamp
    date = new Date(value);
    if (isNaN(date.getTime())) {
      return String(value);
    }
  } else {
    // Não é uma data, retorna o valor original
    return String(value);
  }

  // Formata no formato brasileiro: DD/MM/AAAA às HH:mm
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}/${month}/${year} às ${hours}:${minutes}`;
}

/**
 * Verifica se um valor é uma data válida
 */
export function isDateValue(value: any): boolean {
  if (!value) return false;

  if (value instanceof Date) {
    return !isNaN(value.getTime());
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  return false;
}
