export const PASSWORD_RULES = {
  min: 8,
  upper: /[A-Z]/,
  lower: /[a-z]/,
  digit: /\d/,
  special: /[^A-Za-z0-9]/,
};

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[\s\-()+.]/g, '');
  return /^\d{7,15}$/.test(digits);
}

export function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (password.length < PASSWORD_RULES.min) {
    errors.push(`La contraseña debe tener al menos ${PASSWORD_RULES.min} caracteres`);
  }
  if (!PASSWORD_RULES.upper.test(password)) {
    errors.push('Debe incluir al menos una letra mayúscula');
  }
  if (!PASSWORD_RULES.lower.test(password)) {
    errors.push('Debe incluir al menos una letra minúscula');
  }
  if (!PASSWORD_RULES.digit.test(password)) {
    errors.push('Debe incluir al menos un número');
  }
  if (!PASSWORD_RULES.special.test(password)) {
    errors.push('Debe incluir al menos un carácter especial');
  }
  return errors;
}

export function validateText(field: string, value: string, min: number, max: number, label: string): string | null {
  const v = (value || '').trim();
  if (v.length < min) return `${label} debe tener al menos ${min} caracteres`;
  if (v.length > max) return `${label} no debe superar ${max} caracteres`;
  return null;
}
