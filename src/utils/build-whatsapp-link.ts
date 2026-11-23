/** Link `wa.me` com a mensagem pronta; sem telefone, o WhatsApp deixa escolher o contato. */
export function buildWhatsappLink(
  message: string,
  phone?: string | null
): string {
  const text = encodeURIComponent(message);
  return phone
    ? `https://wa.me/${phone}?text=${text}`
    : `https://wa.me/?text=${text}`;
}
