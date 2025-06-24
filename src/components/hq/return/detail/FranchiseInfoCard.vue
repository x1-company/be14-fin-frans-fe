<template>
    <div class="card">
      <div class="card-title">
        <span class="icon">⭐</span>
        가맹점 정보
      </div>
        <div class="info-grid">
          <div class="label">가맹점 명</div>
          <div class="value">{{ returnData.franchiseName }}</div>
          
          <div class="label">가맹점 코드</div>
          <div class="value">{{ returnData.franchiseCode }}</div>
  
          <div class="label">사업자 번호</div>
          <div class="value">{{ returnData.businessNumber }}</div>
  
          <div class="label">대표자명</div>
          <div class="value">{{ returnData.ceoName }}</div>
  
          <div class="label">계약 날짜</div>
          <div class="value">{{ returnData.franchiseSignedAt }}</div>
  
          <div class="label">주소</div>
          <div class="value">{{ returnData.franchiseAddress }}</div>
  
          <div class="label">우편번호</div>
          <div class="value">{{ returnData.zipCode }}</div>
  
          <div class="label">연락처</div>
          <div class="value">{{ returnData.franchisePhone }}</div>
      </div>
    </div>
  </template>
  
  
  <script setup>
  const props = defineProps({
    returnData: Object
  });
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