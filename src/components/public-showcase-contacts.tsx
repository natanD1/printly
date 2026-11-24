import { AtSign, Globe, Mail, MessageCircle, Phone } from "lucide-react";
import type { ReactNode } from "react";
import type { PublicShowcaseContacts as PublicShowcaseContactsData } from "@/types/showcase";
import { buildWhatsappLink } from "@/utils/build-whatsapp-link";

interface PublicShowcaseContactsProps {
  contacts: PublicShowcaseContactsData;
}

interface SecondaryContactLink {
  ariaLabel: string;
  external: boolean;
  href: string;
  icon: ReactNode;
  key: string;
  label: string;
}

const WHATSAPP_GREETING = "Olá! Vi sua vitrine no Printly.";
const SAFE_HREF_PREFIXES = ["https://", "http://", "mailto:", "tel:"] as const;
const LEADING_AT_REGEX = /^@+/;
const INSTAGRAM_HANDLE_REGEX = /^[A-Za-z0-9._]{1,30}$/;
const PHONE_DIAL_STRIP_REGEX = /[\s()-]/g;
const SECONDARY_LINK_CLASS =
  "inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border bg-background px-3.5 font-medium text-foreground text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

function isSafeContactHref(href: string): boolean {
  const normalized = href.trim().toLowerCase();
  return SAFE_HREF_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function buildWhatsappHref(whatsApp: string | null): string | null {
  const phone = whatsApp?.trim();
  if (!phone) {
    return null;
  }

  const href = buildWhatsappLink(WHATSAPP_GREETING, phone, "universal");
  return isSafeContactHref(href) ? href : null;
}

function buildInstagramLink(
  instagram: string | null
): SecondaryContactLink | null {
  const handle = instagram?.trim().replace(LEADING_AT_REGEX, "");
  if (!(handle && INSTAGRAM_HANDLE_REGEX.test(handle))) {
    return null;
  }

  const href = `https://instagram.com/${handle}`;
  if (!isSafeContactHref(href)) {
    return null;
  }

  return {
    ariaLabel: `Instagram @${handle}`,
    external: true,
    href,
    icon: <AtSign aria-hidden="true" className="size-4 shrink-0" />,
    key: "instagram",
    label: `@${handle}`,
  };
}

function buildWebsiteLink(website: string | null): SecondaryContactLink | null {
  const rawWebsite = website?.trim();
  if (!(rawWebsite && isSafeContactHref(rawWebsite))) {
    return null;
  }

  const lowerWebsite = rawWebsite.toLowerCase();
  const isWebUrl =
    lowerWebsite.startsWith("https://") || lowerWebsite.startsWith("http://");
  if (!isWebUrl) {
    return null;
  }

  return {
    ariaLabel: "Visitar site da loja",
    external: true,
    href: rawWebsite,
    icon: <Globe aria-hidden="true" className="size-4 shrink-0" />,
    key: "website",
    label: "Site",
  };
}

function buildEmailLink(email: string | null): SecondaryContactLink | null {
  const rawEmail = email?.trim();
  if (!rawEmail) {
    return null;
  }

  const href = `mailto:${rawEmail}`;
  if (!isSafeContactHref(href)) {
    return null;
  }

  return {
    ariaLabel: `Enviar e-mail para ${rawEmail}`,
    external: false,
    href,
    icon: <Mail aria-hidden="true" className="size-4 shrink-0" />,
    key: "email",
    label: "E-mail",
  };
}

function buildPhoneLink(phone: string | null): SecondaryContactLink | null {
  const rawPhone = phone?.trim();
  if (!rawPhone) {
    return null;
  }

  const dialValue = rawPhone.replace(PHONE_DIAL_STRIP_REGEX, "");
  if (!dialValue) {
    return null;
  }

  const href = `tel:${dialValue}`;
  if (!isSafeContactHref(href)) {
    return null;
  }

  return {
    ariaLabel: `Ligar para ${rawPhone}`,
    external: false,
    href,
    icon: <Phone aria-hidden="true" className="size-4 shrink-0" />,
    key: "phone",
    label: rawPhone,
  };
}

function buildSecondaryLinks(
  contacts: PublicShowcaseContactsData
): SecondaryContactLink[] {
  const candidates = [
    buildInstagramLink(contacts.instagram),
    buildWebsiteLink(contacts.website),
    buildEmailLink(contacts.email),
    buildPhoneLink(contacts.phone),
  ];

  return candidates.filter(
    (link): link is SecondaryContactLink => link !== null
  );
}

export function PublicShowcaseContacts({
  contacts,
}: PublicShowcaseContactsProps) {
  const whatsappHref = buildWhatsappHref(contacts.whatsApp);
  const secondaryLinks = buildSecondaryLinks(contacts);

  if (!whatsappHref && secondaryLinks.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:flex-wrap">
      {whatsappHref ? (
        <a
          className="inline-flex h-11 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 font-semibold text-sm text-white shadow-xs transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-emerald-500/40 sm:h-10 sm:w-auto dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400"
          href={whatsappHref}
          rel="noopener noreferrer nofollow"
          target="_blank"
        >
          <MessageCircle aria-hidden="true" className="size-4 shrink-0" />
          Chamar no WhatsApp
        </a>
      ) : null}

      {secondaryLinks.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          {secondaryLinks.map((link) =>
            link.external ? (
              <a
                aria-label={link.ariaLabel}
                className={SECONDARY_LINK_CLASS}
                href={link.href}
                key={link.key}
                rel="noopener noreferrer nofollow"
                target="_blank"
              >
                {link.icon}
                <span className="max-w-44 truncate">{link.label}</span>
              </a>
            ) : (
              <a
                aria-label={link.ariaLabel}
                className={SECONDARY_LINK_CLASS}
                href={link.href}
                key={link.key}
              >
                {link.icon}
                <span className="max-w-44 truncate">{link.label}</span>
              </a>
            )
          )}
        </div>
      ) : null}
    </div>
  );
}
