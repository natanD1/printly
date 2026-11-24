import { NextResponse } from "next/server";
import {
  getAuthHeaders,
  invalidDataResponse,
  notFoundResponse,
  toErrorResponse,
} from "@/app/api/showcase/showcase-route-utils";
import { apiFetch } from "@/lib/api-client";
import { showcaseBlockSchema } from "@/schemas/showcase-block-schema";
import type { AdminShowcase } from "@/types/showcase";
import { isUuid } from "@/utils/showcase-slug";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  const { id } = await params;

  if (!isUuid(id)) {
    return notFoundResponse();
  }

  const parsedBody = showcaseBlockSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return invalidDataResponse(parsedBody.error.issues);
  }

  try {
    const showcase = await apiFetch<AdminShowcase>(
      `/admin/showcases/${id}/block`,
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
