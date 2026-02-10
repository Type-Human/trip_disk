<script setup lang="ts">
import type { Photo } from '../../types/trip'
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  photos: Photo[]
  folderName?: string
  selectionMode: boolean
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  totalPhotos: number
}>()

const emit = defineEmits<{
  upload: []
  photoClick: [index: number]
  deletePhotos: [ids: string[]]
  cancelSelection: []
  loadMore: []
}>()

const API_BASE = ((import.meta as any).env?.VITE_API_URL || '/api').replace(/\/api\/?$/, '')


const loadedCount = ref(0)
const batchSize = 25
const isInitialized = ref(false)


const touchStartX = ref(0)
const touchStartY = ref(0)
const touchStartTime = ref(0)
const touchTarget = ref<HTMLElement | null>(null)
const isTouchDevice = ref(false)
const LONG_PRESS_DELAY = 300 
const MIN_SWIPE_DISTANCE = 30


const thumbnailCache = ref<Map<string, string>>(new Map())


onMounted(() => {
  isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  
 
  loadedCount.value = Math.min(batchSize, props.photos.length)
  isInitialized.value = true
  
  if (props.photos.length > batchSize) {
    setTimeout(loadMoreBatch, 200)
  }
})


watch(() => props.photos, () => {
  loadedCount.value = Math.min(batchSize, props.photos.length)
  isInitialized.value = true
  
  if (props.photos.length > batchSize) {
    setTimeout(loadMoreBatch, 200)
  }
})


function loadMoreBatch() {
  if (loadedCount.value >= props.photos.length) return
  
  requestAnimationFrame(() => {
    const newCount = Math.min(loadedCount.value + batchSize, props.photos.length)
    loadedCount.value = newCount
    
    if (newCount < props.photos.length) {
      setTimeout(loadMoreBatch, 100)
    }
  })
}


function handleScroll() {
  const scrollContainer = document.querySelector('.photo-gallery')
  if (!scrollContainer || props.isLoading || !props.hasMore || props.isLoadingMore) return
  
  const scrollTop = scrollContainer.scrollTop
  const scrollHeight = scrollContainer.scrollHeight
  const clientHeight = scrollContainer.clientHeight
  

  if (scrollTop + clientHeight >= scrollHeight * 0.8) {
    emit('loadMore')
  }
}


function handleTouchStart(event: TouchEvent, photoId: string, index: number) {
  if (!isTouchDevice.value || props.selectionMode) return
  
  const touch = event.touches[0]
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
  touchStartTime.value = Date.now()
  touchTarget.value = event.currentTarget as HTMLElement
  

  setTimeout(() => {
    const currentTime = Date.now()
    if (currentTime - touchStartTime.value >= LONG_PRESS_DELAY) {
      toggleSelect(photoId)
    }
  }, LONG_PRESS_DELAY)
}

function handleTouchMove(event: TouchEvent) {
  if (!isTouchDevice.value) return
  
  const touch = event.touches[0]
  const deltaX = Math.abs(touch.clientX - touchStartX.value)
  const deltaY = Math.abs(touch.clientY - touchStartY.value)
  

  if (deltaX > MIN_SWIPE_DISTANCE || deltaY > MIN_SWIPE_DISTANCE) {
    touchTarget.value = null
  }
}

function handleTouchEnd(event: TouchEvent, index: number) {
  if (!isTouchDevice.value) return
  
  const touchTime = Date.now() - touchStartTime.value
  const touch = event.changedTouches[0]
  const deltaX = Math.abs(touch.clientX - touchStartX.value)
  const deltaY = Math.abs(touch.clientY - touchStartY.value)
  
  if (touchTime < LONG_PRESS_DELAY && 
      deltaX < MIN_SWIPE_DISTANCE && 
      deltaY < MIN_SWIPE_DISTANCE &&
      !props.selectionMode) {
    emit('photoClick', index)
  }
  

  touchStartX.value = 0
  touchStartY.value = 0
  touchStartTime.value = 0
  touchTarget.value = null
}


