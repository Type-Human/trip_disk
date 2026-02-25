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

const isAnimating = ref(false)
const displayPhoto = ref<Photo | null>(null)
const nextPhotoCache = ref<Photo | null>(null)
const prevPhotoCache = ref<Photo | null>(null)
const slideOffset = ref(0)
const touchStartX = ref(0)
const touchStartY = ref(0)
const isMobile = ref(false)
const isHeaderVisible = ref(false)
const scale = ref(1)
const isSwiping = ref(false)
const swipeDirection = ref<'left' | 'right' | 'vertical' | null>(null)
const isLoading = ref(true)

let headerTimeout: ReturnType<typeof setTimeout> | null = null
let transitionTimer: ReturnType<typeof setTimeout> | null = null
let animationFrame: number | null = null
let preloadTimer: ReturnType<typeof setTimeout> | null = null

const shouldLoadMore = computed(() => {
  return props.currentIndex >= props.photos.length - 3
})


const imageCache = new Map<string, boolean>()

function preloadImage(url: string, priority: 'high' | 'low' = 'low'): Promise<void> {
  if (imageCache.has(url)) {
    return Promise.resolve()
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.fetchPriority = priority
    img.src = url
    
    img.onload = () => {
      imageCache.set(url, true)
      resolve()
    }
    
    img.onerror = reject
  })
}

async function preloadCurrentImage() {
  if (currentPhoto.value?.url) {
    try {
      isLoading.value = true
      await preloadImage(currentPhoto.value.url, 'high')
    } catch (error) {
      console.error('Ошибка загрузки текущего фото:', error)
    } finally {
      isLoading.value = false
    }
  }
}

function preloadAdjacent() {
  const index = props.currentIndex
  
 
  if (preloadTimer) clearTimeout(preloadTimer)
  
  preloadTimer = setTimeout(() => {
    for (let i = 1; i <= 3; i++) {
      if (index + i < props.photos.length) {
        preloadImage(props.photos[index + i].url, i === 1 ? 'high' : 'low')
      }
      if (index - i >= 0) {
        preloadImage(props.photos[index - i].url, i === 1 ? 'high' : 'low')
      }
    }
    preloadTimer = null
  }, 100)
}

function preloadAllImages() {
  const index = props.currentIndex
  for (let i = 1; i <= 5; i++) {
    if (index + i < props.photos.length) {
      preloadImage(props.photos[index + i].url, 'low')
    }
    if (index - i >= 0) {
      preloadImage(props.photos[index - i].url, 'low')
    }
  }
}

function startTransition(direction: 'next' | 'prev') {
  if (isAnimating.value) return
  
  const canGoNext = direction === 'next' && props.currentIndex < props.photos.length - 1
  const canGoPrev = direction === 'prev' && props.currentIndex > 0
  
  if (!canGoNext && !canGoPrev) {
    if (direction === 'next' && props.currentIndex === props.photos.length - 1) {
      emit('loadMore')
    }
    return
  }
  
  const newIndex = direction === 'next' 
    ? props.currentIndex + 1 
    : props.currentIndex - 1
  

  if (direction === 'next') {
    nextPhotoCache.value = props.photos[newIndex]
  } else {
    prevPhotoCache.value = props.photos[newIndex]
  }
  
  isAnimating.value = true
  slideOffset.value = direction === 'next' ? -100 : 100
  
  if (transitionTimer) clearTimeout(transitionTimer)
  
  transitionTimer = setTimeout(() => {
    emit('update:currentIndex', newIndex)
    displayPhoto.value = props.photos[newIndex]
    slideOffset.value = 0
    isAnimating.value = false
    nextPhotoCache.value = null
    prevPhotoCache.value = null
    transitionTimer = null
    
    preloadAdjacent()
  }, 200)
}

function nextPhoto() {
  startTransition('next')
}

function previousPhoto() {
  startTransition('prev')
}

function handleTouchStart(e: TouchEvent) {
  if (isAnimating.value) {
    e.preventDefault()
    return
  }
  
  showHeader()
  
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  isSwiping.value = true
  swipeDirection.value = null
  
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
}

