<script setup lang="ts">
import { onUnmounted, ref } from 'vue'

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

const MAX_FILES = 1000  
const MAX_FILE_SIZE = 10 * 1024 * 1024 

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
  objectUrls.value.forEach((url) => URL.revokeObjectURL(url))
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
  input.value = ''
}

function addFiles(newFiles: File[]) {
  const imageFiles = newFiles.filter(file => file.type.startsWith('image/'))
  const validFiles = imageFiles.filter(file => file.size <= MAX_FILE_SIZE)
  
  const remainingSlots = MAX_FILES - files.value.length
  const filesToAdd = validFiles.slice(0, remainingSlots)
  
  files.value = [...files.value, ...filesToAdd]
}

function removeFile(index: number) {
  const file = files.value[index]
  revokeObjectUrl(file)
  files.value.splice(index, 1)
}

function handleUpload() {
  if (files.value.length === 0) return
  emit('upload', files.value, selectedFolder.value || undefined)
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && !props.isUploading) {
    emit('close')
  }
}

onUnmounted(() => {
  cleanupUrls()
  document.removeEventListener('keydown', handleKeydown)
})

document.addEventListener('keydown', handleKeydown)
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>Загрузить фото</h2>
        <div class="file-counter" v-if="files.length > 0">
          {{ files.length }}/{{ MAX_FILES }}
        </div>
        <button class="close-btn" :disabled="props.isUploading" @click="emit('close')">
          ✕
        </button>
      </div>

      <div class="drop-zone" :class="{ dragging: isDragging }" 
        @dragover="handleDragOver" 
        @dragleave="handleDragLeave"
        @drop="handleDrop">
        <div class="drop-content">
          <div class="upload-icon">📷</div>
          <p>Перетащите сюда фото или</p>
          <label class="browse-btn">
            <input type="file" multiple accept="image/*" :disabled="props.isUploading" @change="handleFileSelect">
            Выбрать файлы
          </label>
          <p class="hint">
            JPG, PNG, GIF, WebP (до 10MB)<br>
            Максимум: {{ MAX_FILES }} файлов
          </p>
        </div>
      </div>

      <div v-if="props.folders && props.folders.length > 0" class="folder-select">
        <CustomSelect 
          :folders="props.folders" 
          :selected-folder-id="selectedFolder" 
          :is-uploading="props.isUploading"
          @update:selectedFolderId="selectedFolder = $event" 
        />
      </div>

      <div v-if="files.length > 0" class="file-list">
        <h3>Выбрано файлов: {{ files.length }}</h3>
        <div class="files-grid">
          <div v-for="(file, index) in files" :key="index" class="file-item">
            <div class="file-preview">
              <img v-if="file.type.startsWith('image/')" :src="getObjectUrl(file)" :alt="file.name">
              <div v-else class="file-icon">📄</div>
            </div>
            <div class="file-info">
              <p class="file-name">{{ file.name }}</p>
              <p class="file-size">{{ formatFileSize(file.size) }}</p>
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
  backdrop-filter: blur(3px);
}

.modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
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
  flex: 1;
}

.file-counter {
  font-size: 14px;
  color: #666;
  background: #f3f4f6;
  padding: 4px 12px;
  border-radius: 20px;
  margin-right: 12px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 8px;
  line-height: 1;
  transition: all 0.2s;
  min-width: 44px;
  min-height: 44px;
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
  padding: 40px 24px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  background: #fafafa;
}

.drop-zone.dragging {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.05);
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.7;
}

.browse-btn {
  display: inline-block;
  padding: 12px 28px;
  background: #6366f1;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  margin: 16px 0;
  transition: background 0.2s;
  font-weight: 500;
  font-size: 15px;
  border: none;
}

.browse-btn:hover {
  background: #4f46e5;
  transform: translateY(-1px);
}

.browse-btn input[type='file'] {
  display: none;
}

.hint {
  color: #6b7280;
  font-size: 13px;
  margin: 8px 0 0 0;
  line-height: 1.4;
}

.folder-select {
  margin: 0 24px 24px 24px;
  position: relative;
  z-index: 10;
}

.file-list {
  margin: 0 24px 24px 24px;
}

.file-list h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.files-grid {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  background: #fafafa;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
}

.file-item:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.file-preview {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 12px;
  border: 1px solid #eee;
  background: #f5f5f5;
}

.file-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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
  min-width: 0;
}

.file-name {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.remove-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  font-size: 18px;
  line-height: 1;
  transition: all 0.2s;
  min-width: 36px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover:not(:disabled) {
  background: #fee;
  color: #ef4444;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: white;
  border-radius: 0 0 16px 16px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  border: 2px solid transparent;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-secondary {
  background: white;
  color: #374151;
  border-color: #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
  transform: translateY(-1px);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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


@media (max-width: 768px) {
  .modal-overlay {
    align-items: flex-end;
  }
  
  .modal {
    width: 100%;
    max-width: 100%;
    border-radius: 20px 20px 0 0;
    max-height: 90vh;
    margin-bottom: env(safe-area-inset-bottom);
  }
  
  .modal-header {
    padding: 16px 20px;
  }
  
  .close-btn {
    padding: 8px;
    min-width: 40px;
    min-height: 40px;
  }
  
  .drop-zone {
    margin: 20px;
    padding: 30px 20px;
  }
  
  .browse-btn {
    padding: 14px 24px;
    font-size: 14px;
  }
  
  .file-list {
    margin: 0 20px 20px 20px;
  }
  
  .files-grid {
    max-height: 250px;
  }
  
  .file-item {
    padding: 10px;
  }
  
  .file-preview {
    width: 50px;
    height: 50px;
  }
  
  .modal-actions {
    padding: 16px 20px;
    gap: 8px;
  }
  
  .btn-primary,
  .btn-secondary {
    padding: 12px 16px;
    font-size: 14px;
    min-height: 44px;
  }
}


@supports (padding: max(0px)) {
  .modal {
    padding-bottom: max(20px, env(safe-area-inset-bottom));
  }
}
</style>