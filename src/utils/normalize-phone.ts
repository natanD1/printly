export type NormalizedPhone =
  | { ok: true; phone: string | null }
  | { ok: false };

const BR_COUNTRY_CODE = "55";

/**
 * Normaliza telefone BR pra só dígitos com DDI 55.
 * Vazio vira `phone: null`; 10/11 dígitos (DDD + número) ganham o prefixo 55;
 * 12/13 dígitos começando com 55 passam como estão; o resto é inválido.
 */
export function normalizePhone(input: string): NormalizedPhone {
  const digits = input.replace(/\D/g, "");

  if (digits.length === 0) {
    return { ok: true, phone: null };
  }

  if (digits.length === 10 || digits.length === 11) {
    return { ok: true, phone: `${BR_COUNTRY_CODE}${digits}` };
  }

  if (
    (digits.length === 12 || digits.length === 13) &&
    digits.startsWith(BR_COUNTRY_CODE)
  ) {
    return { ok: true, phone: digits };
  }

  return { ok: false };
}
