<template>
  <div class="purchase-order-detail">
    <!-- Header with action buttons -->
    <div class="header-actions">
      <button class="btn btn-primary">발주서 출력</button>
      <button class="btn btn-secondary">수정</button>
      <button class="btn btn-secondary">취소</button>
      <button class="btn btn-secondary" @click="$emit('close')">닫기</button>
    </div>

    <PurchaseOrderInfoCard :detail="detail" />
    <SupplierInfoCard :supplier="detail.supplier" />
    <PurchaseProductListCard :products="detail.products" />
    <PurchasePaymentInfoCard :detail="detail" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/lib/api'
import PurchaseOrderInfoCard from './PurchaseOrderInfoCard.vue'
import SupplierInfoCard from './SupplierInfoCard.vue'
import PurchaseProductListCard from './PurchaseProductListCard.vue'
import PurchasePaymentInfoCard from './PurchasePaymentInfoCard.vue'

const props = defineProps({ orderId: Number })
const emit = defineEmits(['close'])

const detail = ref({
  products: [],
  supplier: {}
})

function formatNumber(val) {
  if (val == null) return ''
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function formatDateOnly(val) {
  if (!val) return ''
  // ISO 형식일 경우 날짜만 추출
  return val.split('T')[0]
}

onMounted(async () => {
  if (!props.orderId) return
  const res = await api.get(`/api/hq/purchaseorder/${props.orderId}`)
  detail.value = {
    ...res.data,
    statusLabel: getStatusText(res.data.status)
  }
})

function getStatusText(status) {
  const map = {
    DRAFT: '임시저장',
    APPROVED: '승인 완료',
    REJECTED: '반려',
    REQUEST_PENDING: '발주 대기',
    CANCELED: '발주 취소'
  }
  return map[status] || status
}
</script>

<style scoped>
.purchase-order-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  /* background-color: #f8f9fa; */
  font-family: 'Malgun Gothic', sans-serif;
}
.header-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 20px;
}
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary {
  background-color: #4f46e5;
  color: white;
}
.btn-primary:hover {
  background-color: #4338ca;
}
.btn-secondary {
  background-color: #6b7280;
  color: white;
}
.btn-secondary:hover {
  background-color: #4b5563;
}
.section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
}
.section-title {
  background-color: #f9fafb;
  padding: 16px 20px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}
.info-grid {
  padding: 0;
}
.info-row {
  display: grid;
  grid-template-columns: 150px 1fr 150px 1fr;
  border-bottom: 1px solid #e5e7eb;
}
.info-row:last-child {
  border-bottom: none;
}
.label {
  background-color: #f9fafb;
  padding: 12px 16px;
  border-right: 1px solid #e5e7eb;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
  display: flex;
  align-items: center;
}
.value {
  padding: 12px 16px;
  border-right: 1px solid #e5e7eb;
  color: #1f2937;
  font-size: 14px;
  display: flex;
  align-items: center;
  background-color: #f3f4f6;
}
.value:last-child {
  border-right: none;
}
.value.empty {
  background-color: #f9fafb;
  color: #9ca3af;
}
.contract-date {
  color: #3b82f6;
  font-weight: 500;
}
.table-container {
  overflow-x: auto;
}
.order-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.order-table th,
.order-table td {
  padding: 12px 8px;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
}
.order-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}
.order-table td {
  color: #1f2937;
  background-color: #f8f9fa;
}
.order-table th:last-child,
.order-table td:last-child {
  border-right: none;
}
.order-table tbody tr:last-child td {
  border-bottom: none;
}
@media (max-width: 768px) {
  .purchase-order-detail {
    padding: 10px;
  }
  .info-row {
    grid-template-columns: 1fr;
  }
  .label,
  .value {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }
  .header-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
  .table-container {
    font-size: 12px;
  }
  .order-table th,
  .order-table td {
    padding: 8px 4px;
  }
}
</style> 