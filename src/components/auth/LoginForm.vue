<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import notificationService from '@/lib/notificationService';

const emit = defineEmits(['account-locked'])

const authStore = useAuthStore()
const router = useRouter()
const userCode = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const BASE_URL = import.meta.env.VITE_API_URL;

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {

  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        userCode: userCode.value,
        password: password.value
      })
    })

    const result = await response.json()

    if (response.ok) {
      const accessToken = response.headers.get('Authorization')
      if (accessToken) {
        authStore.setAccessToken(accessToken.replace('Bearer ', ''))

        // 로그인 성공 후 SSE 연결 및 알림 로드
        try {
          console.log("로그인 성공, SSE 연결 시작...");
          notificationService.connect(); // SSE 연결 (이벤트 기반이므로 await 불필요)
          console.log("SSE 연결 요청 전송 완료.");
          
          // 초기 알림 목록 로드 (Promise 기반이므로 await 사용)
          await notificationService.fetchNotifications();
          console.log("초기 알림 목록 로드 완료.");
        } catch (sseError) {
          console.error("SSE 연결 또는 알림 로드 실패(로그인 계속 진행):", sseError);
        }
      }

      if (result.needChangePassword) {
        router.push('/password-change')
      } else if (result.userType === 'HQ') {
        router.replace('/hq/franchise')
      } else if (result.userType === 'FRANCHISE') {
        router.replace('/franchise')
      } else if (result.userType === 'SUPPLIER') {
        router.replace('/supplier')
      } else if (result.userType === 'ADMIN') {
        router.replace('/hrm')
      } 
      else {
        // 기타 기본 경로
      }

      
    } else {
      errorMessage.value = result.message || '로그인에 실패했습니다.'

      if (result.errorCode === 'ACCOUNT_LOCKED') {
        emit('account-locked', userCode.value)
      }
    }

  } catch (error) {
    errorMessage.value = '서버와의 연결에 문제가 발생했습니다.'
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>환영합니다</h1>
        <p class="subtitle">FRANS 시스템에 로그인하세요</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="userCode">회원코드</label>
          <div class="input-wrapper">
            <input
              type="text"
              id="userCode"
              v-model="userCode"
              required
              placeholder="회원코드를 입력하세요"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="password">비밀번호</label>
          <div class="input-wrapper password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              required
              placeholder="비밀번호를 입력하세요"
            />
            <button 
              type="button" 
              class="toggle-password"
              @click="togglePasswordVisibility"
            >
              <span v-if="showPassword">👁️</span>
              <span v-else>👁️‍🗨️</span>
            </button>
          </div>
        </div>
        
        <div v-if="errorMessage" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ errorMessage }}
        </div>
        
        <button type="submit" class="login-button">
          <span>로그인</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 53px);
  padding: 20px;
  background: #4169e1;
}

.login-box {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 32px;
  color: #4169e1;
  margin-bottom: 8px;
  font-weight: bold;
}

.subtitle {
  color: #6c757d;
  font-size: 16px;
  margin: 0;
}

.login-form {
  width: 100%;
}

.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #4169e1;
  font-weight: 600;
}

.input-wrapper {
  position: relative;
}

input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e3ebff;
  border-radius: 12px;
  font-size: 16px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #4169e1;
  background: white;
  box-shadow: 0 0 0 3px rgba(65, 105, 225, 0.1);
}

input::placeholder {
  color: #adb5bd;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  font-size: 18px;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.toggle-password:hover {
  color: #4169e1;
}

.login-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #4169e1, #5a7ae4);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(65, 105, 225, 0.3);
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(65, 105, 225, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

.error-message {
  background: linear-gradient(135deg, #fff5f5, #fed7d7);
  color: #c53030;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  margin-bottom: 16px;
  border: 1px solid #feb2b2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.error-icon {
  font-size: 16px;
}
</style>