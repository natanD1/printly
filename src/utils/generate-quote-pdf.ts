import type { QuoteCompany, QuoteData } from "@/types/quote";
import { canUseCompanyLogo } from "@/utils/can-use-company-logo";
import { formatCurrency } from "@/utils/format-currency";

const VALIDITY_DAYS = 7;
const DATA_URI_PREFIX = /^data:[^;]+;base64,/;
const NON_ALPHANUMERIC = /[^a-z0-9]+/g;
const EDGE_DASHES = /^-+|-+$/g;
const COMBINING_MARKS = /[̀-ͯ]/g;

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

export function quoteFileName(productName: string): string {
  const slug = productName
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(NON_ALPHANUMERIC, "-")
    .replace(EDGE_DASHES, "");

  return `orcamento-${slug || "produto"}.pdf`;
}

/** react-pdf só aceita PNG/JPG: converte outros formatos (ex: webp) via canvas. */
function convertToPng(dataUri: string): Promise<string | null> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d");
        if (!context || canvas.width === 0 || canvas.height === 0) {
          resolve(null);
          return;
        }
        context.drawImage(image, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = dataUri;
  });
}

/** Devolve data URI PNG/JPG pronto pro react-pdf, ou `null` se não der. */
async function toPdfImageSrc(base64: string | null): Promise<string | null> {
  if (!base64) {
    return null;
  }

  const raw = base64.replace(DATA_URI_PREFIX, "");
  if (raw.startsWith("iVBOR")) {
    return `data:image/png;base64,${raw}`;
  }
  if (raw.startsWith("/9j/")) {
    return `data:image/jpeg;base64,${raw}`;
  }
  return await convertToPng(`data:image/webp;base64,${raw}`);
}

/**
 * Gera o PDF do orçamento só no browser: `@react-pdf/renderer` nunca entra no SSR
 * (import dinâmico). Recebe apenas `QuoteData`, então custo/margem não chegam aqui.
 */
export async function generateQuotePdf(
  data: QuoteData,
  company: QuoteCompany
): Promise<Blob> {
  const [{ pdf }, { QuoteDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/quote-document"),
  ]);

  const [photoSrc, logoSrc] = await Promise.all([
    toPdfImageSrc(data.productPhoto),
    canUseCompanyLogo() ? toPdfImageSrc(company.logoBase64) : null,
  ]);

  const issued = new Date();
  const validUntil = new Date(issued);
  validUntil.setDate(validUntil.getDate() + VALIDITY_DAYS);

  // Chamada direta (sem hooks): devolve o <Document> que o pdf() espera.
  const element = QuoteDocument({
    company,
    issueDate: formatDate(issued),
    logoSrc,
    photoSrc,
    productName: data.productName,
    quantity: data.quantity,
    totalLabel: formatCurrency(data.salePrice),
    unitLabel: formatCurrency(data.unitSalePrice),
    validUntil: formatDate(validUntil),
  });

  return await pdf(element).toBlob();
}

/** Baixa o arquivo via `<a download>` temporário. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
