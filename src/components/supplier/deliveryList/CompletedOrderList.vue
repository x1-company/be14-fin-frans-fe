<template>
  <div class="delivery-registration-container">
    <div class="header">
      <h2 class="title">납품 정보 등록 필요 목록</h2>
    </div>
    
    <div class="table-container">
      <table class="delivery-table">
        <thead>
          <tr>
            <th>No</th>
            <th>발주 번호</th>
            <th>발주 금액</th>
            <th>납기 희망일</th>
            <th>등록하기</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="loading-cell">
              데이터를 불러오는 중...
            </td>
          </tr>
          <tr v-else-if="deliveryList.length === 0">
            <td colspan="8" class="empty-cell">
              등록할 납품 정보가 없습니다.
            </td>
          </tr>
          <tr v-else v-for="(item, index) in deliveryList" :key="item.purchaseOrderId">
            <td>{{ index + 1 }}</td>
            <td>{{ item.purchaseOrderCode }}</td>
            <td>{{ formatCurrency(item.totalAmount) }}</td>
            <td>{{ formatDate(item.requestedDeliveryDate) }}</td>
            <td>
              <button 
                class="register-btn"
                @click="handleRegister(item)"
              >
                등록하기
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/lib/api'

const emit = defineEmits(['register-delivery'])

const deliveryList = ref([])
const loading = ref(false)

// API 호출 함수
const fetchDeliveryList = async () => {
  loading.value = true
  try {
    const response = await api.get('/api/supplier/delivery-info/orders/requested')
    deliveryList.value = response.data || []
  } catch (error) {
    console.error('납품 목록 조회 실패:', error)
    deliveryList.value = []
  } finally {
    loading.value = false
  }
}

// 금액 포맷팅
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount)
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\./g, '.').replace(/\s/g, '')
}

// 등록하기 버튼 클릭 핸들러
const handleRegister = (item) => {
  emit('register-delivery', item)
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  fetchDeliveryList()
})
</script>

<style scoped>
.delivery-registration-container {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.header {
  margin-bottom: 24px;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.table-container {
  overflow-x: auto;
  border: 1px solid #e9ecef;
  border-radius: 8px;
}

.delivery-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

.delivery-table th {
  background: #f8f9fa;
  padding: 16px 12px;
  text-align: center;
  font-weight: 600;
  color: #495057;
  border-bottom: 1px solid #e9ecef;
  white-space: nowrap;
}

.delivery-table td {
  padding: 16px 12px;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
  color: #212529;
}

.delivery-table tbody tr:hover {
  background: #f8f9fa;
}

.delivery-table tbody tr:last-child td {
  border-bottom: none;
}

.register-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.register-btn:hover {
  background: #0056b3;
}

.register-btn:active {
  transform: translateY(1px);
}

.loading-cell,
.empty-cell {
  padding: 40px 20px;
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .delivery-registration-container {
    padding: 16px;
  }
  
  .delivery-table th,
  .delivery-table td {
    padding: 12px 8px;
    font-size: 0.875rem;
  }
  
  .register-btn {
    padding: 6px 12px;
    font-size: 0.75rem;
  }
}
</style>