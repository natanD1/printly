import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ApiError, apiFetch } from "@/lib/api-client";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import type { CompanyProfile } from "@/types/company-profile";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  try {
    // Sem perfil o backend devolve 200 com corpo `null` (ou 204/vazio).
    const companyProfile = await apiFetch<CompanyProfile | null | undefined>(
      "/company-profile",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return NextResponse.json(companyProfile ?? null);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.status }
      );
    }

    // Corpo vazio com status 200: `response.json()` falha, tratamos como sem perfil.
    if (error instanceof SyntaxError) {
      return NextResponse.json(null);
    }

    throw error;
  }
}

export async function PUT(request: Request): Promise<NextResponse> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const formData = await request.formData();

  try {
    const companyProfile = await apiFetch<CompanyProfile>("/company-profile", {
      body: formData,
      headers: { Authorization: `Bearer ${token}` },
      method: "PUT",
    });

    return NextResponse.json(companyProfile);
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
