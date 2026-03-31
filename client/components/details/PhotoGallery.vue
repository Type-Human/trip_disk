<script setup lang="ts">
import type { Photo } from "../../types/trip";
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from "vue";

const props = defineProps<{
  photos: Photo[];
  folderName?: string;
  selectionMode: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  totalPhotos: number;
}>();

const emit = defineEmits<{
  upload: [];
  photoClick: [index: number];
  deletePhotos: [ids: string[]];
  cancelSelection: [];
  loadMore: [];
}>();

const API_BASE = ((import.meta as any).env?.VITE_API_URL || "/api").replace(
  /\/api\/?$/,
  "",
);

const observer = ref<IntersectionObserver | null>(null);
const sentinelRef = ref<HTMLElement | null>(null);

const selectedIds = ref<Set<string>>(new Set());
const showToolbar = ref(false);

const loadedImages = ref<Set<string>>(new Set());
const lastLoadMoreTime = ref(0);
const LOAD_MORE_DELAY = 1000;

const selectedCount = computed(() => selectedIds.value.size);

const initObserver = () => {
  if (observer.value) {
    observer.value.disconnect();
  }

  observer.value = new IntersectionObserver(
    (entries) => {
      const sentinel = entries[0];
      const now = Date.now();

      if (
        sentinel.isIntersecting &&
        !props.isLoading &&
        !props.isLoadingMore &&
        props.hasMore &&
        now - lastLoadMoreTime.value > LOAD_MORE_DELAY
      ) {
        lastLoadMoreTime.value = now;
        emit("loadMore");
      }
    },
    {
      root: null,
      rootMargin: "50px",
      threshold: 0.1,
    },
  );

  if (sentinelRef.value) {
    observer.value.observe(sentinelRef.value);
  }
};

function getThumbnailUrl(photo: Photo): string {
  if (photo.thumbnailUrl) {
    return `${API_BASE}${photo.thumbnailUrl}`;
  }
  return `${API_BASE}${photo.url}`;
}

function getOriginalUrl(photo: Photo): string {
  return `${API_BASE}${photo.url}`;
}

function handleClick(index: number, photoId: string, event: MouseEvent) {
  if (props.selectionMode) {
    event.stopPropagation();
    toggleSelect(photoId);
  } else {
    emit("photoClick", index);
  }
}

function handleTouchStart(event: TouchEvent, photoId: string, index: number) {
  if (props.selectionMode) {
    event.preventDefault();
    toggleSelect(photoId);
  }
}

function handleImageLoad(photoId: string) {
  loadedImages.value.add(photoId);
}

function handleImageError(event: Event, photo: Photo) {
  const img = event.target as HTMLImageElement;
  img.src = getOriginalUrl(photo);
}

function toggleSelect(photoId: string) {
  const next = new Set(selectedIds.value);
  if (next.has(photoId)) {
    next.delete(photoId);
  } else {
    next.add(photoId);
  }
  selectedIds.value = next;
}

function isSelected(photoId: string) {
  return selectedIds.value.has(photoId);
}

function deleteSelected() {
  const ids = Array.from(selectedIds.value);
  if (ids.length > 0) {
    emit("deletePhotos", ids);
    selectedIds.value.clear();
  }
}

function selectAll() {
  props.photos.forEach((photo) => selectedIds.value.add(photo.id));
}

function deselectAll() {
  selectedIds.value.clear();
}

function handleCancel() {
  emit("cancelSelection");
}

onMounted(() => {
  nextTick(() => {
    initObserver();
  });
});

watch(
  () => [
    props.photos.length,
    props.hasMore,
    props.isLoading,
    props.isLoadingMore,
  ],
  () => {
    nextTick(() => {
      if (observer.value && sentinelRef.value) {
        observer.value.disconnect();
        observer.value.observe(sentinelRef.value);
      }
    });
  },
  { deep: true },
);

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect();
  }
});

watch(
  () => props.selectionMode,
  (newValue) => {
    if (newValue) {
      showToolbar.value = true;
    } else {
      selectedIds.value.clear();
      showToolbar.value = false;
    }
  },
);

watch(
  () => props.isLoading,
  (newVal) => {
    if (!newVal) {
      loadedImages.value.clear();
    }
  },
);
</script>

