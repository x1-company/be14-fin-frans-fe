<template>
  <div v-if="modelValue" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <span class="modal-icon">⚙️</span>
        <span class="modal-title">주문 마감 시간 관리</span>
        <button class="modal-close" @click="$emit('update:modelValue', false)">&times;</button>
      </div>
      <div class="modal-desc">
        가맹점에 일괄 적용되는 주문 마감 시간을 등록합니다.<br />
        설정된 시간 이후에는 주문 접수가 제한됩니다.
      </div>
      <hr class="modal-divider" />
      <div class="modal-section">
        <div class="section-label">현재 주문 마감 시간</div>
        <div class="current-deadline-box">
          <span class="icon clock">🕒</span>
          <span class="current-deadline-text">
            주문 마감 시간 <b>{{ currentDeadline || '--:--' }}</b>
          </span>
          <span class="badge">설정됨</span>
        </div>
      </div>
      <div class="modal-section">
        <div class="section-label">새로운 마감 시간 설정</div>
        <input
          v-model="newDeadline"
          type="time"
          class="deadline-input"
          placeholder="오후 12:30"
        />
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary" :disabled="!newDeadline" @click="registerDeadline">
          + 마감 시간 등록
        </button>
        <button class="btn btn-secondary" @click="$emit('delete')">삭제</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  modelValue: Boolean,
  currentDeadline: String
})
const emit = defineEmits(['update:modelValue', 'register', 'delete'])
const newDeadline = ref('')

watch(() => props.modelValue, (val) => {
  if (val) newDeadline.value = ''
})

function registerDeadline() {
  emit('register', newDeadline.value)
}
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
.modal-icon {
  font-size: 1.6rem;
  color: #2257e7;
}
.modal-title {
  font-size: 1.25rem;
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
  color: #6c6f7a;
  font-size: 1.05rem;
  margin-bottom: 18px;
}
.modal-divider {
  border: none;
  border-top: 1.5px solid #e6e8ef;
  margin: 16px 0 18px 0;
}
.modal-section {
  margin-bottom: 18px;
}
.section-label {
  font-size: 1.05rem;
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
.icon.clock {
  color: #2257e7;
  font-size: 1.3rem;
}
.current-deadline-text {
  font-size: 1.13rem;
  font-weight: 600;
  color: #222;
}
.badge {
  background: #e3fbe7;
  color: #1a7f37;
  border-radius: 12px;
  padding: 5px 16px;
  font-size: 0.98rem;
  font-weight: 600;
  margin-left: auto;
}
.deadline-input {
  width: 180px;
  padding: 10px 14px;
  font-size: 1.08rem;
  border: 1.5px solid #e0e4ea;
  border-radius: 7px;
  margin-bottom: 8px;
  margin-top: 4px;
}
.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 28px;
}
.btn {
  padding: 12px 0;
  min-width: 180px;
  border: none;
  border-radius: 8px;
  font-size: 1.08rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
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
.btn-secondary {
  background: #f8fafd;
  color: #333;
  min-width: 80px;
}
.btn-secondary:hover {
  background: #e2e4ea;
}
</style> 