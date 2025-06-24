<template>
  <div class="card product-card">
    <div class="card-title">
      <span class="icon">📦</span>
      반품 품목 정보
    </div>
    <table class="product-table">
      <thead>
        <tr>
          <th>No.</th>
          <th>자재 번호</th>
          <th>자재명</th>
          <th>구매 단가</th>
          <th>수량</th>
          <th>단위</th>
          <th>규격</th>
          <th>자재 분류</th>
          <th>자재 구분</th>
          <th>자재 속성</th>
          <th>반품 타입</th>
          <th>반품 상태</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(p, idx) in returnProducts" :key="p.returnDetailId">
          <td>{{ idx + 1 }}</td>
          <td class="link">{{ p.productCode }}</td>
          <td>{{ p.productName }}</td>
          <td>{{ p.salePrice.toLocaleString() }}원</td>
          <td>{{ p.returnQuantity }}</td>
          <td>{{ p.purchaseUnit }}</td>
          <td>{{ p.spec }}</td>
          <td><span class="badge blue">{{ getTypeName(p.productTypeId) }}</span></td>
          <td><span class="badge purple">{{ getGroupName(p.productGroupId) }}</span></td>
          <td><span class="badge green">{{ getAttributeName(p.productAttributeId) }}</span></td>
          <td>{{ getReturnType(p.returnType) }}</td>
          <td>
            <select v-model="p.returnStatus" class="select">
              <option disabled value="">선택</option>
              <option value="APPROVED">승인</option>
              <option value="REJECTED">반려</option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="summary-box">
      <div>총 수량: <strong>{{ totalQuantity }}개</strong></div>
      <div class="total-amount">{{ totalAmount.toLocaleString() }}원</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  returnProducts: Array,
  totalAmount: Number
});

const totalQuantity = computed(() =>
  props.returnProducts?.reduce((sum, p) => sum + p.returnQuantity, 0) ?? 0
);

// 자재 분류
const getTypeName = (id) => {
  switch (id) {
    case 1: return '원재료';
    case 2: return '소모품';
    case 3: return '상품';
    default: return '-';
  }
};

// 자재 구분
const getGroupName = (id) => {
  switch (id) {
    case 1: return '상온';
    case 2: return '냉장';
    case 3: return '냉동';
    default: return '-';
  }
};

// 자재 속성
const getAttributeName = (id) => {
  switch (id) {
    case 1: return '비신선식품';
    case 2: return '신선식품';
    case 3: return '비식품';
    default: return '-';
  }
};

// 반품 타입
const getReturnType = (type) => {
  switch (type) {
    case 'BAD_QUALITY': return '품질 불량';
    case 'OVER_QUANTITY': return '수량 이상';
    case 'DAMAGED': return '파손';
    case 'ETC': return '기타';
    default: return '-';
  }
};
</script>

<style scoped>
.select {
  padding: 6px 10px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: #fff;
}

.product-card {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.04);
  padding: 32px 24px;
  margin: 20px 0 10px -20px;
  margin-bottom: 24px;
  background: #fff;
  max-width: 100%;
  width: 100%;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
  font-size: 15px;
}

.product-table th {
  background: #f9fafb;
  font-weight: 600;
  padding: 10px;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
}

.product-table td {
  padding: 10px;
  border-bottom: 1px solid #f1f1f1;
  text-align: center;
  color: #333;
}

.link {
  color: #1d4ed8;
  font-weight: 500;
  cursor: pointer;
}

.badge {
  padding: 4px 10px;
  font-size: 14px;
  border-radius: 12px;
  font-weight: 700;
}

.badge.blue {
  background: #e0f0ff;
  color: #2563eb;
}

.badge.purple {
  background: #f3e8ff;
  color: #9333ea;
}

.badge.green {
  background: #e6f9ed;
  color: #16a34a;
}

.summary-box {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
}

.total-amount {
  color: #15803d;
  font-size: 18px;
  font-weight: 700;
}
</style>
