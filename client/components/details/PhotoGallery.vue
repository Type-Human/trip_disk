<script setup lang="ts">
import type { Photo } from '../../types/trip'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  photos: Photo[]
  folderName?: string
  selectionMode: boolean
}>()

const emit = defineEmits<{
  upload: []
  photoClick: [index: number]
  deletePhotos: [ids: string[]]
  cancelSelection: []
}>()

const API_BASE = ((import.meta as any).env?.VITE_API_URL || '/api').replace(/\/api\/?$/, '')

function getPhotoUrl(photo: Photo): string {
  if (photo.url.startsWith('blob:'))
    return photo.url
  if (photo.url.startsWith('http'))
    return photo.url
  return `${API_BASE}${photo.url}`
}

const selectedIds = ref<Set<string>>(new Set())
const showToolbar = ref(false)
const touchStartTime = ref(0)
const touchStartY = ref(0)
const touchStartX = ref(0)
const touchMoved = ref(false)
const activeTouchIndex = ref<number | null>(null)

const selectedCount = computed(() => selectedIds.value.size)

watch(() => props.selectionMode, (newValue) => {
  if (newValue) {
    showToolbar.value = true
  }
  else {
    selectedIds.value.clear()
    showToolbar.value = false
  }
})

function toggleSelect(photoId: string) {
  const next = new Set(selectedIds.value)
  if (next.has(photoId))
    next.delete(photoId)
  else
    next.add(photoId)
  selectedIds.value = next
}

function isSelected(photoId: string) {
  return selectedIds.value.has(photoId)
}

function handleTouchStart(e: TouchEvent, index: number) {
  touchStartTime.value = Date.now()
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  touchMoved.value = false
  activeTouchIndex.value = index
  
  e.preventDefault()
}

function handleTouchMove(e: TouchEvent) {
  if (activeTouchIndex.value !== null && !touchMoved.value) {
    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const diffX = Math.abs(currentX - touchStartX.value)
    const diffY = Math.abs(currentY - touchStartY.value)
    
    if (diffX > 5 || diffY > 5) {
      touchMoved.value = true
    }
  }
}

function handleTouchEnd(e: TouchEvent, index: number) {
  const touchEndTime = Date.now()
  const timeDiff = touchEndTime - touchStartTime.value
  
  if (!touchMoved.value && timeDiff < 300 && activeTouchIndex.value === index) {
    handlePhotoClick(index)
  }
  
  activeTouchIndex.value = null
  touchMoved.value = false
}

function handlePhotoClick(index: number) {
  if (props.selectionMode) {
    toggleSelect(props.photos[index].id)
  } else {
    emit('photoClick', index)
  }
}

function deleteSelected() {
  const ids = Array.from(selectedIds.value)
  if (ids.length > 0) {
    emit('deletePhotos', ids)
    selectedIds.value.clear()
  }
}

function selectAll() {
  props.photos.forEach(photo => selectedIds.value.add(photo.id))
}

function deselectAll() {
  selectedIds.value.clear()
}

function handleCancel() {
  emit('cancelSelection')
}
</script>

<template>
  <div class="photo-gallery">
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor" />
          </svg>
          Удалить ({{ selectedCount }})
        </button>

        <button
          class="toolbar-btn cancel-btn"
          @click="handleCancel"
        >
          Отмена
        </button>
      </div>
    </div>

    <div v-if="photos.length === 0" class="empty-state">
      <div class="empty-icon">
        📷
      </div>
      <p class="empty-text">
        Здесь пока нет фото
      </p>
      <p class="empty-subtext">
        Добавьте первое фото
      </p>
    </div>

    <div v-else class="photos-grid">
      <div
        v-for="(photo, index) in photos"
        :key="photo.id"
        class="photo-item"
        :class="{ selected: selectionMode && isSelected(photo.id) }"
        @touchstart="(e) => handleTouchStart(e, index)"
        @touchmove="handleTouchMove"
        @touchend="(e) => handleTouchEnd(e, index)"
        @click="() => handlePhotoClick(index)"
      >

        <div v-if="selectionMode" class="photo-checkbox">
          <input
            type="checkbox"
            :checked="isSelected(photo.id)"
            @click.stop="toggleSelect(photo.id)"
          >
          <span class="checkmark" />
        </div>

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
  padding: 0 4px;
}

.selection-toolbar {
  background: white;
  padding: 12px;
  margin: 0 -4px 16px -4px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.2s ease-out;
  border: 1px solid #e0e0e0;
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

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.photo-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
  touch-action: pan-y;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.selected {
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
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
      content: '';
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

.photo-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

@media (max-width: 768px) {
  .photo-gallery {
    padding: 0;
  }

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
    font-size: 15px;
    min-width: 0;
  }

  .photos-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .photo-item {
    border-radius: 10px;
  }

  .photo-image {
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

@media (max-width: 360px) {
  .photos-grid {
    grid-template-columns: repeat(1, 1fr);
  }

  .photo-image {
    height: 180px;
  }
}
</style>