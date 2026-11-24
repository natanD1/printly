import { NextResponse } from "next/server";
import {
  getAuthHeaders,
  invalidDataResponse,
  toErrorResponse,
} from "@/app/api/showcase/showcase-route-utils";
import { apiFetch } from "@/lib/api-client";
import { showcaseProductIdsSchema } from "@/schemas/showcase-product-ids-schema";
import type { Showcase } from "@/types/showcase";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  const parsedBody = showcaseProductIdsSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return invalidDataResponse(parsedBody.error.issues);
  }

  try {
    const showcase = await apiFetch<Showcase>("/showcase/items", {
      body: parsedBody.data,
      headers: await getAuthHeaders(),
      method: "POST",
    });

    return NextResponse.json(showcase);
  } catch (error) {
    return toErrorResponse(error);
  }
}
