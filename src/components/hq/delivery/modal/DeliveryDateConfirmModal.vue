<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3 class="modal-title">납품일 확정</h3>
      <p class="modal-description">선택하신 날짜로 납품일을 확정하시겠습니까?</p>
      
      <div class="input-group">
        <label for="deliveryDate">납품일 선택:</label>
        <input id="deliveryDate" type="date" v-model="selectedDate" class="form-input" />
      </div>

      <div class="modal-actions">
        <button class="btn-cancel" @click="$emit('close')">취소</button>
        <button class="btn-confirm" @click="confirmDate" :disabled="!selectedDate || submitting">
          {{ submitting ? '처리 중...' : '확인' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '@/lib/api';
import { useToast } from "@/composables/useToast";

const toast = useToast();

const props = defineProps({
  deliveryInfoId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['close', 'success']);

const selectedDate = ref('');
const submitting = ref(false);

const confirmDate = async () => {
  if (!selectedDate.value) {
    toast.warning('납품일을 선택해주세요.');
    return;
  }

  submitting.value = true;
  try {
    const date = new Date(selectedDate.value);
    const requestDTO = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };

    await api.patch(`/api/hq/delivery-infos/${props.deliveryInfoId}`, requestDTO);
    
    toast.success('납품일이 성공적으로 확정되었습니다.');
    emit('success');
  } catch (error) {
    console.error('납품일 확정 실패:', error);
    toast.error('납품일 확정에 실패했습니다. 다시 시도해주세요.');
  } finally {
    submitting.value = false;
    emit('close');
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 400px;
}
.modal-title {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 1.25rem;
  font-weight: 600;
}
.modal-description {
  margin-bottom: 16px;
  color: #6c757d;
}
.input-group {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.input-group label {
  font-weight: 500;
}
.form-input {
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.btn-cancel {
  padding: 8px 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-confirm {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-confirm:disabled {
  background-color: #adb5bd;
  cursor: not-allowed;
}
</style> 