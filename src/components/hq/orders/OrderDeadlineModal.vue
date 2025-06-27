<template>
  <div v-if="modelValue" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <img src="@/assets/setting.png" alt="설정" class="modal-icon-img" />
        <span class="modal-title">주문 마감 시간 관리</span>
        <button class="modal-close" @click="$emit('update:modelValue', false)">&times;</button>
      </div>
      <div class="modal-desc">
        가맹점에 일괄 적용되는 주문 마감 시간을 등록합니다.<br />
        설정된 시간에 접수 대기인 주문이 검토중으로 변경됩니다.
      </div>
      <hr class="modal-divider" />
      
      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-section">
        <div class="loading-spinner"></div>
        <span>마감 시간 정보를 불러오는 중...</span>
      </div>
      
      <!-- 에러 상태 -->
      <div v-else-if="error" class="error-section">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ error }}</span>
        <button class="btn btn-retry" @click="fetchCurrentDeadline">다시 시도</button>
      </div>
      
      <!-- 정상 상태 -->
      <template v-else>
        <div class="modal-section">
          <div class="section-label">현재 주문 마감 시간</div>
          <div class="current-deadline-box">
            <img src="@/assets/clock.png" alt="시계" class="clock-img" />
            <span class="current-deadline-text">
              주문 마감 시간 <b>{{ currentDeadline || '--:--' }}</b>
            </span>
            <span v-if="currentDeadline" class="badge">설정됨</span>
            <span v-else class="badge badge-empty">미설정</span>
          </div>
        </div>
        <div class="modal-section">
          <div class="section-label">새로운 마감 시간 설정</div>
          <input
            v-model="newDeadline"
            type="time"
            class="deadline-input"
            placeholder="오후 12:30"
            :disabled="submitting"
          />
        </div>
        <div class="modal-actions">
          <button 
            class="btn btn-primary" 
            :disabled="!newDeadline || submitting" 
            @click="showConfirm = true"
          >
            <span v-if="submitting" class="btn-spinner"></span>
            {{ submitting ? '등록 중...' : '+ 마감 시간 등록' }}
          </button>
        </div>
      </template>
      <!-- 컨펌 모달 -->
      <div v-if="showConfirm" class="confirm-overlay">
        <div class="confirm-modal">
          <div class="confirm-header">
            <img src="@/assets/setting.png" alt="설정" class="confirm-icon" />
            <span class="confirm-title">주문 마감 시간 등록</span>
            <button class="confirm-close" @click="showConfirm = false">&times;</button>
          </div>
          <div class="confirm-body">
            <div class="confirm-message">
              주문 마감 시간을 변경하시겠습니까?<br />
              <span class="confirm-current">현재 등록된 마감 시간 {{ currentDeadline || '--:--' }}</span>
            </div>
          </div>
          <div class="confirm-actions">
            <button class="btn btn-cancel" @click="showConfirm = false" :disabled="submitting">취소</button>
            <button class="btn btn-main" @click="onConfirmRegister" :disabled="submitting">
              <span v-if="submitting" class="btn-spinner"></span>
              마감 시간 등록
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '@/lib/api'
import { useToast } from "@/composables/useToast";

const toast = useToast();

const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits(['update:modelValue', 'register'])

const currentDeadline = ref('')
const newDeadline = ref('')
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const showConfirm = ref(false)

