<script setup lang="ts">
import type { Photo } from '../../types/trip'
import { computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  photos: Photo[]
  currentIndex: number
  show: boolean
}>()

const emit = defineEmits<{
  'close': []
  'update:currentIndex': [index: number]
}>()

const currentPhoto = computed(() => {
  return props.photos[props.currentIndex]
})

function handleKeydown(e: KeyboardEvent) {
  if (!props.show)
    return

  switch (e.key) {
    case 'Escape':
      emit('close')
      break
    case 'ArrowLeft':
      previousPhoto()
      break
    case 'ArrowRight':
      nextPhoto()
      break
  }
}

function previousPhoto() {
  const newIndex = props.currentIndex === 0
    ? props.photos.length - 1
    : props.currentIndex - 1
  emit('update:currentIndex', newIndex)
}

function nextPhoto() {
  const newIndex = props.currentIndex === props.photos.length - 1
    ? 0
    : props.currentIndex + 1
  emit('update:currentIndex', newIndex)
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.classList.contains('photo-viewer-overlay')) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    v-if="show"
    class="photo-viewer-overlay"
    @click="handleClickOutside"
  >
    <div class="photo-viewer">
      <button class="close-btn" @click="emit('close')">
        ✕
      </button>

      <div class="photo-container">
        <button class="nav-btn prev-btn" @click="previousPhoto">
          ←
        </button>

        <div class="photo-wrapper">
          <img
            :src="currentPhoto?.url"
            :alt="currentPhoto?.filename"
            class="full-photo"
          >
        </div>

        <button class="nav-btn next-btn" @click="nextPhoto">
          →
        </button>
      </div>

      <div class="photo-info">
        <div class="photo-meta">
          <p class="filename">
            {{ currentPhoto?.filename }}
          </p>
        </div>
        <div class="photo-counter">
          {{ currentIndex + 1 }} / {{ photos.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.photo-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.photo-viewer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 20px;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.photo-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px 20px;
}

.photo-wrapper {
  max-width: 90%;
  max-height: 90%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.full-photo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}

.prev-btn {
  left: 20px;
}

.next-btn {
  right: 20px;
}

.photo-info {
  padding: 20px;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.photo-meta {
  flex: 1;
}

.filename {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.size {
  margin: 0;
  font-size: 12px;
  opacity: 0.7;
}

.photo-counter {
  font-size: 14px;
  opacity: 0.8;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .close-btn {
    top: 10px;
    right: 10px;
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .nav-btn {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .prev-btn {
    left: 10px;
  }

  .next-btn {
    right: 10px;
  }

  .photo-info {
    padding: 12px;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .photo-counter {
    align-self: flex-end;
  }
}
</style>
