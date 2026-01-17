<script setup lang="ts">
import type { Folder } from '../../types/trip'

defineProps<{
  folders: Folder[]
  activeFolder: string
}>()

defineEmits<{
  close: []
  selectFolder: [id: string]
  openAddModal: []
}>()
</script>

<template>
  <div class="mobile-menu-overlay" @click="$emit('close')">
    <div class="mobile-menu" @click.stop>
      <div class="mobile-menu-header">
        <h3>Папки</h3>
        <button class="close-btn" @click="$emit('close')">
          ✕
        </button>
      </div>

      <div class="mobile-folders">
        <button class="add-folder-btn" @click="$emit('openAddModal')">
          <img src="/gif/add-folder.gif" alt="">
          <span>Новая папка</span>
        </button>
        <div
          v-for="folder in folders"
          :key="folder.id"
          class="folder-item"
          :class="{ active: activeFolder === folder.id }"
          @click="$emit('selectFolder', folder.id)"
        >
          <img src="/img/svg/folder.svg" alt="">
          <span>{{ folder.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: white;
  padding: 20px;
  animation: slideIn 0.3s ease;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
}

.mobile-folders {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
}

.folder-item.active {
  background: #667eea;
  color: white;
}

.folder-item img {
  width: 20px;
  height: 20px;
}

.add-folder-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f7fafc;
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  img {
    width: 20px;
    height: 20px;
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
