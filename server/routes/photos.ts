import type { PhotoService } from "../services/photoService";
import { Hono } from "hono";

export function createPhotoRoutes(photoService: PhotoService) {
  const app = new Hono();

  app.get("/trip/:tripId", async (c) => {
    try {
      const tripId = c.req.param("tripId");
      const photos = await photoService.getByTripId(tripId);
      return c.json(photos, 200);
    } catch (error) {
      console.error("Ошибка получения фото поездки:", error);
      return c.json({ error: "Не удалось получить фото поездки" }, 500);
    }
  });


  app.get("/trip/:tripId/paginated", async (c) => {
    try {
      const tripId = c.req.param("tripId");
      const page = parseInt(c.req.query("page") || "1");
      const limit = parseInt(c.req.query("limit") || "25");
      
  
      const result = await photoService.getByTripIdPaginated(tripId, page, limit);
      return c.json(result, 200);
    } catch (error) {
      console.error("Ошибка получения фото поездки (paginated):", error);
      return c.json({ error: "Не удалось получить фото поездки" }, 500);
    }
  });

  
  app.get("/folder/:folderId", async (c) => {
    try {
      const folderId = c.req.param("folderId");
      const photos = await photoService.getByFolderId(folderId);
      return c.json(photos, 200);
    } catch (error) {
      console.error("Ошибка получения фото папки:", error);
      return c.json({ error: "Не удалось получить фото папки" }, 500);
    }
  });


  app.get("/folder/:folderId/paginated", async (c) => {
    try {
      const folderId = c.req.param("folderId");
      const page = parseInt(c.req.query("page") || "1");
      const limit = parseInt(c.req.query("limit") || "25");
      
      const result = await photoService.getByFolderIdPaginated(folderId, page, limit);
      return c.json(result, 200);
    } catch (error) {
      console.error("Ошибка получения фото папки (paginated):", error);
      return c.json({ error: "Не удалось получить фото папки" }, 500);
    }
  });

  app.post("/upload", async (c) => {
    try {
      const formData = await c.req.formData();
      const tripId = formData.get("tripId") as string;
      const folderId = formData.get("folderId") as string | null;

      const files: File[] = [];

      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          files.push(value);
        }
      }

      if (files.length === 0) {
        return c.json({ error: "No files provided" }, 400);
      }

      const uploadedPhotos = await photoService.upload(
        tripId,
        files,
        folderId || undefined,
      );
      return c.json(uploadedPhotos, 201);
    } catch (error) {
      console.error("Upload error:", error);
      return c.json({ error: "Failed to upload photos" }, 500);
    }
  });

  app.get("/download/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const { buffer, filename, mimeType } = await photoService.download(id);

      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
          "Content-Length": buffer.length.toString(),
        },
      });
    } catch (error) {
      console.error("Ошибка скачивания фото:", error);
      return c.json({ error: "Не удалось скачать фото" }, 404);
    }
  });

  app.delete("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const deleted = await photoService.delete(id);

      if (deleted) {
        return c.json({ message: "Фото удалено" }, 200);
      } else {
        return c.json({ error: "Фото не найдено" }, 404);
      }
    } catch (error) {
      console.error("Ошибка удаления фото:", error);
      return c.json({ error: "Ошибка удаления фото" }, 500);
    }
  });

  app.post("/delete-batch", async (c) => {
    try {
      const body = await c.req.json<{ ids: string[] }>();
      if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
        return c.json({ error: "Не указаны id фото" }, 400);
      }
      const deleted = await photoService.deleteMany(body.ids);
      return c.json({ deleted }, 200);
    } catch (error) {
      console.error("Ошибка удаления фото:", error);
      return c.json({ error: "Ошибка удаления фото" }, 500);
    }
  });

  return app;
}