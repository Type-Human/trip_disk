<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { handleRegister } = useAuth()

const username = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

const onSubmit = async () => {
  error.value = ''
  success.value = ''
  loading.value = true

  try {
    const result = await handleRegister(username.value, email.value, password.value)
    if (result.success) {
      success.value = 'Регистрация успешна!'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      error.value = result.error || 'Ошибка регистрации'
    }
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <div class="auth-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.5" />
            <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.5" />
            <path d="M19 8v6M22 11h-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </div>
        <h1>Создать аккаунт</h1>
        <p class="subtitle">Присоединяйтесь к нам</p>
      </div>

      <form @submit.prevent="onSubmit">
        <div class="form-group">
          <div class="input-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" />
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" />
            </svg>
          </div>
          <input v-model="username" type="text" placeholder="Имя пользователя" required :disabled="loading" />
        </div>

        <div class="form-group">
          <div class="input-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                stroke="currentColor" stroke-width="2" />
              <path d="M22 6L12 13 2 6" stroke="currentColor" stroke-width="2" />
            </svg>
          </div>
          <input v-model="email" type="email" placeholder="Email" required :disabled="loading" />
        </div>

        <div class="form-group">
          <div class="input-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2" />
            </svg>
          </div>
          <input v-model="password" type="password" placeholder="Пароль" required :disabled="loading" />
        </div>

        <button type="submit" :disabled="loading" class="submit-btn">
          <span v-if="!loading">Зарегистрироваться</span>
          <span v-else class="spinner"></span>
        </button>

        <div v-if="success" class="success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          {{ success }}
        </div>

        <p v-if="error" class="error">{{ error }}</p>
      </form>

      <div class="auth-footer">
        <p>Уже есть аккаунт?</p>
        <router-link to="/login" class="link">Войти</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;


  @media (max-width:768px) {
    padding: 8px;
  }

}

.auth-container {
  max-width: 480px;
  width: 100%;
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.5s ease;
  
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;

  .auth-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    margin-bottom: 1.5rem;

    svg {
      color: white;
    }
  }

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1a202c;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: #718096;
    font-size: 14px;
  }
}

.form-group {
  margin-bottom: 1.25rem;
  position: relative;

  .input-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #a0aec0;
    pointer-events: none;
    transition: color 0.3s;
  }

  input {
    width: 100%;
    padding: 12px 12px 12px 44px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 16px;
    transition: all 0.3s;
    background: white;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);

      +.input-icon {
        color: #667eea;
      }
    }

    &:disabled {
      background: #f7fafc;
      cursor: not-allowed;
    }
  }
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);

    &::before {
      left: 100%;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error {
  color: #e53e3e;
  margin-top: 1rem;
  text-align: center;
  font-size: 14px;
  padding: 8px;
  background: #fff5f5;
  border-radius: 8px;
}

.success {
  color: #38a169;
  margin-top: 1rem;
  text-align: center;
  font-size: 14px;
  padding: 8px;
  background: #f0fff4;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  svg {
    flex-shrink: 0;
  }
}

.auth-footer {
  margin-top: 2rem;
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;

  p {
    color: #718096;
    font-size: 14px;
    margin-bottom: 0.5rem;
  }

  .link {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s;

    &:hover {
      color: #764ba2;
      text-decoration: underline;
    }
  }
}
</style>