function handleClick(index: number, photoId: string) {
  if (isTouchDevice.value) return 
  
  if (props.selectionMode) {
    toggleSelect(photoId)
  } else {
    emit('photoClick', index)
  }
}

function getThumbnailUrl(photo: Photo): string {
  const cacheKey = `${photo.id}_thumbnail`
  
  if (thumbnailCache.value.has(cacheKey)) {
    return thumbnailCache.value.get(cacheKey)!
  }
  
  let url = ''
  if (photo.url.startsWith('blob:')) url = photo.url
  else if (photo.url.startsWith('http')) url = photo.url
  else url = `${API_BASE}${photo.url}`
  
  thumbnailCache.value.set(cacheKey, url)
  return url
}

const selectedIds = ref<Set<string>>(new Set())
const showToolbar = ref(false)

const selectedCount = computed(() => selectedIds.value.size)

const displayPhotos = computed(() => {
  return props.photos.slice(0, loadedCount.value)
})

watch(() => props.selectionMode, (newValue) => {
  if (newValue) {
    showToolbar.value = true
  } else {
    selectedIds.value.clear()
    showToolbar.value = false
  }
})


onMounted(() => {
  const gallery = document.querySelector('.photo-gallery')
  if (gallery) {
    gallery.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  const gallery = document.querySelector('.photo-gallery')
  if (gallery) {
    gallery.removeEventListener('scroll', handleScroll)
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

function handleLoadMore() {
  if (!props.isLoading && !props.isLoadingMore && props.hasMore) {
    emit('loadMore')
  }
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
            <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="#FF0000" />
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

    <div v-if="!isLoading && photos.length === 0" class="empty-state">
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
        v-for="(photo, index) in displayPhotos"
        :key="photo.id"
        class="photo-item"
        :class="{ selected: selectionMode && isSelected(photo.id) }"
        @click="handleClick(index, photo.id)"
        @touchstart="handleTouchStart($event, photo.id, index)"
        @touchmove="handleTouchMove($event)"
        @touchend="handleTouchEnd($event, index)"
        @touchcancel="handleTouchEnd($event, index)"
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
          :src="getThumbnailUrl(photo)"
          :alt="photo.filename"
          class="photo-image"
          loading="lazy"
          decoding="async"
        >
      </div>
    </div>

    

    <div v-if="!isLoading && !isLoadingMore && hasMore && photos.length > 0" class="load-more-btn">
      <button @click="handleLoadMore" :disabled="isLoadingMore">
        Показать еще фото
      </button>
    </div>


  </div>
</template>

<style scoped lang="scss">
.photo-gallery {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  contain: content;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

.selection-toolbar {
  background: white;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.2s ease-out;
  border: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  will-change: transform;
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
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

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
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  contain: layout style;
}

.photo-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  cursor: pointer;
  transition: transform 0.15s ease-out;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
  contain: layout;
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
  touch-action: manipulation;

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    z-index: 1;
  }

  &.selected {
    border: 2px solid #0066cc;
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
  height: 180px;
  object-fit: cover;
  display: block;
  pointer-events: none;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.loading-indicator {
  text-align: center;
  padding: 40px;

  .spinner {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #0066cc;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}

.load-more-btn {
  text-align: center;
  padding: 30px 0;
  
  button {
    padding: 12px 24px;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: #4f46e5;
      transform: translateY(-1px);
    }
    
  }
}

.all-loaded {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
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
    font-size: 15px;
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

  .photo-image {
    height: 140px;
  }

  .photo-checkbox {
    top: 8px;
    right: 8px;
  }
  
  .load-more-btn {
    padding: 20px 0;
    
    button {
      padding: 10px 20px;
      font-size: 15px;
      width: 90%;
    }
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
  
  .photo-image {
    height: 200px;
  }
}

@media (min-width: 1441px) {
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
  
  .photo-image {
    height: 220px;
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