<script setup lang="ts">
import type { Trip } from '../../types/trip'

defineProps<{
  trip: Trip
}>()

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="trip-card">
    <div v-if="trip.image" class="trip-photo">
      <img :src="trip.image" :alt="trip.title">
    </div>
    <div v-else class="trip-no-photo">
      <span class="trip-icon">✈️</span>
    </div>

    <div class="trip-info">
      <h3>{{ trip.title }}</h3>
      <p>{{ trip.description }}</p>

      <div class="trip-bottom">
        <div class="trip-details">
          <span class="trip-date">📅 {{ formatDate(trip.date) }}</span>
          <span class="trip-location">📍 {{ trip.location || 'Не указано' }}</span>
        </div>
        <button class="trip-more-btn">
          →
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.trip-card {
  width: 100%;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.25s ease;
  margin-bottom: $spacing-lg;
  display: flex;
  opacity: 0.9;
  flex-direction: column;

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
    transform: translateY(-3px);
    opacity: 1;
  }
}

.trip-photo {
  width: 100%;
  height: 250px;
  border-radius: 16px;
  overflow: hidden;
  transition: opacity 0.3s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }

  .trip-card:hover & {
    opacity: 1;

    img {
      transform: scale(1.02);
    }
  }
}

.trip-no-photo {
  width: 100%;
  height: 180px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;

  .trip-icon {
    font-size: 48px;
    opacity: 0.9;
  }
}

.trip-info {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1a202c;
    margin: 0 0 10px 0;
    line-height: 1.4;
  }

  p {
    color: #4a5568;
    font-size: 14px;
    line-height: 1.5;
    margin: 0 0 20px 0;
    flex-grow: 1;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.trip-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.trip-details {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .trip-date {
    color: #4a5568;
    font-size: 13px;
    font-weight: 500;
  }

  .trip-location {
    color: #718096;
    font-size: 13px;
    font-weight: 500;
  }
}

.trip-more-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-accent);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s ease;

  &:hover {
    background: #3182ce;
    transform: translateX(3px);
  }
}
</style>
