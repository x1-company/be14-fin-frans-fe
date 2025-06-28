<template>
  <div class="card">
    <div class="card-title">
      <span class="icon">🏢</span>
      공급처 정보
    </div>
    <div class="info-grid">
      <div class="label">공급처 명</div>
      <div class="value">{{ supplier?.name || '-' }}</div>
      <div class="label">대표자명</div>
      <div class="value">{{ supplier?.ceoName || '-' }}</div>
      <div class="label">사업자 번호</div>
      <div class="value">{{ supplier?.businessNumber || '-' }}</div>
      <div class="label">우편번호</div>
      <div class="value">{{ supplier?.zipcode || '-' }}</div>
      <div class="label">공급처 번호</div>
      <div class="value">{{ supplier?.code || '-' }}</div>
      <div class="label">전화번호</div>
      <div class="value">{{ supplier?.companyPhone || '-' }}</div>
      <div class="label">주소</div>
      <div class="value">{{ supplier?.address || '-' }}</div>
      <div class="label">계약일자</div>
      <div class="value contract-date">{{ supplier?.signedAt ? supplier.signedAt.split('T')[0] : '-' }}</div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({ supplier: Object });
</script>
<style scoped>
.card {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.04);
  padding: 25px 24px;
  margin-top: 20px;
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
.contract-date {
  color: #3b82f6;
  font-weight: 500;
}
</style> 