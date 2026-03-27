<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import Icon from '../ui/Icon.vue'

const router = useRouter()
const { user, isAuthenticated, handleLogout } = useAuth()

const logout = async () => {
  await handleLogout()
  window.location.reload()
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <header class="app-header">
    <div class="header-container container">
      <div class="logo-container">
        <router-link to="/" class="nav-link" active-class="active">
          <img class="logo" src="/img/logo/disk-logo.png" alt="">
        </router-link>
      </div>
      <nav class="nav">
        <div class="user-icon-wrapper">
          <button 
            v-if="!isAuthenticated" 
            @click="goToLogin" 
            class="user-icon-btn"
            title="Войти"
          >
            <Icon 
              :size="32" 
              color="#8bc4ff"
              :filled="false"
              stroke-color="#8bc4ff"
              stroke-width="1.5"
              view-box="0 0 64 64"
            >
              <circle cx="32" cy="32" r="30" fill="#e8f3ff" stroke="none"/>
              <path d="M54.85,51.42a30,30,0,0,1-45.7,0,23,23,0,0,1,45.7,0Z" fill="#8bc4ff" stroke="none"/>
              <path d="M43,23c0,10.5-13.59,15.14-19.9,6.46A10.7,10.7,0,0,1,21,23a11,11,0,0,1,22,0Z" fill="#8bc4ff" stroke="none"/>
              <path d="M32,0C4.57,0-9.84,32.21,7.61,52.7a32,32,0,0,0,48.77,0C74,31.93,59.16,0,32,0Zm0,4C53.84,4,67.24,28,55.87,46.58A25,25,0,0,0,42.13,31.13l.4-.5A13,13,0,0,0,32,10C20.88,10,15.18,23,21.86,31.13A25,25,0,0,0,8.13,46.58C-3.24,28,10.15,4,32,4ZM11.25,50.77a20.94,20.94,0,0,1,14-16.66,13,13,0,0,0,13.46,0,20.92,20.92,0,0,1,14,16.66A28,28,0,0,1,11.25,50.77ZM23,23a9,9,0,1,1,9,9A9,9,0,0,1,23,23Z" fill="#2e58ff" stroke="none"/>
            </Icon>
          </button>
          
          <div v-else class="user-menu">
            <router-link to="/profile" class="profile-link">
              <Icon 
                :size="32" 
                color="#6366f1"
                :filled="true"
                view-box="0 0 64 64"
              >
                <circle cx="32" cy="32" r="30" fill="#6366f1" stroke="none"/>
                <path d="M54.85,51.42a30,30,0,0,1-45.7,0,23,23,0,0,1,45.7,0Z" fill="#fff" stroke="none"/>
                <path d="M43,23c0,10.5-13.59,15.14-19.9,6.46A10.7,10.7,0,0,1,21,23a11,11,0,0,1,22,0Z" fill="#fff" stroke="none"/>
                <path d="M32,0C4.57,0-9.84,32.21,7.61,52.7a32,32,0,0,0,48.77,0C74,31.93,59.16,0,32,0Zm0,4C53.84,4,67.24,28,55.87,46.58A25,25,0,0,0,42.13,31.13l.4-.5A13,13,0,0,0,32,10C20.88,10,15.18,23,21.86,31.13A25,25,0,0,0,8.13,46.58C-3.24,28,10.15,4,32,4ZM11.25,50.77a20.94,20.94,0,0,1,14-16.66,13,13,0,0,0,13.46,0,20.92,20.92,0,0,1,14,16.66A28,28,0,0,1,11.25,50.77ZM23,23a9,9,0,1,1,9,9A9,9,0,0,1,23,23Z" fill="#fff" stroke="none"/>
              </Icon>
              <span class="username">{{ user?.username || user?.email?.split('@')[0] }}</span>
            </router-link>
            <button @click="logout" class="logout-btn" title="Выйти">
              <Icon :size="18" color="#666" stroke-color="#666">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" />
                <path d="M16 17L21 12L16 7" />
                <path d="M21 12H9" />
              </Icon>
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header {
  padding: 12px 0;
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
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
}

.nav {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.user-icon-wrapper {
  display: flex;
  align-items: center;
}

.user-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 4px;
}

.profile-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  padding: 6px 6px;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(99, 102, 241, 0.1);
  }
  
  .username {
    font-size: 14px;
    font-weight: 500;
    color: #2c3e50;
  }
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  svg {
    transition: transform 0.3s ease;
  }
  
  &:hover {
    color: #e74c3c;
    background: rgba(231, 76, 60, 0.1);
    
    svg {
      transform: translateX(2px);
    }
  }
}

@media (max-width: 768px) {
  .nav {
    gap: 1rem;
  }
  
  .username {
    display: none;
  }
  
  .logout-btn span {
    display: none;
  }
  
  .profile-link .username {
    display: none;
  }
}
</style>