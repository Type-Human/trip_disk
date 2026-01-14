<script setup lang="ts">
import { ref } from 'vue'
import TripList from '../components/trips/TripList.vue'
import InputSerch from '../components/ui/InputSerch.vue'
import ViewSwitcher from '../components/ui/ViewSwitcher.vue'

const currentView = ref<'list' | 'grid'>('list')

function handleViewSwitch(viewType: 'list' | 'grid') {
  currentView.value = viewType
}
</script>

<template>
  <div class="home container--small">
    <div class="home__content">
      <div class="home__setting">
        <div class="home__setting-header">
          <h1 class="home__setting-title">
            Путешествия
          </h1>
          <div class="home__setting-actions">
            <router-link to="/edit-trip">
              <button class="home__setting-button">
                Создать
              </button>
            </router-link>
          </div>
        </div>

        <div class="home__setting-bottom">
          <div class="home__setting-input-wrapper">
            <InputSerch />
          </div>
          <ViewSwitcher @switch-view="handleViewSwitch" />
        </div>
      </div>

      <div class="home__trips" :class="currentView">
        <TripList />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home {
  margin-top: $spacing-xl;

  &__setting {
    margin-bottom: $spacing-md;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;

    &-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    &-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    &-bottom {
      width: 100%;
      display: flex;
      gap: 16px;
    }

    &-input-wrapper {
      position: relative;
      width: 100%;

      &::before {
        content: '';
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        height: 20px;
        background-color: #9ca3af;
        mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/%3E%3C/svg%3E");
        mask-size: contain;
        mask-repeat: no-repeat;
        pointer-events: none;
        z-index: 1;
      }
    }

    &-title {
      font-size: $font-size-2xl;
      font-weight: $font-weight-bold;
      color: var(--color-text);
      margin: 0;
    }

    &-button {
      padding: $spacing-xs $spacing-md;
      background: var(--color-accent);
      color: white;
      border: none;
      border-radius: 8px;
      height: 36px;
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: var(--color-accent-hover);
      }
    }

    &-input {
      width: 100%;
      height: 46px;
      border-radius: 8px;
      border: 1px solid #d4d7e5;
      outline: none;
      padding: 0 50px;
      padding-right: 16px;
      font-size: 14px;
      color: var(--color-text);
      background: white;
      box-sizing: border-box;

      &:focus {
        border-color: var(--color-accent);
      }

      &::placeholder {
        color: #9ca3af;
      }
    }
  }

  &__trips {
    flex: 1;
    min-width: 0;
    &.list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    &.grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
  }
}
</style>
