<template>
  <div class="card product-card">
    <div class="card-title">
      <span class="icon">📦</span>
      자재 정보
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
          <th>비고</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in products" :key="item.id">
          <td>{{ idx + 1 }}</td>
          <td>{{ item.productCode }}</td>
          <td>{{ item.productName }}</td>
          <td>{{ formatNumber(item.purchasePrice) }}</td>
          <td>{{ formatNumber(item.quantity) }}</td>
          <td>{{ item.purchaseUnit }}</td>
          <td>{{ item.standard }}</td>
          <td><span class="badge blue">{{ item.productTypeName }}</span></td>
          <td><span class="badge purple">{{ item.productGroupName }}</span></td>
          <td><span class="badge green">{{ item.productAttributeName }}</span></td>
          <td>{{ item.remarks || '' }}</td>
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
const props = defineProps({ products: Array });
function formatNumber(val) {
  if (val == null) return '';
  return val.toLocaleString();
}
const totalQuantity = computed(() => props.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) ?? 0);
const totalAmount = computed(() => props.products?.reduce((sum, p) => sum + ((p.purchasePrice || 0) * (p.quantity || 0)), 0) ?? 0);
</script>
<style scoped>
.card.product-card {
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
</style> 