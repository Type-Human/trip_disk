<script setup lang="ts">
import type { Folder, Photo, Trip } from "../types/trip";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { tripApi } from "@/api";
import PhotoGallery from "../components/details/PhotoGallery.vue";
import PhotoViewer from "../components/details/PhotoViewer.vue";
import AddFolderModal from "../components/modals/AddFolderModal.vue";
import BackBtn from "../components/ui/BackBtn.vue";
import Icon from "../components/ui/Icon.vue";
import PhotoUpload from "../components/upload/PhotoUpload.vue";
import DeleteModal from "../components/modals/DeleteModal.vue";

const route = useRoute();
const tripId = route.params.id as string;

const trip = ref<Trip | null>(null);
const photos = ref<Photo[]>([]);
const folders = ref<Folder[]>([
  { id: "all", name: "Все фото", tripId, createdAt: new Date().toISOString() },
]);
const activeFolder = ref("all");
const showUpload = ref(false);
const showCreateFolder = ref(false);
const showPhotoViewer = ref(false);
const currentPhotoIndex = ref(0);
const isLoading = ref(false);
const isChangingFolder = ref(false);
const isUploading = ref(false);
const showMobileMenu = ref(false);
const showDeleteModal = ref(false);
const folderIdDelete = ref<string | false>(false);
const isDeleting = ref(false);

const currentPage = ref(1);
const totalPages = ref(1);
const totalPhotos = ref(0);
const hasMore = ref(false);
const isLoadingMore = ref(false);

const selectionMode = ref(false);

const filteredPhotos = computed(() => {
  if (activeFolder.value === "all") {
    return photos.value;
  }
  return photos.value.filter((photo) => photo.folderId === activeFolder.value);
});

const realFolders = computed(() => {
  return folders.value.filter((f) => f.id !== "all");
});

function startSelection() {
  selectionMode.value = true;
}

function cancelSelection() {
  selectionMode.value = false;
}

async function fetchTripData() {
  try {
    isLoading.value = true;
    const [tripData, foldersData] = await Promise.all([
      tripApi.getById(tripId),
      tripApi.getFoldersByTripId(tripId),
    ]);

    trip.value = tripData;
    folders.value = [
      {
        id: "all",
        name: "Все фото",
        tripId,
        createdAt: new Date().toISOString(),
      },
      ...foldersData,
    ];

    await loadFolderPhotos(activeFolder.value, 1, false);
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
  } finally {
    isLoading.value = false;
  }
}

async function loadFolderPhotos(
  folderId: string,
  page: number = 1,
  append: boolean = false,
) {
  try {
    if (append) {
      isLoadingMore.value = true;
    } else {
      isChangingFolder.value = true;
    }

    let result;
    if (folderId === "all") {
      result = await tripApi.getPhotosByTripIdPaginated(tripId, page, 50);
    } else {
      result = await tripApi.getPhotosByFolderIdPaginated(folderId, page, 50);
    }

    if (append) {
      photos.value = [...photos.value, ...result.photos];
    } else {
      photos.value = result.photos;
    }

    currentPage.value = result.page;
    totalPages.value = result.totalPages;
    totalPhotos.value = result.total;
    hasMore.value = result.page < result.totalPages;
  } catch (error) {
    console.error("Ошибка загрузки фото папки:", error);
    if (!append) {
      photos.value = [];
    }
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
    isChangingFolder.value = false;
  }
}

async function loadMorePhotos() {
  if (hasMore.value && !isLoadingMore.value && !isLoading.value) {
    await loadFolderPhotos(activeFolder.value, currentPage.value + 1, true);
  }
}

function handleFolderClick(folderId: string) {
  if (activeFolder.value === folderId) return;

  activeFolder.value = folderId;
  currentPage.value = 1;

  loadFolderPhotos(folderId, 1, false);
}

watch(
  () => activeFolder.value,
  (newFolderId) => {
    if (newFolderId) {
      currentPage.value = 1;
    }
  },
);

async function handlePhotoUpload(files: File[], folderId?: string) {
  try {
    isUploading.value = true;
    const targetFolderId =
      folderId ||
      (activeFolder.value !== "all" ? activeFolder.value : undefined);
    const uploadedPhotos = await tripApi.uploadPhotos(
      tripId,
      files,
      targetFolderId,
    );

    photos.value = [...photos.value, ...uploadedPhotos];
    totalPhotos.value += uploadedPhotos.length;

    showUpload.value = false;
  } catch (error) {
    console.error("Ошибка загрузки фото:", error);
  } finally {
    isUploading.value = false;
  }
}

async function handleCreateFolder(name: string) {
  try {
    const folder = await tripApi.createFolder(tripId, name);

    folders.value.push(folder);
    activeFolder.value = folder.id;
    showCreateFolder.value = false;

    await loadFolderPhotos(folder.id, 1, false);
  } catch (error) {
    console.error("Ошибка создания папки:", error);
  }
}

async function handleDeletePhotos(ids: string[]) {
  try {
    await tripApi.deletePhotos(ids);
    photos.value = photos.value.filter((p) => !ids.includes(p.id));
    totalPhotos.value = photos.value.length;
    cancelSelection();
  } catch (error) {
    console.error("Ошибка удаления фото:", error);
  }
}

async function handleDeleteFolder(folderId: string) {
  showDeleteModal.value = true;
  folderIdDelete.value = folderId;
}

