<script setup lang="ts">
defineEmits<{
  click: []
}>()
</script>

<template>
  <button class="button" @click="$emit('click')">
    <slot />
  </button>
</template>
