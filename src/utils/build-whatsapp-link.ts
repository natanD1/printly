/**
 * Onde o link abre:
 * - `app`: `whatsapp://`, abre direto o app instalado (desktop/Mac);
 * - `universal`: `wa.me`, no celular o sistema abre o app sozinho;
 * - `web`: WhatsApp Web, saída pra quem não tem o app.
 */
export type WhatsappLinkTarget = "app" | "universal" | "web";

/** Link com a mensagem pronta; sem telefone, o WhatsApp deixa escolher o contato. */
export function buildWhatsappLink(
  message: string,
  phone?: string | null,
  target: WhatsappLinkTarget = "universal"
): string {
  const text = encodeURIComponent(message);
  const phoneParam = phone ? `phone=${phone}&` : "";

  if (target === "app") {
    return `whatsapp://send?${phoneParam}text=${text}`;
  }
  if (target === "web") {
    return `https://web.whatsapp.com/send?${phoneParam}text=${text}`;
  }
  return phone
    ? `https://wa.me/${phone}?text=${text}`
    : `https://wa.me/?text=${text}`;
}
