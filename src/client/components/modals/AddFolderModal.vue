<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  close: []
  create: [name: string]
}>()

const folderName = ref('')

function handleCreate() {
  if (!folderName.value.trim()) {
    return
  }
  emit('create', folderName.value.trim())
  folderName.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
  }
  if (e.key === 'Enter') {
    handleCreate()
  }
}
</script>

<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <h3>Новая папка</h3>
      <input
        v-model="folderName"
        type="text"
        placeholder="Название папки"
        autofocus
        @keydown="handleKeydown"
      >
      <div class="modal-actions">
        <button class="cancel" @click="$emit('close')">
          Отмена
        </button>
        <button class="save" :disabled="!folderName.trim()" @click="handleCreate">
          Создать
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.modal h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #111827;
}

.modal input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 24px;
  box-sizing: border-box;

  &:focus {
    border-color: #6366f1;
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.cancel {
  background: #f3f4f6;
  color: #374151;

  &:hover {
    background: #e5e7eb;
  }
}

.save {
  background: #6366f1;
  color: white;

  &:hover:not(:disabled) {
    background: #4f46e5;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
}
</style>
