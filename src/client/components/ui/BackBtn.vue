<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <button class="back-btn" @click="router.back()">
    <img src="/img/svg/arrow-left.svg" alt="" style="width: 15px; height: 15px;">
  </button>
</template>

<style scoped lang="scss">
.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  margin-bottom: 24px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  cursor: pointer;
  font-size: 18px;
  z-index: 100;

  img {
    margin-top: 1px;
  }

  &:hover {
    background: #f5f5f5;
  }
}
</style>
