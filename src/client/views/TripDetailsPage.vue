<script setup lang="ts">
import type { Folder, Photo, Trip } from '../types/trip'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { tripApi } from '../api'
import PhotoGallery from '../components/details/PhotoGallery.vue'
import AddFolderModal from '../components/modals/AddFolderModal.vue'
import PhotoUpload from '../components/Upload/PhotoUpload.vue'

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
          Добавить фото
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
  padding: 16px;

  @media (min-width: 640px) {
    padding: 24px;
  }
}

.header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;

  @media (min-width: 768px) {
    gap: 24px;
    margin-bottom: 32px;
  }
}

.back-btn {
  padding: 10px 14px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-size: 14px;

  @media (min-width: 640px) {
    padding: 8px 16px;
  }

  &:hover {
    background: #e5e7eb;
  }
}

.header-content {
  flex: 1;
  min-width: 0;
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 20px;
  line-height: 1.3;
  color: #111827;

  @media (min-width: 640px) {
    font-size: 24px;
  }

  @media (min-width: 1024px) {
    font-size: 32px;
  }
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  width: 100%;

  @media (min-width: 640px) {
    width: auto;
    gap: 12px;
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
  flex: 1;
  min-width: 0;
  justify-content: center;

  @media (min-width: 375px) {
    font-size: 14px;
    padding: 10px 16px;
  }

  @media (min-width: 640px) {
    flex: none;
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

.folders-tabs {
  border-bottom: 1px solid #e5e7eb;
}

.folders-scroll {
  display: flex;
  gap: 6px;
  overflow-x: auto;

  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 640px) {
    gap: 8px;
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
    flex-direction: column;
    gap: 12px;
  }

  .back-btn {
    align-self: flex-start;
  }

  .header-content {
    width: 100%;
  }

  .header-actions {
    justify-content: stretch;
  }

  .btn-primary,
  .btn-secondary {
    font-size: 12px;

    @media (min-width: 350px) {
      font-size: 13px;
    }
  }
}

@media (max-width: 374px) {
  .header-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }

  .folder-tab .folder-name {
    max-width: 80px;
  }
}
</style>
