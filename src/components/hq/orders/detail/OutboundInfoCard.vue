<template>
    <div class="card">
      <div class="card-title">
        <span class="icon">🚚</span>
        출고 정보
      </div>
      <div class="info-grid">
        <div class="label">출고 코드</div>
        <div class="value">{{ order.outboundCode || '-' }}</div>
  
        <div class="label">출고 상태</div>
        <div class="value">{{ outboundStatusText }}</div>
  
        <div class="label">출고일</div>
        <div class="value">{{ order.outboundDate || '-' }}</div>
  
        <div class="label">출고 담당자</div>
        <div class="value">{{ order.outboundManager || '-' }}</div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    order: Object
  });
  
  const outboundStatusText = computed(() => {
    if (!props.order.outboundCode) return '출고 전';
    if (props.order.outboundCode && !props.order.outboundDate) return '출고 준비';
    if (props.order.outboundDate) return '완료';
    return '-';
  });
  </script>
  
  <style scoped>
  .card {
    border: 1px solid #e9ecef;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(30, 41, 59, 0.04);
    padding: 32px 24px;
    margin: 20px 0 10px 60px;
    margin-bottom: 24px;
    background: #fff;
  }
  
  .card-title {
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .icon {
    font-size: 18px;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    row-gap: 12px;
    column-gap: 16px;
    align-items: center;
  }
  
  .label {
    color: #6b7280;
    font-size: 14px;
  }
  
  .value {
    font-size: 14px;
    font-weight: 500;
    margin: 0 30px;
    text-align: right;
  }
  </style>
  