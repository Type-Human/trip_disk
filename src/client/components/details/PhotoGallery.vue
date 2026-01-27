<script setup lang="ts">
import type { Photo } from '../../types/trip'

defineProps<{
  photos: Photo[]
  folderName?: string
}>()

defineEmits<{
  upload: []
}>()

function getPhotoUrl(photo: Photo): string {
  if (photo.url.startsWith('blob:')) {
    return photo.url
  }

  if (photo.url.startsWith('http')) {
    return photo.url
  }

  return `http://localhost:3000${photo.url}`
}
</script>

<template>
  <div class="photo-gallery">
    <div v-if="photos.length === 0" class="empty-state">
      <div class="empty-icon">
        📷
      </div>
      <p class="empty-text">
        Нет фото в этой папке
      </p>
      <p class="empty-subtext">
        Добавьте фото, нажав кнопку выше
      </p>
    </div>

    <div v-else class="photos-grid">
      <div
        v-for="photo in photos"
        :key="photo.id"
        class="photo-item"
      >
        <img
          :src="getPhotoUrl(photo)"
          :alt="photo.filename"
          class="photo-image"
          loading="lazy"
        >
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.photo-gallery {
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 64px 24px;
  background: #f9fafb;
  border-radius: 12px;

  .empty-icon {
    font-size: 64px;
    opacity: 0.6;
  }

  .empty-text {
    font-size: 20px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 8px 0;
  }

  .empty-subtext {
    font-size: 14px;
    color: #64748b;
    margin: 0 0 24px 0;
  }

  .upload-btn {
    padding: 12px 24px;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #4f46e5;
    }
  }
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f4f6;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
