import { NextResponse } from "next/server";
import {
  getAuthHeaders,
  toErrorResponse,
} from "@/app/api/showcase/showcase-route-utils";
import { apiFetch } from "@/lib/api-client";
import type { AdminShowcase } from "@/types/showcase";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const showcases = await apiFetch<AdminShowcase[]>("/admin/showcases", {
      headers: await getAuthHeaders(),
    });

    return NextResponse.json(showcases);
  } catch (error) {
    return toErrorResponse(error);
  }
}
