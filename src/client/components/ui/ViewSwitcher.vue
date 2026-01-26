<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue?: 'list' | 'grid'
}>()

const emit = defineEmits<{
  (e: 'switchView', viewType: 'list' | 'grid'): void
  (e: 'update:modelValue', viewType: 'list' | 'grid'): void
}>()

const activeView = ref<'list' | 'grid'>(props.modelValue || 'list')

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    activeView.value = newVal
  }
}, { immediate: true })

function switchView(viewType: 'list' | 'grid') {
  activeView.value = viewType
  emit('switchView', viewType)
  emit('update:modelValue', viewType)
}
</script>

<template>
  <div class="view-switcher">
    <button class="view-switcher-button " :class="{ active: activeView === 'list' }" @click="switchView('list')">
      <img src="/img/svg/list.svg" alt="">
    </button>
    <button class="view-switcher-button " :class="{ active: activeView === 'grid' }" @click="switchView('grid')">
      <img src="/img/svg/grid.svg" alt="">
    </button>
  </div>
</template>

<style scoped lang="scss">
.view-switcher {
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 5px;
  border-radius: 8px;
  background-color: #e9ecef;

  &-button {
    height: 36px;
    width: 50px;
    display: flex;
    align-items: center;
    cursor: pointer;
    justify-content: center;
    background-color: inherit;
    border-radius: 8px;
    border: none;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      img {
        transform: translateY(-1.5px);
        transition: transform 0.3s ease;
      }
    }

    &.active {
      background-color: #f8f9fa;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 1;
      &:hover {
        transform: none;
      }
    }
  }
}
</style>
