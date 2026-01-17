<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import FolderSidebar from '../components/details/FolderSidebar.vue'
import MobileMenu from '../components/details/MobileMenu.vue'
import PhotoGallery from '../components/details/PhotoGallery.vue'
import AddFolderModal from '../components/modals/AddFolderModal.vue'
import BackBtn from '../components/ui/BackBtn.vue'
import { useTripStore } from '../stores/tripStore'

const route = useRoute()
const tripStore = useTripStore()
const tripId = route.params.id as string

const showAddModal = ref(false)
const showMobileMenu = ref(false)
const folders = ref([
  { id: 'all', name: 'Все фото' },
])
const activeFolder = ref('all')

onMounted(() => {
  tripStore.fetchTripMediaById(tripId)
})
</script>

<template>
  <div class="trip-page container">
    <BackBtn />
    <MobileMenu
      v-if="showMobileMenu"
      :folders="folders"
      :active-folder="activeFolder"
      @close="showMobileMenu = false"
      @select-folder="activeFolder = $event"
      @open-add-modal="showAddModal = true"
    />

    <AddFolderModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @add="(name: string) => {
        folders.push({
          id: `folder_${Date.now()}`,
          name,
        })
        showAddModal = false
      }"
    />

    <div class="content">
      <FolderSidebar
        :folders="folders"
        :active-folder="activeFolder"
        @select-folder="activeFolder = $event"
        @open-add-modal="showAddModal = true"
      />

      <PhotoGallery
        :folders="folders"
        :active-folder="activeFolder"
        @open-menu="showMobileMenu = true"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.trip-page {
  margin-top: $spacing-xl;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  display: grid;
  grid-template-columns: 250px 1fr;
  flex: 1;
  overflow: hidden;
}

@media (max-width: 768px) {
  .content {
    grid-template-columns: 1fr;
  }
}
</style>
