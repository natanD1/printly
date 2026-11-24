import { NextResponse } from "next/server";
import {
  getAuthHeaders,
  notFoundResponse,
  toErrorResponse,
} from "@/app/api/showcase/showcase-route-utils";
import { apiFetch } from "@/lib/api-client";
import { isUuid } from "@/utils/showcase-slug";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ productId: string }>;
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  const { productId } = await params;

  if (!isUuid(productId)) {
    return notFoundResponse();
  }

  try {
    await apiFetch<void>(`/showcase/items/${productId}`, {
      headers: await getAuthHeaders(),
      method: "DELETE",
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
