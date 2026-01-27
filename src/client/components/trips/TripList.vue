<script setup lang="ts">
import type { CreateTripDto, Trip } from '../../types/trip'
import { onMounted, ref } from 'vue'
import { tripApi } from '../../api'
import CreateTripModal from '../modals/CreateTripModal.vue'
import TripCard from './TripCard.vue'

const trips = ref<Trip[]>([])
const showCreateModal = ref(false)
const isLoading = ref(false)
const isCreating = ref(false)

async function fetchTrips() {
  try {
    isLoading.value = true
    trips.value = await tripApi.getAll()
  }
  catch (error) {
    console.error('Ошибка загрузки поездок:', error)
  }
  finally {
    isLoading.value = false
  }
}

async function handleCreateTrip(data: CreateTripDto) {
  try {
    isCreating.value = true
    const newTrip = await tripApi.create(data)
    trips.value.unshift(newTrip)
    showCreateModal.value = false
  }
  catch (error) {
    console.error('Ошибка создания поездки:', error)
  }
  finally {
    isCreating.value = false
  }
}

onMounted(() => {
  fetchTrips()
})
</script>

<template>
  <div class="trips-list">
    <div class="header">
      <h1>Мои поездки</h1>
      <button class="create-btn" @click="showCreateModal = true">
        + Новая поездка
      </button>
    </div>

    <div v-if="isLoading" class="loading">
      Загрузка...
    </div>

    <div v-else-if="trips.length === 0" class="empty-state">
      <div class="empty-icon">
        ✈️
      </div>
      <h3>У вас пока нет поездок</h3>
      <p>Создайте свою первую поездку!</p>
      <button class="empty-btn" @click="showCreateModal = true">
        Создать поездку
      </button>
    </div>

    <div v-else class="trips-grid">
      <TripCard
        v-for="trip in trips"
        :key="trip.id"
        :trip="trip"
      />
    </div>

    <CreateTripModal
      :show="showCreateModal"
      :loading="isCreating"
      @close="showCreateModal = false"
      @submit="handleCreateTrip"
    />
  </div>
</template>

<style scoped lang="scss">
.trips-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;

  h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: #111827;
  }
}

.create-btn {
  padding: 12px 24px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;

  &:hover {
    background: #4f46e5;
  }
}

.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.empty-state {
  text-align: center;
  padding: 64px 24px;
  background: #f9fafb;
  border-radius: 12px;
  margin-top: 40px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #111827;
  font-size: 20px;
}

.empty-state p {
  margin: 0 0 24px 0;
  color: #6b7280;
}

.empty-btn {
  padding: 12px 24px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: #4f46e5;
  }
}

.loading {
  text-align: center;
  padding: 48px;
  color: #6b7280;
}
</style>
