import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ApiError, apiFetch } from "@/lib/api-client";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import type { Product } from "@/types/product";

export const dynamic = "force-dynamic";

const PERIOD_PARAMS = ["from", "to"] as const;

export async function GET(request: Request): Promise<NextResponse> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const { searchParams } = new URL(request.url);
  const query = new URLSearchParams();

  for (const key of PERIOD_PARAMS) {
    const value = searchParams.get(key);
    if (value) {
      query.set(key, value);
    }
  }

  const path = query.size ? `/products?${query}` : "/products";

  try {
    const products = await apiFetch<Product[]>(path, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(products);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }

    throw error;
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const formData = await request.formData();

  try {
    const product = await apiFetch<Product>("/products", {
      body: formData,
      headers: { Authorization: `Bearer ${token}` },
      method: "POST",
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }

    throw error;
  }
}
