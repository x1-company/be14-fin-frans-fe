<template>
  <div class="delivery-registration-container">
    <!-- 기존 목록 표시 -->
    <div v-if="!showForm">
      <div class="header">
        <h2 class="title">완료된 납품 정보 목록</h2>
        
        <!-- 날짜 범위 선택 추가 -->
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
              <th>수정하기</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="9" class="loading-cell">
                데이터를 불러오는 중...
              </td>
            </tr>
            <tr v-else-if="deliveryList.length === 0">
              <td colspan="9" class="empty-cell">
                완료된 납품 정보가 없습니다.
              </td>
            </tr>
            <tr v-else v-for="(item, index) in deliveryList" :key="item.purchaseOrderId">
              <td>{{ index + 1 }}</td>
              <td>{{ item.purchaseOrderCode }}</td>
              <td>{{ formatCurrency(item.totalAmount) }}</td>
              <td>{{ formatDate(item.processedAt) }}</td>
              <td>{{ formatDate(item.requestedDeliveryDate) }}</td>
              <td>{{ item.deliveredDay ? item.deliveredYear + item.deliveredMonth + item.deliveredDay : '-' }}</td>
              <td>
                <button 
                  class="modify-btn"
                  :class="{ 'disabled': item.deliveryInfoId !== null }"
                  :disabled="item.deliveryInfoId !== null"
                  @click="handleModify(item)"
                >
                  {{ item.deliveryInfoId !== null ? '수정불가' : '수정하기' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 수정 폼 표시 -->
    <DeliveryModifyForm 
      v-if="showForm"
      :purchaseOrderId="selectedOrderId"
      @back="handleBack"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/lib/api'
import DeliveryModifyForm from './DeliveryModifyForm.vue'

const emit = defineEmits(['modify-delivery'])

const deliveryList = ref([])
const loading = ref(false)
const showForm = ref(false)
const selectedOrderId = ref(null)

// 날짜 관련 상태
const startYearMonth = ref('')
const endYearMonth = ref('')
const dateError = ref('')

// 현재 년월을 YYYY-MM 형식으로 반환 (input type="month"용)
const getCurrentYearMonth = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

// YYYY-MM 형식을 YYYYMM 형식으로 변환
const formatYearMonthForApi = (yearMonth) => {
  return yearMonth.replace('-', '')
}

// 날짜 범위 유효성 검사
const validateDateRange = () => {
  dateError.value = ''
  
  if (!startYearMonth.value || !endYearMonth.value) {
    return
  }
  
  const start = new Date(startYearMonth.value + '-01')
  const end = new Date(endYearMonth.value + '-01')
  
  if (start > end) {
    dateError.value = '시작월은 종료월보다 이전이어야 합니다.'
    return
  }
  
  // 6개월 제한 검사
  const monthDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  if (monthDiff > 5) {
    dateError.value = '최대 6개월까지만 조회할 수 있습니다.'
    return
  }
}

// API 호출 함수
const fetchDeliveryList = async () => {
  // 날짜 유효성 검사
  validateDateRange()
  if (dateError.value) {
    return
  }
  
  loading.value = true
  try {
    // YYYY-MM 형식을 YYYYMM 형식으로 변환하여 API 호출
    const startParam = formatYearMonthForApi(startYearMonth.value)
    const endParam = formatYearMonthForApi(endYearMonth.value)
    const queryParams = `startYearMonth=${startParam}&endYearMonth=${endParam}`
    const response = await api.get(`/api/supplier/delivery-info/orders/completed?${queryParams}`)
    deliveryList.value = response.data || []
  } catch (error) {
    console.error('완료된 납품 목록 조회 실패:', error)
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

// 수정하기 버튼 클릭 핸들러
const handleModify = (item) => {
  if (item.deliveredDay !== null) {
    return // 이미 납품 완료된 경우 수정 불가
  }
  selectedOrderId.value = item.purchaseOrderId
  showForm.value = true
}

// 폼에서 돌아가기
const handleBack = () => {
  showForm.value = false
  selectedOrderId.value = null
}

// 수정 성공 시
const handleSuccess = () => {
  showForm.value = false
  selectedOrderId.value = null
  // 목록 새로고침
  fetchDeliveryList()
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  // 초기값을 현재 월로 설정
  const currentMonth = getCurrentYearMonth()
  startYearMonth.value = currentMonth
  endYearMonth.value = currentMonth
  
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
  margin: 0 0 16px 0;
}

/* 날짜 필터 스타일 */
.date-filter {
  margin-bottom: 16px;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.date-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-input-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #495057;
  white-space: nowrap;
}

.date-input {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #495057;
  background: #fff;
}

.date-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.search-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-btn:hover:not(:disabled) {
  background: #218838;
}

.search-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.date-error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 8px;
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

.modify-btn {
  background: #ffc107;
  color: #212529;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.modify-btn:hover:not(:disabled) {
  background: #e0a800;
}

.modify-btn.disabled {
  background: #6c757d;
  color: #fff;
  cursor: not-allowed;
}

.modify-btn:disabled {
  cursor: not-allowed;
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
  
  .date-inputs {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .date-input-group {
    justify-content: space-between;
  }
  
  .delivery-table th,
  .delivery-table td {
    padding: 12px 8px;
    font-size: 0.875rem;
  }
  
  .modify-btn {
    padding: 6px 12px;
    font-size: 0.75rem;
  }
}
</style>