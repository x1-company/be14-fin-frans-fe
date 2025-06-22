<template>
  <div class="delivery-form-container">
    <div class="header">
      <h2 class="title">납품 정보 수정</h2>
      <button class="back-btn" @click="$emit('back')">
        ← 목록으로 돌아가기
      </button>
    </div>

    <div v-if="loading" class="loading">
      데이터를 불러오는 중...
    </div>

    <div v-else-if="orderData" class="form-content">
      <!-- 발주 정보 -->
      <div class="order-info-section">
        <h3>발주 정보</h3>
        <div class="order-info-grid">
          <div class="info-item">
            <label>발주 번호</label>
            <span>{{ orderData.purchaseOrderCode }}</span>
          </div>
          <div class="info-item">
            <label>요청 납기일</label>
            <span>{{ formatDate(orderData.requestedDeliveryDate) }}</span>
          </div>
        </div>
      </div>

      <!-- 납품 정보 입력 -->
      <div class="delivery-info-section">
        <h3>납품 정보</h3>
        <div class="delivery-info-grid">
          <div class="input-group">
            <label for="expectedDate">납품 예정일 *</label>
            <input
              id="expectedDate"
              type="date"
              v-model="deliveryInfo.expectedDate"
              class="form-input"
              required
            />
          </div>
          <div class="input-group">
            <label for="deliveryCompany">택배사 이름 *</label>
            <input
              id="deliveryCompany"
              type="text"
              v-model="deliveryInfo.deliveryCompanyName"
              placeholder="택배사 이름을 입력하세요"
              class="form-input"
              required
            />
          </div>
          <div class="input-group">
            <label for="vehicleNumber">차량번호</label>
            <input
              id="vehicleNumber"
              type="text"
              v-model="deliveryInfo.vehicleNumber"
              placeholder="차량번호를 입력하세요"
              class="form-input"
            />
          </div>
          <div class="input-group">
            <label for="trackingNumber">운송장번호</label>
            <input
              id="trackingNumber"
              type="text"
              v-model="deliveryInfo.trackingNumber"
              placeholder="운송장번호를 입력하세요"
              class="form-input"
            />
          </div>
        </div>
      </div>

      <!-- 상품 목록 -->
      <div class="product-section">
        <h3>상품 목록</h3>
        <div class="product-table-container">
          <table class="product-table">
            <thead>
              <tr>
                <th>상품명</th>
                <th>단위</th>
                <th>단가</th>
                <th>수량</th>
                <th>금액</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in productList" :key="product.productId">
                <td>{{ product.productName }}</td>
                <td>{{ product.purchaseUnit }}</td>
                <td>{{ formatCurrency(product.purchasePrice) }}</td>
                <td>
                  <input
                    type="number"
                    v-model.number="product.quantity"
                    min="0"
                    class="quantity-input"
                    @input="updateTotalAmount"
                  />
                </td>
                <td>{{ formatCurrency(product.purchasePrice * product.quantity) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="total-section">
          <div class="total-amount">
            <strong>총 금액: {{ formatCurrency(totalAmount) }}</strong>
          </div>
        </div>
      </div>

      <!-- 수정 버튼 -->
      <div class="action-section">
        <button 
          class="modify-btn"
          @click="submitDeliveryInfo"
          :disabled="submitting || !isFormValid"
        >
          {{ submitting ? '수정 중...' : '수정하기' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/lib/api'

const props = defineProps({
  purchaseOrderId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['back', 'success'])

const loading = ref(false)
const submitting = ref(false)
const orderData = ref(null)
const productList = ref([])
const deliveryInfoId = ref(null)

const deliveryInfo = ref({
  expectedDate: '',
  deliveryCompanyName: '',
  vehicleNumber: '',
  trackingNumber: ''
})

// 총 금액 계산
const totalAmount = computed(() => {
  return productList.value.reduce((sum, product) => {
    return sum + (product.purchasePrice * product.quantity)
  }, 0)
})

// 폼 유효성 검사
const isFormValid = computed(() => {
  return deliveryInfo.value.expectedDate && 
         deliveryInfo.value.deliveryCompanyName &&
         productList.value.length > 0
})

// 발주 정보 조회
const fetchOrderData = async () => {
  loading.value = true
  try {
    const response = await api.get(`/api/supplier/delivery-info/order/${props.purchaseOrderId}`)
    orderData.value = response.data
    productList.value = response.data.productList || []
    console.log(response.data);

    // 납품 정보가 있다면 폼에 채우기
    if (response.data.deliveryInfoId) {
        console.log("yes")
        deliveryInfo.value = {
            deliveryInfoId: response.data.deliveryInfoId,
            expectedDate: response.data.expectedDate || '',
            deliveryCompanyName: response.data.deliveryCompanyName || '',
            vehicleNumber: response.data.vehicleNumber || '',
            trackingNumber: response.data.trackingNumber || ''
        }
    }
  } catch (error) {
    console.error('발주 정보 조회 실패:', error)
    alert('발주 정보를 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

// 총 금액 업데이트 (수량 변경 시)
const updateTotalAmount = () => {
  // computed로 자동 계산되므로 별도 로직 불필요
}

// 납품 정보 수정
const submitDeliveryInfo = async () => {
  if (!isFormValid.value) {
    alert('필수 항목을 모두 입력해주세요.')
    return
  }

  submitting.value = true
  try {
    const requestData = {
      id: deliveryInfo.value.deliveryInfoId || 0,
      expectedDate: deliveryInfo.value.expectedDate,
      deliveryCompanyName: deliveryInfo.value.deliveryCompanyName,
      vehicleNumber: deliveryInfo.value.vehicleNumber,
      trackingNumber: deliveryInfo.value.trackingNumber,
      items: productList.value.map(product => ({
        productId: product.productId,
        quantity: product.quantity
      }))
    }

    console.log('납품 정보 수정 요청 데이터:', requestData)

    await api.patch('/api/supplier/delivery-infos/modify', requestData)
    alert('납품 정보가 성공적으로 수정되었습니다.')
    emit('success')
  } catch (error) {
    console.error('납품 정보 수정 실패:', error)
    alert('납품 정보 수정에 실패했습니다.')
  } finally {
    submitting.value = false
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

onMounted(() => {
  fetchOrderData()
})
</script>

<style scoped>
.delivery-form-container {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
  justify-content: space-between;
}

.back-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background: #5a6268;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.order-info-section,
.delivery-info-section,
.product-section {
  margin-bottom: 32px;
}

.order-info-section h3,
.delivery-info-section h3,
.product-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 16px;
}

.order-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-weight: 500;
  color: #495057;
  font-size: 0.875rem;
}

.info-item span {
  color: #212529;
  font-weight: 600;
}

.delivery-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-weight: 500;
  color: #495057;
  font-size: 0.875rem;
}

.form-input {
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.product-table-container {
  overflow-x: auto;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 16px;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

.product-table th {
  background: #f8f9fa;
  padding: 16px 12px;
  text-align: center;
  font-weight: 600;
  color: #495057;
  border-bottom: 1px solid #e9ecef;
}

.product-table td {
  padding: 16px 12px;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
  color: #212529;
}

.quantity-input {
  width: 80px;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  text-align: center;
}

.quantity-input:focus {
  outline: none;
  border-color: #007bff;
}

.total-section {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.total-amount {
  font-size: 1.25rem;
  color: #212529;
}

.action-section {
  display: flex;
  justify-content: center;
  padding-top: 24px;
}

.modify-btn {
  background: #ffc107;
  color: #212529;
  border: none;
  padding: 12px 32px;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.modify-btn:hover:not(:disabled) {
  background: #e0a800;
}

.modify-btn:disabled {
  background: #6c757d;
  color: #fff;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .delivery-form-container {
    padding: 16px;
  }
  
  .delivery-info-grid,
  .order-info-grid {
    grid-template-columns: 1fr;
  }
  
  .product-table th,
  .product-table td {
    padding: 12px 8px;
    font-size: 0.875rem;
  }
}
</style>