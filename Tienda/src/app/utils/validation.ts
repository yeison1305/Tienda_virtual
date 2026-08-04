export const PASSWORD_RULES: { re: RegExp; label: string }[] = [
  { re: /.{8,}/, label: 'Mínimo 8 caracteres' },
  { re: /[A-Z]/, label: 'Una mayúscula' },
  { re: /[a-z]/, label: 'Una minúscula' },
  { re: /\d/, label: 'Un número' },
  { re: /[^A-Za-z0-9]/, label: 'Un carácter especial' },
];

export function passwordErrors(password: string): string[] {
  return PASSWORD_RULES.filter((rule) => !rule.re.test(password)).map((rule) => rule.label);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[\s\-()+.]/g, '');
  return /^\d{7,15}$/.test(digits);
}
