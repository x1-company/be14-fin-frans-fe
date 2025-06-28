<template>
  <div v-if="visible" class="modal-backdrop">
    <div class="modal-content">
      <!-- 날짜 선택 모달 -->
      <div v-if="!isConfirmStep">
        <div class="modal-header">
          <span class="modal-title">
            <span class="icon">📅</span>
            반품 수거일 입력
          </span>
          <button class="close-btn" @click="onCancel">×</button>
        </div>
        <div class="modal-body">
          <div class="delivery-info">
            <div class="info-row">
              <span class="label">배송업체:</span>
              <span class="value">{{ deliveryInfo?.deliveryCompany || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">배송 기사명:</span>
              <span class="value">{{ deliveryInfo?.name || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">기사 연락처:</span>
              <span class="value">{{ deliveryInfo?.phone || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">운송장 번호:</span>
              <span class="value">{{ deliveryInfo?.trackingNumber || '-' }}</span>
            </div>
          </div>
          <div class="input-group">
            <label>반품 수거 완료일</label>
            <Datepicker
              v-model="selectedDate"
              :format="formatDate"
              :preview-format="formatDate"
              locale="ko"
              :enable-time-picker="false"
              auto-apply
              text-input
            />
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn cancel" @click="onCancel">취소</button>
          <button 
            class="btn confirm" 
            @click="showConfirm"
            :disabled="!selectedDate"
          >등록</button>
        </div>
      </div>

      <!-- 확인 모달 -->
      <div v-else>
        <div class="modal-header">
          <span class="modal-title">
            <span class="icon">✓</span>
            정보 확인
          </span>
          <button class="close-btn" @click="onCancel">×</button>
        </div>
        <div class="modal-body">
          <div class="confirm-message">
            아래의 정보가 맞습니까?
          </div>
          <div class="confirm-info">
            <div class="info-row">
              <span class="label">배송업체:</span>
              <span class="value">{{ deliveryInfo?.deliveryCompany || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">배송 기사명:</span>
              <span class="value">{{ deliveryInfo?.name || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">기사 연락처:</span>
              <span class="value">{{ deliveryInfo?.phone || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">운송장 번호:</span>
              <span class="value">{{ deliveryInfo?.trackingNumber || '-' }}</span>
            </div>
            <div class="info-row highlight">
              <span class="label">반품 수거 완료일:</span>
              <span class="value">{{ formatDate(selectedDate) }}</span>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn cancel" @click="isConfirmStep = false">수정</button>
          <button class="btn confirm" @click="onConfirm">완료</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const props = defineProps({ 
  visible: Boolean,
  returnData: Object
});
const emits = defineEmits(['confirm', 'cancel']);

const isConfirmStep = ref(false);
const selectedDate = ref(null);

const deliveryInfo = computed(() => ({
  deliveryCompany: props.returnData?.deliveryCompany || '-',
  name: props.returnData?.driverName || '-',
  phone: props.returnData?.driverPhone || '-',
  trackingNumber: props.returnData?.trackingNumber || '-'
}));

// 디버깅용: returnData 변경 로그
watch(() => props.returnData, (val) => {
  console.log('DeliveryCompleteModal - props.returnData changed:', val);
}, { immediate: true, deep: true });

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function showConfirm() {
  isConfirmStep.value = true;
}

function onConfirm() {
  emits('confirm', {
    ...deliveryInfo.value,
    deliveredAt: formatDate(selectedDate.value)
  });
}

function onCancel() {
  isConfirmStep.value = false;
  selectedDate.value = null;
  emits('cancel');
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  z-index: 1000;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.12);
  padding: 32px;
  min-width: 400px;
  max-width: 90vw;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #888;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 8px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn.cancel {
  background: #f5f5f5;
  color: #333;
}

.btn.confirm {
  background: #1976d2;
  color: #fff;
}

.btn.confirm:disabled {
  background: #e0e0e0;
  cursor: not-allowed;
}

.confirm-message {
  font-size: 16px;
  margin-bottom: 20px;
  color: #1976d2;
  font-weight: 500;
}

.confirm-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.info-row {
  margin: 8px 0;
  display: flex;
  gap: 8px;
}

.info-row .label {
  color: #666;
  font-weight: 500;
  min-width: 100px;
}

.info-row .value {
  color: #333;
  font-weight: 600;
}

.info-row.highlight {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.info-row.highlight .label,
.info-row.highlight .value {
  color: #1976d2;
  font-weight: 600;
}

.input-group input[type='text'] {
  padding-right: 40px;
}
.vue-datepicker__input {
  width: 100%;
  box-sizing: border-box;
  padding-right: 40px !important;
}
.vue-datepicker__calendar-icon {
  right: 12px !important;
}

.delivery-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
}
</style> 