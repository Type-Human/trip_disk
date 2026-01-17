<script setup lang="ts">
import type { Folder } from '../../types/trip'
import { computed } from 'vue'
import { useTripStore } from '../../stores/tripStore'

defineProps<{
  folders: Folder[]
  activeFolder: string
}>()

defineEmits<{
  openMenu: []
}>()

const tripStore = useTripStore()

const currentPhotos = computed(() => {
  if (!tripStore.selectedMedia)
    return []
  return tripStore.selectedMedia.photos
})
</script>

<template>
  <div class="photos">
    <div class="photos-header">
      <button class="mobile-menu-btn" @click="$emit('openMenu')">
        <span class="folder-name">{{ folders.find(f => f.id === activeFolder)?.name }}</span>
      </button>

      <div class="desktop-header-info">
        <h2>{{ folders.find(f => f.id === activeFolder)?.name }}</h2>
        <p v-if="currentPhotos.length > 0" class="photo-count">
          {{ currentPhotos.length }} фото
        </p>
      </div>
    </div>

    <div class="photos-container">
      <div class="photos-grid">
        <div
          v-for="(photo, index) in currentPhotos"
          :key="index"
          class="photo-card"
        >
          <div class="photo-wrapper">
            <img
              :src="photo"
              loading="lazy"
              :alt="`Фото ${index + 1}`"
              class="photo-image"
            >
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentPhotos.length === 0" class="empty-state">
      <div class="empty-icon">
        📷
      </div>
      <p class="empty-text">
        Нет фото в этой папке
      </p>
      <p class="empty-subtext">
        Добавьте фото или выберите другую папку
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.photos {
  padding: 24px;
  padding-top: 0px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.photos-header {
  margin-bottom: 32px;
  flex-shrink: 0;
}

.mobile-menu-btn {
  display: none;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  width: 100%;
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  }

  .menu-icon {
    font-size: 18px;
  }

  .folder-name {
    flex: 1;
    text-align: left;
  }

  .arrow-icon {
    font-size: 12px;
    opacity: 0.6;
  }
}

.desktop-header-info {
  h2 {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.2;
  }

  .photo-count {
    margin: 0;
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
  }
}

.photos-container {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.photos-grid {
  height: 100%;
  overflow-y: auto;
  padding-right: 16px;
  padding-bottom: 24px;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
  align-content: start;
  grid-auto-rows: 240px;
}

.photo-card {
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-8px);

    .photo-wrapper {
      box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
  }
}

.photo-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: white;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
  will-change: transform;
  cursor: pointer;
  .photo-card:hover & {
    transform: scale(1.05);
  }
}

.photo-number {
  color: white;
  font-size: 20px;
  font-weight: 600;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 20px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 24px;
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
    margin: 0;
  }
}

@media (max-width: 767px) {
  .photos {
    padding: 0px;
  }

  .photos-header {
    margin-bottom: 20px;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .desktop-header-info {
    display: none;
  }

  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(calc(50% - 8px), 1fr));
    gap: 16px;
    grid-auto-rows: 160px;
    padding-right: 8px;
    padding-bottom: 16px;
  }

  .empty-state {
    padding: 24px 16px;

    .empty-icon {
      font-size: 48px;
    }

    .empty-text {
      font-size: 18px;
    }
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(calc(33.333% - 16px), 1fr));
    gap: 20px;
    grid-auto-rows: 200px;
  }
}

@media (min-width: 1024px) and (max-width: 1279px) {
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(calc(25% - 18px), 1fr));
    gap: 24px;
    grid-auto-rows: 220px;
  }
}

@media (min-width: 1280px) and (max-width: 1599px) {
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(calc(20% - 19.2px), 1fr));
    gap: 24px;
    grid-auto-rows: 240px;
  }
}

@media (min-width: 1600px) {
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 32px;
    grid-auto-rows: 280px;
  }
}

.photos-grid::-webkit-scrollbar {
  width: 10px;
}

.photos-grid::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 8px;
}

.photos-grid::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 8px;
  border: 2px solid #f1f5f9;

  &:hover {
    background: #94a3b8;
  }
}

.photo-wrapper::before {
  content: '';
  display: block;
  padding-top: 100%;
}

.photo-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

@media (max-height: 800px) {
  .photos-grid {
    grid-auto-rows: 180px;
  }

  @media (min-width: 1280px) {
    .photos-grid {
      grid-auto-rows: 200px;
    }
  }
}

.photo-card {
  animation: fadeInUp 0.5s ease forwards;
  opacity: 0;

  @for $i from 1 through 50 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.05}s;
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
