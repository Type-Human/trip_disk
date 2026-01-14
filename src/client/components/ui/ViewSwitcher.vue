<script setup lang="ts">
</script>

<template>
  <div class="view-switcher">
    <button class="view-switcher-button view-switcher-button--active">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
        <path fill="currentColor" d="M3 5v14h17V5zm4 2v2H5V7zm-2 6v-2h2v2zm0 2h2v2H5zm13 2H9v-2h9zm0-4H9v-2h9zm0-4H9V7h9z" />
      </svg>
    </button>
    <button class="view-switcher-button ">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
        <path fill="currentColor" d="M3 11h8V3H3m2 2h4v4H5m8 12h8v-8h-8m2 2h4v4h-4M3 21h8v-8H3m2 2h4v4H5m8-16v8h8V3m-2 6h-4V5h4Z" />
      </svg>
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
    justify-content: center;
    background-color: inherit;
    border-radius: 8px;
    border: none;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;

    &--active {
      background-color: #f8f9fa;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 1;
    }
  }
}
</style>
