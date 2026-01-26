<script setup lang="ts">
import type { Folder, Photo, Trip } from '../types/trip'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { tripApi } from '../api'
import PhotoGallery from '../components/details/PhotoGallery.vue'
import AddFolderModal from '../components/modals/AddFolderModal.vue'
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
const isLoading = ref(false)
const isUploading = ref(false)

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
    alert('Не удалось загрузить фото')
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
    alert('Не удалось создать папку')
  }
}

onMounted(() => {
  fetchTripData()
})
</script>

<template>
  <div class="trip-details">
    <div class="header">
      <button class="back-btn" @click="$router.push('/')">
        ← Назад
      </button>

      <div class="header-content">
        <h1>{{ trip?.title || 'Загрузка...' }}</h1>
      </div>

      <div class="header-actions">
        <button class="btn-secondary" @click="showCreateFolder = true">
          + Папка
        </button>
        <button class="btn-primary" @click="showUpload = true">
          📷 Добавить фото
        </button>
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
          {{ folder.name }}
          <span class="photo-count">
            {{ activeFolder === folder.id ? filteredPhotos.length : '' }}
          </span>
        </button>
      </div>
    </div>

    <PhotoGallery
      :photos="filteredPhotos"
      :folder-name="folders.find(f => f.id === activeFolder)?.name || 'Фото'"
      @upload="showUpload = true"
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

    <div v-if="isLoading" class="loading">
      Загрузка...
    </div>
  </div>
</template>

<style scoped lang="scss">
.trip-details {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.header {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.back-btn {
  padding: 8px 16px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: #e5e7eb;
  }
}

.header-content {
  flex: 1;
  min-width: 200px;
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  color: #111827;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
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

.folders-tabs {
  margin-bottom: 32px;
  border-bottom: 1px solid #e5e7eb;
}

.folders-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
}

.folder-tab {
  padding: 12px 24px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: #e5e7eb;
  }

  &.active {
    background: #6366f1;
    color: white;
  }
}

.photo-count {
  font-size: 12px;
  opacity: 0.8;
}

.loading {
  text-align: center;
  padding: 64px;
  color: #6b7280;
}
</style>
