<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  close: []
  upload: [files: File[]]
}>()

const files = ref<File[]>([])
const isDragging = ref(false)
const uploadProgress = ref(0)
const isUploading = ref(false)

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
  const imageFiles = newFiles.filter(file =>
    file.type.startsWith('image/'),
  )

  const validFiles = imageFiles.filter(file =>
    file.size <= 10 * 1024 * 1024,
  )

  files.value = [...files.value, ...validFiles]
}

function removeFile(index: number) {
  files.value.splice(index, 1)
}

async function handleUpload() {
  if (files.value.length === 0)
    return

  isUploading.value = true

  const interval = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
      setTimeout(() => {
        emit('upload', files.value)
        files.value = []
        uploadProgress.value = 0
        isUploading.value = false
      }, 500)
    }
  }, 100)
}

function formatFileSize(bytes: number): string {
  if (bytes === 0)
    return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}
</script>

<template>
  <div class="modal-overlay" @click="emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>Загрузить фото</h2>
        <button class="close-btn" :disabled="isUploading" @click="emit('close')">
          ✕
        </button>
      </div>

      <div
        class="drop-zone"
        :class="{ dragging: isDragging }"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <div class="drop-content">
          <div class="upload-icon">
            📷
          </div>
          <p>Перетащите сюда фото или</p>
          <label class="browse-btn">
            <input
              type="file"
              multiple
              accept="image/*"
              :disabled="isUploading"
              @change="handleFileSelect"
            >
            Выбрать файлы
          </label>
          <p class="hint">
            Поддерживаются JPG, PNG, GIF, WebP (до 10MB)
          </p>
        </div>
      </div>

      <div v-if="files.length > 0" class="file-list">
        <h3>Выбранные файлы ({{ files.length }})</h3>
        <div class="files-grid">
          <div
            v-for="(file, index) in files"
            :key="index"
            class="file-item"
          >
            <div class="file-preview">
              <img
                v-if="file.type.startsWith('image/')"
                :src="URL.createObjectURL(file)"
                :alt="file.name"
              >
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
            <button
              class="remove-btn"
              :disabled="isUploading"
              @click="removeFile(index)"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <div v-if="isUploading" class="upload-progress">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${uploadProgress}%` }"
          />
        </div>
        <p>{{ uploadProgress }}%</p>
      </div>

      <div class="modal-actions">
        <button
          class="btn-secondary"
          :disabled="isUploading"
          @click="emit('close')"
        >
          Отмена
        </button>
        <button
          class="btn-primary"
          :disabled="files.length === 0 || isUploading"
          @click="handleUpload"
        >
          <span v-if="isUploading">Загрузка...</span>
          <span v-else>Загрузить ({{ files.length }})</span>
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
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
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

  &:hover:not(:disabled) {
    background: #f3f4f6;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.drop-zone {
  margin: 24px;
  padding: 48px 24px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;

  &.dragging {
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.05);
  }
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

  &:hover {
    background: #4f46e5;
  }

  input[type='file'] {
    display: none;
  }
}

.hint {
  color: #6b7280;
  font-size: 14px;
  margin: 8px 0 0 0;
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
}

.file-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
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

  &:hover:not(:disabled) {
    background: #f3f4f6;
    color: #ef4444;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.upload-progress {
  margin: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
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
}

.btn-primary {
  background: #6366f1;
  color: white;
  border: none;

  &:hover:not(:disabled) {
    background: #4f46e5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;

  &:hover:not(:disabled) {
    background: #f9fafb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
