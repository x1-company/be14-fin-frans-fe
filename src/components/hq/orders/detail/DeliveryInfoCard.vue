<template>
  <div class="card">
    <div class="card-title">
      <span class="icon">🚚</span>
      배송 정보
    </div>
    <div class="info-grid">
      <div class="label">배송 업체</div>
      <div class="value">{{ order.deliveryCompany }}</div>

      <div class="label">배송 기사명</div>
      <div class="value">{{ order.driverName }}</div>

      <div class="label">기사 연락처</div>
      <div class="value">{{ order.driverPhone }}</div>

      <div class="label">운송장 번호</div>
      <div class="value">{{ order.trackingNumber }}</div>

      <div class="label">배송 일자</div>
      <div class="value">{{ formatDate(order.deliveredAt) }}</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  order: Object
});

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
}
</script>

<style scoped>
.card {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.04);
  padding: 25px 24px;
  margin-top: 20px;
  margin-bottom: 24px;
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
  grid-template-columns: 1fr 1fr 1fr 1fr; /* label-value × 2셋 */
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
</style>
