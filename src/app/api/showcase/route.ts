import { NextResponse } from "next/server";
import {
  getAuthHeaders,
  toErrorResponse,
} from "@/app/api/showcase/showcase-route-utils";
import { apiFetch } from "@/lib/api-client";
import type { Showcase } from "@/types/showcase";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const showcase = await apiFetch<Showcase>("/showcase", {
      headers: await getAuthHeaders(),
    });

    return NextResponse.json(showcase);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(): Promise<NextResponse> {
  try {
    const showcase = await apiFetch<Showcase>("/showcase", {
      headers: await getAuthHeaders(),
      method: "POST",
    });

    return NextResponse.json(showcase);
  } catch (error) {
    return toErrorResponse(error);
  }
}
