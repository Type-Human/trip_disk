<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuth } from "@/composables/useAuth";
import { useRouter } from "vue-router";
import { tripApi } from "@/api";
import type { Trip } from "@/types/trip";
import DeleteModal from "@/components/modals/DeleteModal.vue";
import Icon from "@/components/ui/Icon.vue";

const router = useRouter();
const { user, handleLogout } = useAuth();

const isEditing = ref(false);
const editForm = ref({
  username: "",
  email: "",
  bio: "",
  location: "",
  website: "",
  company: "",
});

const trips = ref<Trip[]>([]);
const loadingTrips = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const showDeleteModal = ref(false);
const isloadingDelete = ref(false);
const tripId = ref('')

onMounted(async () => {
  if (user) {
    editForm.value.username = user.username;
    editForm.value.email = user.email;
  }
  await loadUserTrips();
});

const loadUserTrips = async () => {
  loadingTrips.value = true;
  try {
    const allTrips = await tripApi.getAll();
    trips.value = allTrips;
  } catch (error) {
    console.error("Ошибка загрузки поездок:", error);
  } finally {
    loadingTrips.value = false;
  }
};

const goToTrip = (tripId: string) => {
  router.push(`/trips/${tripId}`);
};



const toggleEdit = () => {
  isEditing.value = !isEditing.value;
  successMessage.value = "";
  errorMessage.value = "";
};

const openDeleteModal = (id:string) => {
  showDeleteModal.value = true;
  tripId.value = id
};

const closeDeleteModal = () => {
  if (!isloadingDelete.value ||  !tripId.value) {
    showDeleteModal.value = false;
    tripId.value = ''
  }
};

const deleteTrip = async () => {
  isloadingDelete.value = true;
  try {
    await tripApi.delete(tripId.value);
    trips.value = trips.value.filter((t) => t.id !== tripId.value);
    isloadingDelete.value = false;
    showDeleteModal.value = false
    tripId.value = ''
  } catch (error) {
    errorMessage.value = "Ошибка при удалении поездки";
    isloadingDelete.value = false;
    tripId.value = ''
  } finally {
    isloadingDelete.value = false;
    showDeleteModal.value = false
    tripId.value = ''
  }
};

const formatDate = (date?: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
</script>

<template>
  <div class="profile-page">
    <div class="container-xl">
      <div class="tab-nav">
        <button class="tab active">Поездки</button>
      </div>
      <div
        class="Layout Layout--flowRow-until-md Layout--sidebarPosition-start"
      >
        <div class="Layout-sidebar">
          <div class="h-card">
            <div class="profile-header">
              <div class="avatar-container">
                <div class="avatar">
                  <span class="avatar-initials">
                    {{ user?.username?.charAt(0)?.toUpperCase() || "U" }}
                  </span>
                </div>
              </div>

              <div class="profile-names">
                <h1 class="profile-name">
                  {{ user?.username || "Пользователь" }}
                </h1>
                <p class="profile-username">{{ user?.email }}</p>
              </div>
            </div>

            <div class="profile-stats">
              <div class="stat-item">
                <div class="stat-number">{{ trips.length }}</div>
                <div class="stat-label">поездок</div>
              </div>
            </div>

            <div class="profile-actions">
              <button @click="toggleEdit" class="btn-edit-profile">
                <Icon size="16" stroke-color="currentColor" stroke-width="2">
                  <path d="M17 3L21 7L7 21H3V17L17 3Z" />
                </Icon>
                Редактировать профиль
              </button>
            </div>
          </div>
        </div>

        <div class="Layout-main">
          <div class="trips-section">
            <div class="trips-header">
              <h2 class="section-title">
                Поездки
              </h2>
            </div>

            <div v-if="loadingTrips" class="loading-trips">
              <div class="spinner"></div>
              <p>Загрузка поездок...</p>
            </div>

            <div v-else-if="trips.length === 0" class="empty-trips">
              <p>У вас пока нет поездок</p>
            </div>

            <div v-else class="trips-grid">
              <div
                v-for="trip in trips"
                :key="trip.id"
                class="trip-card"
                @click="goToTrip(trip.id)"
              >
                <div class="trip-cover">
                  <img
                    v-if="trip.coverImage"
                    :src="trip.coverImage"
                    :alt="trip.title"
                  />
                  <div v-else class="trip-cover-placeholder">
                    <Icon size="32" stroke-color="rgb(31, 41, 55)" stroke-width="1.5">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                      <circle cx="12" cy="9" r="3" />
                    </Icon>
                  </div>
                  <button
                    class="delete-trip-btn"
                    @click.stop="openDeleteModal(trip.id)"
                    title="Удалить"
                  >
                    <Icon size="14" stroke-color="white" stroke-width="2">
                      <path d="M18 6L6 18M6 6L18 18" />
                    </Icon>
                  </button>
                </div>
                <div class="trip-info">
                  <h3>{{ trip.title }}</h3>
                  <p class="trip-date">{{ formatDate(trip.date) }}</p>
                  <p class="trip-location">
                    {{ trip.location || "Место не указано" }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div v-if="successMessage" class="message success">
            <Icon size="16" stroke-color="currentColor" stroke-width="2">
              <path d="M20 6L9 17L4 12" />
            </Icon>
            {{ successMessage }}
          </div>

          <div v-if="errorMessage" class="message error">
            <Icon size="16" stroke-color="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </Icon>
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
  <DeleteModal v-if="showDeleteModal" @close="closeDeleteModal" @confirm="deleteTrip" />
</template>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  padding-top: 48px;
  padding: 48px;
}

.container-xl {
  max-width: $container-width;
  margin: 0 auto;
}

.Layout {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.Layout-sidebar {
  flex: 0 0 296px;
}

.Layout-main {
  flex: 1;
  min-width: 0;
}

.h-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e1e4e8;
  padding: 24px;
}

.profile-header {
  text-align: center;
  margin-bottom: 20px;
}

.avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.avatar {
  width: 100px;
  height: 100px;
  background: $color-primary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .avatar-initials {
    font-size: 40px;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
  }
}

.profile-name {
  font-size: 20px;
  font-weight: 600;
  color: #24292f;
  margin-bottom: 4px;
}

.profile-username {
  font-size: 14px;
  color: #57606a;
}

.profile-stats {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 16px 0;
  border-top: 1px solid #e1e4e8;
  border-bottom: 1px solid #e1e4e8;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;

  .stat-number {
    font-size: 20px;
    font-weight: 600;
    color: #24292f;
  }

  .stat-label {
    font-size: 12px;
    color: #57606a;
  }
}

.profile-actions {
  margin-bottom: 16px;
}

.btn-edit-profile {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #24292f;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    border-color: #d0d7de;
  }
}

