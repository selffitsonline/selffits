import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { extractMediaFromSetting } from "@/lib/media-helper";

// Module-level in-memory cache for ultra-fast (sub-millisecond) image responses
const mediaBufferCache = new Map<string, { buffer: Buffer; mimeType: string }>();

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const section = searchParams.get("section");
    const id = searchParams.get("id") || "root";
    const field = searchParams.get("field") || "imageUrl";
    const version = searchParams.get("v") || "";

    if (!section) {
      return new NextResponse("Missing section parameter", { status: 400 });
    }

    const cacheKey = `${section}:${id}:${field}:${version}`;
    const cached = mediaBufferCache.get(cacheKey);
    if (cached) {
      return new NextResponse(new Uint8Array(cached.buffer), {
        status: 200,
        headers: {
          "Content-Type": cached.mimeType,
          "Cache-Control": "public, max-age=31536000, stale-while-revalidate=86400, immutable",
        },
      });
    }

    const setting = await db.websiteSettings.findUnique({
      where: { key: section },
      select: { value: true },
    });

    if (!setting || !setting.value) {
      return new NextResponse("Media section not found", { status: 404 });
    }

    const rawDataUrl = extractMediaFromSetting(setting.value, id, field);
    if (!rawDataUrl || !rawDataUrl.startsWith("data:image/")) {
      return new NextResponse("Image data not found", { status: 404 });
    }

    const match = rawDataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return new NextResponse("Invalid data URL format", { status: 400 });
    }

    const mimeType = match[1] || "image/jpeg";
    const buffer = Buffer.from(match[2], "base64");

    // Cache in memory (evict oldest if cache grows over 50 items)
    if (mediaBufferCache.size > 50) {
      const firstKey = mediaBufferCache.keys().next().value;
      if (firstKey) mediaBufferCache.delete(firstKey);
    }
    mediaBufferCache.set(cacheKey, { buffer, mimeType });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, stale-while-revalidate=86400, immutable",
      },
    });
  } catch (err: any) {
    console.error("API /api/media error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
