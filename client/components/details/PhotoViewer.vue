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
const isTouchBlocked = ref(false) 
const displayPhoto = ref<Photo | null>(null)
const nextPhotoCache = ref<Photo | null>(null)
const prevPhotoCache = ref<Photo | null>(null)
const slideOffset = ref(0)
const touchStartX = ref(0)
const isMobile = ref(false)
const isHeaderVisible = ref(false)
const scale = ref(1)

let headerTimeout: ReturnType<typeof setTimeout> | null = null
let transitionTimer: ReturnType<typeof setTimeout> | null = null
let touchBlockTimer: ReturnType<typeof setTimeout> | null = null

const shouldLoadMore = computed(() => {
  return props.currentIndex >= props.photos.length - 3
})


onMounted(() => {
  displayPhoto.value = currentPhoto.value
  checkMobile()
  window.addEventListener('resize', checkMobile)
  document.addEventListener('keydown', handleKeydown)
  document.body.classList.add('no-scroll')
  showHeader()
  preloadAllImages()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('keydown', handleKeydown)
  document.body.classList.remove('no-scroll')
  if (transitionTimer) clearTimeout(transitionTimer)
  if (touchBlockTimer) clearTimeout(touchBlockTimer)
  if (headerTimeout) clearTimeout(headerTimeout)
})


function preloadAllImages() {
  const index = props.currentIndex
  for (let i = 1; i <= 5; i++) {
    if (index + i < props.photos.length) {
      const img = new Image()
      img.src = props.photos[index + i].url
    }
    if (index - i >= 0) {
      const img = new Image()
      img.src = props.photos[index - i].url
    }
  }
}

function preloadAdjacent() {
  const index = props.currentIndex
  for (let i = 1; i <= 3; i++) {
    if (index + i < props.photos.length) {
      const img = new Image()
      img.src = props.photos[index + i].url
    }
    if (index - i >= 0) {
      const img = new Image()
      img.src = props.photos[index - i].url
    }
  }
}


function nextPhoto() {
  if (isAnimating.value) return
  if (props.currentIndex === props.photos.length - 1) {
    emit('loadMore')
    return
  }
  
  const nextIndex = props.currentIndex + 1
  nextPhotoCache.value = props.photos[nextIndex]
  

  isAnimating.value = true
  isTouchBlocked.value = true
  slideOffset.value = -100
  
  if (touchBlockTimer) clearTimeout(touchBlockTimer)
  touchBlockTimer = setTimeout(() => {
    isTouchBlocked.value = false
    touchBlockTimer = null
  }, 300)
  
  transitionTimer = setTimeout(() => {
    emit('update:currentIndex', nextIndex)
    displayPhoto.value = props.photos[nextIndex]
    slideOffset.value = 0
    isAnimating.value = false
    nextPhotoCache.value = null
    transitionTimer = null
  }, 200)
  
  preloadAdjacent()
}

function previousPhoto() {
  if (isAnimating.value) return
  if (props.currentIndex === 0) return
  
  const prevIndex = props.currentIndex - 1
  prevPhotoCache.value = props.photos[prevIndex]
  

  isAnimating.value = true
  isTouchBlocked.value = true
  slideOffset.value = 100
  
  if (touchBlockTimer) clearTimeout(touchBlockTimer)
  touchBlockTimer = setTimeout(() => {
    isTouchBlocked.value = false
    touchBlockTimer = null
  }, 300)
  
  transitionTimer = setTimeout(() => {
    emit('update:currentIndex', prevIndex)
    displayPhoto.value = props.photos[prevIndex]
    slideOffset.value = 0
    isAnimating.value = false
    prevPhotoCache.value = null
    transitionTimer = null
  }, 200)
  
  preloadAdjacent()
}


function handleTouchStart(e: TouchEvent) {
 
  if (isAnimating.value || isTouchBlocked.value) {
    e.preventDefault()
    return
  }
  
  showHeader()
  touchStartX.value = e.touches[0].clientX
}

function handleTouchMove(e: TouchEvent) {
  
  if (isAnimating.value || isTouchBlocked.value) {
    e.preventDefault()
    return
  }
  
  const deltaX = e.touches[0].clientX - touchStartX.value
  
  if (Math.abs(deltaX) > 10) {
    e.preventDefault()
    let offset = deltaX / 2
    
    if (props.currentIndex === 0 && offset > 0) {
      offset = offset / 3
    }
    if (props.currentIndex === props.photos.length - 1 && offset < 0) {
      offset = offset / 3
    }
    slideOffset.value = Math.max(Math.min(offset, 100), -100)
  }
}

function handleTouchEnd(e: TouchEvent) {

  if (isAnimating.value || isTouchBlocked.value) {
    e.preventDefault()
    return
  }
  
  const deltaX = e.changedTouches[0].clientX - touchStartX.value
  const absDelta = Math.abs(deltaX)
  
  if (absDelta > 50) {
    if (deltaX < 0 && props.currentIndex < props.photos.length - 1) {
      nextPhoto()
    } else if (deltaX > 0 && props.currentIndex > 0) {
      previousPhoto()
    } else {
      slideOffset.value = 0
    }
  } else {
    slideOffset.value = 0
  }
}


function handleKeydown(e: KeyboardEvent) {
  if (isAnimating.value || isTouchBlocked.value) return
  switch (e.key) {
    case 'Escape': emit('close'); break
    case 'ArrowLeft': e.preventDefault(); previousPhoto(); break
    case 'ArrowRight': e.preventDefault(); nextPhoto(); break
  }
}

watch(() => props.currentIndex, (newIndex) => {
  if (shouldLoadMore.value) emit('loadMore')
  displayPhoto.value = props.photos[newIndex]
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
  if (isAnimating.value || isTouchBlocked.value) return
  
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
</script>

<template>
  <div 
    class="MediaViewer" 
    @mousemove="handleMouseMove"
    @mouseleave="isHeaderVisible = false"
    :class="{ 'touch-blocked': isTouchBlocked }" 
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
      @touchmove.prevent="handleTouchMove"
      @touchend="handleTouchEnd"
      @click="handleClickOutside"
    >
      <div class="slider-container">
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
            />
          </div>
        </div>
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
              fetchpriority="high"
            />
          </div>
        </div>

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
            />
          </div>
        </div>
      </div>

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
    
    <div v-if="isTouchBlocked && isMobile" class="touch-block-indicator"></div>
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
  touch-action: pan-y;
}


.touch-blocked {
  cursor: wait;
}

.touch-block-indicator {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 100;
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: fadeInOut 0.3s ease;
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  100% { opacity: 1; }
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
}





.slide-current {
  z-index: 10;
}

.slide-prev,
.slide-next {
  z-index: 5;
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

.no-scroll {
  overflow: hidden !important;
  position: fixed;
  width: 100%;
  height: 100%;
}


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