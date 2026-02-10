<script setup lang="ts">
import type { Photo } from '../../types/trip'
import { computed, ref, watch, onMounted } from 'vue'

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

const visibleCount = ref(25)
const loadStep = 25
const isLoadingMore = ref(false)


function loadMorePhotos() {
  if (visibleCount.value >= props.photos.length) return
  
  isLoadingMore.value = true
  setTimeout(() => {
    visibleCount.value = Math.min(visibleCount.value + loadStep, props.photos.length)
    isLoadingMore.value = false
  }, 100)
}


function checkScroll() {
  const scrollContainer = document.querySelector('.photo-gallery')
  if (!scrollContainer) return
  
  const scrollTop = scrollContainer.scrollTop
  const scrollHeight = scrollContainer.scrollHeight
  const clientHeight = scrollContainer.clientHeight
  
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    loadMorePhotos()
  }
}


const selectedIds = ref<Set<string>>(new Set())
const showToolbar = ref(false)

const selectedCount = computed(() => selectedIds.value.size)

watch(() => props.selectionMode, (newValue) => {
  if (newValue) {
    showToolbar.value = true
  } else {
    selectedIds.value.clear()
    showToolbar.value = false
  }
})


watch(() => props.photos, () => {
  visibleCount.value = 30
  selectedIds.value.clear()
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

function handleClick(index: number) {
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
  selectedIds.value = new Set(props.photos.map(photo => photo.id))
}

function deselectAll() {
  selectedIds.value.clear()
}

function handleCancel() {
  emit('cancelSelection')
}


onMounted(() => {
  const gallery = document.querySelector('.photo-gallery')
  if (gallery) {
    gallery.addEventListener('scroll', checkScroll)
  }
})
</script>

<template>
  <div class="photo-gallery">
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
        v-for="(photo, index) in photos.slice(0, visibleCount)" 
        :key="photo.id" 
        class="photo-item"
        :class="{ selected: selectionMode && isSelected(photo.id) }" 
        @click="() => handleClick(index)"
      >
        <div v-if="selectionMode" class="photo-checkbox">
          <input type="checkbox" :checked="isSelected(photo.id)" @click.stop="toggleSelect(photo.id)">
          <span class="checkmark" />
        </div>

        <img 
          :src="getPhotoUrl(photo)" 
          :alt="photo.filename" 
          class="photo-image" 
          loading="lazy" 
          decoding="async"
          @load="(e: any) => e.target.classList.add('loaded')"
        />
        

        <div class="photo-loading"></div>
      </div>
    </div>
    
    <div v-if="visibleCount < photos.length" class="loading-more" @click="loadMorePhotos">
      <div v-if="isLoadingMore" class="spinner"></div>
      <span v-else>Показать еще</span>
    </div>
  </div>


  <div v-if="showToolbar && selectionMode" class="selection-toolbar">
    <div class="toolbar-info">
      <span class="selected-count">Выбрано: {{ selectedCount }}</span>
    </div>

    <div class="toolbar-actions">
      <button v-if="selectedCount < photos.length" class="toolbar-btn select-all-btn" @click="selectAll">
        Выбрать все
      </button>

      <button v-if="selectedCount > 0" class="toolbar-btn deselect-btn" @click="deselectAll">
        Снять всё
      </button>

      <button v-if="selectedCount > 0" class="toolbar-btn delete-btn" @click="deleteSelected">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"
            fill="#FF0000" />
        </svg>
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
  min-height: 100vh;
  padding-bottom: 80px;
  position: relative;
}



.loading-more {
  text-align: center;
  padding: 20px;
  color: #666;
  cursor: pointer;
  
  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #f3f4f6;
    border-top: 3px solid #6366f1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }
  
  span {
    display: inline-block;
    padding: 8px 16px;
    background: #f3f4f6;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
    
    &:hover {
      background: #e5e7eb;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.selection-toolbar {
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.2s ease-out;
  border: 1px solid #e0e0e0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
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
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
  padding: 4px;
}

.photo-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  cursor: pointer;
  transition: transform 0.2s ease;
  aspect-ratio: 1 / 1;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1;
  }

  &.selected {
    outline: 3px solid #0066cc;
    outline-offset: -3px;
  }
}

.photo-checkbox {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;

  input {
    position: absolute;
    opacity: 0;
    width: 20px;
    height: 20px;
    cursor: pointer;

    &:checked+.checkmark {
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
    width: 20px;
    height: 20px;
    background: white;
    border: 2px solid #ccc;
    border-radius: 4px;

    &::after {
      content: '';
      position: absolute;
      display: none;
      left: 5px;
      top: 1px;
      width: 6px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  &.loaded {
    opacity: 1;
  }
}

.photo-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  opacity: 0.5;
  
  .photo-image.loaded ~ & {
    opacity: 0;
    pointer-events: none;
  }
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 768px) {
  .photo-gallery {
    padding: 0 8px 70px 8px;
  }
  

  .photos-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }
  
  .toolbar-actions {
    gap: 6px;
  }

  .toolbar-btn {
    flex: 1;
    justify-content: center;
    padding: 10px;
    font-size: 12px;
    min-width: 0;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .photos-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
}

@media (min-width: 1025px) and (max-width: 1440px) {
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }
}

@media (min-width: 1441px) {
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 14px;
  }
}
</style>