import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ApiError, apiFetch } from "@/lib/api-client";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { savePlanSchema } from "@/schemas/save-plan-schema";
import type { Plan } from "@/types/plan";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  const { id } = await params;
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  try {
    const data = await apiFetch<Plan>(`/plans/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.status }
      );
    }

    throw error;
  }
}

export async function PUT(
  request: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  const { id } = await params;
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const body = await request.json();
  const parsedBody = savePlanSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { issues: parsedBody.error.issues, message: "Dados inválidos" },
      { status: 400 }
    );
  }

  try {
    const plan = await apiFetch<Plan>(`/plans/${id}`, {
      body: parsedBody.data,
      headers: { Authorization: `Bearer ${token}` },
      method: "PUT",
    });

    return NextResponse.json(plan);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.status }
      );
    }

    throw error;
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  const { id } = await params;
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  try {
    await apiFetch<void>(`/plans/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      method: "DELETE",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.status }
      );
    }

    throw error;
  }
}
