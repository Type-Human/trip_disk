<script setup lang="ts">
import type { Folder } from '../../types/trip'

defineProps<{
  folders: Folder[]
  activeFolder: string
}>()

defineEmits<{
  selectFolder: [id: string]
  openAddModal: []
}>()
</script>

<template>
  <div class="folders-sidebar">
    <button class="add-btn" @click="$emit('openAddModal')">
      <img src="/gif/add-folder.gif" alt="">
      <span>Новая папка</span>
    </button>

    <div class="folders-list">
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
</template>

<style scoped>
.folders-sidebar {
  border-right: 1px solid #e2e8f0;
  padding-right: 20px;
  padding-left: 0px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #f7fafc;
  border: 2px dashed #cbd5e0;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 8px;
}

.add-btn img {
  width: 20px;
  height: 20px;
}

.folders-list {
  flex: 1;
  overflow-y: auto;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
}

.folder-item:hover {
  background: #f7fafc;
}

.folder-item.active {
  background: #667eea;
  color: white;
}

.folder-item img {
  width: 20px;
  height: 20px;
}

@media (max-width: 768px) {
  .folders-sidebar {
    display: none;
  }
}
</style>
