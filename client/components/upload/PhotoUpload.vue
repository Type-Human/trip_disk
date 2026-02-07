<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import CustomSelect from '../ui/CustomSelect.vue';

const props = defineProps<{
  folders?: Array<{ id: string; name: string }>
  selectedFolderId?: string | null
  isUploading?: boolean
}>()

const emit = defineEmits<{
  close: []
  upload: [files: File[], folderId?: string]
}>()

const files = ref<File[]>([])
const isDragging = ref(false)
const selectedFolder = ref<string | null>(props.selectedFolderId || '')
const objectUrls = ref<Map<File, string>>(new Map())

function getObjectUrl(file: File): string {
  if (!objectUrls.value.has(file)) {
    objectUrls.value.set(file, URL.createObjectURL(file))
  }
  return objectUrls.value.get(file)!
}

function revokeObjectUrl(file: File) {
  const url = objectUrls.value.get(file)
  if (url) {
    URL.revokeObjectURL(url)
    objectUrls.value.delete(file)
  }
}

function cleanupUrls() {
  objectUrls.value.forEach((url) => {
    URL.revokeObjectURL(url)
  })
  objectUrls.value.clear()
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const droppedFiles = Array.from(e.dataTransfer?.files || [])
  addFiles(droppedFiles)
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const selectedFiles = Array.from(input.files || [])
  addFiles(selectedFiles)
}

function addFiles(newFiles: File[]) {
  const imageFiles = newFiles.filter(file => file.type.startsWith('image/'))
  const validFiles = imageFiles.filter(file => file.size <= 10 * 1024 * 1024)
  files.value = [...files.value, ...validFiles]
}

function removeFile(index: number) {
  const file = files.value[index]
  revokeObjectUrl(file)
  files.value.splice(index, 1)
}

function handleUpload() {
  if (files.value.length === 0) return


  emit('upload', files.value, selectedFolder.value || undefined)

  files.value = []
  selectedFolder.value = ''
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

onUnmounted(() => {
  cleanupUrls()
})
</script>

<template>
  <div class="modal-overlay" @click="emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>Загрузить фото</h2>
        <button class="close-btn" :disabled="props.isUploading" @click="emit('close')">
          ✕
        </button>
      </div>

      <div class="drop-zone" :class="{ dragging: isDragging }" @dragover="handleDragOver" @dragleave="handleDragLeave"
        @drop="handleDrop">
        <div class="drop-content">
          <div class="upload-icon">
            📷
          </div>
          <p>Перетащите сюда фото или</p>
          <label class="browse-btn">
            <input type="file" multiple accept="image/*" :disabled="props.isUploading" @change="handleFileSelect">
            Выбрать файлы
          </label>
          <p class="hint">
            Поддерживаются JPG, PNG, GIF, WebP (до 10MB)
          </p>
        </div>
      </div>

      <div v-if="props.folders && props.folders.length > 0" class="folder-select">
        <CustomSelect :folders="props.folders" :selected-folder-id="selectedFolder" :is-uploading="props.isUploading"
          @update:selectedFolderId="selectedFolder = $event" />
      </div>

      <div v-if="files.length > 0" class="file-list">
        <h3>Выбранные файлы ({{ files.length }})</h3>
        <div class="files-grid">
          <div v-for="(file, index) in files" :key="index" class="file-item">
            <div class="file-preview">
              <img v-if="file.type.startsWith('image/')" :src="getObjectUrl(file)" :alt="file.name">
              <div v-else class="file-icon">
                📄
              </div>
            </div>
            <div class="file-info">
              <p class="file-name">
                {{ file.name }}
              </p>
              <p class="file-size">
                {{ formatFileSize(file.size) }}
              </p>
            </div>
            <button class="remove-btn" :disabled="props.isUploading" @click="removeFile(index)">
              ✕
            </button>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn-secondary" :disabled="props.isUploading" @click="emit('close')">
          Отмена
        </button>
        <button class="btn-primary" :disabled="files.length === 0 || props.isUploading" @click="handleUpload">
          <span class="btn-content">
            <span v-if="props.isUploading" class="btn-spinner"></span>
            <span v-else>Загрузить ({{ files.length }})</span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 900;
}

.modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
  scrollbar-width: none;
  -ms-overflow-style: none; 
}


.modal::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  background: transparent;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.close-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.drop-zone {
  margin: 24px;
  padding: 48px 24px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.drop-zone.dragging {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.05);
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.browse-btn {
  display: inline-block;
  padding: 12px 24px;
  background: #6366f1;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  margin: 16px 0;
  transition: background 0.2s;
}

.browse-btn:hover {
  background: #4f46e5;
}

.browse-btn input[type='file'] {
  display: none;
}

.hint {
  color: #6b7280;
  font-size: 14px;
  margin: 8px 0 0 0;
}

.folder-select {
  margin: 0 24px 24px 24px;
  position: relative;
  z-index: 10;
}

:deep(.custom-select) {
  position: relative;
}

:deep(.custom-select__dropdown) {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

:deep(.custom-select__dropdown::-webkit-scrollbar) {
  display: none;
  width: 0;
  height: 0;
  background: transparent;
}

.file-list {
  margin: 24px;
}

.file-list h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.files-grid {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.files-grid::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  background: transparent;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.file-item:last-child {
  border-bottom: none;
}

.file-preview {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 12px;
}

.file-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  font-size: 24px;
}

.file-info {
  flex: 1;
}

.file-name {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.remove-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.remove-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #ef4444;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 1;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
}

.btn-primary {
  background: #6366f1;
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: #4f46e5;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}


</style>