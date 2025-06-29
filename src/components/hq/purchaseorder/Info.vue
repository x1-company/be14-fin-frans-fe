<template>
  <div class="purchase-order-content">
    <div v-if="loading" class="loading-container">로딩 중...</div>
    <div v-else-if="error" class="error-container">
      데이터를 불러오는 데 실패했습니다.
    </div>
    <PurchaseOrderDetail
      v-if="selectedOrderId && !editOrderData"
      :orderId="selectedOrderId"
      @close="selectedOrderId = null"
      @edit="handleEdit"
      @refresh-list="handleRefreshList"
      />
    <PurchaseOrderUpdate
      v-else-if="editOrderData"
      :orderData="editOrderData"
      :supplier="editOrderData.supplier"
      @update-complete="handleUpdateComplete"
      @cancel-update="handleCancelUpdate"
    />
    <InfoForm
      v-else
      :orders="filteredOrders"
      :filterTabs="filterTabs"
      :activeFilterTab="activeFilterTab"
      :onFilterTabChange="handleFilterTabChange"
      :page="page"
      :totalCount="totalCount"
      :onPageChange="handlePageChange"
      @show-register-view="showRegisterView"
      @show-detail="handleShowDetail"
      @search="handleSearch"
    />
    </div>
  </template>
  
  <script setup>
import { ref, computed, watch } from 'vue';
  import InfoForm from './InfoForm.vue';
import PurchaseOrderDetail from './PurchaseOrderDetail.vue';
import PurchaseOrderUpdate from './PurchaseOrderUpdate.vue';
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
const editOrderData = ref(null);
const page = ref(1);
const pageSize = 10;
const totalCount = ref(0);

function handleShowDetail(orderId) {
  selectedOrderId.value = orderId;
  editOrderData.value = null;
}

function handleEdit(orderData) {
  editOrderData.value = orderData;
  selectedOrderId.value = null;
}

function handleUpdateComplete() {
  editOrderData.value = null;
  selectedOrderId.value = null;
  fetchOrders(props.supplier.id, page.value); // 수정 후 목록 갱신
}

function handleCancelUpdate() {
  editOrderData.value = null;
  selectedOrderId.value = null;
}

function handleRefreshList() {
  fetchOrders(props.supplier.id, page.value);
}

function handleSearch({ type, keyword }) {
  page.value = 1;
  activeFilterTab.value = 0;
  if (!keyword) {
    fetchOrders(props.supplier.id, 1);
    return;
  }
  loading.value = true;
  error.value = null;
  let url = '';
  let params = { page: 0, size: pageSize };
  if (type === 'title') {
    url = '/api/hq/purchaseorder/title';
    params.title = keyword;
  } else if (type === 'code') {
    url = '/api/hq/purchaseorder/code';
    params.code = keyword;
  }
  api.get(url, { params })
    .then(response => {
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
      totalCount.value = response.data.totalElements || 0;
    })
    .catch(e => {
      error.value = e;
      orders.value = [];
      totalCount.value = 0;
    })
    .finally(() => {
      loading.value = false;
    });
}

async function fetchOrders(supplierId, pageNum = 1) {
  if (!supplierId) {
    orders.value = [];
    totalCount.value = 0;
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    const response = await api.get('/api/hq/purchaseorder', {
      params: { supplierId, page: pageNum - 1, size: pageSize }
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
    totalCount.value = response.data.totalElements || 0;
  } catch (e) {
    console.error(`[API ERROR] Purchase orders fetch failed for supplier ${supplierId}:`, e.response || e);
    error.value = e;
    orders.value = [];
    totalCount.value = 0;
  } finally {
    loading.value = false;
  }
}

async function fetchOrdersByStatus(status, pageNum = 1) {
  loading.value = true;
  error.value = null;
  try {
    const response = await api.get('/api/hq/purchaseorder/status', {
      params: { status, supplierId: props.supplier.id, page: pageNum - 1, size: pageSize }
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
    totalCount.value = response.data.totalElements || 0;
  } catch (e) {
    error.value = e;
    orders.value = [];
    totalCount.value = 0;
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.supplier,
  (newSupplier) => {
    if (newSupplier && newSupplier.id) {
      page.value = 1;
      fetchOrders(newSupplier.id, 1);
    } else {
      orders.value = [];
      totalCount.value = 0;
    }
    activeFilterTab.value = 0;
    selectedOrderId.value = null;
    editOrderData.value = null;
  },
  { immediate: true }
);

const filteredOrders = computed(() => {
  switch (activeFilterTab.value) {
    case 1: // 진행중
      return orders.value;
    case 2: // 완료
      return orders.value;
    case 3: // 취소
      return orders.value;
    case 4: // 반려
      return orders.value;
    default:
      return orders.value;
  }
});

function handleFilterTabChange(index) {
  activeFilterTab.value = index;
  page.value = 1;
  if (index === 1) {
    fetchOrdersByStatus('REQUEST_PENDING', 1);
  } else if (index === 2) {
    fetchOrdersByStatus('APPROVED', 1);
  } else if (index === 3) {
    fetchOrdersByStatus('CANCELED', 1);
  } else if (index === 4) {
    fetchOrdersByStatus('REJECTED', 1);
  } else {
    fetchOrders(props.supplier.id, 1);
  }
}

function handlePageChange(newPage) {
  page.value = newPage;
  if (activeFilterTab.value === 1) {
    fetchOrdersByStatus('REQUEST_PENDING', newPage);
  } else if (activeFilterTab.value === 2) {
    fetchOrdersByStatus('APPROVED', newPage);
  } else if (activeFilterTab.value === 3) {
    fetchOrdersByStatus('CANCELED', newPage);
  } else if (activeFilterTab.value === 4) {
    fetchOrdersByStatus('REJECTED', newPage);
  } else {
    fetchOrders(props.supplier.id, newPage);
  }
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
  