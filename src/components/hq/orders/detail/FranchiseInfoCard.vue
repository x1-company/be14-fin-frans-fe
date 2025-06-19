<template>
  <div class="card">
    <div class="card-title">
      <span class="icon">⭐</span>
      가맹점 정보
    </div>
      <div class="info-grid">
        <div class="label">가맹점 명</div>
        <div class="value">{{ order.franchiseName }}</div>
        
        <div class="label">가맹점 코드</div>
        <div class="value">{{ order.franchiseCode }}</div>

        <div class="label">사업자 번호</div>
        <div class="value">{{ order.businessNumber }}</div>

        <div class="label">대표자명</div>
        <div class="value">{{ order.ceoName }}</div>

        <div class="label">계약 날짜</div>
        <div class="value">{{ order.franchiseSignedAt }}</div>

        <div class="label">주소</div>
        <div class="value">{{ order.franchiseAddress }}</div>

        <div class="label">우편번호</div>
        <div class="value">{{ order.zipCode }}</div>

        <div class="label">연락처</div>
        <div class="value">{{ order.franchisePhone }}</div>
    </div>
  </div>
</template>


<script setup>
const props = defineProps({
  order: Object
});
</script>

<style scoped>
.card {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.04);
  padding: 32px 24px;
  margin: 20px 0 0 60px;
  /* margin-bottom: 10px; */
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
  grid-template-columns: 1fr 1fr 1fr 1fr; /* label-value × 2셋 */
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