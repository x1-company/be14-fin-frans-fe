<template>
  <div class="purchase-order-content">
    <div v-if="loading" class="loading-container">로딩 중...</div>
    <div v-else-if="error" class="error-container">
      데이터를 불러오는 데 실패했습니다.
    </div>
    <PurchaseOrderDetail
      v-if="selectedOrderId"
      :orderId="selectedOrderId"
      @close="selectedOrderId = null"
    />
    <InfoForm
      v-else
      :orders="filteredOrders"
      :filterTabs="filterTabs"
      :activeFilterTab="activeFilterTab"
      :onFilterTabChange="handleFilterTabChange"
      @show-register-view="showRegisterView"
      @show-detail="handleShowDetail"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import InfoForm from './InfoForm.vue';
import PurchaseOrderDetail from './PurchaseOrderDetail.vue';
import api from '@/lib/api';

const props = defineProps({
  supplier: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['show-register-view']);

const orders = ref([]);
const loading = ref(false);
const error = ref(null);
const activeFilterTab = ref(0);
const filterTabs = [
  '전체',
  '진행중인 발주 목록',
  '완료된 발주 목록',
  '취소된 발주 목록',
  '반려된 발주 목록'
];

const selectedOrderId = ref(null);

function handleShowDetail(orderId) {
  selectedOrderId.value = orderId;
}

async function fetchOrders(supplierId) {
  if (!supplierId) {
    orders.value = [];
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    const response = await api.get('/api/hq/purchaseorder', {
      params: { supplierId, page: 0, size: 10 }
    });
    const rawOrders = response.data.content || response.data || [];
    orders.value = rawOrders.map(dto => ({
      id: dto.id,
      orderNumber: dto.code,
      title: dto.title,
      amount: dto.totalAmount,
      status: dto.status,
      requestDate: dto.createdAt ? dto.createdAt.split('T')[0] : '-',
      deliveryDate: dto.requestedDeliveryDate || '-',
    }));
  } catch (e) {
    console.error(`[API ERROR] Purchase orders fetch failed for supplier ${supplierId}:`, e.response || e);
    error.value = e;
    orders.value = [];
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.supplier,
  (newSupplier) => {
    if (newSupplier && newSupplier.id) {
      fetchOrders(newSupplier.id);
    } else {
      orders.value = [];
    }
    activeFilterTab.value = 0;
    selectedOrderId.value = null;
  },
  { immediate: true }
);

const filteredOrders = computed(() => {
  // 백엔드 PurchaseOrderStatus Enum 이름과 일치해야 합니다.
  const statusMap = {
    inProgress: ['REQUEST_PENDING'], 
    completed: ['APPROVED'], // '완료된 발주'는 APPROVED
    canceled: ['CANCELED'],
    rejected: ['REJECTED']
  };

  switch (activeFilterTab.value) {
    case 1: // 진행중
      return orders.value.filter(o => statusMap.inProgress.includes(o.status));
    case 2: // 완료
      return orders.value.filter(o => statusMap.completed.includes(o.status));
    case 3: // 취소
      return orders.value.filter(o => statusMap.canceled.includes(o.status));
    case 4: // 반려
      return orders.value.filter(o => statusMap.rejected.includes(o.status));
    default: // 전체
      return orders.value;
  }
});

function handleFilterTabChange(index) {
  activeFilterTab.value = index;
}

const showRegisterView = () => {
  emit('show-register-view');
};
</script>

<style scoped>
.purchase-order-content {
  width: 100%;
  background: #fff;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.03);
  padding: 32px;
}
.loading-container,
.error-container {
  padding: 40px;
  text-align: center;
  color: #888;
}
</style>
  