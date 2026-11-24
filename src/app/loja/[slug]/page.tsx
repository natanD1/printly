import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";
import { PublicShowcaseUnavailable } from "@/components/public-showcase-unavailable";
import { PublicShowcaseView } from "@/components/public-showcase-view";
import { ApiError, apiFetch } from "@/lib/api-client";
import { env } from "@/lib/env";
import type { PublicShowcase } from "@/types/showcase";
import { isValidShowcaseSlug } from "@/utils/showcase-slug";

type AvailablePublicShowcase = Extract<PublicShowcase, { available: true }>;

interface PublicShowcasePageProps {
  params: Promise<{ slug: string }>;
}

const getPublicShowcase = cache(
  async (slug: string): Promise<PublicShowcase | null> => {
    if (!isValidShowcaseSlug(slug)) {
      return null;
    }

    try {
      return await apiFetch<PublicShowcase>(`/public/showcases/${slug}`, {
        revalidate: 60,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }

      throw error;
    }
  }
);

async function resolveSiteOrigin(): Promise<string | null> {
  if (env.SITE_URL) {
    return env.SITE_URL;
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("host")?.trim();

  if (!host) {
    return null;
  }

  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

function buildAbsoluteUrl(path: string, origin: string): string | null {
  try {
    return new URL(path, origin).toString();
  } catch {
    return null;
  }
}

function resolveOgImagePath(
  slug: string,
  showcase: AvailablePublicShowcase
): string | null {
  if (showcase.hasLogo) {
    return `/api/public/loja/${slug}/logo`;
  }

  const firstItemWithPhoto = showcase.items.find((item) => item.hasPhoto);
  if (firstItemWithPhoto) {
    return `/api/public/loja/${slug}/foto/${firstItemWithPhoto.productId}`;
  }

  return null;
}

export async function generateMetadata({
  params,
}: PublicShowcasePageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isValidShowcaseSlug(slug)) {
    return {
      robots: { follow: false, index: false },
      title: "Vitrine não encontrada | Printly",
    };
  }

  const showcase = await getPublicShowcase(slug);

  if (!showcase) {
    return {
      robots: { follow: false, index: false },
      title: "Vitrine não encontrada | Printly",
    };
  }

  if (!showcase.available) {
    return {
      description: "Esta vitrine não está disponível no momento.",
      robots: { follow: false, index: false },
      title: "Vitrine indisponível | Printly",
    };
  }

  const title = `${showcase.storeName} — Vitrine`;
  const description = `Conheça os produtos de ${showcase.storeName}.`;
  const ogImagePath = resolveOgImagePath(slug, showcase);
  const siteOrigin = await resolveSiteOrigin();
  const ogImageUrl =
    ogImagePath && siteOrigin
      ? buildAbsoluteUrl(ogImagePath, siteOrigin)
      : null;

  const openGraph: NonNullable<Metadata["openGraph"]> = {
    description,
    locale: "pt_BR",
    title,
    type: "website",
  };

  if (ogImageUrl) {
    openGraph.images = [{ alt: showcase.storeName, url: ogImageUrl }];
  }

  const pageUrl = siteOrigin
    ? buildAbsoluteUrl(`/loja/${slug}`, siteOrigin)
    : null;
  if (pageUrl) {
    openGraph.url = pageUrl;
  }

  return {
    description,
    openGraph,
    title,
  };
}

export default async function PublicShowcasePage({
  params,
}: PublicShowcasePageProps) {
  const { slug } = await params;

  if (!isValidShowcaseSlug(slug)) {
    notFound();
  }

  const showcase = await getPublicShowcase(slug);

  if (!showcase) {
    notFound();
  }

  if (!showcase.available) {
    return <PublicShowcaseUnavailable />;
  }

  return <PublicShowcaseView showcase={showcase} slug={slug} />;
}
