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

    <div class="MediaViewerSlides">
      <swiper
        :modules="[Navigation, Pagination, Zoom, Keyboard, A11y]"
        :slides-per-view="1"
        :initial-slide="props.currentIndex"
        :space-between="20"
        :navigation="{
          prevEl: '.swiper-button-prev',
          nextEl: '.swiper-button-next'
        }"
        :pagination="false"
        :zoom="{
          maxRatio: 3,
          minRatio: 1,
          toggle: false
        }"
        :keyboard="{
          enabled: true,
          onlyInViewport: true
        }"
        :touch-ratio="1.5"
        :resistance-ratio="0.3"
        :speed="300"
        :threshold="10"
        :long-swipes-ratio="0.2"
        :preload-images="true"
        :lazy="{
          loadPrevNext: true,
          loadPrevNextAmount: 3
        }"
        @slideChange="onSlideChange"
        @reachEnd="onReachEnd"
        @swiper="onSwiperInit"
        @click="handleImageClick"
        class="swiper-container"
      >
        <swiper-slide v-for="(photo, index) in props.photos" :key="photo.id">
          <div class="slide-wrapper">
            <div class="swiper-zoom-container">
              <img 
                :data-src="photo.url"
                :src="photo.url" 
                :alt="photo.filename"
                class="slide-image"
                draggable="false"
              />
            </div>
          </div>
        </swiper-slide>
      </swiper>

      <button 
        v-if="!isMobile" 
        class="navigation prev swiper-button-prev"
        :class="{ 'nav-visible': isHeaderVisible }"
        :disabled="isAnimating || props.currentIndex === 0"
        aria-label="Previous"
      >
        <Icon class="nav-icon" :size="32" color="#fff" :filled="true">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </Icon>
      </button>

      <button 
        v-if="!isMobile" 
        class="navigation next swiper-button-next"
        :class="{ 'nav-visible': isHeaderVisible }"
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

<script setup lang="ts">
import type { Photo } from '../../types/trip'
import { computed, onMounted, ref, onUnmounted, watch } from 'vue'
import Icon from '../ui/Icon.vue';
import { tripApi } from '@/api';

import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Zoom, Keyboard, A11y } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/zoom'

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
const isMobile = ref(false)
const isHeaderVisible = ref(false)
const scale = ref(1)
const swiperInstance = ref<SwiperType | null>(null)
const loadedImages = ref<Set<string>>(new Set()) 
const lastTapTime = ref(0)

let headerTimeout: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  document.addEventListener('keydown', handleKeydown)
  document.body.classList.add('no-scroll')
  showHeader()
  
  // Загружаем текущее фото с высоким приоритетом
  preloadCurrentImage()
  // Загружаем соседние
  preloadAdjacentImages()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('keydown', handleKeydown)
  document.body.classList.remove('no-scroll')
  if (headerTimeout) clearTimeout(headerTimeout)
})

function preloadCurrentImage() {
  const photo = props.photos[props.currentIndex]
  if (photo && !loadedImages.value.has(photo.url)) {
    const img = new Image()
    img.fetchPriority = 'high'
    img.src = photo.url
    img.onload = () => loadedImages.value.add(photo.url)
  }
}

function preloadAdjacentImages() {
  const index = props.currentIndex
  
  for (let i = 1; i <= 5; i++) {
    if (index + i < props.photos.length) {
      const photo = props.photos[index + i]
      if (!loadedImages.value.has(photo.url)) {
        const img = new Image()
        img.fetchPriority = 'low'
        img.src = photo.url
        img.onload = () => loadedImages.value.add(photo.url)
      }
    }
    if (index - i >= 0) {
      const photo = props.photos[index - i]
      if (!loadedImages.value.has(photo.url)) {
        const img = new Image()
        img.fetchPriority = 'low'
        img.src = photo.url
        img.onload = () => loadedImages.value.add(photo.url)
      }
    }
  }
}

watch(() => props.currentIndex, (newIndex, oldIndex) => {
  // При смене фото загружаем новое с высоким приоритетом
  preloadCurrentImage()
  preloadAdjacentImages()
})

function checkMobile() { 
  isMobile.value = window.innerWidth <= 768 
}

function onSwiperInit(swiper: SwiperType) {
  swiperInstance.value = swiper
}

function onSlideChange(swiper: SwiperType) {
  emit('update:currentIndex', swiper.activeIndex)
}

function onReachEnd() {
  emit('loadMore')
}

function handleKeydown(e: KeyboardEvent) {
  if (!swiperInstance.value) return
  
  switch (e.key) {
    case 'Escape': 
      emit('close')
      break
    case 'ArrowLeft': 
      e.preventDefault()
      swiperInstance.value.slidePrev()
      break
    case 'ArrowRight': 
      e.preventDefault()
      swiperInstance.value.slideNext()
      break
  }
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
  if (!isMobile.value) {
    showHeader()
  }
}

function handleImageClick(e: MouseEvent) {
  const now = Date.now()
  
  if (isMobile.value) {
    if (now - lastTapTime.value < 300) {
      lastTapTime.value = 0
      return
    }
    lastTapTime.value = now
    
    if (isHeaderVisible.value) {
      isHeaderVisible.value = false
      if (headerTimeout) clearTimeout(headerTimeout)
    } else {
      showHeader()
    }
  } else {
    if (isHeaderVisible.value) {
      isHeaderVisible.value = false
      if (headerTimeout) clearTimeout(headerTimeout)
    } else {
      showHeader()
    }
  }
}
</script>

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
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
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

.swiper-container {
  width: 100%;
  height: 100%;
  background: #000;
}

:deep(.swiper-wrapper) {
  align-items: center;
}

:deep(.swiper-slide) {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.slide-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
}

.swiper-zoom-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
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

  .slide-wrapper {
    padding: 0 !important;
  }
}

@media (min-width: 1440px) {
  .slide-wrapper {
    padding: 40px;
  }
}

@media (min-width: 1920px) {
  .slide-wrapper {
    padding: 60px;
  }
}

* {
  -webkit-tap-highlight-color: transparent !important;
  -webkit-touch-callout: none !important;
}
</style>