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
    this.baseDir = path.resolve(process.env.STORAGE_DIR || "./public/uploads");
  }

  async uploadFile(fileBuffer: Buffer, fileName: string, subDir: string = "certificates"): Promise<{ fileKey: string; publicUrl: string }> {
    const targetDir = path.join(this.baseDir, subDir);
    await fs.mkdir(targetDir, { recursive: true });

    const safeFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(targetDir, safeFileName);

    await fs.writeFile(filePath, fileBuffer);

    const fileKey = `${subDir}/${safeFileName}`;
    const publicUrl = `/uploads/${fileKey}`;

    return { fileKey, publicUrl };
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