function handleTouchMove(e: TouchEvent) {
  if (isAnimating.value || !isSwiping.value) {
    e.preventDefault()
    return
  }
  
  const currentX = e.touches[0].clientX
  const currentY = e.touches[0].clientY
  
  const deltaX = currentX - touchStartX.value
  const deltaY = currentY - touchStartY.value
  
  if (swipeDirection.value === null) {
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      e.preventDefault()
      swipeDirection.value = deltaX > 0 ? 'right' : 'left'
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
      swipeDirection.value = 'vertical'
      return
    }
  }
  
  if (swipeDirection.value === 'left' || swipeDirection.value === 'right') {
    e.preventDefault()
    
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }
    
    animationFrame = requestAnimationFrame(() => {
      let offset = deltaX / 2
      
      if (props.currentIndex === 0 && offset > 0) {
        offset = offset / 3
      }
      if (props.currentIndex === props.photos.length - 1 && offset < 0) {
        offset = offset / 3
      }
      
      slideOffset.value = Math.max(Math.min(offset, 100), -100)
      animationFrame = null
    })
  }
}

function handleTouchEnd(e: TouchEvent) {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
  
  if (!isSwiping.value) {
    slideOffset.value = 0
    return
  }
  
  if (swipeDirection.value === 'vertical') {
    isSwiping.value = false
    swipeDirection.value = null
    slideOffset.value = 0
    return
  }
  
  if (isAnimating.value) {
    isSwiping.value = false
    swipeDirection.value = null
    slideOffset.value = 0
    return
  }
  
  const deltaX = e.changedTouches[0].clientX - touchStartX.value
  const absDelta = Math.abs(deltaX)
  
  if (absDelta > 50 && swipeDirection.value !== 'vertical') {
    if (deltaX < 0 && props.currentIndex < props.photos.length - 1) {
      startTransition('next')
    } else if (deltaX > 0 && props.currentIndex > 0) {
      startTransition('prev')
    } else {
      slideOffset.value = 0
    }
  } else {
    slideOffset.value = 0
  }
  
  isSwiping.value = false
  swipeDirection.value = null
}

function handleKeydown(e: KeyboardEvent) {
  if (isAnimating.value) return
  
  switch (e.key) {
    case 'Escape': 
      emit('close')
      break
    case 'ArrowLeft': 
      e.preventDefault()
      previousPhoto()
      break
    case 'ArrowRight': 
      e.preventDefault()
      nextPhoto()
      break
  }
}

watch(() => props.currentIndex, (newIndex, oldIndex) => {
  if (shouldLoadMore.value) emit('loadMore')
  displayPhoto.value = props.photos[newIndex]
  preloadCurrentImage()
  preloadAdjacent()
})

function checkMobile() { 
  isMobile.value = window.innerWidth <= 768 
}

async function downloadCurrentPhoto() {
  try {
    const photoId = currentPhoto.value?.id
    if (!photoId) return
    await tripApi.downloadPhotoAsFile(photoId, currentPhoto.value?.filename || 'photo.jpg')
  } catch (error) { 
    console.error('Ошибка скачивания:', error) 
  }
}

function showHeader() {
  isHeaderVisible.value = true
  if (headerTimeout) clearTimeout(headerTimeout)
  headerTimeout = setTimeout(() => { 
    isHeaderVisible.value = false 
  }, 3000)
}

function handleMouseMove() { 
  showHeader() 
}

function handleImageClick(e: MouseEvent) {
  if (isAnimating.value) return
  
  if (!isMobile.value) {
    if (isHeaderVisible.value) {
      isHeaderVisible.value = false
      if (headerTimeout) clearTimeout(headerTimeout)
    } else {
      showHeader()
    }
  }
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.classList.contains('MediaViewerSlides')) {
    emit('close')
  }
}

function handleWheel(e: WheelEvent) {
  if (isAnimating.value || isMobile.value) return
  
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
    e.preventDefault()
    
    if (e.deltaX > 0 && props.currentIndex < props.photos.length - 1) {
      nextPhoto()
    } else if (e.deltaX < 0 && props.currentIndex > 0) {
      previousPhoto()
    }
  }
}

onMounted(() => {
  displayPhoto.value = currentPhoto.value
  checkMobile()
  window.addEventListener('resize', checkMobile)
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('wheel', handleWheel, { passive: false })
  document.body.classList.add('no-scroll')
  showHeader()
  preloadCurrentImage()
  preloadAdjacent()
  preloadAllImages()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('wheel', handleWheel)
  document.body.classList.remove('no-scroll')
  if (transitionTimer) clearTimeout(transitionTimer)
  if (headerTimeout) clearTimeout(headerTimeout)
  if (animationFrame) cancelAnimationFrame(animationFrame)
  if (preloadTimer) clearTimeout(preloadTimer)
})
</script>

