<script setup lang="ts">
import type { CreateTripDto, Trip } from '../types/trip'
import { onMounted, ref } from 'vue'
import { tripApi } from '../api'
import CreateTripModal from '../components/modals/CreateTripModal.vue'
import TripCard from '../components/trips/TripCard.vue'
import ViewSwitcher from '../components/ui/ViewSwitcher.vue'

const trips = ref<Trip[]>([])
const showCreateModal = ref(false)
const isLoading = ref(false)
const isCreating = ref(false)
const viewType = ref<'grid' | 'list'>('list')

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
    alert('Не удалось создать поездку')
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
  <div class="home">
    <div class="header">
      <h1>Мои поездки</h1>
      <div class="header-actions">
        <ViewSwitcher v-model="viewType" @switch-view="viewType = $event" />
        <button class="create-btn" @click="showCreateModal = true">
          + Новая поездка
        </button>
      </div>
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
      <button @click="showCreateModal = true">
        Создать поездку
      </button>
    </div>

    <div v-else :class="viewType === 'grid' ? 'trips-grid' : 'trips-list'">
      <TripCard
        v-for="trip in trips"
        :key="trip.id"
        :trip="trip"
        :view-type="viewType"
        @click="$router.push(`/trips/${trip.id}`)"
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

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
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

  &:hover {
    background: #4f46e5;
  }
}

.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.trips-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
}

.empty-state p {
  margin: 0 0 24px 0;
  color: #6b7280;
}

.empty-state button {
  padding: 12px 24px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;

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
