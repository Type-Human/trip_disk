<script setup lang="ts">
import type { Photo, Trip } from '../../types/trip'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { tripApi } from '@/api'
import Icon from '../ui/Icon.vue'

const props = defineProps<{
  trip: Trip
  viewType?: 'grid' | 'list'
}>()
const emit = defineEmits<{
  delete: [trip: Trip]
}>()
const router = useRouter()
function goToTrip() {
  router.push(`/trips/${props.trip.id}`)
}

function handleWrapperClick(e: Event) {
  const target = e.target as HTMLElement
  if (target.closest('.delete-badge')) {
    e.preventDefault()
    e.stopPropagation()
    emit('delete', props.trip)
    return
  }
  goToTrip()
}

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

    return props.trip.coverImage ? `${props.trip.coverImage}` : ''
  }

  if (previewPhoto.value) {
    if (previewPhoto.value.url.startsWith('blob:')) {
      return previewPhoto.value.url
    }

    return previewPhoto.value?.url ? `${previewPhoto.value.url}` : ''
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
  <div class="trip-card-wrapper" :class="{ 'trip-link-grid': props.viewType === 'grid' }" role="button" tabindex="0"
    @click="handleWrapperClick" @keydown.enter="handleWrapperClick">
    <article class="trip-card" :class="{ 'trip-card-grid': props.viewType === 'grid' }">
      <div class="trip-media">
        <div v-if="imageUrl" class="trip-image">
          <img :src="imageUrl" :alt="trip.title" loading="lazy">
          <div class="image-overlay" />
        </div>
        <div v-else class="trip-placeholder">
          <div class="placeholder-icon">
            <Icon size="32" stroke-color="currentColor" stroke-width="1.5">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                      <circle cx="12" cy="9" r="3" />
                    </Icon>
          </div>
        </div>
        
      </div>
      <div class="trip-content">
        <div class="content-header">
        
          <p class="trip-description">
            {{ trip.description }}
          </p>
        </div>

        <div class="content-footer">
          <div class="location-info">
            <Icon size="16" stroke="#6366f1">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </Icon>
            <span>{{ trip.location || 'Не указано' }}</span>
          </div>
        </div>
      </div>
    </article>
    <div class="date-badge">
          {{ formatDate(trip.date) }}
        </div>
    <button type="button" class="delete-badge" title="Удалить путешествие">
      <Icon size="16" stroke="#ef4444">
        <path data-v-943d8c11="" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
      </Icon>
    </button>
  </div>
</template>

<style scoped lang="scss">
.trip-card-wrapper {
  position: relative;
  display: block;
  height: 100%;
  cursor: pointer;

  &:hover {
    .trip-card {
      transform: translateY(-4px);
      box-shadow: $shadow-lg;
    }
  }

  &.trip-link-grid:hover .trip-card {
    transform: translateY(-4px);
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

    .trip-card-wrapper:hover & img {
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
  right: 50px;
  z-index: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  color: $color-gray-darker;
  box-shadow: $shadow-sm;
  
}

.delete-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  width: 26px;
  height: 26px;
  background: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background 0.2s;
  padding: 0;
  pointer-events: auto;

  &:hover {
    background: #fee2e2;

    :deep(.icon) {
      transform: scale(1.1);
    }
  }
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

    :deep(.icon) {
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
    right: 50px;
    font-size: 11px;
    padding: 6px 12px;
  }

  .delete-badge {
    top: 12px;
  }

  .trip-content {
    padding: 16px;
    gap: 12px;
  }
}
</style>
