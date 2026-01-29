<script setup lang="ts">
import type { Folder, Photo, Trip } from '../types/trip'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { tripApi } from '../api'
import PhotoGallery from '../components/details/PhotoGallery.vue'
import PhotoViewer from '../components/details/PhotoViewer.vue'
import AddFolderModal from '../components/modals/AddFolderModal.vue'
import BackBtn from '../components/ui/BackBtn.vue'
import PhotoUpload from '../components/upload/PhotoUpload.vue'

const route = useRoute()
const tripId = route.params.id as string

const trip = ref<Trip | null>(null)
const photos = ref<Photo[]>([])
const folders = ref<Folder[]>([
  { id: 'all', name: 'Все фото', tripId, createdAt: new Date().toISOString() },
])
const activeFolder = ref('all')
const showUpload = ref(false)
const showCreateFolder = ref(false)
const showPhotoViewer = ref(false)
const currentPhotoIndex = ref(0)
const isLoading = ref(false)
const isUploading = ref(false)
const showMobileMenu = ref(false)

const filteredPhotos = computed(() => {
  if (activeFolder.value === 'all') {
    return photos.value
  }
  return photos.value.filter(photo => photo.folderId === activeFolder.value)
})

const realFolders = computed(() => {
  return folders.value.filter(f => f.id !== 'all')
})

async function fetchTripData() {
  try {
    isLoading.value = true
    const [tripData, photosData, foldersData] = await Promise.all([
      tripApi.getById(tripId),
      tripApi.getPhotosByTripId(tripId),
      tripApi.getFoldersByTripId(tripId),
    ])

    trip.value = tripData
    photos.value = photosData
    folders.value = [
      { id: 'all', name: 'Все фото', tripId, createdAt: new Date().toISOString() },
      ...foldersData,
    ]
  }
  catch (error) {
    console.error('Ошибка загрузки данных:', error)
  }
  finally {
    isLoading.value = false
  }
}

async function handlePhotoUpload(files: File[], folderId?: string) {
  try {
    isUploading.value = true
    showUpload.value = false

    const targetFolderId = folderId || (activeFolder.value !== 'all' ? activeFolder.value : undefined)
    const uploadedPhotos = await tripApi.uploadPhotos(tripId, files, targetFolderId)
    photos.value.push(...uploadedPhotos)
  }
  catch (error) {
    console.error('Ошибка загрузки фото:', error)
  }
  finally {
    isUploading.value = false
  }
}

async function handleCreateFolder(name: string) {
  try {
    const folder = await tripApi.createFolder(tripId, name)
    folders.value.push(folder)
    activeFolder.value = folder.id
    showCreateFolder.value = false
  }
  catch (error) {
    console.error('Ошибка создания папки:', error)
  }
}

function openPhotoViewer(index: number) {
  currentPhotoIndex.value = index
  showPhotoViewer.value = true
}

onMounted(() => {
  fetchTripData()
})
</script>

<template>
  <div class="trip-details">
    <div class="header">
      <div class="title-container">
        <BackBtn />
        <div class="header-content">
          <h1>{{ trip?.title || 'Загрузка...' }}</h1>
        </div>
      </div>

      <div class="desktop-actions">
        <button class="btn-secondary" @click="showCreateFolder = true">
          + Папка
        </button>
        <button class="btn-primary" @click="showUpload = true">
          Добавить фото
        </button>
      </div>

      <div class="mobile-menu">
        <button class="mobile-menu-button" @click="showMobileMenu = !showMobileMenu">
          <span class="menu-dots">⋮</span>
        </button>

        <div v-if="showMobileMenu" class="mobile-menu-overlay" @click="showMobileMenu = false">
          <div class="mobile-menu-content" @click.stop>
            <button class="mobile-menu-item" @click="showCreateFolder = true; showMobileMenu = false">
              + Папка
            </button>
            <button class="mobile-menu-item" @click="showUpload = true; showMobileMenu = false">
              Добавить фото
            </button>
            <button class="mobile-menu-close" @click="showMobileMenu = false">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="folders-tabs">
      <div class="folders-scroll">
        <button
          v-for="folder in folders"
          :key="folder.id"
          class="folder-tab"
          :class="{ active: activeFolder === folder.id }"
          @click="activeFolder = folder.id"
        >
          <span class="folder-name">{{ folder.name }}</span>
          <span v-if="activeFolder === folder.id" class="photo-count">
            {{ filteredPhotos.length }}
          </span>
        </button>
      </div>
    </div>

    <PhotoGallery
      :photos="filteredPhotos"
      :folder-name="folders.find(f => f.id === activeFolder)?.name || 'Фото'"
      @upload="showUpload = true"
      @photo-click="openPhotoViewer"
    />

    <PhotoUpload
      v-if="showUpload"
      :folders="realFolders"
      :selected-folder-id="activeFolder !== 'all' ? activeFolder : null"
      @close="showUpload = false"
      @upload="handlePhotoUpload"
    />

    <AddFolderModal
      v-if="showCreateFolder"
      @close="showCreateFolder = false"
      @create="handleCreateFolder"
    />

    <PhotoViewer
      v-if="showPhotoViewer"
      :photos="filteredPhotos"
      :current-index="currentPhotoIndex"
      :show="showPhotoViewer"
      @close="showPhotoViewer = false"
      @update:current-index="currentPhotoIndex = $event"
    />

    <div v-if="isLoading" class="loading">
      Загрузка...
    </div>
  </div>
