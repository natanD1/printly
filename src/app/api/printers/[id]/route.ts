import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ApiError, apiFetch } from "@/lib/api-client";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { printerSchema } from "@/schemas/printer-schema";
import type { Printer } from "@/types/printer";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(
  request: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  const { id } = await params;
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const body = await request.json();
  const parsedBody = printerSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { issues: parsedBody.error.issues, message: "Dados inválidos" },
      { status: 400 }
    );
  }

  try {
    const printer = await apiFetch<Printer>(`/printers/${id}`, {
      body: parsedBody.data,
      headers: { Authorization: `Bearer ${token}` },
      method: "PUT",
    });

    return NextResponse.json(printer);
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
    await apiFetch<void>(`/printers/${id}`, {
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
