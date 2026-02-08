import type { Photo } from "../types/trip";
import { existsSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { getDatabase } from "../database";
import { fileStorage } from "../storage";
import { readFile } from "node:fs/promises";

export class PhotoService {
  async initialize(): Promise<void> {}

  async getByTripId(tripId: string): Promise<Photo[]> {
    const db = getDatabase().getDatabase();
    const photos = db
      .prepare("SELECT * FROM photos WHERE tripId = ? ORDER BY uploadedAt DESC")
      .all(tripId) as Photo[];
    return photos;
  }

  async getByFolderId(folderId: string): Promise<Photo[]> {
    const db = getDatabase().getDatabase();
    const photos = db
      .prepare(
        "SELECT * FROM photos WHERE folderId = ? ORDER BY uploadedAt DESC",
      )
      .all(folderId) as Photo[];
    return photos;
  }

  async upload(
    tripId: string,
    files: File[],
    folderId?: string,
  ): Promise<Photo[]> {
    const db = getDatabase().getDatabase();
    const uploadedPhotos: Photo[] = [];

    for (const file of files) {
      const filename = await fileStorage.saveFile(file);

      const photo: Photo = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tripId,
        url: `/uploads/${filename}`,
        filename: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        folderId,
      };

      db.prepare(
        `
        INSERT INTO photos (id, tripId, folderId, url, filename, size, uploadedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      ).run(
        photo.id,
        photo.tripId,
        photo.folderId || null,
        photo.url,
        photo.filename,
        photo.size,
        photo.uploadedAt,
      );

      uploadedPhotos.push(photo);
    }

    return uploadedPhotos;
  }

  async deleteMany(ids: string[]): Promise<number> {
    let count = 0;
    for (const id of ids) {
      const ok = await this.delete(id);
      if (ok) count += 1;
    }
    return count;
  }

  async delete(id: string): Promise<boolean> {

    const db = getDatabase().getDatabase();
    const photo = db.prepare("SELECT * FROM photos WHERE id = ?").get(id) as
      | Photo
      | undefined;

    if (!photo) {
      return false;
    }

    try {
      const filename = photo.url.replace("/uploads/", "");
      console.log(`📄 Имя файла из URL: ${filename}`);

      const filepath = join("/app/uploads", filename);

      if (existsSync(filepath)) {
        await unlink(filepath);
      } else {

        const fs = require("fs");
        const files = fs.readdirSync("/app/uploads");

        const similar = files.filter((f) => f.includes(filename));
      }
    } catch (error) {
      console.error("💥 Ошибка удаления файла:", error);
    }

    const result = db.prepare("DELETE FROM photos WHERE id = ?").run(id);

    return result.changes > 0;
  }

  async deleteByTripId(tripId: string): Promise<number> {
    const db = getDatabase().getDatabase();
    const photos = db
      .prepare("SELECT * FROM photos WHERE tripId = ?")
      .all(tripId) as Photo[];

    for (const photo of photos) {
      try {
        const filename = photo.url.replace("/uploads/", "");
        const filepath = join("/app/uploads", filename);

        if (existsSync(filepath)) {
          await unlink(filepath);
        }
      } catch (error) {
        console.error("Ошибка удаления файла:", error);
      }
    }

    const result = db
      .prepare("DELETE FROM photos WHERE tripId = ?")
      .run(tripId);
    return result.changes;
  }

  async deleteByFolderId(folderId: string): Promise<number> {
    const db = getDatabase().getDatabase();
    const photos = db
      .prepare("SELECT * FROM photos WHERE folderId = ?")
      .all(folderId) as Photo[];

    for (const photo of photos) {
      try {
        const filename = photo.url.replace("/uploads/", "");
        const filepath = join("/app/uploads", filename);

        if (existsSync(filepath)) {
          await unlink(filepath);
        }
      } catch (error) {
        console.error("Ошибка удаления файла:", error);
      }
    }

    const result = db
      .prepare("DELETE FROM photos WHERE folderId = ?")
      .run(folderId);
    return result.changes;
  }

  async download(
    id: string,
  ): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    const db = getDatabase().getDatabase();
    const photo = db.prepare("SELECT * FROM photos WHERE id = ?").get(id) as
      | Photo
      | undefined;

    if (!photo) {
      throw new Error("Фото не найдено в БД");
    }

    const filename = photo.url.replace("/uploads/", "");
    const filepath = join("/app/uploads", filename);

    if (!existsSync(filepath)) {
      throw new Error("Файл не найден на диске");
    }

    const buffer = await readFile(filepath);

    const getMimeType = (filename: string): string => {
      const ext = filename.split(".").pop()?.toLowerCase();
      switch (ext) {
        case "jpg":
        case "jpeg":
          return "image/jpeg";
        case "png":
          return "image/png";
        case "gif":
          return "image/gif";
        case "webp":
          return "image/webp";
        default:
          return "application/octet-stream";
      }
    };

    return {
      buffer,
      filename: photo.filename,
      mimeType: getMimeType(photo.filename),
    };
  }
}