<template>
  <div class="photo-gallery">
    <div v-if="isLoading && photos.length === 0" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка фотографий...</p>
    </div>
    <div v-else-if="!isLoading && photos.length === 0" class="empty-container">
      <div class="empty-state">
        <div class="empty-icon">📷</div>
        <p class="empty-text">Здесь пока нет фото</p>
        <p class="empty-subtext">Добавьте первое фото</p>
      </div>
    </div>

    <div v-else class="photos-grid" :class="{ 'loading-overlay': isLoading }">
      <div
        v-for="(photo, index) in photos"
        :key="photo.id"
        class="photo-item"
        :class="{
          selected: selectionMode && isSelected(photo.id),
          'image-loaded': loadedImages.has(photo.id),
        }"
        @click="handleClick(index, photo.id, $event)"
        @touchstart="handleTouchStart($event, photo.id, index)"
      >
        <div v-if="selectionMode" class="photo-checkbox">
          <input
            type="checkbox"
            :checked="isSelected(photo.id)"
            @click.stop="toggleSelect(photo.id)"
          />
          <span class="checkmark" />
        </div>

        <div class="image-wrapper">
          <img
            :src="getThumbnailUrl(photo)"
            :alt="photo.filename"
            class="photo-image"
            decoding="async"
            loading="lazy"
            @load="handleImageLoad(photo.id)"
            @error="handleImageError($event, photo)"
            :style="{
              opacity: loadedImages.has(photo.id) ? 1 : 0,
              transition: loadedImages.has(photo.id)
                ? 'opacity 0.15s ease'
                : 'none',
            }"
          />
          <div
            v-if="!loadedImages.has(photo.id)"
            class="image-placeholder"
          ></div>
        </div>
      </div>

 
      <div v-if="isLoading" class="skeleton-overlay">
        <div class="spinner"></div>
        <p>Загрузка...</p>
      </div>
    </div>

    <div
      v-if="hasMore && photos.length > 0"
      ref="sentinelRef"
      class="sentinel"
    ></div>

    <div v-if="isLoadingMore" class="loading-indicator">
      <div class="spinner"></div>
      <p>Загрузка...</p>
    </div>


  </div>

  <div v-if="showToolbar && selectionMode" class="selection-toolbar">
    <div class="toolbar-info">
      <span class="selected-count">Выбрано: {{ selectedCount }}</span>
    </div>

    <div class="toolbar-actions">
      <button
        v-if="selectedCount < photos.length"
        class="toolbar-btn select-all-btn"
        @click="selectAll"
      >
        Выбрать все
      </button>

      <button
        v-if="selectedCount > 0"
        class="toolbar-btn deselect-btn"
        @click="deselectAll"
      >
        Снять всё
      </button>

      <button
        v-if="selectedCount > 0"
        class="toolbar-btn delete-btn"
        @click="deleteSelected"
      >
       
        Удалить 
      </button>

      <button class="toolbar-btn cancel-btn" @click="handleCancel">
        Отмена
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.photo-gallery {
  width: 100%;
  position: relative;
  min-height: 300px;
  padding-bottom: 70px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #0066cc;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  p {
    margin: 0;
    font-size: 16px;
    color: #666;
  }
}
.empty-container {

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    background: #f9f9f9;
    border-radius: 12px;
    margin-top: 20px;

    .empty-icon {
      font-size: 48px;
      opacity: 0.5;
      margin-bottom: 16px;
    }

    .empty-text {
      font-size: 17px;
      font-weight: 500;
      color: #444;
      margin: 0 0 8px 0;
    }

    .empty-subtext {
      font-size: 14px;
      color: #777;
      margin: 0;
    }
  }
}
.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  
  position: relative;
}

.loading-overlay {
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.skeleton-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #0066cc;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 12px;
  }

  p {
    margin: 0;
    font-size: 15px;
    color: #333;
    font-weight: 500;
  }
}

.photo-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  cursor: pointer;
  transition: transform 0.15s ease-out;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.2s ease-out;
  animation-fill-mode: both;

  @for $i from 1 through 50 {
    &:nth-child(#{$i}) {
      animation-delay: $i * 0.005s;
    }
  }

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    z-index: 1;
  }

}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.photo-checkbox {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;

  input {
    position: absolute;
    opacity: 0;
    width: 22px;
    height: 22px;
    cursor: pointer;

    &:checked + .checkmark {
      background: #0066cc;
      border-color: #0066cc;

      &::after {
        display: block;
      }
    }
  }

  .checkmark {
    position: relative;
    display: block;
    width: 22px;
    height: 22px;
    background: white;
    border: 2px solid #ccc;
    border-radius: 6px;

    &::after {
      content: "";
      position: absolute;
      display: none;
      left: 6px;
      top: 0px;
      width: 6px;
      height: 11px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  transition: opacity 0.15s ease;
  will-change: transform;
  image-rendering: auto;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #f0f0f0;
}

.sentinel {
  height: 1px;
  width: 100%;
  margin: 20px 0;
  visibility: hidden;
}

.loading-indicator {
  text-align: center;
  padding: 20px;

  .spinner {
    display: inline-block;
    width: 24px;
    height: 24px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #0066cc;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 8px;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #666;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}



.selection-toolbar {
  background: white;
  padding: 12px;
  margin-bottom: 16px;

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.2s ease-out;
  border: 1px solid #e0e0e0;
  position: fixed;
  top: auto;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.toolbar-info {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.selected-count {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:active {
    transform: scale(0.98);
  }
}

.select-all-btn {
  background: #e8f4ff;
  color: #0066cc;
}

.deselect-btn {
  background: #f0f0f0;
  color: #666;
}

.delete-btn {
  background: #ffe8e8;
  color: #d32f2f;

  svg {
    color: #d32f2f;
  }
}

.cancel-btn {
  background: #f0f0f0;
  color: #333;
  margin-left: auto;
}

@media (max-width: 768px) {
  .selection-toolbar {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0;
    border-radius: 16px 16px 0 0;
    animation: slideUp 0.3s ease-out;
    z-index: 100;
    padding: 16px;
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  .toolbar-actions {
    gap: 6px;
  }

  .toolbar-btn {
    flex: 1;
    justify-content: center;
    padding: 12px;
    font-size: 11px;
    min-width: 0;
  }

  .photos-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .photo-item {
    border-radius: 10px;

    &:hover {
      transform: none;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    }
  }

  .image-wrapper {
    height: 140px;
  }

  .photo-checkbox {
    top: 8px;
    right: 8px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .photos-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1025px) and (max-width: 1440px) {
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    
  }

  .image-wrapper {
    height: 200px;
  }
}

@media (min-width: 1441px) {
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }

  .image-wrapper {
    height: 220px;
  }
}

@media (max-width: 360px) {
  .photos-grid {
    grid-template-columns: repeat(1, 1fr);
  }

  .image-wrapper {
    height: 180px;
  }
}
</style>
