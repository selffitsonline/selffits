import fs from "fs/promises";
import path from "path";

export interface StorageProvider {
  uploadFile(fileBuffer: Buffer, fileName: string, subDir?: string): Promise<{ fileKey: string; publicUrl: string }>;
  deleteFile(fileKey: string): Promise<boolean>;
  getPublicUrl(fileKey: string): string;
}

export class LocalStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), "public", "uploads");
  }

  async uploadFile(fileBuffer: Buffer, fileName: string, subDir: string = "certificates"): Promise<{ fileKey: string; publicUrl: string }> {
    const safeFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const fileKey = `${subDir}/${safeFileName}`;

    try {
      const targetDir = path.join(this.baseDir, subDir);
      await fs.mkdir(targetDir, { recursive: true });
      const filePath = path.join(targetDir, safeFileName);
      await fs.writeFile(filePath, fileBuffer);
      return { fileKey, publicUrl: `/uploads/${fileKey}` };
    } catch (err) {
      // Fallback for Vercel Serverless environment where /public is read-only
      try {
        const tmpDir = path.join("/tmp", subDir);
        await fs.mkdir(tmpDir, { recursive: true });
        await fs.writeFile(path.join(tmpDir, safeFileName), fileBuffer);
      } catch {}

      const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
      let mimeType = "application/octet-stream";
      if (ext === ".pdf") mimeType = "application/pdf";
      else if (ext === ".doc") mimeType = "application/msword";
      else if (ext === ".docx") mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      else if (ext === ".png") mimeType = "image/png";
      else if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
      else if (ext === ".webp") mimeType = "image/webp";

      const base64Str = fileBuffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64Str}`;
      return { fileKey: dataUrl, publicUrl: dataUrl };
    }
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    try {
      const filePath = path.join(this.baseDir, fileKey);
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  getPublicUrl(fileKey: string): string {
    return `/uploads/${fileKey}`;
  }
}

export const storageProvider: StorageProvider = new LocalStorageProvider();
