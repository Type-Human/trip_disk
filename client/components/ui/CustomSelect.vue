<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'

const props = defineProps<{
    folders?: Array<{ id: string; name: string }>
    selectedFolderId?: string | null
    isUploading?: boolean
}>()

const emit = defineEmits<{
    'update:selectedFolderId': [value: string | null]
}>()

const isOpen = ref(false)
const selectRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()
const selectedFolder = ref(props.selectedFolderId || '')
const selectedLabel = ref('Без папки')
const dropdownWidth = ref('auto')

watch(() => props.selectedFolderId, (newVal) => {
    selectedFolder.value = newVal || ''
    updateSelectedLabel()
})

onMounted(() => {
    updateSelectedLabel()
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('resize', updateDropdownPosition)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('resize', updateDropdownPosition)
})

function updateSelectedLabel() {
    if (!selectedFolder.value) {
        selectedLabel.value = 'Без папки'
    } else if (props.folders) {
        const folder = props.folders.find(f => f.id === selectedFolder.value)
        selectedLabel.value = folder ? folder.name : 'Без папки'
    }
}

function toggleDropdown() {
    if (props.isUploading) return
    isOpen.value = !isOpen.value
    
    if (isOpen.value && selectRef.value) {
        nextTick(() => {
            updateDropdownPosition()
        })
    }
}

function updateDropdownPosition() {
    if (isOpen.value && selectRef.value && dropdownRef.value) {
        const selectRect = selectRef.value.getBoundingClientRect()
        const dropdown = dropdownRef.value
        
      
        dropdownWidth.value = `${selectRect.width}px`
        
     
        dropdown.style.position = 'fixed'
        dropdown.style.left = `${selectRect.left}px`
        dropdown.style.top = `${selectRect.bottom + 4}px`
        dropdown.style.width = dropdownWidth.value
        
       
        const viewportHeight = window.innerHeight
        const dropdownHeight = dropdown.offsetHeight
        const spaceBelow = viewportHeight - selectRect.bottom
        
        if (spaceBelow < dropdownHeight && selectRect.top > dropdownHeight) {
          
            dropdown.style.top = `${selectRect.top - dropdownHeight - 4}px`
            dropdown.style.borderRadius = '8px 8px 0 0'
        } else {
            dropdown.style.borderRadius = '0 0 8px 8px'
        }
    }
}

function selectOption(value: string, label: string) {
    selectedFolder.value = value
    selectedLabel.value = label
    isOpen.value = false
    emit('update:selectedFolderId', value || null)
}

function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement
    if (selectRef.value && !selectRef.value.contains(target)) {
        isOpen.value = false
    }
}
</script>

<template>
    <div class="folder-select">
        <div ref="selectRef" class="custom-select" :class="{ open: isOpen, disabled: props.isUploading }">
            <div class="select-trigger" @click="toggleDropdown">
                <span class="selected-value">
                    {{ selectedLabel }}
                </span>
                <span class="dropdown-arrow">▼</span>
            </div>

            <div v-if="isOpen" ref="dropdownRef" class="dropdown-menu" :style="{ width: dropdownWidth }">
                <div class="dropdown-item" :class="{ active: selectedFolder === '' }"
                    @click="selectOption('', 'Без папки')">
                    Без папки
                </div>

                <div v-for="folder in props.folders" :key="folder.id" class="dropdown-item"
                    :class="{ active: selectedFolder === folder.id }" @click="selectOption(folder.id, folder.name)">
                    {{ folder.name }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.folder-select {
    margin: 0 24px 16px 24px;
}

.custom-select {
    position: relative;
    width: 100%;
}

.custom-select.disabled {
    opacity: 0.6;
    pointer-events: none;
}

.select-trigger {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
    min-height: 42px;
    width: 100%;
    box-sizing: border-box;
}

.select-trigger:hover:not(.disabled) {
    border-color: #6366f1;
}

.custom-select.open .select-trigger {
    border-color: #6366f1;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}

.selected-value {
    font-size: 14px;
    color: #374151;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
}

.dropdown-arrow {
    font-size: 10px;
    color: #6b7280;
    transition: transform 0.2s;
    padding-top: 1px;
    flex-shrink: 0;
    margin-left: 8px;
}

.custom-select.open .dropdown-arrow {
    transform: rotate(180deg);
}

.dropdown-menu {
    position: fixed; 
    background: white;
    border: 1px solid #d1d5db;
    border-top: none;
    border-radius: 0 0 8px 8px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 2000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.dropdown-menu::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
    background: transparent;
}

.dropdown-item {
    padding: 12px 14px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
    color: #374151;
    border-bottom: 1px solid #f3f4f6;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.dropdown-item:last-child {
    border-bottom: none;
}

.dropdown-item:hover {
    background: #f9fafb;
}

.dropdown-item.active {
    background: #f0f9ff;
    color: #0369a1;
    font-weight: 500;
}
</style>