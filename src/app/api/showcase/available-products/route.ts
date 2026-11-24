import { NextResponse } from "next/server";
import {
  getAuthHeaders,
  toErrorResponse,
} from "@/app/api/showcase/showcase-route-utils";
import { apiFetch } from "@/lib/api-client";
import type { ShowcaseAvailableProduct } from "@/types/showcase";

export const dynamic = "force-dynamic";

const MAX_SEARCH_LENGTH = 100;

export async function GET(request: Request): Promise<NextResponse> {
  const search = (new URL(request.url).searchParams.get("search") ?? "")
    .trim()
    .slice(0, MAX_SEARCH_LENGTH);
  const query = search ? `?search=${encodeURIComponent(search)}` : "";

  try {
    const products = await apiFetch<ShowcaseAvailableProduct[]>(
      `/showcase/available-products${query}`,
      { headers: await getAuthHeaders() }
    );

    return NextResponse.json(products);
  } catch (error) {
    return toErrorResponse(error);
  }
}
