import { NextResponse } from "next/server";
import {
  getAuthHeaders,
  invalidDataResponse,
  notFoundResponse,
  toErrorResponse,
} from "@/app/api/showcase/showcase-route-utils";
import { apiFetch } from "@/lib/api-client";
import { showcaseVisibilitySchema } from "@/schemas/showcase-visibility-schema";
import type { Showcase } from "@/types/showcase";
import { isUuid } from "@/utils/showcase-slug";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ productId: string }>;
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  const { productId } = await params;

  if (!isUuid(productId)) {
    return notFoundResponse();
  }

  const parsedBody = showcaseVisibilitySchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return invalidDataResponse(parsedBody.error.issues);
  }

  try {
    const showcase = await apiFetch<Showcase>(
      `/showcase/items/${productId}/visibility`,
      {
        body: parsedBody.data,
        headers: await getAuthHeaders(),
        method: "PATCH",
      }
    );

    return NextResponse.json(showcase);
  } catch (error) {
    return toErrorResponse(error);
  }
}
