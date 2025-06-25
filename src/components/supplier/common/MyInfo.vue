<template>
  <!-- 모달 오버레이 -->
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <h2 class="modal-title">내 정보</h2>
        <button class="close-button" @click="closeModal">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- 모달 콘텐츠 -->
      <div class="modal-content">
        <!-- 로딩 상태 -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">정보를 불러오는 중...</p>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="error" class="error-container">
          <AlertCircle class="w-8 h-8 text-red-500" />
          <p class="error-text">{{ error }}</p>
          <button class="retry-button" @click="fetchUserInfo">
            다시 시도
          </button>
        </div>

        <!-- 사용자 정보 표시 -->
        <div v-else-if="userInfo" class="user-info-container">
          <!-- 프로필 섹션 -->
          <div class="profile-section">
            <div class="profile-image-container">
              <img
                v-if="userInfo.profileUrl"
                :src="userInfo.profileUrl"
                :alt="userInfo.name + ' 프로필'"
                class="profile-image"
              />
              <div v-else class="profile-placeholder">
                <User class="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div class="profile-info">
              <h3 class="user-name">{{ userInfo.name }}</h3>
              <p class="user-code">{{ userInfo.code }}</p>
            </div>
          </div>

          <!-- 정보 그리드 -->
          <div class="info-grid">
            <!-- 연락처 정보 -->
            <div class="info-section">
              <h4 class="section-title">연락처 정보</h4>
              <div class="info-item">
                <Phone class="w-4 h-4 text-gray-500" />
                <span class="info-label">전화번호</span>
                <span class="info-value">{{ formatPhoneNumber(userInfo.phone) }}</span>
              </div>
              <div class="info-item">
                <Mail class="w-4 h-4 text-gray-500" />
                <span class="info-label">이메일</span>
                <span class="info-value">{{ userInfo.email }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 모달 푸터 -->
      <div class="modal-footer">
        <button class="close-footer-button" @click="closeModal">
          닫기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { X, User, Phone, Mail, AlertCircle } from 'lucide-vue-next'
import api from '@/lib/api'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const loading = ref(false)
const error = ref('')
const userInfo = ref(null)

// 모달이 열릴 때 사용자 정보 가져오기
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    fetchUserInfo()
  }
})

const fetchUserInfo = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await api.get('/api/supplier/me')
    userInfo.value = response.data
  } catch (err) {
    console.error('사용자 정보 조회 실패:', err)
    error.value = '사용자 정보를 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  emit('close')
}

// 전화번호 포맷팅 함수
const formatPhoneNumber = (phone) => {
  if (!phone) return '-'
  
  // 숫자만 추출
  const numbers = phone.replace(/\D/g, '')
  
  // 010-1234-5678 형태로 포맷팅
  if (numbers.length === 11) {
    return numbers.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  }
  
  return phone
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s;
}

.close-button:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.error-text {
  color: #dc2626;
  font-size: 0.9rem;
  margin: 12px 0 20px 0;
}

.retry-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #2563eb;
}

.user-info-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.profile-image-container {
  flex-shrink: 0;
}

.profile-image {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-info {
  flex: 1;
}

.user-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.user-code {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  font-family: monospace;
}

.info-grid {
  display: grid;
  gap: 20px;
}

.info-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.info-item:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}

.info-label {
  font-size: 0.875rem;
  color: #6b7280;
  min-width: 60px;
  font-weight: 500;
}

.info-value {
  font-size: 0.875rem;
  color: #111827;
  flex: 1;
  font-weight: 500;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  justify-content: flex-end;
}

.close-footer-button {
  background: #6b7280;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.close-footer-button:hover {
  background: #4b5563;
}

/* 반응형 디자인 */
@media (max-width: 640px) {
  .modal-container {
    margin: 10px;
    max-width: none;
  }
  
  .profile-section {
    flex-direction: column;
    text-align: center;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .info-label {
    min-width: auto;
  }
}
</style>