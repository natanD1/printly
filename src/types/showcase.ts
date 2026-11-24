/** Contrato: docs/vitrine-contrato.md. Valores monetários são preço por unidade, em reais. */

export interface ShowcaseItem {
  hasPhoto: boolean;
  isVisible: boolean;
  name: string;
  /** Visível + produzido, mas além do limite atual de `MaxShowcaseItems`: não aparece no público. */
  outsidePlan: boolean;
  productId: string;
  productIsProduced: boolean;
  sortOrder: number;
  unitSalePrice: number;
}

/** `GET /showcase`. Sem vitrine criada, só `exists` e `planAllows`. */
export type Showcase =
  | { exists: false; planAllows: boolean }
  | {
      exists: true;
      isBlocked: boolean;
      isPublished: boolean;
      items: ShowcaseItem[];
      /** `null` = ilimitado (admin ou plano sem limite). */
      limit: number | null;
      planAllows: boolean;
      slug: string;
      used: number;
    };

export type ExistingShowcase = Extract<Showcase, { exists: true }>;

export interface ShowcaseAvailableProduct {
  hasPhoto: boolean;
  id: string;
  name: string;
  unitSalePrice: number;
}

export interface AdminShowcase {
  id: string;
  isBlocked: boolean;
  isPublished: boolean;
  itemCount: number;
  ownerEmail: string;
  ownerName: string;
  slug: string;
  userId: string;
}

export interface PublicShowcaseContacts {
  email: string | null;
  instagram: string | null;
  phone: string | null;
  website: string | null;
  /** Só dígitos, com DDI (ex: 5511999998888). */
  whatsApp: string | null;
}

export interface PublicShowcaseItem {
  hasPhoto: boolean;
  name: string;
  productId: string;
  unitPrice: number;
}

/** `GET /public/showcases/{slug}`. Indisponível vem só com `available: false`. */
export type PublicShowcase =
  | { available: false }
  | {
      available: true;
      contacts: PublicShowcaseContacts;
      hasLogo: boolean;
      items: PublicShowcaseItem[];
      showBranding: boolean;
      storeName: string;
    };
