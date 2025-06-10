<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/lib/api'

const authStore = useAuthStore()
const router = useRouter()

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const toggleOldPasswordVisibility = () => {
  showOldPassword.value = !showOldPassword.value
}

const toggleNewPasswordVisibility = () => {
  showNewPassword.value = !showNewPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const isPasswordMismatch = computed(() => {
  return newPassword.value && confirmPassword.value && newPassword.value !== confirmPassword.value
})

const handleChangePassword = async () => {
  if (isPasswordMismatch.value) return

  try {
    await api.patch('/api/auth/password', {
      oldPassword: oldPassword.value,
      newPassword: newPassword.value
    })

    alert("비밀번호가 성공적으로 변경되었습니다.")
    authStore.clearAccessToken()
    router.push('/login')
  } catch (error) {
    alert(`변경 실패: ${error.response?.data?.message || '오류 발생'}`)
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h1>비밀번호 변경</h1>
      <p class="info-text">
        최초 로그인 혹은 비밀번호 초기화 시 비밀번호 변경은 필수입니다.
      </p>
      <form @submit.prevent="handleChangePassword">
        <div class="form-group">
          <label for="oldPassword">기존 비밀번호</label>
          <div class="password-input">
            <input
              :type="showOldPassword ? 'text' : 'password'"
              id="oldPassword"
              v-model="oldPassword"
              required
            />
            <button 
              type="button" 
              class="toggle-password"
              @click="toggleOldPasswordVisibility"
            >
              <span v-if="showOldPassword">👁️</span>
              <span v-else>👁️‍🗨️</span>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="newPassword">새 비밀번호</label>
          <div class="password-input">
            <input
              :type="showNewPassword ? 'text' : 'password'"
              id="newPassword"
              v-model="newPassword"
              required
            />
            <button 
              type="button" 
              class="toggle-password"
              @click="toggleNewPasswordVisibility"
            >
              <span v-if="showNewPassword">👁️</span>
              <span v-else>👁️‍🗨️</span>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">새 비밀번호 확인</label>
          <div class="password-input">
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              id="confirmPassword"
              v-model="confirmPassword"
              required
            />
            <button 
              type="button" 
              class="toggle-password"
              @click="toggleConfirmPasswordVisibility"
            >
              <span v-if="showConfirmPassword">👁️</span>
              <span v-else>👁️‍🗨️</span>
            </button>
          </div>
          <p v-if="isPasswordMismatch" class="error-text">
            새 비밀번호가 일치하지 않습니다.
          </p>
        </div>

        <button
          type="submit"
          class="login-button"
          :class="{ disabled: isPasswordMismatch }"
          :disabled="isPasswordMismatch"
        >
          비밀번호 변경
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
  min-height: calc(100vh - 50px);
  padding: 20px;
  background-color: #f5f5f5;
}

.login-box {
  background-color: white;
  border-radius: 5px;
  padding: 30px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
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
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #4169e1;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s ease;
}

.login-button:hover {
  background-color: #3a5ecc;
}
.login-button.disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-text {
  color: red;
  font-size: 12px;
  margin-top: 6px;
}

.info-text {
  font-size: 12px;
  color: #666;
  margin-bottom: 20px;
  text-align: center;
}
</style>
