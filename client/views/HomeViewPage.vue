<script setup lang="ts">
import type { CreateTripDto, Trip } from "../types/trip";
import { onMounted, ref } from "vue";
import { tripApi } from "@/api";
import CreateTripModal from "../components/modals/CreateTripModal.vue";
import DeleteModal from "../components/modals/DeleteModal.vue";
import TripCard from "../components/trips/TripCard.vue";
import ViewSwitcher from "../components/ui/ViewSwitcher.vue";
import AvailabilitySwitch from "@/components/ui/AvailabilitySwitch.vue";

const trips = ref<Trip[]>([]);
const showCreateModal = ref(false);
const showDeleteModal = ref(false);
const tripToDelete = ref<Trip | null>(null);
const isLoading = ref(false);
const isSwitching = ref(false);
const isCreating = ref(false);
const isDeleting = ref(false);
const viewType = ref<"grid" | "list">("list");
const availabilityType = ref<"my" | "public">("my");

async function fetchTrips(showLoader: boolean = true) {
  try {
    if (showLoader) {
      isLoading.value = true;
    } else {
      isSwitching.value = true;
    }
    
    if (availabilityType.value === "my") {
      trips.value = await tripApi.getTripsUser();
    } else {
      trips.value = await tripApi.getAll();
    }
  } catch (error: any) {

    trips.value = [];
  } finally {
    isLoading.value = false;
    isSwitching.value = false;
  }
}

async function handleCreateTrip(data: CreateTripDto) {
  try {
    isCreating.value = true;
    const newTrip = await tripApi.create(data);
    if (availabilityType.value === "my" && !newTrip.isPublic) {
      trips.value.push(newTrip);
    } else if (availabilityType.value === "public" && newTrip.isPublic) {
      trips.value.push(newTrip);
    }
    showCreateModal.value = false;
  } catch (error) {
    console.error("Ошибка создания поездки:", error);
  } finally {
    isCreating.value = false;
  }
}

function openDeleteModal(trip: Trip) {
  tripToDelete.value = trip;
  showDeleteModal.value = true;
}

async function confirmDeleteTrip() {
  if (!tripToDelete.value) return;

  try {
    isDeleting.value = true;
    await tripApi.delete(tripToDelete.value.id);
    trips.value = trips.value.filter((t) => t.id !== tripToDelete.value!.id);
    showDeleteModal.value = false;
    tripToDelete.value = null;
  } catch (error) {
    console.error("Ошибка удаления поездки:", error);
  } finally {
    isDeleting.value = false;
  }
}

function closeDeleteModal() {
  if (!isDeleting.value) {
    showDeleteModal.value = false;
    tripToDelete.value = null;
  }
}

function handleAvailabilityChange(type: "my" | "public") {
  if (availabilityType.value === type) return;
  availabilityType.value = type;
  fetchTrips(false);
}

onMounted(() => {
  fetchTrips(true);
});
</script>

<template>
  <div class="home">
    <div class="title-section">
      <h1 class="title">
        {{ availabilityType === "my" ? "Мои поездки" : "Общие поездки" }}
      </h1>
      <div class="mobile-availability">
        <AvailabilitySwitch
          :model-value="availabilityType"
          @update:type="handleAvailabilityChange"
        />
      </div>
    </div>

    <div class="header">
      <div class="desktop-availability">
        <AvailabilitySwitch
          :model-value="availabilityType"
          @update:type="handleAvailabilityChange"
        />
      </div>
      <div class="header-actions">
        <ViewSwitcher v-model="viewType" @switch-view="viewType = $event" />
        <button class="create-btn" @click="showCreateModal = true">
          + Новая поездка
        </button>
      </div>
    </div>

    <div v-if="isSwitching" class="switching-loader">
      <div class="spinner"></div>
    </div>

    <div v-else-if="isLoading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="trips.length === 0" class="empty-state">
      <div class="empty-icon">✈️</div>
      <h3>
        {{
          availabilityType === "my"
            ? "У вас пока нет поездок"
            : "Нет общих поездок"
        }}
      </h3>
      <p>
        {{
          availabilityType === "my"
            ? "Создайте свою первую поездку!"
            : "Пока нет ни одной общей поездки"
        }}
      </p>
    </div>

    <div v-else :class="viewType === 'grid' ? 'trips-grid' : 'trips-list'">
      <TripCard
        v-for="trip in trips"
        :key="trip.id"
        :trip="trip"
        :view-type="viewType"
        :type="availabilityType"
        @delete="openDeleteModal"
      />
    </div>

    <DeleteModal
      v-if="showDeleteModal && tripToDelete"
      :loading="isDeleting"
      @close="closeDeleteModal"
      @confirm="confirmDeleteTrip"
    />

    <CreateTripModal
      :show="showCreateModal"
      :loading="isCreating"
      @close="showCreateModal = false"
      @submit="handleCreateTrip"
    />
  </div>
</template>

<style scoped lang="scss">
.home {
  max-width: 1200px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 16px 12px;
}

.title-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.mobile-availability {
  display: block;
}

.desktop-availability {
  display: none;
}

.header {
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.create-btn {
  padding: 12px 16px;
  background: $color-primary;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  flex: 1;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }
}

.switching-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  width: 100%;
  min-height: 300px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  width: 100%;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(59, 130, 246, 0.1);
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.trips-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.trips-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: #f9fafb;
  border-radius: 12px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #111827;
}

.empty-state p {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #6b7280;
}

@media (min-width: 640px) {
  .home {
    padding: 24px;
    padding-top: 48px;
  }

  .title-section {
    margin-bottom: 0px;
  }

  .title {
    font-size: 28px;
  }

  .mobile-availability {
    display: none;
  }

  .desktop-availability {
    display: block;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: end;
    margin-bottom: 24px;
  }

  .header-actions {
    width: auto;
    align-items: end;
    gap: 16px;
  }

  .create-btn {
    padding: 15px 24px;
    flex: none;
  }

  .trips-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .trips-list {
    gap: 16px;
  }

  .empty-state {
    padding: 60px 24px;
  }

  .empty-icon {
    font-size: 64px;
  }

  .empty-state h3 {
    font-size: 20px;
  }
}

@media (min-width: 768px) {
  .trips-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }

  .title {
    font-size: 32px;
  }
}
</style>