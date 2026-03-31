<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  loading: boolean
}>()

const emit = defineEmits<{
  submit: [data: any]
  cancel: []
}>()

const form = ref({
  title: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  location: '',
  coverImage: null as File | null,
})

const previewUrl = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function handleCoverImageSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    form.value.coverImage = file
    const reader = new FileReader()
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function handleSubmit() {
  if (!form.value.title.trim()) {
    return
  }
  emit('submit', {
    title: form.value.title,
    description: form.value.description,
    date: form.value.date,
    location: form.value.location,
    coverImage: form.value.coverImage,
  })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !props.loading) {
    handleSubmit()
  }
  if (e.key === 'Escape') {
    emit('cancel')
  }
}
</script>

<template>
  <form class="trip-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="title">Название поездки *</label>
      <input
        id="title"
        v-model="form.title"
        type="text"
        placeholder="Например: Отпуск в горах"
        required
        :disabled="loading"
        @keydown="handleKeydown"
      >
    </div>

    <div class="form-group">
      <label for="description">Описание</label>
      <textarea
        id="description"
        v-model="form.description"
        placeholder="Расскажите о вашей поездке..."
        rows="3"
        :disabled="loading"
      />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="date">Дата</label>
        <input
          id="date"
          v-model="form.date"
          type="date"
          :disabled="loading"
        >
      </div>

      <div class="form-group">
        <label for="location">Место</label>
        <input
          id="location"
          v-model="form.location"
          type="text"
          placeholder="Куда едете?"
          :disabled="loading"
        >
      </div>
    </div>

    <div class="form-group">
      <label for="coverImage">Превью (опционально)</label>
      <div v-if="previewUrl" class="cover-preview-wrapper">
        <div class="cover-preview">
          <img :src="previewUrl" alt="Превью">
        </div>
        <input
          id="coverImage"
          ref="fileInput"
          type="file"
          accept="image/*"
          :disabled="loading"
          class="hidden-input"
          @change="handleCoverImageSelect"
        >
      </div>
      <div v-else class="cover-upload">
        <input
          id="coverImage"
          ref="fileInput"
          type="file"
          accept="image/*"
          :disabled="loading"
          class="file-input"
          @change="handleCoverImageSelect"
        >
        <label for="coverImage" class="upload-label">
          <div class="upload-icon">
            <img src="/img/svg/upload-icon.svg" alt="">
          </div>
          <div class="upload-text">
            <span class="upload-title">Загрузить превью</span>
            <span class="upload-hint">Нажмите или перетащите изображение</span>
          </div>
        </label>
      </div>
    </div>

    <div class="form-actions">
      <button
        type="button"
        class="btn-secondary"
        :disabled="loading"
        @click="emit('cancel')"
      >
        Отмена
      </button>
      <button
        type="submit"
        class="btn-primary"
        :disabled="loading || !form.title.trim()"
      >
        <span v-if="loading">Создание...</span>
        <span v-else>Создать поездку</span>
      </button>
    </div>
  </form>
</template>

<style scoped lang="scss">
.trip-form {
  padding: 28px;
  @media (max-width: 768px) {
    padding: 16px;
  }
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;

  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: $color-primary;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
  }
}

.form-group input {
  height: 38px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

input[type="date"] {
  &::-webkit-date-and-time-value {
    text-align: left;
  }
  
  &::-webkit-calendar-picker-indicator {
    opacity: 0.6;
    padding: 4px;
    cursor: pointer;
  }
}

@supports (-webkit-touch-callout: none) {
  input[type="date"] {
    height: 38px;
  }
}


.cover-upload {
  margin-top: 8px;
}

.file-input {
  display: none;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    border-color: $color-primary;
    background: #f0f4ff;
  }
}

.upload-icon {
  color: $color-primary;
  margin-bottom: 12px;
  transition: transform 0.3s ease;

  .upload-label:hover & {
    transform: translateY(-2px);
  }
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.upload-title {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.upload-hint {
  font-size: 12px;
  color: #6b7280;
}

.cover-preview-wrapper {
  margin-top: 8px;
}

.cover-preview {
  position: relative;
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }

  img {
    width: 100%;
    height: auto;
    display: block;
    max-height: 300px;
    object-fit: cover;
  }

  .remove-preview,
  .change-preview {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.95);
    color: #374151;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

    &:hover {
      background: white;
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }

  .remove-preview {
    color: #ef4444;

    &:hover {
      background: #fee2e2;
      color: #dc2626;
    }
  }

  .change-preview {
    color: $color-primary;

    &:hover {
      background: #eef2ff;
      color: #4f46e5;
    }
  }
}

.hidden-input {
  display: none;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 20px;
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
  background-color: $color-primary;
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

  &:hover:not(:disabled) {
    background-color: #f9fafb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>