<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  total: number
  completed: number
  results: Array<{ name: string; success: boolean; error?: string }>
  onCancel?: () => void
}>()

const emit = defineEmits<{
  cancel: []
}>()

const progress = ref(0)

watch(() => props.completed, (val) => {
  if (props.total > 0) {
    progress.value = (val / props.total) * 100
  }
})

const successCount = ref(0)
const failedCount = ref(0)

watch(() => props.results, (results) => {
  successCount.value = results.filter(r => r.success).length
  failedCount.value = results.filter(r => !r.success).length
}, { deep: true })
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="upload-progress-overlay">
      <div class="upload-progress-modal">
        <h3>Загрузка фото...</h3>
        
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <span class="progress-text">{{ Math.round(progress) }}%</span>
        </div>

        <div class="stats-container">
          <div class="stat-row">
            <span class="stat-label">Всего</span>
            <span class="stat-value">{{ total }}</span>
          </div>
          <div class="stat-row success">
            <span class="stat-label">
              <span class="icon">✓</span> Загружено
            </span>
            <span class="stat-value">{{ successCount }}</span>
          </div>
          <div class="stat-row error" v-if="failedCount > 0">
            <span class="stat-label">
              <span class="icon">✕</span> Ошибок
            </span>
            <span class="stat-value">{{ failedCount }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">
              <span class="icon">⋯</span> Осталось
            </span>
            <span class="stat-value">{{ total - completed }}</span>
          </div>
        </div>

        <div class="results-container" v-if="results.length > 0">
          <div class="results-header">Последние</div>
          <div class="results-list">
            <div 
              v-for="(result, i) in results.slice(-5)" 
              :key="i"
              class="result-item"
              :class="{ success: result.success, error: !result.success }"
            >
              <span class="result-icon">{{ result.success ? '✓' : '✕' }}</span>
              <span class="result-name">{{ result.name.length > 30 ? result.name.slice(0, 27) + '...' : result.name }}</span>
            </div>
            <div v-if="results.length > 5" class="result-more">
              +{{ results.length - 5 }}
            </div>
          </div>
        </div>
        
        <button class="cancel-btn" @click="$emit('cancel')" :disabled="completed === total">
          {{ completed === total ? 'Готово' : 'Отмена' }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.upload-progress-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
}

.upload-progress-modal {
  background: white;
  padding: 24px;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  text-align: center;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #6366f1;
  transition: width 0.2s ease;
  border-radius: 3px;
}

.progress-text {
  font-size: 15px;
  font-weight: 600;
  color: #6366f1;
  min-width: 48px;
  text-align: right;
}

.stats-container {
  background: #f9fafb;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &.success {
    color: #059669;
  }
  
  &.error {
    color: #dc2626;
  }
}

.stat-label {
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-value {
  font-weight: 600;
}

.icon {
  display: inline-block;
  width: 18px;
  text-align: center;
  font-size: 14px;
}

.results-container {
  margin-bottom: 20px;
}

.results-header {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.results-list {
  background: #f3f4f6;
  border-radius: 10px;
  padding: 10px;
  max-height: 140px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  font-size: 13px;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
  }
  
  &.success {
    color: #059669;
  }
  
  &.error {
    color: #dc2626;
  }
}

.result-icon {
  flex-shrink: 0;
  width: 18px;
  text-align: center;
  font-size: 13px;
}

.result-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #374151;
}

.result-more {
  color: #6b7280;
  font-size: 12px;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.cancel-btn {
  width: 100%;
  padding: 12px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #e5e7eb;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #10b981;
    color: white;
    border-color: #10b981;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .upload-progress-modal {
    padding: 20px;
    width: 92%;
  }
}
</style>