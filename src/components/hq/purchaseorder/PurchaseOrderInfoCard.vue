<template>
  <div class="card order-card">
    <div class="order-title">
      <span class="order-icon">📝</span>
      발주 정보
    </div>
    <div class="info-box-row">
      <div class="info-box blue">
        <span class="label">발주 번호</span>
        <span class="value">{{ detail.code || '-' }}</span>
      </div>
      <div class="info-box green">
        <span class="label">발주 상태</span>
        <span class="value">{{ detail.statusLabel || '-' }}</span>
      </div>
    </div>
    <div class="info-grid">
      <div class="label">제목</div>
      <div class="value">{{ detail.title || '-' }}</div>
      <div class="label">납기희망일</div>
      <div class="value">{{ detail.requestedDeliveryDate || '-' }}</div>
      <div class="label">담당자</div>
      <div class="value">{{ detail.userName || '-' }}</div>
      <div class="label">담당자 이메일</div>
      <div class="value">{{ detail.userEmail || '-' }}</div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({ detail: Object });
</script>
<style scoped>
.card.order-card {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.04);
  padding: 25px 24px;
  margin-top: 20px;
  background: #fff;
  max-width: 100%;
  width: 100%;
}
.order-title {
  font-size: 15px;
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
  font-size: 13px;
}
.info-box .label {
  font-weight: 500;
  color: #3b3b3b;
}
.info-box .value {
  font-weight: 700;
  font-size: 13px;
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
  margin-left: 5px;
  font-size: 13px;
  font-weight: 500;
}
.info-grid .value {
  font-size: 13px;
  font-weight: 500;
  margin: 0 30px;
  text-align: right;
}
</style> 