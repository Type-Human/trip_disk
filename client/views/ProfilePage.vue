<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'


const { user } = useAuth()


const editForm = ref({
  username: '',
  email: ''
})



onMounted(() => {
  if (user) {
    editForm.value.username = user.username
    editForm.value.email = user.email
  }
})



</script>

<template>
  <div class="profile-page">
    <div class="profile-container">
      <div class="profile-header">
        <div class="avatar-container">
          <div class="avatar">
            <span class="avatar-initials">
              {{ user?.username?.charAt(0)?.toUpperCase() || 'U' }}
            </span>
          </div>
        </div>
        <h1 class="profile-name">{{ user?.username || 'Пользователь' }}</h1>
        <p class="profile-email">{{ user?.email }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.profile-page {
 height: 100vh ;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  height: 100%;
}

.profile-header {
  text-align: center;
}

.avatar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
}

.avatar {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #6366f1 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  
  .avatar-initials {
    font-size: 36px;
    font-weight: 600;
    color: white;
    line-height: 1;
  }
}

.profile-name {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.profile-email {
  font-size: 16px;
  color: #718096;
}

</style>