</template>

<style scoped lang="scss">
.trip-details {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px;

  @media (min-width: 640px) {
    padding: 24px;
  }
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  position: relative;

  @media (min-width: 768px) {
    margin-bottom: 32px;
  }
}

.title-container {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.header-content {
  flex: 1;
  min-width: 0;
}

.header-content h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (min-width: 640px) {
    font-size: 24px;
  }

  @media (min-width: 1024px) {
    font-size: 32px;
  }
}

.desktop-actions {
  display: none;

  @media (min-width: 640px) {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}

.btn-primary,
.btn-secondary {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;

  @media (min-width: 375px) {
    font-size: 14px;
    padding: 10px 16px;
  }

  @media (min-width: 640px) {
    padding: 12px 20px;
  }

  @media (min-width: 768px) {
    padding: 12px 24px;
  }
}

.btn-primary {
  background: #6366f1;
  color: white;
  border: none;

  &:hover {
    background: #4f46e5;
  }
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;

  &:hover {
    background: #f9fafb;
  }
}

.mobile-menu {
  @media (min-width: 640px) {
    display: none;
  }
}

.mobile-menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 18px;
  line-height: 1;

  &:hover {
    background: #e5e7eb;
  }

  .menu-dots {
    display: inline-block;
    transform: rotate(90deg);
    font-weight: bold;
    color: #374151;
  }
}

.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn 0.2s ease-out;
}

.mobile-menu-content {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 16px 16px 0 0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: slideUp 0.3s ease-out;
}

.mobile-menu-item {
  padding: 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 12px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e5e7eb;
  }
}

.mobile-menu-close {
  padding: 16px;
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #111827;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.folders-tabs {
  border-bottom: 1px solid #e5e7eb;
}

.folders-scroll {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 2px;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 3px;
  }

  @media (min-width: 640px) {
    gap: 8px;

    &::-webkit-scrollbar {
      height: 8px;
    }
  }
}

.folder-tab {
  padding: 10px 14px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  font-size: 13px;
  flex-shrink: 0;

  @media (min-width: 375px) {
    padding: 10px 16px;
  }

  @media (min-width: 640px) {
    padding: 12px 20px;
    font-size: 14px;
    gap: 8px;
  }

  @media (min-width: 768px) {
    padding: 12px 24px;
  }

  &:hover {
    background: #e5e7eb;
  }

  &.active {
    background: #6366f1;
    color: white;
  }

  .folder-name {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;

    @media (min-width: 375px) {
      max-width: 120px;
    }

    @media (min-width: 640px) {
      max-width: 150px;
    }

    @media (min-width: 768px) {
      max-width: 200px;
    }
  }
}

.photo-count {
  font-size: 11px;
  opacity: 0.8;
  flex-shrink: 0;

  @media (min-width: 640px) {
    font-size: 12px;
  }
}

.loading {
  text-align: center;
  padding: 48px;
  color: #6b7280;

  @media (min-width: 768px) {
    padding: 64px;
  }
}

@media (max-width: 639px) {
  .header {
    gap: 12px;
  }

  .title-container {
    gap: 10px;
  }

  .header-content h1 {
    font-size: 18px;

    @media (min-width: 375px) {
      font-size: 20px;
    }
  }
}
</style>
