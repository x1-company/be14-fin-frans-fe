<template>
  <div class="delivery-list-container">
    <div class="header">
      <h2 class="title">완료된 납품 목록</h2>
      <div class="date-filter">
        <div class="date-inputs">
          <div class="date-input-group">
            <label for="startDate">시작월:</label>
            <input 
              id="startDate"
              type="month" 
              v-model="startYearMonth" 
              @change="validateDateRange"
              class="date-input"
            />
          </div>
          <div class="date-input-group">
            <label for="endDate">종료월:</label>
            <input 
              id="endDate"
              type="month" 
              v-model="endYearMonth" 
              @change="validateDateRange"
              class="date-input"
            />
          </div>
          <button 
            class="search-btn"
            @click="fetchDeliveryList"
            :disabled="loading"
          >
            조회
          </button>
        </div>
        <div v-if="dateError" class="date-error">
          {{ dateError }}
        </div>
      </div>
    </div>
    
    <div class="table-container">
      <table class="delivery-table">
        <thead>
          <tr>
            <th>No</th>
            <th>발주 번호</th>
            <th>발주 금액</th>
            <th>발주 요청일</th>
            <th>납기 희망일</th>
            <th>납품일</th>
            <th>납품일 등록</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="loading-cell">
              데이터를 불러오는 중...
            </td>
          </tr>
          <tr v-else-if="deliveryList.length === 0">
            <td colspan="7" class="empty-cell">
              완료된 납품 정보가 없습니다.
            </td>
          </tr>
          <tr v-else v-for="(item, index) in deliveryList" :key="item.purchaseOrderId">
            <td>{{ index + 1 }}</td>
            <td>{{ item.purchaseOrderCode }}</td>
            <td>{{ formatCurrency(item.totalAmount) }}</td>
            <td>{{ formatDate(item.processedAt) }}</td>
            <td>{{ formatDate(item.requestedDeliveryDate) }}</td>
            <td>{{ formatDeliveryDate(item) }}</td>
            <td>
              <button 
                class="register-btn"
                @click="openConfirmModal(item.deliveryInfoId)"
                :disabled="isDeliveryDateConfirmed(item)"
              >
                {{ isDeliveryDateConfirmed(item) ? '등록완료' : '등록' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <DeliveryDateConfirmModal
      v-if="showConfirmModal"
      :deliveryInfoId="selectedDeliveryInfoId"
      @close="closeConfirmModal"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import api from '@/lib/api';
import DeliveryDateConfirmModal from './modal/DeliveryDateConfirmModal.vue';

const props = defineProps({
  supplierId: {
    type: Number,
    default: null
  }
});

const deliveryList = ref([]);
const loading = ref(false);
const showConfirmModal = ref(false);
const selectedDeliveryInfoId = ref(null);

const today = new Date();
const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

const startYearMonth = ref(sixMonthsAgo.toISOString().substring(0, 7));
const endYearMonth = ref(today.toISOString().substring(0, 7));
const dateError = ref('');

const fetchDeliveryList = async () => {
  if (validateDateRange() === false) return;

  loading.value = true;
  try {
    const params = {
      startYearMonth: startYearMonth.value.replace('-', ''),
      endYearMonth: endYearMonth.value.replace('-', ''),
      supplierId: props.supplierId
    };

    if (params.supplierId === null) {
      delete params.supplierId;
    }

    const response = await api.get('/api/hq/delivery-info/orders/completed', { params });
    deliveryList.value = response.data;
  } catch (error) {
    console.error('납품 완료 목록 조회 실패:', error);
    alert('데이터를 불러오는 데 실패했습니다.');
    deliveryList.value = [];
  } finally {
    loading.value = false;
  }
};

const validateDateRange = () => {
  const start = new Date(startYearMonth.value);
  const end = new Date(endYearMonth.value);
  
  if (start > end) {
    dateError.value = '시작월은 종료월보다 이전이어야 합니다.';
    return false;
  }
  
  const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (monthsDiff > 5) {
    dateError.value = '조회 기간은 최대 6개월입니다.';
    return false;
  }

  dateError.value = '';
  return true;
};

const openConfirmModal = (deliveryInfoId) => {
  selectedDeliveryInfoId.value = deliveryInfoId;
  showConfirmModal.value = true;
};

const closeConfirmModal = () => {
  showConfirmModal.value = false;
  selectedDeliveryInfoId.value = null;
};

const handleSuccess = () => {
  closeConfirmModal();
  fetchDeliveryList();
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR');
};

const formatDeliveryDate = (item) => {
    if (!item.deliveredYear || !item.deliveredMonth || !item.deliveredDay) return '-';
    return `${item.deliveredYear}-${String(item.deliveredMonth).padStart(2, '0')}-${String(item.deliveredDay).padStart(2, '0')}`;
}

const isDeliveryDateConfirmed = (item) => {
  return !!(item.deliveredYear && item.deliveredMonth && item.deliveredDay);
};

watch(() => props.supplierId, () => {
  fetchDeliveryList();
}, { immediate: true });
</script>

<style scoped>
.delivery-list-container {
  padding: 24px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.title {
  font-size: 1.5rem;
  font-weight: 600;
}
.date-filter {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}
.date-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}
.date-input-group {
  display: flex;
  align-items: center;
  gap: 4px;
}
.date-input {
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}
.search-btn {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.date-error {
  color: red;
  font-size: 12px;
}
.table-container {
  overflow-x: auto;
}
.delivery-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}
.delivery-table th, .delivery-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
}
.delivery-table th {
  background-color: #f8f9fa;
}
.loading-cell, .empty-cell {
  padding: 48px;
  text-align: center;
  color: #6c757d;
}
.register-btn {
  padding: 6px 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.register-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
</style> 