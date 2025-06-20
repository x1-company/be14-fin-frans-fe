<template>
  <div v-if="visible" class="modal-backdrop">
    <div class="modal-content">
      <!-- 입력 모달 -->
      <div v-if="!isConfirmStep">
        <div class="modal-header">
          <span class="modal-title">
            <span class="icon">🚚</span>
            배송 정보 입력
          </span>
          <button class="close-btn" @click="onCancel">×</button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label>배송업체</label>
            <input type="text" v-model="form.deliveryCompany" placeholder="예: CJ대한통운">
          </div>
          <div class="input-group">
            <label>배송 기사명</label>
            <input type="text" v-model="form.name" placeholder="배송 기사 성함">
          </div>
          <div class="input-group">
            <label>기사 연락처</label>
            <input type="text" v-model="form.phone" placeholder="예: 010-1234-5678">
          </div>
          <div class="input-group">
            <label>운송장 번호</label>
            <input type="text" v-model="form.trackingNumber" placeholder="운송장 번호 입력">
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn cancel" @click="onCancel">취소</button>
          <button 
            class="btn confirm" 
            @click="showConfirm"
            :disabled="!isFormValid"
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
              <span class="label">배송 업체:</span>
              <span class="value">{{ form.deliveryCompany }}</span>
            </div>
            <div class="info-row">
              <span class="label">배송 기사명:</span>
              <span class="value">{{ form.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">기사 연락처:</span>
              <span class="value">{{ form.phone }}</span>
            </div>
            <div class="info-row">
              <span class="label">운송장 번호:</span>
              <span class="value">{{ form.trackingNumber }}</span>
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
import { ref, computed, watch } from 'vue';

const props = defineProps({ visible: Boolean, initialInfo: Object });
const emits = defineEmits(['confirm', 'cancel']);

const isConfirmStep = ref(false);
const form = ref({
  deliveryCompany: '',
  name: '',
  phone: '',
  trackingNumber: ''
});

watch(
  () => [props.visible, props.initialInfo],
  ([visible, initialInfo]) => {
    if (visible && initialInfo) {
      form.value = { ...initialInfo };
    }
  },
  { immediate: true }
);

const isFormValid = computed(() => {
  return form.value.deliveryCompany && 
         form.value.name && 
         form.value.phone && 
         form.value.trackingNumber;
});

function showConfirm() {
  isConfirmStep.value = true;
}

function onConfirm() {
  emits('confirm', form.value);
}

function onCancel() {
  isConfirmStep.value = false;
  form.value = {
    deliveryCompany: '',
    name: '',
    phone: '',
    trackingNumber: ''
  };
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

.input-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
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
</style> 