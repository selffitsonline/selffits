import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { extractMediaFromSetting, mediaBufferCache } from "@/lib/media-helper";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const PROGRAM_FALLBACK_IMAGES: Record<string, string> = {
  kids: "/images/kids_martial_arts.png",
  adults: "/images/adults_martial_arts.png",
  ladies: "/images/ladies_fitness.png",
  "weight-loss": "/images/weight_loss_hiit.png",
  fitness: "/images/weight_loss_hiit.png",
};

const ALLOWED_IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
  ".gif",
  ".ico",
]);

function isImageBuffer(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;
  // WebP: RIFF .... WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return true;
  }
  // GIF: GIF87a or GIF89a
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return true;
  // SVG: starts with < (check text for <svg)
  const headerText = buffer.subarray(0, 100).toString("utf8").trim().toLowerCase();
  if (headerText.startsWith("<?xml") || headerText.startsWith("<svg") || headerText.includes("<svg")) return true;
  // ICO: 00 00 01 00
  if (buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01 && buffer[3] === 0x00) return true;

  return false;
}

function getMimeType(filePath: string, buffer?: Buffer): string {
  if (buffer && buffer.length >= 4) {
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return "image/jpeg";
    }
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return "image/png";
    }
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      return "image/webp";
    }
  }
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".gif":
      return "image/gif";
    default:
      return "image/jpeg";
  }
}

function resolveProgramFallback(id: string): string {
  const lower = (id || "").toLowerCase();
  if (PROGRAM_FALLBACK_IMAGES[lower]) {
    return PROGRAM_FALLBACK_IMAGES[lower];
  }
  if (lower.includes("kid")) return "/images/kids_martial_arts.png";
  if (lower.includes("adult") || lower.includes("mma")) return "/images/adults_martial_arts.png";
  if (lower.includes("lad") || lower.includes("women") || lower.includes("female")) return "/images/ladies_fitness.png";
  if (lower.includes("weight") || lower.includes("loss") || lower.includes("fit") || lower.includes("hiit")) {
    return "/images/weight_loss_hiit.png";
  }
  return "/images/kids_martial_arts.png";
}

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

    let setting: { value: any } | null = null;
    try {
      setting = await db.websiteSettings.findUnique({
        where: { key: section },
        select: { value: true },
      });
    } catch (dbErr) {
      console.warn("API /api/media DB lookup error (will attempt fallback):", dbErr);
    }

    const rawDataUrl = setting?.value ? extractMediaFromSetting(setting.value, id, field) : null;

    // 1. Base64 Data URL resolution
    if (rawDataUrl && rawDataUrl.startsWith("data:image/")) {
      const match = rawDataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1] || "image/jpeg";
        const buffer = Buffer.from(match[2], "base64");

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
      }
    }

    // 2. Physical File Path resolution (e.g. /images/... or /uploads/...)
    // Enforces strict sandbox security: path traversal rejection, extension whitelist, realpath check, and image magic bytes.
    if (rawDataUrl && rawDataUrl.startsWith("/") && !rawDataUrl.startsWith("/api/media")) {
      let decodedRaw = "";
      try {
        decodedRaw = decodeURIComponent(rawDataUrl);
        // Double-decode check to block multi-layer encoded traversal attacks (%252e%252e)
        if (decodedRaw.includes("%")) {
          try {
            decodedRaw = decodeURIComponent(decodedRaw);
          } catch {}
        }
      } catch {
        return new NextResponse("Malformed URI encoding", { status: 400 });
      }

      if (
        decodedRaw.includes("..") ||
        decodedRaw.includes("\0") ||
        rawDataUrl.includes("..") ||
        rawDataUrl.toLowerCase().includes("%2e") ||
        decodedRaw.toLowerCase().includes("%2e")
      ) {
        return new NextResponse("Invalid file path", { status: 400 });
      }

      const publicRoot = path.resolve(process.cwd(), "public");
      const cleanPath = decodedRaw.replace(/^\/+/, "");
      const resolvedPath = path.resolve(publicRoot, cleanPath);

      if (!resolvedPath.startsWith(publicRoot + path.sep)) {
        return new NextResponse("Forbidden path", { status: 403 });
      }

      const ext = path.extname(resolvedPath).toLowerCase();
      if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
        return new NextResponse("Unsupported media type", { status: 415 });
      }

      if (fs.existsSync(resolvedPath)) {
        const realPath = fs.realpathSync(resolvedPath);
        if (!realPath.startsWith(publicRoot + path.sep)) {
          return new NextResponse("Forbidden path", { status: 403 });
        }

        const stat = await fs.promises.stat(realPath);
        if (!stat.isFile()) {
          return new NextResponse("Invalid media target", { status: 400 });
        }

        const buffer = await fs.promises.readFile(realPath);

        if (!isImageBuffer(buffer)) {
          return new NextResponse("Invalid image content", { status: 400 });
        }

        const mimeType = getMimeType(realPath, buffer);

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
      }
    }

    // 3. Fallback resolution specifically for Explore Programs cards
    // If the database has a self-referential /api/media string, empty value, missing file, or DB error,
    // reliably resolve to the canonical program card image so the client NEVER sees a blank card.
    if (section === "homepage_programs") {
      const fallbackRelPath = resolveProgramFallback(id);
      const filePath = path.join(process.cwd(), "public", fallbackRelPath.replace(/^\/+/, ""));
      if (fs.existsSync(filePath)) {
        const buffer = await fs.promises.readFile(filePath);
        const mimeType = getMimeType(filePath, buffer);

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
      }
    }

    if (!setting || !setting.value) {
      return new NextResponse("Media section not found", { status: 404 });
    }

    return new NextResponse("Image data not found", { status: 404 });
  } catch (err: any) {
    console.error("API /api/media error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
