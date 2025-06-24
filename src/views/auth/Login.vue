<script setup>
import { ref } from 'vue'
import TopBar from '@/components/auth/TopBar.vue'
import LoginForm from '@/components/auth/LoginForm.vue'

const showModal = ref(false)
const lockedUserCode = ref('')
const resetMessage = ref('')
const resetEmail = ref('')
const isLoading = ref(false)

const handleAccountLocked = (code) => {
  lockedUserCode.value = code
  resetMessage.value = ''
  resetEmail.value = ''
  isLoading.value = false
  showModal.value = true
}

const handleConfirmReset = async () => {
  isLoading.value = true
  try {
    const response = await fetch(`${BASE_URL}/api/auth/password/reset`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userCode: lockedUserCode.value
      }),
    })

    const result = await response.json()

    if (response.ok) {
      resetEmail.value = result.maskedEmail
      resetMessage.value = result.message
    } else {
      alert("비밀번호 초기화에 실패했습니다. 관리자에게 문의 바랍니다.")
      showModal.value = false
    }
  } catch (error) {
    alert("비밀번호 초기화 중 오류가 발생했습니다.")
    showModal.value = false
  } finally {
    isLoading.value = false
  }
}

const handleClose = () => {
  showModal.value = false
}
</script>

<template>
  <div class="app">
    <TopBar />
    <LoginForm @account-locked="handleAccountLocked" />

    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>계정 잠금 알림</h3>
        </div>
        <div class="modal-content">
          <p>
            <strong class="user-code">{{ lockedUserCode }}</strong> 계정이 잠겼습니다.<br />
            비밀번호 초기화를 진행하시겠습니까?
          </p>

          <!-- 로딩 중 -->
          <div v-if="isLoading" class="spinner"></div>

          <!-- 결과 표시 -->
          <div v-if="resetMessage && !isLoading" class="reset-info">
            <div class="success-icon">✓</div>
            <p class="email">{{ resetEmail }}</p>
            <p class="message">{{ resetMessage }}</p>
          </div>
        </div>

        <!-- 버튼 영역 -->
        <div class="modal-actions">
          <button
            v-if="!isLoading && !resetMessage"
            class="confirm-button"
            @click="handleConfirmReset"
          >
            확인
          </button>
          <button
            v-if="!isLoading && !resetMessage"
            class="cancel-button"
            @click="handleClose"
          >
            취소
          </button>
          <button
            v-if="!isLoading && resetMessage"
            class="confirm-button full-width"
            @click="handleClose"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Arial', sans-serif;
  overflow: hidden
}

.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #4169e1 0%, #5a7ae4 100%);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(65, 105, 225, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px);
}

.modal {
  background-color: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 20px 40px rgba(65, 105, 225, 0.3);
  animation: fadeIn 0.3s ease-out;
  overflow: hidden;
}

.modal-header {
  background: linear-gradient(135deg, #4169e1, #5a7ae4);
  color: white;
  padding: 20px 24px;
  text-align: center;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.modal-content {
  padding: 24px;
  text-align: center;
}

.modal-content p {
  font-size: 16px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 8px;
}

.user-code {
  color: #4169e1;
  font-weight: bold;
}

.modal-actions {
  display: flex;
  padding: 0 24px 24px;
  gap: 12px;
}

.modal-actions button {
  flex: 1;
  padding: 12px 0;
  font-size: 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.confirm-button {
  background: linear-gradient(135deg, #4169e1, #5a7ae4);
  color: white;
  box-shadow: 0 4px 12px rgba(65, 105, 225, 0.3);
}

.confirm-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(65, 105, 225, 0.4);
}

.confirm-button.full-width {
  flex: none;
  width: 100%;
}

.cancel-button {
  background-color: #f8f9fa;
  color: #6c757d;
  border: 2px solid #e9ecef;
}

.cancel-button:hover {
  background-color: #e9ecef;
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.reset-info {
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9ff, #e8f0ff);
  border-radius: 12px;
  border: 2px solid #e3ebff;
}

.success-icon {
  font-size: 32px;
  color: #4169e1;
  margin-bottom: 12px;
  font-weight: bold;
}

.reset-info .email {
  font-size: 16px;
  color: #4169e1;
  font-weight: bold;
  margin-bottom: 8px;
}

.reset-info .message {
  font-size: 14px;
  color: #495057;
  line-height: 1.5;
}

.spinner {
  margin: 24px auto;
  border: 4px solid #e3ebff;
  border-top: 4px solid #4169e1;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>