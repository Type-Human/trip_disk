<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Folder } from '../../types/trip'

const props = defineProps<{
  folders?: Folder[]
  selectedFolderId?: string | null
}>()

const emit = defineEmits<{
  close: []
  upload: [files: File[], folderId?: string]
}>()

const selectedFiles = ref<File[]>([])
const selectedFolder = ref<string | null>(props.selectedFolderId || null)
const isDragging = ref(false)

const previews = ref<Map<File, string>>(new Map())

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    addFiles(Array.from(input.files))
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files))
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function addFiles(files: File[]) {
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  selectedFiles.value.push(...imageFiles)
  
  imageFiles.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        previews.value.set(file, e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  })
}

function removeFile(file: File) {
  selectedFiles.value = selectedFiles.value.filter(f => f !== file)
  previews.value.delete(file)
}

function handleUpload() {
  if (selectedFiles.value.length === 0) return
  emit('upload', selectedFiles.value, selectedFolder.value || undefined)
  selectedFiles.value = []
  previews.value.clear()
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const canUpload = computed(() => selectedFiles.value.length > 0)
</script>

<template>
  <div class="modal-overlay" @click="emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Загрузить фото</h2>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div
          v-if="folders && folders.length > 0"
          class="folder-selector"
        >
          <label>Папка:</label>
          <select v-model="selectedFolder" class="folder-select">
            <option :value="null">Без папки</option>
            <option
              v-for="folder in folders"
              :key="folder.id"
              :value="folder.id"
            >
              {{ folder.name }}
            </option>
          </select>
        </div>

        <div
          class="drop-zone"
          :class="{ dragging: isDragging }"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
        >
          <input
            id="file-input"
            type="file"
            multiple
            accept="image/*"
            class="file-input"
            @change="handleFileSelect"
          >
          <label for="file-input" class="drop-label">
            <div class="drop-icon">📷</div>
            <div class="drop-text">
              Перетащите фото сюда или нажмите для выбора
            </div>
            <div class="drop-hint">
              Можно выбрать несколько файлов
            </div>
          </label>
        </div>

        <div v-if="selectedFiles.length > 0" class="previews">
          <div
            v-for="(file, index) in selectedFiles"
            :key="index"
            class="preview-item"
          >
            <img
              :src="previews.get(file)"
              :alt="file.name"
              class="preview-image"
            >
            <div class="preview-info">
              <div class="preview-name">{{ file.name }}</div>
              <div class="preview-size">{{ formatFileSize(file.size) }}</div>
            </div>
            <button class="remove-btn" @click="removeFile(file)">✕</button>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="emit('close')">
          Отмена
        </button>
        <button
          class="btn-primary"
          :disabled="!canUpload"
          @click="handleUpload"
        >
          Загрузить {{ selectedFiles.length > 0 ? `(${selectedFiles.length})` : '' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
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
  padding: 16px;
  overflow-y: auto;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #111827;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    color: #6b7280;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s;

    &:hover {
      background: #f3f4f6;
      color: #111827;
    }
  }
}

.modal-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.folder-selector {
  margin-bottom: 24px;

  label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
  }

  .folder-select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    background: white;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
  }
}

.drop-zone {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  transition: all 0.2s;
  cursor: pointer;
  background: #f9fafb;

  &.dragging {
    border-color: #6366f1;
    background: #eef2ff;
  }

  .file-input {
    display: none;
  }

  .drop-label {
    cursor: pointer;
    display: block;
  }

  .drop-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .drop-text {
    font-size: 16px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 8px;
  }

  .drop-hint {
    font-size: 14px;
    color: #6b7280;
  }
}

.previews {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.preview-item {
  position: relative;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.preview-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.preview-info {
  padding: 8px;
}

.preview-name {
  font-size: 12px;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.preview-size {
  font-size: 11px;
  color: #6b7280;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: rgba(239, 68, 68, 0.9);
  }
}

.modal-footer {
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
  background-color: #6366f1;
  color: white;
  border: none;

  &:hover:not(:disabled) {
    background-color: #4f46e5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-secondary {
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;

  &:hover {
    background-color: #f9fafb;
  }
}

</style>
