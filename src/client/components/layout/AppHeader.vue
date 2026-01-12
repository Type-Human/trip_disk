<script setup lang="ts">

</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <div class="logo">
        <img class="logo" src="/img/logo/disk-logo.png" alt="">
      </div>
      <nav class="nav">
        <router-link to="/" class="nav-link" active-class="active">
          Главная
        </router-link>
        <router-link to="/trips" class="nav-link" active-class="active">
          Поездки
        </router-link>
        <router-link to="/gallery" class="nav-link" active-class="active">
          Галерея
        </router-link>
        <router-link to="/profile" class="nav-link" active-class="active">
          Профиль
        </router-link>
      </nav>
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header {
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  padding: 0.5rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  background-color: rgba(var(--color-bg-secondary-rgb), 0.8);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.logo {
  width: 70px;
  object-fit: fill;
}

.nav {
  display: flex;
  gap: 2rem;
  align-items: center;

  .nav-link {
    color: var(--color-text-secondary);
    text-decoration: none;
    font-weight: 500;
    font-size: 1rem;
    padding: 0.5rem 0;
    position: relative;
    transition: color 0.3s ease;

    &:hover {
      color: var(--color-text);
    }

    &.active {
      color: var(--color-accent);

      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background-color: var(--color-accent);
        border-radius: 1px;
      }
    }
  }
}
</style>
