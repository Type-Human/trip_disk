<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  close: []
  add: [name: string]
}>()

const folderName = ref('')

function handleAdd() {
  if (!folderName.value.trim())
    return
  emit('add', folderName.value.trim())
  folderName.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape')
    emit('close')
  if (e.key === 'Enter')
    handleAdd()
}
</script>

<template>
  <div class="modal-overlay" @click="emit('close')">
    <div class="modal" @click.stop>
      <h3>Новая папка</h3>
      <input
        v-model="folderName"
        placeholder="Название папки"
        autofocus
        @keydown="handleKeydown"
      >
      <div class="modal-actions">
        <button class="cancel" @click="emit('close')">
          Отмена
        </button>
        <button class="save" @click="handleAdd">
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
  max-width: 600px;
}

.modal h3 {
  margin-bottom: 24px;
}

.modal input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 24px;

  &:focus {
    border: 2px solid #667eea;
    outline: none;
  }
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-actions button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

.cancel {
  background: #e2e8f0;
}

.save {
  background: #667eea;
  color: white;
}

</style>
