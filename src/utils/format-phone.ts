const MAX_LOCAL_DIGITS = 11;
const BR_COUNTRY_CODE = "55";

/** Máscara BR enquanto digita: (11) 91234-5678 ou (11) 1234-5678. */
export function formatPhoneMask(input: string): string {
  let digits = input.replace(/\D/g, "");

  // Número colado com DDI (+55): descarta o DDI antes de mascarar. Só com 13
  // dígitos (celular) ou com "+", pra não engolir o DDD 55 (RS) quando o
  // usuário digita um dígito a mais.
  const hasCountryCode =
    digits.startsWith(BR_COUNTRY_CODE) &&
    (digits.length === MAX_LOCAL_DIGITS + 2 ||
      (digits.length > MAX_LOCAL_DIGITS && input.trim().startsWith("+")));
  if (hasCountryCode) {
    digits = digits.slice(BR_COUNTRY_CODE.length);
  }
  digits = digits.slice(0, MAX_LOCAL_DIGITS);

  if (digits.length === 0) {
    return "";
  }
  if (digits.length <= 2) {
    return `(${digits}`;
  }

  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  const splitAt = digits.length > 10 ? 5 : 4;

  if (rest.length <= splitAt) {
    return `(${ddd}) ${rest}`;
  }
  return `(${ddd}) ${rest.slice(0, splitAt)}-${rest.slice(splitAt)}`;
}