// 현재 마감시간 조회
async function fetchCurrentDeadline() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await api.get('/api/hq/orders/deadline')
    currentDeadline.value = response.data.orderDeadlineAt || ''
  } catch (err) {
    console.error('마감시간 조회 실패:', err)
    error.value = '마감시간 정보를 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

// 실제 등록 함수 (컨펌에서 호출)
async function onConfirmRegister() {
  if (!newDeadline.value) return
  submitting.value = true
  try {
    await api.post(`/api/hq/orders/deadline?time=${newDeadline.value}`)
    currentDeadline.value = newDeadline.value
    newDeadline.value = ''
    emit('register', currentDeadline.value)
    toast.success('마감시간이 성공적으로 등록되었습니다.')
    showConfirm.value = false
  } catch (err) {
    console.error('마감시간 등록 실패:', err)
    toast.error('마감시간 등록에 실패했습니다. 다시 시도해주세요.')
  } finally {
    submitting.value = false
  }
}

watch(() => props.modelValue, (val) => {
  if (val) {
    newDeadline.value = ''
    fetchCurrentDeadline()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 36px 38px 28px 38px;
  min-width: 400px;
  max-width: 95vw;
  box-shadow: 0 8px 32px 0 rgba(0,0,0,0.13);
  animation: modalPop 0.18s cubic-bezier(.4,1.6,.6,1) 1;
  position: relative;
}
@keyframes modalPop {
  0% { transform: scale(0.97); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}
.modal-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.modal-icon-img {
  width: 28px;
  height: 28px;
  margin-right: 2px;
}
.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #222;
}
.modal-close {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 1.6rem;
  color: #888;
  cursor: pointer;
  padding: 0 4px;
}
.modal-desc {
  color: #676970;
  font-size: 0.8rem;
  margin-top: 15px;
  margin-bottom: 18px;
}
.modal-divider {
  border: none;
  border-top: 1.5px solid #e6e8ef;
  margin: 16px 0 18px 0;
}

.loading-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: #6c6f7a;
  font-size: 1.05rem;
}
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e6e8ef;
  border-top: 2px solid #2257e7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #fef2f2;
  border-radius: 8px;
  margin-bottom: 20px;
}
.error-icon {
  font-size: 1.2rem;
  color: #dc2626;
}
.error-text {
  color: #dc2626;
  font-size: 1.05rem;
  flex: 1;
}
.btn-retry {
  background: #dc2626;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
}
.btn-retry:hover {
  background: #b91c1c;
}

.modal-section {
  margin-bottom: 18px;
}
.section-label {
  font-size: 0.88rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #222;
}
.current-deadline-box {
  background: #f4f8fd;
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.clock-img {
  width: 22px;
  height: 22px;
  margin-right: 2px;
}
.current-deadline-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: #222;
}
.badge {
  background: #e3fbe7;
  color: #1a7f37;
  border-radius: 12px;
  padding: 3px 13px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-left: auto;
}
.badge-empty {
  background: #f3f4f6;
  color: #6b7280;
}
.deadline-input {
  width: 160px;
  padding: 8px 12px;
  font-size: 1rem;
  border: 1.5px solid #e0e4ea;
  border-radius: 7px;
  margin-bottom: 8px;
  margin-top: 4px;
}
.deadline-input:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}
.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 28px;
}
.btn {
  padding: 8px 0;
  min-width: 140px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-primary {
  background: #a9c8ff;
  color: #2257e7;
}
.btn-primary:enabled {
  background: #2257e7;
  color: #fff;
}
.btn-primary:disabled {
  background: #e6eaf2;
  color: #b0b6c2;
  cursor: not-allowed;
}
.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.confirm-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}
.confirm-modal {
  background: #fff;
  border-radius: 22px;
  min-width: 380px;
  max-width: 95vw;
  box-shadow: 0 8px 32px 0 rgba(0,0,0,0.13);
  padding: 0 0 28px 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
}
.confirm-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 28px 28px 0 28px;
}
.confirm-icon {
  width: 32px;
  height: 32px;
}
.confirm-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #2563eb;
  margin-left: 6px;
}
.confirm-close {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #888;
  cursor: pointer;
  padding: 0 4px;
}
.confirm-body {
  padding: 24px 28px 0 28px;
}
.confirm-message {
  background: #eaf2ff;
  color: #222;
  border-radius: 16px;
  padding: 28px 0 22px 0;
  text-align: center;
  font-size: 1.08rem;
  font-weight: 500;
  margin-bottom: 0;
}
.confirm-current {
  display: block;
  color: #2563eb;
  font-size: 0.98rem;
  font-weight: 700;
  margin-top: 8px;
}
.confirm-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 32px;
  padding: 0 28px;
}
.btn-cancel {
  background: #f5f6fa;
  color: #222;
  border: none;
  border-radius: 12px;
  font-size: 1.02rem;
  font-weight: 600;
  padding: 12px 0;
  min-width: 110px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-cancel:hover:not(:disabled) {
  background: #e2e4ea;
}
.btn-main {
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1.02rem;
  font-weight: 600;
  padding: 12px 0;
  min-width: 110px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-main:disabled {
  background: #bcd2fa;
  color: #fff;
  cursor: not-allowed;
}
</style>
