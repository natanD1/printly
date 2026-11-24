import { NextResponse } from "next/server";
import {
  getAuthHeaders,
  notFoundResponse,
  toErrorResponse,
} from "@/app/api/showcase/showcase-route-utils";
import { apiFetchBinary } from "@/lib/api-client";
import { isUuid } from "@/utils/showcase-slug";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ productId: string }>;
}

export async function GET(
  _request: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  const { productId } = await params;

  if (!isUuid(productId)) {
    return notFoundResponse();
  }

  try {
    const photo = await apiFetchBinary(
      `/showcase/products/${productId}/photo`,
      {
        headers: await getAuthHeaders(),
      }
    );

    return new NextResponse(photo.body, {
      headers: {
        "Cache-Control": photo.cacheControl ?? "private, max-age=300",
        "Content-Type": photo.contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
