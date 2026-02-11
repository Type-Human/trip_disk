<script setup lang="ts">
import type { Photo } from '../../types/trip'
import { computed, onMounted, ref, onUnmounted, watch } from 'vue'
import Icon from '../ui/Icon.vue';
import { tripApi } from '@/api';

const props = defineProps<{
  photos: Photo[]
  currentIndex: number
  folderId?: string 
}>()

const emit = defineEmits<{
  close: []
  'update:currentIndex': [index: number]
  loadMore: [] 
}>()

const currentPhoto = computed(() => props.photos[props.currentIndex])
const touchStartX = ref(0)
const touchStartY = ref(0)
const isZooming = ref(false)
const scale = ref(1)
const isMobile = ref(false)
const lastTapTime = ref(0)
const isHeaderVisible = ref(false)
let headerTimeout: ReturnType<typeof setTimeout> | null = null
let tapTimeout: ReturnType<typeof setTimeout> | null = null
let tapCount = 0
let initialDistance = 0

const shouldLoadMore = computed(() => {
  return props.currentIndex >= props.photos.length - 3
})

watch(() => props.currentIndex, (newIndex) => {
  if (shouldLoadMore.value) {
    emit('loadMore')
  }
})

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

function showHeader() {
  isHeaderVisible.value = true
  if (headerTimeout) {
    clearTimeout(headerTimeout)
    headerTimeout = null
  }

  headerTimeout = setTimeout(() => {
    isHeaderVisible.value = false
    headerTimeout = null
  }, 3000)
}

function handleMouseMove() {
  showHeader()
}

function handleTouchStart(e: TouchEvent) {
  showHeader()
  
  if (e.touches.length === 1) {
    touchStartX.value = e.touches[0].clientX
    touchStartY.value = e.touches[0].clientY
    isZooming.value = false
  } else if (e.touches.length === 2) {
    isZooming.value = true
    const dx = e.touches[0].clientX - e.touches[1].clientX
    const dy = e.touches[0].clientY - e.touches[1].clientY
    initialDistance = Math.sqrt(dx * dx + dy * dy)
    e.preventDefault()
  }
}

function handleTouchMove(e: TouchEvent) {
  if (isZooming.value && e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX
    const dy = e.touches[0].clientY - e.touches[1].clientY
    const currentDistance = Math.sqrt(dx * dx + dy * dy)
    
    if (initialDistance > 0) {
      scale.value = Math.max(1, Math.min(3, currentDistance / initialDistance))
    }
    e.preventDefault()
  }
}

function handleTouchEnd(e: TouchEvent) {
  if (!isZooming.value && e.changedTouches.length === 1) {
    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    const diffX = Math.abs(touchStartX.value - touchEndX)
    const diffY = Math.abs(touchStartY.value - touchEndY)
    
    if (diffX > 30 && diffY < 50 && scale.value === 1) {
      if (touchStartX.value > touchEndX) {
        nextPhoto()
      } else {
        previousPhoto()
      }
    }
  }
  
  isZooming.value = false
  
  if (scale.value > 1) {
    setTimeout(() => {
      scale.value = 1
    }, 3000)
  }
}

function handleImageClick(e: MouseEvent) {
  if (!isMobile.value) {
    if (isHeaderVisible.value) {
      isHeaderVisible.value = false
      if (headerTimeout) {
        clearTimeout(headerTimeout)
        headerTimeout = null
      }
    } else {
      showHeader()
    }
    return
  }

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
  showHeader()
}

function nextPhoto() {
  if (props.currentIndex === props.photos.length - 1) {
    emit('loadMore')
    return
  }
  
  const newIndex = props.currentIndex + 1
  emit('update:currentIndex', newIndex)
  showHeader()
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
  document.documentElement.style.overflow = 'hidden'
  showHeader()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('keydown', handleKeydown)
  document.body.classList.remove('no-scroll')
  document.documentElement.style.overflow = ''
  
  if (tapTimeout) {
    clearTimeout(tapTimeout)
    tapTimeout = null
  }
  if (headerTimeout) {
    clearTimeout(headerTimeout)
    headerTimeout = null
  }
})
</script>

<template>
  <div 
    class="MediaViewer" 
    @mousemove="handleMouseMove"
    @mouseleave="isHeaderVisible = false"
  >
    <div 
      class="media-viewer-header" 
      :class="{ 'header-visible': isHeaderVisible, 'header-hidden': !isHeaderVisible }"
    >
      <div class="header-content">
       

        <div class="header-actions">
          <button class="download-button" @click="downloadCurrentPhoto" aria-label="Download">
            <Icon class="download-icon" :size="20" color="#fff" :filled="true">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </Icon>
          </button>

          <button class="close-button" @click="emit('close')" aria-label="Close">
            <Icon class="close-icon" :size="20" color="#fff" :filled="true">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </Icon>
          </button>
        </div>
      </div>
    </div>

    <div 
      class="MediaViewerSlides" 
      @touchstart="handleTouchStart" 
      @touchmove="handleTouchMove" 
      @touchend="handleTouchEnd"
      @click="handleClickOutside"
    >
      <div class="current-image-container">
        <img 
          :src="currentPhoto?.url" 
          :alt="currentPhoto?.filename" 
          class="current-image" 
          draggable="false"
          @click="handleImageClick"
          :style="{ transform: scale > 1 ? `scale(${scale})` : 'none' }"
        />
      </div>

      <button 
        v-if="!isMobile" 
        class="navigation prev" 
        :class="{ 'nav-visible': isHeaderVisible }"
        @click.stop="previousPhoto" 
        aria-label="Previous"
      >
        <Icon class="nav-icon" :size="32" color="#fff" :filled="true">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </Icon>
      </button>

      <button 
        v-if="!isMobile" 
        class="navigation next" 
        :class="{ 'nav-visible': isHeaderVisible }"
        @click.stop="nextPhoto" 
        aria-label="Next"
      >
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
  touch-action: none;
}

.media-viewer-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
  z-index: 20;
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  height: 100%;
  pointer-events: auto;
}

.header-visible {
  opacity: 1;
  transform: translateY(0);
}

.header-hidden {
  opacity: 0;
  transform: translateY(-20px);
  pointer-events: none;
}


.header-actions {
  display: flex;
  width: 100%;
  justify-content: space-between;
  gap: 12px;
}

.download-button,
.close-button {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  backdrop-filter: blur(4px);
}

.download-button:hover,
.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
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
  touch-action: none;
}

.current-image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  touch-action: none;
}

.current-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
  transform-origin: center center;
  -webkit-user-drag: none;
  user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: none;
}


.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.navigation {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  height: 56px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease, background-color 0.2s, transform 0.2s;
  z-index: 15;
  padding: 0;
  backdrop-filter: blur(4px);
  pointer-events: none;
}

.nav-visible {
  opacity: 0.8;
  pointer-events: auto;
}

.navigation:hover {
  opacity: 1 !important;
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.05);
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

@media (max-width: 768px) {
  .current-image {
    width: 100vw !important;
    height: auto !important;
    max-height: 100vh !important;
    object-fit: contain !important;
    object-position: center !important;
    display: block !important;
  }

  .current-image-container {
    width: 100vw !important;
    height: 100vh !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .media-viewer-header {
    height: 70px;
    background: linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%);
  }

  .header-content {
    padding: 12px 16px;
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


  .navigation {
    display: none;
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
}
</style>