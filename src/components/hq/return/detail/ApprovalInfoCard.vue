<template>
    <div class="card">
      <div class="card-title">
        <span class="icon">📄</span>
        결재 정보
      </div>
      <div class="info-grid">
        <div class="label">결재 코드</div>
        <div class="value">{{ returnData.approvalCode || '-' }}</div>
  
        <div class="label">결재 요청자</div>
        <div class="value">{{ returnData.approvalRequester || '-' }}</div>
  
        <div class="label">기안 일시</div>
        <div class="value">{{ returnData.approvalRequestedAt || '-' }}</div>
  
        <div class="label">결재 상태</div>
        <div class="value">{{ approvalStatusText || '-'}}</div>
  
        <div class="label">결재 완료 일시</div>
        <div class="value">{{ returnData.approvalCompletedAt || '-' }}</div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    returnData: Object
  });
  
  const approvalStatusText = computed(() => {
    switch (props.returnData.approvalStatus) {
      case 'PENDING':
        return '승인 대기';
      case 'APPROVED':
        return '승인 완료';
      case 'REJECTED':
        return '반려됨';
      default:
        return '결재 전';
    }
  });
  
  const statusClass = computed(() => {
    switch (props.returnData.approvalStatus) {
      case 'PENDING':
        return 'pending';
      case 'APPROVED':
        return 'approved';
      case 'REJECTED':
        return 'rejected';
      default:
        return '결재 전';
    }
  });
  </script>
  
  <style scoped>
.card {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.04);
  padding: 25px 24px;
  margin-bottom: 20px;
  background: #fff;
  max-width: 100%;
  width: 100%;
}

.card-title {
  font-weight: bold;
  font-size: 15px;
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
  font-size: 13px;
}

.value {
  font-size: 13px;
  font-weight: 500;
  margin: 0 30px;
  text-align: right;
}

.pending {
  background-color: #fef3c7;
  color: #b45309;
}

.approved {
  background-color: #d1fae5;
  color: #047857;
}

.rejected {
  background-color: #fee2e2;
  color: #b91c1c;
}
  </style>
  