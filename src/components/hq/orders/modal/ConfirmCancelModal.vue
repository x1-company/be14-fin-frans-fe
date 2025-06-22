<template>
    <div v-if="visible" class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title error">
            <span class="icon">🔄</span>
            검토 취소
          </span>
          <button class="close-btn" @click="onCancel">×</button>
        </div>
        <div class="modal-body">
          <div class="modal-message error">
            검토를 취소하시겠습니까?<br />
            <span class="sub">결재 요청 전에는 문서에 대한 검토여부를 변경할 수 있습니다.</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn cancel" @click="onCancel">취소</button>
          <button class="btn reject" @click="onConfirm">검토 취소</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({ visible: Boolean });
  const emits = defineEmits(['confirm', 'cancel']);
  function onConfirm() { emits('confirm'); }
  function onCancel() { emits('cancel'); }
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
  .modal-title.error {
    font-size: 20px;
    font-weight: 700;
    color: #d32f2f;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .icon {
    font-size: 22px;
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
  .modal-message.error {
    background: #ffeaea;
    border-radius: 8px;
    padding: 14px 12px;
    color: #d32f2f;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 12px;
  }
  .modal-message .sub {
    color: #d32f2f;
    font-size: 14px;
    font-weight: 400;
  }
  .modal-label {
    font-weight: 600;
    margin-bottom: 6px;
    color: #d32f2f;
  }
  textarea {
    width: 100%;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 10px;
    font-size: 15px;
    resize: none;
    margin-bottom: 8px;
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
  .btn.reject {
    background: #d32f2f;
    color: #fff;
  }
  .btn.reject:disabled {
    background: #ffd6d6;
    color: #fff;
    cursor: not-allowed;
  }
  </style>