<template>
  <div 
    class="MediaViewer" 
    @mousemove="handleMouseMove"
    @mouseleave="isHeaderVisible = false"
  >
    <!-- Индикатор загрузки -->
    <div v-if="isLoading" class="loading-indicator">
      <div class="spinner"></div>
      <span>Загрузка изображения...</span>
    </div>

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
      <div class="slider-container">
        <!-- Предыдущее фото -->
        <div 
          v-if="prevPhotoCache || (props.currentIndex > 0 && !isAnimating)" 
          class="slide slide-prev"
          :style="{
            transform: `translateX(${slideOffset - 100}%)`,
            transition: isAnimating ? 'transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1)' : 'none'
          }"
        >
          <div class="slide-content" :class="{ 'mobile-slide': isMobile }">
            <img 
              :src="prevPhotoCache?.url || props.photos[props.currentIndex - 1]?.url" 
              :alt="prevPhotoCache?.filename || props.photos[props.currentIndex - 1]?.filename"
              class="slide-image"
              draggable="false"
              loading="lazy"
            />
          </div>
        </div>
        
        <!-- Текущее фото -->
        <div 
          class="slide slide-current"
          :style="{
            transform: `translateX(${slideOffset}%)`,
            transition: isAnimating ? 'transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1)' : 'none'
          }"
        >
          <div class="slide-content" :class="{ 'mobile-slide': isMobile }">
            <img 
              :src="displayPhoto?.url || currentPhoto?.url" 
              :alt="displayPhoto?.filename || currentPhoto?.filename"
              class="slide-image"
              draggable="false"
              @click="handleImageClick"
              :style="{ transform: scale > 1 ? `scale(${scale})` : 'none' }"
              :fetchpriority="'high'"
            />
          </div>
        </div>

        <!-- Следующее фото -->
        <div 
          v-if="nextPhotoCache || (props.currentIndex < props.photos.length - 1 && !isAnimating)" 
          class="slide slide-next"
          :style="{
            transform: `translateX(${slideOffset + 100}%)`,
            transition: isAnimating ? 'transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1)' : 'none'
          }"
        >
          <div class="slide-content" :class="{ 'mobile-slide': isMobile }">
            <img 
              :src="nextPhotoCache?.url || props.photos[props.currentIndex + 1]?.url" 
              :alt="nextPhotoCache?.filename || props.photos[props.currentIndex + 1]?.filename"
              class="slide-image"
              draggable="false"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <!-- Навигационные кнопки -->
      <button 
        v-if="!isMobile" 
        class="navigation prev" 
        :class="{ 'nav-visible': isHeaderVisible }"
        @click.stop="previousPhoto" 
        :disabled="isAnimating || props.currentIndex === 0"
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
        :disabled="isAnimating || props.currentIndex === props.photos.length - 1"
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
  touch-action: pan-y pinch-zoom;
  -webkit-overflow-scrolling: touch;
}

/* Индикатор загрузки */
.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  color: white;
  text-align: center;
  background: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Хедер */
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

/* Слайды */
.MediaViewerSlides {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.slider-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
  pointer-events: none;
}

.slide-current {
  z-index: 10;
  pointer-events: auto;
}

.slide-prev,
.slide-next {
  z-index: 5;
}

.slide-content {
  width: calc(100% - 60px);
  height: calc(100% - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-slide {
  width: 100% !important;
  height: 100% !important;
}

.slide-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  -webkit-touch-callout: none;
}

/* Навигация */
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
  transition: opacity 0.3s ease, background-color 0.2s;
  z-index: 30;
  padding: 0;
  backdrop-filter: blur(4px);
  pointer-events: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.navigation:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-visible {
  opacity: 0.9;
  pointer-events: auto;
}

.navigation:hover:not(:disabled) {
  opacity: 1;
  background: rgba(255, 255, 255, 0.3);
}

.prev {
  left: 24px;
}

.next {
  right: 24px;
}

.nav-icon {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

/* Утилиты */
.no-scroll {
  overflow: hidden !important;
  position: fixed;
  width: 100%;
  height: 100%;
}

/* Медиа-запросы */
@media (max-width: 768px) {
  .media-viewer-header {
    height: 70px;
  }

  .header-content {
    padding: 12px 16px;
  }

  .download-button,
  .close-button {
    width: 36px;
    height: 36px;
  }

  .navigation {
    display: none;
  }

  .slide-content {
    width: 100% !important;
    height: 100% !important;
  }
}

@media (min-width: 1440px) {
  .slide-content {
    width: calc(100% - 80px);
    height: calc(100% - 80px);
  }
}

* {
  -webkit-tap-highlight-color: transparent !important;
  -webkit-touch-callout: none !important;
}
</style>