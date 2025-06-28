<template>
  <div v-if="visible" class="modal-backdrop">
    <div class="modal-content">
      <div class="modal-header">
        <span class="modal-title">
          <span class="icon">✔️</span>
          <span class="success">반품 수거 완료</span>
        </span>
        <button class="close-btn" @click="$emit('cancel')">×</button>
      </div>
      <div class="modal-body">
        <div class="modal-message">반품 수거 완료하시겠습니까?</div>
      </div>
      <div class="modal-actions">
        <button class="btn cancel" @click="$emit('cancel')">취소</button>
        <button class="btn confirm" @click="$emit('confirm')">수거 완료</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  visible: Boolean
});
const emits = defineEmits(['confirm', 'cancel']);
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
  padding: 32px 32px 24px 32px;
  min-width: 400px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #388e3c;
  display: flex;
  align-items: center;
  gap: 8px;
}
.icon {
  font-size: 22px;
}
.success {
  color: #388e3c;
}
.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #888;
}
.modal-body {
  margin: 12px 0;
}
.modal-message {
  background: #e9f9ee;
  border-radius: 8px;
  padding: 18px 12px;
  color: #388e3c;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}
.btn {
  padding: 8px 22px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
.btn.cancel {
  background: #f5f5f5;
  color: #333;
}
.btn.confirm {
  background: #388e3c;
  color: #fff;
}
.btn.confirm:hover {
  background: #2e7030;
}
</style>
