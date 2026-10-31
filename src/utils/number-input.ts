const THOUSANDS_REGEX = /\B(?=(\d{3})+(?!\d))/g;
const NON_DIGITS_REGEX = /\D/g;
const NON_DIGITS_OR_COMMA_REGEX = /[^\d,]/g;
const LEADING_ZEROS_REGEX = /^0+(?=\d)/;
const DOTS_REGEX = /\./g;

function groupThousands(integer: string): string {
  return integer.replace(THOUSANDS_REGEX, ".");
}

/**
 * Formata o texto digitado no padrão pt-BR (1.234,56).
 * - `fixed`: os dígitos entram pela direita, como maquininha de cartão (ideal pra dinheiro).
 * - livre: o usuário digita a vírgula e o texto limita as casas decimais.
 */
export function maskNumberInput(
  raw: string,
  decimals: number,
  fixed: boolean
): string {
  if (fixed && decimals > 0) {
    const digits = raw
      .replace(NON_DIGITS_REGEX, "")
      .replace(LEADING_ZEROS_REGEX, "");
    if (!digits) {
      return "";
    }

    const padded = digits.padStart(decimals + 1, "0");
    const integer = padded.slice(0, -decimals);
    const fraction = padded.slice(-decimals);
    return `${groupThousands(integer)},${fraction}`;
  }

  const [integerRaw, ...fractionParts] = raw
    .replace(NON_DIGITS_OR_COMMA_REGEX, "")
    .split(",");
  const integer = integerRaw.replace(LEADING_ZEROS_REGEX, "");
  const hasSeparator = decimals > 0 && fractionParts.length > 0;

  if (!(integer || hasSeparator)) {
    return "";
  }

  const fraction = fractionParts.join("").slice(0, decimals);
  return `${groupThousands(integer || "0")}${hasSeparator ? `,${fraction}` : ""}`;
}

export function formatNumberInput(
  value: number | null,
  decimals: number,
  fixed: boolean
): string {
  if (value === null) {
    return "";
  }

  const rounded = value.toFixed(decimals);
  const raw = fixed ? rounded : String(Number(rounded)).replace(".", ",");
  return maskNumberInput(raw, decimals, fixed);
}

export function parseNumberInput(text: string): number | null {
  if (!text) {
    return null;
  }

  return Number(text.replace(DOTS_REGEX, "").replace(",", "."));
}
