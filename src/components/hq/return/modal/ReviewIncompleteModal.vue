<template>
    <div v-if="visible" class="modal-overlay">
      <div class="modal-card">
        <button class="modal-close" @click="$emit('close')" aria-label="닫기">×</button>
        <div class="modal-title">
          <span class="modal-info-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="14" fill="#eaf3ff"/>
              <text x="14" y="20" text-anchor="middle" font-size="18" font-weight="bold" fill="#1976d2" font-family="Segoe UI, Arial, sans-serif">!</text>
            </svg>
          </span>
          <span>검토 미완료</span>
        </div>
        <div class="modal-message-box">
          <div class="modal-message-main">모든 자재의 반품 상태를 지정해주세요.</div>
          <div class="modal-message-sub">각 자재별로 승인 또는 반려를 선택하신 후 다시 시도해주세요.</div>
        </div>
        <div class="modal-btn-bar">
          <button class="modal-confirm-btn" @click="$emit('close')">확인</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    visible: Boolean
  });


  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.15);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 6px 28px rgba(30,41,59,0.14);
    padding: 38px 36px 28px 36px;
    min-width: 410px;
    max-width: 95vw;
    text-align: left;
    position: relative;
    box-sizing: border-box;
  }
  .modal-close {
    position: absolute;
    top: 15px;
    right: 18px;
    background: none;
    border: none;
    font-size: 28px;
    color: #9eb7cf;
    cursor: pointer;
    z-index: 2;
    transition: color 0.16s;
  }
  .modal-title {
    font-size: 22px;
    font-weight: 800;
    color: #2176d2;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 22px;
    letter-spacing: -0.5px;
  }
  .modal-info-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 2px;
  }
  .modal-message-box {
    background: #eaf3ff;
    border: 1.5px solid #c3e0ff;
    border-radius: 10px;
    padding: 19px 18px 15px 18px;
    margin-bottom: 30px;
  }
  .modal-message-main {
    font-size: 17px;
    font-weight: 700;
    color: #1c3354;
    margin-bottom: 7px;
    letter-spacing: -0.5px;
  }
  .modal-message-sub {
    font-size: 15px;
    color: #5287bc;
    letter-spacing: -0.5px;
  }
  .modal-btn-bar {
    display: flex;
    justify-content: flex-end;
  }
  .modal-confirm-btn {
    padding: 10px 32px;
    min-width: 90px;
    max-width: 110px;
    border-radius: 7px;
    border: none;
    background: #1976d2;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.13s;
    box-shadow: 0 1px 4px rgba(25, 118, 210, 0.11);
  }
  .modal-confirm-btn:hover { background: #135ab7; }
  </style>
  