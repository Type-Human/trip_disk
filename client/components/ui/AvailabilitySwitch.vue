<script setup lang="ts">
import { ref, watch } from 'vue'
import Icon from '../ui/Icon.vue'

const props = defineProps<{
  modelValue: 'my' | 'public'
}>()

const emit = defineEmits<{
  (e: 'update:type', type: 'my' | 'public'): void
}>()

const activeView = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  activeView.value = newVal
})

const setView = (type: 'my' | 'public') => {
  activeView.value = type
  emit('update:type', type)
}
</script>

<template>
  <div class="view-switcher">
    <button 
      class="view-switcher-button" 
      :class="{ active: activeView === 'my' }"
      @click="setView('my')"
      title="Мои поездки"
    >
      <Icon size="14" color="currentColor">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="currentColor" stroke="none"/>
          <path d="M54.85,51.42a30,30,0,0,1-45.7,0,23,23,0,0,1,45.7,0Z" fill="white" stroke="none"/>
          <path d="M43,23c0,10.5-13.59,15.14-19.9,6.46A10.7,10.7,0,0,1,21,23a11,11,0,0,1,22,0Z" fill="white" stroke="none"/>
          <path d="M32,0C4.57,0-9.84,32.21,7.61,52.7a32,32,0,0,0,48.77,0C74,31.93,59.16,0,32,0Zm0,4C53.84,4,67.24,28,55.87,46.58A25,25,0,0,0,42.13,31.13l.4-.5A13,13,0,0,0,32,10C20.88,10,15.18,23,21.86,31.13A25,25,0,0,0,8.13,46.58C-3.24,28,10.15,4,32,4ZM11.25,50.77a20.94,20.94,0,0,1,14-16.66,13,13,0,0,0,13.46,0,20.92,20.92,0,0,1,14,16.66A28,28,0,0,1,11.25,50.77ZM23,23a9,9,0,1,1,9,9A9,9,0,0,1,23,23Z" fill="white" stroke="none"/>
        </svg>
      </Icon>
      <span>Мои</span>
    </button>
    
    <button 
      class="view-switcher-button"
      :class="{ active: activeView === 'public' }"
      @click="setView('public')"
      title="Общие поездки"
    >
      <Icon size="14" color="currentColor">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <path d="M2 12H22" stroke="currentColor" stroke-width="1.5"/>
          <path d="M12 2C14.5 4.5 15.5 8 12 12C8.5 8 9.5 4.5 12 2Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <path d="M12 22C14.5 19.5 15.5 16 12 12C8.5 16 9.5 19.5 12 22Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <ellipse cx="12" cy="12" rx="3" ry="10" stroke="currentColor" stroke-width="1.5" fill="none"/>
        </svg>
      </Icon>
      <span>Общие</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.view-switcher {
  height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 0 3px;
  border-radius: 6px;
  background-color: #e9ecef;

  &-button {
    height: 24px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    background-color: inherit;
    border-radius: 4px;
    border: none;
    transition: all 0.2s ease;
    font-size: 11px;
    font-weight: 500;
    color: #6c757d;
    padding: 0 8px;
    white-space: nowrap;

    &:hover {
      color: #6366f1;
    }

    &.active {
      background-color: #f8f9fa;
      color: #6366f1;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    :deep(svg) {
      flex-shrink: 0;
      display: block;
    }
  }
}
</style>