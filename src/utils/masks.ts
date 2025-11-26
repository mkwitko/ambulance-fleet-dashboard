export function maskPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, '');

  if (!digits) return "";

  // (1) D — "(D"
  if (digits.length <= 2) {
    return `(${digits}`;
  }

  // (2) DD — "(DD) "
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  // (3) até 10 dígitos
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  // (4) 11 dígitos — formato 5+4
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function maskCnpj(cnpj: string) {
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export function maskCpf(cpf: string) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function maskCep(cep: string) {
  return cep.replace(/(\d{5})(\d{3})/, '$1-$2')
}

export function currencyMask(value: string) {
  // Mantém apenas os dígitos
  const digits = value.replace(/\D/g, "");

  if (!digits) return "";

  // Converte para número (centavos)
  const number = Number(digits) / 100;

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function removeCurrencyMask(value: string) {
  return value.replace(/[^0-9,-]+/g, "").replace(",", ".");
}