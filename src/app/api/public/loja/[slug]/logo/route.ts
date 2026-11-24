import { NextResponse } from "next/server";
import { ApiError, apiFetchBinary } from "@/lib/api-client";
import { isValidShowcaseSlug } from "@/utils/showcase-slug";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

const DEFAULT_CACHE_CONTROL = "public, max-age=300";

export async function GET(
  _request: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  const { slug } = await params;

  if (!isValidShowcaseSlug(slug)) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const { body, cacheControl, contentType } = await apiFetchBinary(
      `/public/showcases/${slug}/logo`,
      { revalidate: 300 }
    );

    return new NextResponse(body, {
      headers: {
        "Cache-Control": cacheControl ?? DEFAULT_CACHE_CONTROL,
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return new NextResponse(null, { status: error.status });
    }

    throw error;
  }
}
