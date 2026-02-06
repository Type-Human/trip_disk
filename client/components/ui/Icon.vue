<script setup>
import { computed } from 'vue'

const props = defineProps({

  size: {
    type: [Number, String],
    default: 24,
  },

  color: {
    type: String,
    default: 'currentColor',
  },

  strokeColor: {
    type: String,
    default: 'currentColor',
  },

  strokeWidth: {
    type: [Number, String],
    default: 2,
  },
  strokeLinecap: {
    type: String,
    default: 'round',
  },
  strokeLinejoin: {
    type: String,
    default: 'round',
  },

  filled: {
    type: Boolean,
    default: false,
  },

  viewBox: {
    type: String,
    default: '0 0 24 24',
  },

  className: {
    type: String,
    default: '',
  },
})

const fill = computed(() => props.filled ? props.color : 'none')
const stroke = computed(() => props.filled ? 'none' : props.strokeColor)

const customStyle = computed(() => ({
  '--icon-color': props.color,
  '--icon-stroke-color': props.strokeColor,
}))
</script>

<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="viewBox"
    :fill="fill"
    :stroke="stroke"
    :stroke-width="strokeWidth"
    :stroke-linecap="strokeLinecap"
    :stroke-linejoin="strokeLinejoin"
    class="icon" :class="[className]"
    :style="customStyle"
    v-bind="$attrs"
  >

    <slot />
  </svg>
</template>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  user-select: none;
}
</style>
