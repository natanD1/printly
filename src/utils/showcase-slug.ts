/** Mesma regra do backend (`ShowcaseSlug`): minúsculas/dígitos separados por hífen simples, 3–60 caracteres. */
export const SHOWCASE_SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const SHOWCASE_SLUG_MIN_LENGTH = 3;
export const SHOWCASE_SLUG_MAX_LENGTH = 60;

export function isValidShowcaseSlug(value: string): boolean {
  return (
    value.length >= SHOWCASE_SLUG_MIN_LENGTH &&
    value.length <= SHOWCASE_SLUG_MAX_LENGTH &&
    SHOWCASE_SLUG_PATTERN.test(value)
  );
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
