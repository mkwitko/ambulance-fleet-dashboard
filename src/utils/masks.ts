export function maskPhoneNumber(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, '')

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phoneNumber
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

export function currencyMask(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
