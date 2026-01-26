<script setup lang="ts">
import type { Photo, Trip } from '../../types/trip'
import { computed, onMounted, ref } from 'vue'
import { tripApi } from '../../api'

const props = defineProps<{
  trip: Trip
  viewType?: 'grid' | 'list'
}>()

const previewPhoto = ref<Photo | null>(null)
const isLoading = ref(false)

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const imageUrl = computed(() => {
  if (props.trip.coverImage) {
    if (props.trip.coverImage.startsWith('blob:')) {
      return props.trip.coverImage
    }

    if (props.trip.coverImage.startsWith('http')) {
      return props.trip.coverImage
    }

    return `http://localhost:3000${props.trip.coverImage}`
  }

  if (props.trip.image) {
    return props.trip.image
  }

  if (previewPhoto.value) {
    if (previewPhoto.value.url.startsWith('blob:')) {
      return previewPhoto.value.url
    }

    return `http://localhost:3000${previewPhoto.value.url}`
  }
  return null
})

async function loadPreviewPhoto() {
  try {
    isLoading.value = true
    const photos = await tripApi.getPhotosByTripId(props.trip.id)
    if (photos.length > 0) {
      previewPhoto.value = photos[0]
    }
  }
  catch (error) {
    console.error('Ошибка загрузки превью:', error)
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadPreviewPhoto()
})
</script>

<template>
  <router-link
    :to="`/trips/${trip.id}`"
    class="trip-link"
    :class="{ 'trip-link-grid': props.viewType === 'grid' }"
  >
    <article class="trip-card" :class="{ 'trip-card-grid': props.viewType === 'grid' }">
      <div class="trip-media">
        <div v-if="imageUrl" class="trip-image">
          <img :src="imageUrl" :alt="trip.title" loading="lazy">
          <div class="image-overlay" />
        </div>
        <div v-else class="trip-placeholder">
          <div class="placeholder-icon">
            ✈️
          </div>
        </div>
        <div class="date-badge">
          {{ formatDate(trip.date) }}
        </div>
      </div>
      <div class="trip-content">
        <div class="content-header">
          <h3 class="trip-title">
            {{ trip.title }}
          </h3>
          <p class="trip-description">
            {{ trip.description }}
          </p>
        </div>

        <div class="content-footer">
          <div class="location-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{{ trip.location || 'Не указано' }}</span>
          </div>
        </div>
      </div>
    </article>
  </router-link>
</template>

<style scoped lang="scss">
.trip-link {
  text-decoration: none;
  color: inherit;
  display: block;

  &:hover {
    .trip-card {
      transform: translateY(-4px);
      box-shadow: $shadow-lg;
    }
  }

  &.trip-link-grid {
    &:hover {
      .trip-card {
        transform: translateY(-4px);
      }
    }
  }
}

.trip-card {
  background: $color-white;
  border-radius: $border-radius-lg;
  overflow: hidden;
  transition: all $transition-base;
  box-shadow: $shadow-sm;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.trip-media {
  position: relative;
  height: 200px;
  overflow: hidden;

  .trip-image {
    width: 100%;
    height: 100%;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform $transition-base;
    }

    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.1));
    }

    .trip-link:hover & img {
      transform: scale(1.05);
    }
  }

  .trip-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #f0f4ff 0%, #e6f0ff 100%);
    display: flex;
    align-items: center;
    justify-content: center;

    .placeholder-icon {
      font-size: 48px;
      opacity: 0.8;
    }
  }
}

.date-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  color: $color-gray-darker;
  box-shadow: $shadow-sm;
}

.trip-content {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content-header {
  flex: 1;

  .trip-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-medium;
    color: $color-gray-darker;
    margin: 0 0 8px 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .trip-description {
    font-size: $font-size-sm;
    color: $color-gray-dark;
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.content-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba($color-gray-light, 0.5);

  .location-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: $font-size-sm;
    color: $color-gray-dark;

    svg {
      color: $color-primary;
      flex-shrink: 0;
    }

    span {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
}

@media (max-width: 768px) {
  .trip-media {
    height: 180px;
  }

  .trip-content {
    padding: 20px;
  }

  .content-header {
    .trip-title {
      font-size: $font-size-base;
    }

    .trip-description {
      font-size: $font-size-xs;
    }
  }
}

@media (max-width: 480px) {
  .trip-media {
    height: 160px;
  }

  .date-badge {
    top: 12px;
    right: 12px;
    font-size: 11px;
    padding: 4px 8px;
  }

  .trip-content {
    padding: 16px;
    gap: 12px;
  }
}
</style>
