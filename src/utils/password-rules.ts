/**
 * Regras de senha forte do cadastro. Espelham `PasswordPolicy` do backend
 * (`Printly.Application`): mudar uma regra aqui exige mudar lá também.
 * O login NÃO usa estas regras (senhas antigas continuam válidas).
 */
export interface PasswordRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_MIN_LENGTH = 8;

/**
 * O BCrypt do backend ignora o que passa de 72 bytes UTF-8 (não caracteres):
 * letras acentuadas ocupam 2 bytes, emoji 4. O limite é em bytes nos dois lados.
 */
export const PASSWORD_MAX_BYTES = 72;

const UPPERCASE = /\p{Lu}/u;
const LOWERCASE = /\p{Ll}/u;
const DIGIT = /\p{Nd}/u;
// "Especial" = nem letra nem dígito decimal, igual a `!char.IsLetterOrDigit` no C#.
// Espaço conta como especial.
const SPECIAL = /[^\p{L}\p{Nd}]/u;

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: `Pelo menos ${PASSWORD_MIN_LENGTH} caracteres`,
    test: (value) => value.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: "uppercase",
    label: "Uma letra maiúscula",
    test: (value) => UPPERCASE.test(value),
  },
  {
    id: "lowercase",
    label: "Uma letra minúscula",
    test: (value) => LOWERCASE.test(value),
  },
  {
    id: "digit",
    label: "Um número",
    test: (value) => DIGIT.test(value),
  },
  {
    id: "special",
    label: "Um caractere especial",
    test: (value) => SPECIAL.test(value),
  },
];

export type PasswordStrength = "weak" | "medium" | "strong";

export function isWithinPasswordMaxLength(value: string): boolean {
  return new TextEncoder().encode(value).length <= PASSWORD_MAX_BYTES;
}

/** Quantas regras de composição passam (0 a 5). */
export function getPasswordScore(value: string): number {
  return PASSWORD_RULES.filter((rule) => rule.test(value)).length;
}

/** 0 a 2 regras = fraca; 3 a 4 = média; as 5 e dentro do limite = forte. */
export function getPasswordStrength(value: string): PasswordStrength {
  const score = getPasswordScore(value);

  if (score === PASSWORD_RULES.length && isWithinPasswordMaxLength(value)) {
    return "strong";
  }
  if (score >= 3) {
    return "medium";
  }
  return "weak";
}