.profile-details {
  margin-top: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 14px;
  color: #57606a;

  svg {
    flex-shrink: 0;
    color: #6a737d;
  }
}

.tab-nav {
  display: flex;
  gap: 16px;
  border-bottom: 1px solid #e1e4e8;
  margin-bottom: 24px;

  .tab {
    padding: 12px 16px;
    background: none;
    border: none;
    font-size: 14px;
    font-weight: 500;
    color: #57606a;
    cursor: pointer;
    position: relative;

    &.active {
      color: $color-primary;

      &::after {
        content: "";
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background: $color-primary;
      }
    }
  }
}

.trips-section {
  background: white;
  border-radius: 16px;
  border: 1px solid #e1e4e8;
  padding: 24px;
}

.trips-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #24292f;
}

.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.trip-card {
  background: white;
  border: 1px solid #e1e4e8;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.trip-cover {
  position: relative;
  height: 160px;
  background: #f6f8fa;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .trip-cover-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #d0d7de;
     background: linear-gradient(135deg, #f0f4ff 0%, #e6f0ff 100%);
  }

  .delete-trip-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(0, 0, 0, 0.6);
    border: none;
    border-radius: 4px;
    display: flex;
    padding: 4px;
    cursor: pointer;
    color: white;
    transition: all 0.2s;

    &:hover {
      background: #dc3545;
    }
  }
}

.trip-info {
  padding: 12px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #24292f;
    margin-bottom: 4px;
  }

  .trip-date {
    font-size: 12px;
    color: #57606a;
    margin-bottom: 4px;
  }

  .trip-location {
    font-size: 12px;
    color: #6a737d;
  }
}

.empty-trips {
  text-align: center;
  padding: 48px;
  color: #6a737d;

  svg {
    margin-bottom: 16px;
    color: #d0d7de;
  }

  p {
    margin-bottom: 16px;
  }
}

.loading-trips {
  text-align: center;
  padding: 48px;

  .spinner {
    margin: 0 auto 16px;
  }
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e1e4e8;
  border-top-color: $color-primary;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 6px;
  margin-top: 16px;
  font-size: 14px;

  &.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  &.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding: 12px;
  }

  .Layout {
    flex-direction: column;
  }

  .Layout-sidebar {
    flex: auto;
  }

  .trips-grid {
    grid-template-columns: 1fr;
  }
}
</style>