async function confirmDeleteModal() {
  if (!folderIdDelete.value) return;

  try {
    isDeleting.value = true;
    await tripApi.deleteFolder(folderIdDelete.value);
    folders.value = folders.value.filter((f) => f.id !== folderIdDelete.value);
    photos.value = photos.value.filter(
      (p) => p.folderId !== folderIdDelete.value,
    );

    showDeleteModal.value = false;
    if (activeFolder.value === String(folderIdDelete.value)) {
      activeFolder.value = "all";
      await loadFolderPhotos("all", 1, false);
    }

    folderIdDelete.value = false;
  } catch (error) {
    console.error(error);
  } finally {
    isDeleting.value = false;
  }
}

function closeDeleteModal() {
  if (!isDeleting.value) {
    showDeleteModal.value = false;
    folderIdDelete.value = false;
  }
}

function openPhotoViewer(index: number) {
  if (selectionMode.value) return;
  currentPhotoIndex.value = index;
  showPhotoViewer.value = true;
}

onMounted(() => {
  fetchTripData();
});
</script>

<template>
  <div class="trip-details">
    <div class="header">
      <div class="title-container">
        <BackBtn />
        <div class="header-content">
          <h1>{{ trip?.title || "Загрузка..." }}</h1>
        </div>
      </div>
      <button
        v-if="!selectionMode && filteredPhotos?.length > 0"
        class="manage-photos-btn"
        :title="
          selectionMode ? 'Выйти из режима выбора' : 'Управление фотографиями'
        "
        @click="startSelection"
      >
        <Icon :size="20" filled color="#FF0000">
          <path
            d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"
          />
        </Icon>
      </button>
      <div class="desktop-actions">
        <button class="btn-secondary" @click="showCreateFolder = true">
          + Папка
        </button>
        <button class="btn-primary" @click="showUpload = true">
          Добавить фото
        </button>
        
      </div>
      <div class="mobile-menu">
        <button
          class="mobile-menu-button"
          @click="showMobileMenu = !showMobileMenu"
        >
          <span class="menu-dots">⋮</span>
        </button>

        <div
          v-if="showMobileMenu"
          class="mobile-menu-overlay"
          @click="showMobileMenu = false"
        >
          <div class="mobile-menu-content" @click.stop>
            <button
              class="mobile-menu-item"
              @click="
                showCreateFolder = true;
                showMobileMenu = false;
              "
            >
              + Папка
            </button>
            <button
              class="mobile-menu-item"
              @click="
                showUpload = true;
                showMobileMenu = false;
              "
            >
              Добавить фото
            </button>
            <button class="mobile-menu-close" @click="showMobileMenu = false">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="folders-container">
      <div class="folders-tabs">
        <div class="folders-scroll">
          <button
            v-for="folder in folders"
            :key="folder.id"
            class="folder-tab"
            :class="{ active: activeFolder === folder.id }"
            @click="handleFolderClick(folder.id)"
          >
            <span class="folder-name">{{ folder.name }}</span>

            <button
              v-if="folder.id !== 'all'"
              type="button"
              class="folder-tab-delete"
              title="Удалить папку"
              @click.stop="handleDeleteFolder(folder.id)"
            >
              ✕
            </button>
          </button>
        </div>
      </div>
    </div>

    <PhotoGallery
      :photos="filteredPhotos"
      :folder-name="folders.find((f) => f.id === activeFolder)?.name || 'Фото'"
      :selection-mode="selectionMode"
      :is-loading="isChangingFolder"
      :is-loading-more="isLoadingMore"
      :has-more="hasMore"
      :total-photos="totalPhotos"
      @upload="showUpload = true"
      @photo-click="openPhotoViewer"
      @delete-photos="handleDeletePhotos"
      @cancel-selection="cancelSelection"
      @load-more="loadMorePhotos"
    />

    <PhotoUpload
      v-if="showUpload"
      :folders="realFolders"
      :selected-folder-id="activeFolder !== 'all' ? activeFolder : null"
      :is-uploading="isUploading"
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
      :folder-id="activeFolder !== 'all' ? activeFolder : undefined"
      @close="showPhotoViewer = false"
      @update:current-index="currentPhotoIndex = $event"
      @load-more="loadMorePhotos"
    />

    <DeleteModal
      v-if="folderIdDelete && showDeleteModal"
      @confirm="confirmDeleteModal"
      :loading="isDeleting"
      @close="closeDeleteModal()"
    />
  </div>
</template>

<style scoped lang="scss">
.trip-details {
  max-width: 1400px;
  height: 100vh;
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

.folders-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.manage-photos-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    color: #666;
  }

  @media (min-width: 640px) {
    width: 44px;
    height: 44px;
  }
}

.folders-tabs {
  flex: 1;
  border-bottom: 1px solid #e5e7eb;
  min-width: 0;
}

.folders-scroll {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
    background: transparent;
  }

  @media (min-width: 640px) {
    gap: 8px;

    &::-webkit-scrollbar {
      display: block;
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #ccc;
      border-radius: 3px;
    }

    &.hide-on-desktop {
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
}

.folder-tab {
  padding: 10px 14px;
  padding-right: 5px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  transition: all 0.2s;
  min-width: 110px;
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

    .folder-tab-delete {
      color: white;
    }
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

.folder-tab-delete {
  margin-left: 6px;
  padding: 2px 6px;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  border-radius: 4px;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #ff4444;
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
  background: white;
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

  .folders-container {
    gap: 8px;
  }
}
</style>
