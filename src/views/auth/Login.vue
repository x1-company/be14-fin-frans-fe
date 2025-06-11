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
    const response = await fetch('http://localhost:8080/api/auth/password/reset', {
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
        <p>
          <strong>{{ lockedUserCode }}</strong> 계정은 잠겼습니다.<br />
          비밀번호 초기화를 진행하시겠습니까?
        </p>

        <!-- 로딩 중 -->
        <div v-if="isLoading" class="spinner"></div>

        <!-- 결과 표시 -->
        <div v-if="resetMessage && !isLoading" class="reset-info">
          <p class="email">{{ resetEmail }}</p>
          <p class="message">{{ resetMessage }}</p>
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
            class="confirm-button"
            @click="handleClose"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Arial', sans-serif;
  overflow: hidden
}

.app {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background-color: #fff;
  padding: 24px 28px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.2s ease-in-out;
}

.modal p {
  font-size: 16px;
  color: #333;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  gap: 10px;
}

.modal-actions button {
  flex: 1;
  padding: 10px 0;
  font-size: 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.confirm-button {
  background-color: #4169e1;
  color: white;
}

.confirm-button:hover {
  background-color: #3657c5;
}

.cancel-button {
  background-color: #999;
  color: white;
}

.cancel-button:hover {
  background-color: #7a7a7a;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reset-info {
  margin-top: 16px;
  margin-bottom: 8px;
}

.reset-info .email {
  font-size: 14px;
  color: #4169e1;
  font-weight: bold;
  margin-bottom: 4px;
}

.reset-info .message {
  font-size: 14px;
  color: #333;
}

.spinner {
  margin: 20px auto;
  border: 4px solid #eee;
  border-top: 4px solid #4169e1;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>