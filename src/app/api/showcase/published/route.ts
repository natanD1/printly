import { NextResponse } from "next/server";
import {
  getAuthHeaders,
  invalidDataResponse,
  toErrorResponse,
} from "@/app/api/showcase/showcase-route-utils";
import { apiFetch } from "@/lib/api-client";
import { showcasePublishedSchema } from "@/schemas/showcase-published-schema";
import type { Showcase } from "@/types/showcase";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request): Promise<NextResponse> {
  const parsedBody = showcasePublishedSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return invalidDataResponse(parsedBody.error.issues);
  }

  try {
    const showcase = await apiFetch<Showcase>("/showcase/published", {
      body: parsedBody.data,
      headers: await getAuthHeaders(),
      method: "PATCH",
    });

    return NextResponse.json(showcase);
  } catch (error) {
    return toErrorResponse(error);
  }
}
