<script setup lang="ts"></script>

<template>
  <header class="app-header">
    <div class="header-container container">
      <div class="logo-container">
        <img class="logo" src="/img/logo/disk-logo.png" alt="">
      </div>
      <nav class="nav">
        <router-link to="/" class="nav-link" active-class="active">
          Главная
        </router-link>
        <!-- <router-link to="/trips" class="nav-link" active-class="active">
          Поездки
        </router-link> -->
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
  padding: 16px 0;
  top: 0;
  z-index: 100;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
  height: 100%;
  box-sizing: border-box;
}

.logo-container {
  height: 100%;
  display: flex;
  align-items: center;
}

.logo {
  height: 100%;
  width: 70px;
  object-fit: contain;
}

.nav {
  display: flex;
  gap: 2rem;
  align-items: center;

  .nav-link {
    color: var(--color-gray-darker);
    text-decoration: none;
    font-weight: $font-weight-bold;
    font-size: $font-size-base;
    padding: 8px 0;
    position: relative;
    transition: color 0.3s ease;

    &:hover {
      color: var(--color-text);
    }

    &.active {
      color: var(--color-accent);
    }
  }
}
</style>
