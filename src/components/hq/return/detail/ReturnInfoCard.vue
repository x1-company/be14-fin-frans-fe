<template>
  <div class="card return-card">
    <div class="return-title">
      <span class="return-icon">↩️</span>
      반품 정보
    </div>
    <!-- 반품번호 & 총 반품금액 박스 -->
    <div class="info-box-row">
      <div class="info-box blue">
        <span class="label">반품 번호</span>
        <span class="value">{{ returnData.code || '-' }}</span>
      </div>
      <div class="info-box green">
        <span class="label">총 반품 금액</span>
        <span class="value">{{ (returnData.totalAmount ?? 0).toLocaleString() }}원</span>
      </div>
    </div>
    <!-- 날짜, 수량, 상태 -->
    <div class="info-grid">
      <div class="label">반품 날짜</div>
      <div class="value">{{ returnData.createdAt || '-' }}</div>
      <div class="label">총 품목 수량</div>
      <div class="value">{{ returnData.totalQuantity ? `${returnData.totalQuantity.toLocaleString()}개` : '-' }}</div>
      <div class="label">반품 상태</div>
      <div class="value return-status">{{ statusText || '-' }}</div>
    </div>
    <!-- 반려 사유 -->
    <div class="reject-box" v-if="returnData.rejectedReason">
      <div class="reject-title">반려 사유</div>
      <div class="reject-reason">{{ returnData.rejectedReason }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  returnData: Object
});
const statusText = computed(() => {
  switch(props.returnData.status) {
    case 'WAITING_FOR_RECEIPT': return '접수 대기';
    case 'REJECTED': return '반려';
    case 'REVIEW_COMPLETED': return '검토 완료';
    case 'APPROVED': return '결재 완료';
    case 'PICKING_UP': return '반품 수거 중';
    case 'PICKED_UP': return '반품 수거 완료';
    case 'COMPLETED': return '반품 완료';
    default: return props.returnData.status;
  }
});
</script>

<style scoped>
.card.return-card {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.04);
  padding: 32px 24px;
  margin: 20px 0 10px -20px;      /* 위치 변경 */
  margin-bottom: 24px;
  background: #fff;
  max-width: 100%;
  width: 100%;
}

.return-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-box-row {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  max-width: 97%;
}

.info-box {
  flex: 1;
  border-radius: 8px;
  padding: 16px;
  color: #222;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 15px;
}

.info-box .label {
  font-weight: 500;
  color: #3b3b3b;
}

.info-box .value {
  font-weight: 700;
  font-size: 16px;
}

.info-box.blue {
  background-color: #eef5ff;
  color: #1976d2;
}

.info-box.green {
  background-color: #e9f9ee;
  color: #388e3c;
}

.info-grid {
  display: grid;
  grid-template-columns: 150px 1fr 150px 1fr;
  row-gap: 12px;
  column-gap: 16px;
  align-items: center;
  margin-bottom: 24px;
}

.info-grid .label {
  color: #6b7280;
  font-size: 15px;
  font-weight: 500;
}

.info-grid .value {
  font-size: 15px;
  font-weight: 500;
  margin: 0 30px;
  text-align: right;
}

.info-row {
  display: flex;
  gap: 48px;
  font-size: 15px;
  margin-bottom: 24px;
}

.sub-label {
  color: #888;
  font-weight: 500;
  margin-right: 8px;
}

.return-status {
  font-weight: 700;
  color: #1976d2;
}

.reject-box {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  color: #333;
}

.reject-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #666;
}

.reject-reason {
  color: #444;
}
</style>
