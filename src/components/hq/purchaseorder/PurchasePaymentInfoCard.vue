<template>
  <div class="card">
    <div class="card-title">
      <span class="icon">📄</span>
      결재 정보
    </div>
    <div class="info-grid">
      <div class="label">결재 코드</div>
      <div class="value">{{ detail.paymentCode || '-' }}</div>
      <div class="label">결재 요청자</div>
      <div class="value">{{ detail.paymentRequester || '-' }}</div>
      <div class="label">기안 일시</div>
      <div class="value">{{ detail.draftDate || '-' }}</div>
      <div class="label">결재 상태</div>
      <div class="value">{{ detail.paymentStatus || '-' }}</div>
      <div class="label">결재 완료 일시</div>
      <div class="value">{{ detail.completionDate || '-' }}</div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({ detail: Object });
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
</style> 