<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['account-locked'])

const authStore = useAuthStore()
const router = useRouter()
const userCode = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {

  try {
    const response = await fetch('http://localhost:8080/login', {
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
      }

      if (result.needChangePassword) {
        router.push('/password-change')
      } else {
        // 메인 페이지로 이동
        if (result.userType === 'HQ') {
          if (authStore.departmentName && authStore.departmentName.includes('영업')) {
            // 가맹점 메인 페이지로
            // TODO: 실제 경로로 변경 필요
          } else if (authStore.departmentName && authStore.departmentName.includes('물류')) {
            // 창고 관리 페이지로
            // TODO: 실제 경로로 변경 필요
          } else if (authStore.departmentName && authStore.departmentName.includes('인사')) {
            // 인사 관리 페이지로
            router.push('/hrm')
          } else {
            // 기본 페이지로 이동
            // TODO: 기본 경로로 변경 필요
          }
        } else if (result.userType === 'FRANCHISE') {
          // 가맹점주 메인 페이지로
          router.push('/franchise')
        } else if (result.userType === 'SUPPLIER') {
          // 공급처 메인 페이지로
          router.push('/supplier')
        } else {
          // 기본 페이지
          // TODO: 기본 경로로 변경 필요
        }
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
      <h1>환영합니다</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="userCode">회원코드</label>
          <input
            type="text"
            id="userCode"
            v-model="userCode"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">비밀번호</label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              required
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
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <button type="submit" class="login-button">로그인</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 50px);
  padding: 20px;
  background-color: #f5f5f5;
}

.login-box {
  background-color: white;
  border-radius: 5px;
  padding: 50px 30px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 40px;
  font-size: 28px;
  color: #333;
}

.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 18px;
  box-sizing: border-box;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #777;
  font-size: 18px;
}

.login-button {
  width: 100%;
  padding: 14px;
  background-color: #4169e1;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  margin-top: 10px;
}

.login-button:hover {
  background-color: #3a5ecc;
}

.error-message {
  color: red;
  margin-bottom: 10px;
  font-size: 14px;
  text-align: center;
}
</style>