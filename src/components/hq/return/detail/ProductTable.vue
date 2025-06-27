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
        <tr v-for="(p, idx) in filteredProducts" :key="p?.returnDetailId || p?.id || idx">
          <td>{{ idx + 1 }}</td>
          <td class="link">{{ p?.productCode || '-' }}</td>
          <td>{{ p?.productName || '-' }}</td>
          <td>{{ formatPrice(p?.salePrice || p?.price) }}</td>
          <td>{{ p?.returnQuantity || p?.quantity || '-' }}</td>
          <td>{{ p?.purchaseUnit || p?.unit || '-' }}</td>
          <td>{{ p?.spec || '-' }}</td>
          <td><span class="badge blue">{{ getTypeName(p?.productTypeId) }}</span></td>
          <td><span class="badge purple">{{ getGroupName(p?.productGroupId) }}</span></td>
          <td><span class="badge green">{{ getAttributeName(p?.productAttributeId) }}</span></td>
          <td>{{ getReturnType(p?.returnType) }}</td>
          <td>
            <template v-if="isEditable">
              <select v-model="p.status" class="select status-select">
                <option disabled value="">선택</option>
                <option value="APPROVED">승인</option>
                <option value="REJECTED">반려</option>
              </select>
            </template>
            <template v-else>
              <span v-if="p?.returnStatus === 'APPROVED' || p?.status === 'APPROVED'" class="status-badge approved">승인</span>
              <span v-else-if="p?.returnStatus === 'REJECTED' || p?.status === 'REJECTED'" class="status-badge rejected">반려</span>
              <span v-else class="status-badge">-</span>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="summary-box">
      <div>총 수량: <strong>{{ totalQuantity }}개</strong></div>
      <div class="total-amount">{{ formatPrice(totalAmount) }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  products: { type: Array, default: () => [] },
  totalAmount: { type: [Number, String], default: 0 },
  isEditable: { type: Boolean, default: false }
})

const filteredProducts = computed(() => {
  if (!Array.isArray(props.products)) return []
  return props.products.filter(p => p && typeof p === 'object')
})

const totalQuantity = computed(() =>
  filteredProducts.value.reduce((sum, p) => {
    const quantity = p?.returnQuantity || p?.quantity || 0
    return sum + (Number(quantity) || 0)
  }, 0)
)

const formatPrice = (value) => {
  if (value == null || value === '' || value === undefined) return '-'
  const num = Number(value)
  return (isNaN(num) || !isFinite(num)) ? '-' : `${num.toLocaleString()}원`
}

const getTypeName = (id) => {
  switch (Number(id)) {
    case 1: return '원재료'
    case 2: return '소모품'
    case 3: return '상품'
    default: return '-'
  }
}
const getGroupName = (id) => {
  switch (Number(id)) {
    case 1: return '상온'
    case 2: return '냉장'
    case 3: return '냉동'
    default: return '-'
  }
}
const getAttributeName = (id) => {
  switch (Number(id)) {
    case 1: return '비신선식품'
    case 2: return '신선식품'
    case 3: return '비식품'
    default: return '-'
  }
}
const getReturnType = (type) => {
  switch (type) {
    case 'BAD_QUALITY': return '품질 불량'
    case 'OVER_QUANTITY': return '수량 이상'
    case 'DAMAGED': return '파손'
    case 'ETC': return '기타'
    default: return '-'
  }
}
const getReturnStatusText = (status) => {
  switch (status) {
    case 'APPROVED': return '승인'
    case 'REJECTED': return '반려'
    default: return '-'
  }
}
</script>

<style scoped>
.product-card {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.04);
  padding: 25px 24px;
  margin-top: 20px;
  background: #fff;
  width: 100%;
}

.card-title {
  font-size: 15px;
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
  font-size: 13px;
}

.product-table th,
.product-table td {
  padding: 7px 6px;
  text-align: center;
  color: #333;
}

.product-table th {
  background: #f9fafb;
  font-weight: 600;
  border-bottom: 1px solid #e0e0e0;
}

.product-table td {
  border-bottom: 1px solid #f1f1f1;
}

.link {
  color: #1d4ed8;
  font-weight: 500;
  cursor: pointer;
}

.badge {
  padding: 4px 10px;
  font-size: 12px;
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
  font-size: 13px;
  font-weight: 500;
}

.total-amount {
  color: #15803d;
  font-size: 14px;
  font-weight: 700;
  margin-right: 20px;
}

.select.status-select {
  min-width: 80px;
  height: 30px;
  padding: 0 16px;
  border: 1.5px solid #ececec;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  font-weight: 400;
  color: #0c0c0cde;
  appearance: none;
  box-shadow: none;
  display: block;
  margin: 0 auto;
  transition: border 0.2s;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23666' stroke-width='2'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 12px;
}
.select.status-select:focus,
.select.status-select:hover {
  border-color: #1976d2;
  outline: none;
}
.select.status-select option {
  font-weight: 600;
  color: #222;
}

.status-badge {
  display: inline-block;
  min-width: 44px;
  padding: 4px 16px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}
.status-badge.approved {
  background: #e6f9ed;
  color: #16a34a;
  font-weight: 700;
  margin-right: 20px;
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 12px;
}
.status-badge.rejected {
  background: #ffeaea;
  color: #d32f2f;
  font-weight: 700;
  margin-right: 20px;
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 12px;
}
</style>