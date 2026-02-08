<script setup lang="ts">
import type { Photo } from '../../types/trip'
import { computed, onMounted, ref, onUnmounted } from 'vue'
import Icon from '../ui/Icon.vue';
import { tripApi } from '@/api';

const props = defineProps<{
  photos: Photo[]
  currentIndex: number
}>()

const emit = defineEmits<{
  'close': []
  'update:currentIndex': [index: number]
}>()

const currentPhoto = computed(() => props.photos[props.currentIndex])
const touchStartX = ref(0)
const isMobile = ref(false)
const lastTapTime = ref(0)
let tapCount = 0
let tapTimeout: number | null = null

function checkMobile() {
  isMobile.value = window.innerWidth <= 768
}

async function downloadCurrentPhoto() {
  try {
    const photoId = currentPhoto.value?.id
    if (!photoId) return

    const filename = currentPhoto.value?.filename || 'photo.jpg'
    await tripApi.downloadPhotoAsFile(photoId, filename)

  } catch (error) {
    console.error('Ошибка скачивания:', error)
  }
}

function handleTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0].clientX
}

function handleTouchEnd(e: TouchEvent) {
  const touchEndX = e.changedTouches[0].clientX
  const diff = touchStartX.value - touchEndX

  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      nextPhoto()
    } else {
      previousPhoto()
    }
  }
}

function handleImageClick(e: MouseEvent) {
  if (!isMobile.value) return

  const now = Date.now()
  const timeDiff = now - lastTapTime.value

  tapCount++

  if (tapCount === 1) {
    lastTapTime.value = now

    tapTimeout = setTimeout(() => {
      tapCount = 0
    }, 300)
  } else if (tapCount === 2 && timeDiff < 300) {
    if (tapTimeout) {
      clearTimeout(tapTimeout)
      tapTimeout = null
    }
    tapCount = 0
    previousPhoto()
  }
}

function previousPhoto() {
  const newIndex = props.currentIndex === 0 ? props.photos.length - 1 : props.currentIndex - 1
  emit('update:currentIndex', newIndex)
}

function nextPhoto() {
  const newIndex = props.currentIndex === props.photos.length - 1 ? 0 : props.currentIndex + 1
  emit('update:currentIndex', newIndex)
}

function handleKeydown(e: KeyboardEvent) {
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

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.classList.contains('MediaViewerSlides') || target.classList.contains('current-image-container')) {
    emit('close')
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  document.addEventListener('keydown', handleKeydown)
  document.body.classList.add('no-scroll')
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('keydown', handleKeydown)
  document.body.classList.remove('no-scroll')
  if (tapTimeout) {
    clearTimeout(tapTimeout)
  }
})
</script>

<template>
  <div class="MediaViewer">
    <div class="media-viewer-header">
      <div v-if="!isMobile" class="photo-counter">
        {{ currentIndex + 1 }} / {{ photos.length }}
      </div>

      <div class="header-actions">
        <button class="download-button" @click="downloadCurrentPhoto" aria-label="Download">
          <Icon class="download-icon" :size="20" color="#fff" :filled="true">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </Icon>
        </button>

        <button class="close-button" @click="emit('close')" aria-label="Close">
          <Icon class="close-icon" :size="20" color="#fff" :filled="true">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </Icon>
        </button>
      </div>
    </div>

    <div class="MediaViewerSlides" @touchstart="handleTouchStart" @touchend="handleTouchEnd"
      @click="handleClickOutside">
      <div class="current-image-container">
        <img :src="currentPhoto?.url" :alt="currentPhoto?.filename" class="current-image" draggable="false"
          @click="handleImageClick" />
      </div>

      <button v-if="!isMobile" class="navigation prev" @click.stop="previousPhoto" aria-label="Previous">
        <Icon class="nav-icon" :size="32" color="#fff" :filled="true">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </Icon>
      </button>

      <button v-if="!isMobile" class="navigation next" @click.stop="nextPhoto" aria-label="Next">
        <Icon class="nav-icon" :size="32" color="#fff" :filled="true">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </Icon>
      </button>
    </div>
  </div>
</template>



<style scoped>
.MediaViewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.media-viewer-header {
  position: absolute;
  top: 10px;
  width: 100%;
  right: 0;
  height: 56px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 10;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.photo-counter {
  color: white;
  font-size: 14px;
}

.download-button,
.close-button {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.download-button:hover,
.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.download-icon,
.close-icon {
  width: 20px;
  height: 20px;
}

.MediaViewerSlides {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  touch-action: pan-y pinch-zoom;
}

.current-image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
}

@media (max-width: 768px) {
  .current-image {
    width: 100vw !important;
    height: auto !important;
    max-height: 100vh !important;
    object-fit: contain !important;
    object-position: center !important;
    display: block !important;
  }

  .header-actions {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
}

  .current-image-container {
    width: 100vw !important;
    height: 100vh !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .media-viewer-header {
    height: 44px;
    padding: 0 12px;
  }

  .download-button,
  .close-button {
    width: 36px;
    height: 36px;
  }

  .download-icon,
  .close-icon {
    width: 18px;
    height: 18px;
  }
}

@media (min-width: 769px) {
  .current-image {
    max-width: 100% !important;
    max-height: calc(100vh - 56px) !important;
    height: auto !important;
    width: auto !important;
    object-fit: contain !important;
    object-position: center !important;
    display: block !important;
  }

  .current-image-container {
    max-width: 100vw;
    max-height: 100vh;
  }

  .navigation {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 56px;
    height: 56px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s, background-color 0.2s;
    z-index: 10;
    padding: 0;
  }

  .MediaViewer:hover .navigation {
    opacity: 0.7;
  }

  .navigation:hover {
    opacity: 1 !important;
    background: rgba(255, 255, 255, 0.2);
  }

  .prev {
    left: 20px;
  }

  .next {
    right: 20px;
  }

  .nav-icon {
    width: 32px;
    height: 32px;
  }
}

.MediaViewer {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.no-scroll {
  overflow: hidden !important;
  position: fixed;
  width: 100%;
  height: 100%;
}

:deep(*) {
  box-sizing: border-box;
}

.current-image {
  -webkit-user-drag: none;
  user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}
</style>