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
    console.error(`변경 실패: ${error.response?.data?.message || '오류 발생'}`)
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="header-section">
        <h1>비밀번호 변경</h1>
        <p class="info-text">
          최초 로그인 혹은 비밀번호 초기화 시 비밀번호 변경은 필수입니다.
        </p>
      </div>
      
      <form @submit.prevent="handleChangePassword" class="password-form">
        <div class="form-group">
          <label for="oldPassword">기존 비밀번호</label>
          <div class="input-wrapper password-input">
            <input
              :type="showOldPassword ? 'text' : 'password'"
              id="oldPassword"
              v-model="oldPassword"
              required
              placeholder="기존 비밀번호를 입력하세요"
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
          <div class="input-wrapper password-input">
            <input
              :type="showNewPassword ? 'text' : 'password'"
              id="newPassword"
              v-model="newPassword"
              required
              placeholder="새 비밀번호를 입력하세요"
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
          <div class="input-wrapper password-input">
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              id="confirmPassword"
              v-model="confirmPassword"
              required
              placeholder="새 비밀번호를 다시 입력하세요"
              :class="{ 'error-input': isPasswordMismatch }"
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
          <div v-if="isPasswordMismatch" class="error-text">
            <span class="error-icon">⚠️</span>
            새 비밀번호가 일치하지 않습니다.
          </div>
        </div>

        <button
          type="submit"
          class="login-button"
          :class="{ disabled: isPasswordMismatch }"
          :disabled="isPasswordMismatch"
        >
          <span>비밀번호 변경</span>
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

.header-section {
  text-align: center;
  margin-bottom: 32px;
}

h1 {
  font-size: 28px;
  color: #4169e1;
  margin-bottom: 12px;
  font-weight: bold;
}

.info-text {
  font-size: 14px;
  color: #6c757d;
  line-height: 1.5;
  margin: 0;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8f9ff, #e8f0ff);
  border-radius: 8px;
  border-left: 4px solid #4169e1;
}

.password-form {
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
  padding: 16px 50px 16px 20px;
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

input.error-input {
  border-color: #dc3545;
  background: rgba(220, 53, 69, 0.05);
}

input.error-input:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
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
  background: #4169e1;
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

.login-button:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(65, 105, 225, 0.4);
}

.login-button:active:not(.disabled) {
  transform: translateY(0);
}

.login-button.disabled {
  background: linear-gradient(135deg, #adb5bd, #ced4da);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(173, 181, 189, 0.3);
}

.error-text {
  color: #dc3545;
  font-size: 13px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(220, 53, 69, 0.1);
  border-radius: 6px;
  border-left: 3px solid #dc3545;
}

.error-icon {
  font-size: 14px;
}
</style>