<template>
  <div class="return-register">
    <!-- 헤더 영역 -->
    <div class="header-section">
      <div class="header-left">
        <h2 class="section-title">📦 반품 등록</h2>
      </div>
      <div class="header-right">
        <button class="list-btn" @click="$emit('back-to-list')">목록으로</button>
      </div>
    </div>

    <!-- 단계별 진행 -->
    <div class="step-container">
      <div class="step-indicator">
        <div :class="['step', { active: currentStep >= 1, completed: currentStep > 1 }]">
          <span class="step-number">1</span>
          <span class="step-label">주문 선택</span>
        </div>
        <div class="step-line" :class="{ completed: currentStep > 1 }"></div>
        <div :class="['step', { active: currentStep >= 2, completed: currentStep > 2 }]">
          <span class="step-number">2</span>
          <span class="step-label">반품 상품 선택</span>
        </div>
        <div class="step-line" :class="{ completed: currentStep > 2 }"></div>
        <div :class="['step', { active: currentStep >= 3, completed: currentStep > 3 }]">
          <span class="step-number">3</span>
          <span class="step-label">수량 및 사유 입력</span>
        </div>
        <div class="step-line" :class="{ completed: currentStep > 3 }"></div>
        <div :class="['step', { active: currentStep >= 4 }]">
          <span class="step-number">4</span>
          <span class="step-label">반품 등록</span>
        </div>
      </div>
    </div>

    <!-- 1단계: 주문 선택 -->
    <div v-if="currentStep === 1" class="step-content">
      <h3 class="content-title">배송 완료된 주문 목록</h3>
      <div class="order-list">
        <div v-if="deliveredOrders.length === 0" class="empty-message">
          배송 완료된 주문이 없습니다.
        </div>
        <div v-for="order in deliveredOrders" :key="order.id" class="order-item" @click="selectOrder(order)">
          <div class="order-info">
            <div class="order-code">{{ order.code }}</div>
            <div class="order-date">배송일: {{ order.deliveredAt }}</div>
          </div>
          <div class="order-status">{{ order.status }}</div>
        </div>
      </div>
    </div>

    <!-- 2단계: 반품 상품 선택 -->
    <div v-if="currentStep === 2" class="step-content">
      <h3 class="content-title">반품할 상품 선택 (주문번호: {{ selectedOrder?.code }})</h3>
      <div class="product-table">
        <div class="product-table-header">
          <div class="col col-select">선택</div>
          <div class="col col-code">상품 코드</div>
          <div class="col col-name">상품명</div>
          <div class="col col-price">단가</div>
          <div class="col col-ordered">주문 수량</div>
        </div>
        <div class="product-table-body">
          <div v-for="product in orderProducts" :key="product.id" class="product-row">
            <div class="col col-select">
              <input 
                type="checkbox" 
                :checked="isProductSelected(product.id)"
                @change="toggleProductSelection(product)"
              />
            </div>
            <div class="col col-code">{{ product.productCode }}</div>
            <div class="col col-name">{{ product.productName }}</div>
            <div class="col col-price">{{ formatPrice(product.salePrice) }}원</div>
            <div class="col col-ordered">{{ product.quantity }}{{ product.unit }}</div>
          </div>
        </div>
      </div>
      <div class="step-actions">
        <button class="btn-secondary" @click="currentStep = 1">이전</button>
        <button class="btn-primary" @click="currentStep = 3" :disabled="returnItems.length === 0">다음</button>
      </div>
    </div>

    <!-- 3단계: 수량 및 사유 입력 -->
    <div v-if="currentStep === 3" class="step-content">
      <h3 class="content-title">반품 수량 및 사유 입력</h3>
      <div class="quantity-reason-table">
        <div class="quantity-reason-header">
          <div class="col col-name">상품명</div>
          <div class="col col-ordered">주문 수량</div>
          <div class="col col-return">반품 수량</div>
          <div class="col col-reason">반품 사유</div>
        </div>
        <div class="quantity-reason-body">
          <div v-for="item in returnItems" :key="item.productId" class="quantity-reason-row">
            <div class="col col-name">{{ getProductName(item.productId) }}</div>
            <div class="col col-ordered">{{ getProductQuantity(item.productId) }}{{ getProductUnit(item.productId) }}</div>
            <div class="col col-return">
              <input 
                type="number" 
                :max="getProductQuantity(item.productId)"
                min="1"
                v-model.number="item.quantity"
                class="quantity-input"
              />
            </div>
            <div class="col col-reason">
              <select 
                v-model="item.returnType"
                class="return-type-select"
              >
                <option value="WRONG_DELIVERY">잘못 배송</option>
                <option value="OVER_QUANTITY">수량 초과</option>
                <option value="DAMAGED">파손</option>
                <option value="BAD_QUALITY">품질 불량</option>
                <option value="EXPIRING_SOON">유통기한 임박</option>
                <option value="ETC">기타</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div class="step-actions">
        <button class="btn-secondary" @click="currentStep = 2">이전</button>
        <button class="btn-primary" @click="currentStep = 4">다음</button>
      </div>
    </div>

    <!-- 4단계: 반품 등록 -->
    <div v-if="currentStep === 4" class="step-content">
      <h3 class="content-title">반품 정보 입력</h3>
      
      <!-- 반품 상품 요약 -->
      <div class="return-summary">
        <h4>반품 상품 목록</h4>
        <div v-for="item in returnItems" :key="item.productId" class="summary-item">
          <span class="product-name">{{ getProductName(item.productId) }}</span>
          <span class="quantity">{{ item.quantity }}개</span>
          <span class="return-type">{{ getReturnTypeText(item.returnType) }}</span>
        </div>
      </div>

      <!-- 반품 사유 입력 -->
      <div class="form-group">
        <label for="description">반품 사유</label>
        <textarea 
          id="description"
          v-model="returnDescription"
          placeholder="반품 사유를 상세히 입력해주세요"
          class="description-input"
          rows="4"
        ></textarea>
      </div>

      <!-- 파일 업로드 -->
      <div class="form-group">
        <label>첨부 파일</label>
        <div class="file-upload-area">
          <input 
            type="file" 
            ref="fileInput"
            @change="handleFileSelect"
            multiple
            accept="image/*"
            class="file-input"
          />
          <button class="file-upload-btn" @click="$refs.fileInput.click()">
            📎 파일 선택
          </button>
          <span class="file-info">이미지 파일만 업로드 가능합니다</span>
        </div>
        
        <!-- 선택된 파일 목록 -->
        <div v-if="selectedFiles.length > 0" class="selected-files">
          <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
            <span class="file-name">{{ file.name }}</span>
            <button class="file-remove-btn" @click="removeFile(index)">❌</button>
          </div>
        </div>
      </div>

      <div class="step-actions">
        <button class="btn-secondary" @click="currentStep = 3">이전</button>
        <button class="btn-primary" @click="submitReturn" :disabled="isSubmitting">
          {{ isSubmitting ? '등록 중...' : '반품 등록' }}
        </button>
      </div>
    </div>

    <!-- 로딩 오버레이 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';

const auth = useAuthStore();
const toast = useToast();

const emit = defineEmits(['back-to-list']);

// 상태 관리
const currentStep = ref(1);
const isLoading = ref(false);
const isSubmitting = ref(false);

// 1단계: 주문 목록
const deliveredOrders = ref([]);
const selectedOrder = ref(null);

// 2단계: 상품 목록
const orderProducts = ref([]);
const returnItems = ref([]);

// 4단계: 반품 정보
const returnDescription = ref('');
const selectedFiles = ref([]);
const uploadedFiles = ref([]);

// 1단계: 배송 완료된 주문 목록 조회
const fetchDeliveredOrders = async () => {
  isLoading.value = true;
  try {
    const response = await api.get(`/api/franchise/return/${auth.franchiseId}/regist/orders`);
    deliveredOrders.value = response.data;
  } catch (error) {
    console.error('주문 목록 조회 실패:', error);
  } finally {
    isLoading.value = false;
  }
};

// 주문 선택
const selectOrder = async (order) => {
  selectedOrder.value = order;
  await fetchOrderProducts(order.id);
  currentStep.value = 2;
};

// 2단계: 선택된 주문의 상품 목록 조회
const fetchOrderProducts = async (orderId) => {
  isLoading.value = true;
  try {
    const response = await api.get(`/api/franchise/return/1/regist/orders/${orderId}`);
    orderProducts.value = response.data;
  } catch (error) {
    console.error('주문 상품 조회 실패:', error);
  } finally {
    isLoading.value = false;
  }
};

// 상품 선택/해제
const toggleProductSelection = (product) => {
  const existingIndex = returnItems.value.findIndex(item => item.productId === product.productId);
  
  if (existingIndex >= 0) {
    returnItems.value.splice(existingIndex, 1);
  } else {
    returnItems.value.push({
      productId: product.productId,
      orderId: product.orderId,
      quantity: 1,
      returnType: 'DAMAGED'
    });
  }
};

// 상품이 선택되었는지 확인
const isProductSelected = (productId) => {
  return returnItems.value.some(item => item.productId === productId);
};

// 상품명 가져오기
const getProductName = (productId) => {
  const product = orderProducts.value.find(p => p.productId === productId);
  return product ? product.productName : '';
};

// 상품 수량 가져오기
const getProductQuantity = (productId) => {
  const product = orderProducts.value.find(p => p.productId === productId);
  return product ? product.quantity : 0;
};

// 상품 단위 가져오기
const getProductUnit = (productId) => {
  const product = orderProducts.value.find(p => p.productId === productId);
  return product ? product.unit : '';
};

// 반품 사유 텍스트 변환
const getReturnTypeText = (type) => {
  const typeMap = {
    'WRONG_DELIVERY': '잘못 배송',
    'OVER_QUANTITY': '수량 초과',
    'DAMAGED': '파손',
    'BAD_QUALITY': '품질 불량',
    'EXPIRING_SOON': '유통기한 임박',
    'ETC': '기타'
  };
  return typeMap[type] || type;
};

// 파일 선택 처리
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  selectedFiles.value = [...selectedFiles.value, ...files];
};

// 파일 제거
const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

// 파일 업로드 - 각 파일을 개별적으로 AWS S3에 업로드
const uploadFiles = async () => {
  if (selectedFiles.value.length === 0) return [];

  const uploadedFileList = [];

  try {
    // 각 파일을 개별적으로 업로드
    for (const file of selectedFiles.value) {
      const formData = new FormData();
      formData.append('files', file);

      const response = await api.post('/api/upload?type=return', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // 응답 형태: [url, fileName, originalName]
      // response.data는 배열의 배열이므로 첫 번째 요소를 가져옴
      const fileInfo = response.data;
      
      uploadedFileList.push({
        url: fileInfo[0],        // S3 URL
        name: fileInfo[2],       // 원본 파일명
        fileName: fileInfo[1]    // 삭제용 파일명
      });
    }

    return uploadedFileList;
  } catch (error) {
    console.error('파일 업로드 실패:', error);
    throw error;
  }
};

// 업로드된 파일 삭제
const deleteUploadedFiles = async (files) => {
  for (const file of files) {
    try {
      // fileName 사용 (두 번째 요소)
      await api.delete(`/api/upload?fileName=${file.fileName}&type=return`);
    } catch (error) {
      console.error('파일 삭제 실패:', error);
    }
  }
};

// 반품 등록
const submitReturn = async () => {
  if (!returnDescription.value.trim()) {
    toast.warning('반품 사유를 입력해주세요.');
    return;
  }

  isSubmitting.value = true;
  let uploadedFileList = [];

  try {
    // 파일 업로드
    if (selectedFiles.value.length > 0) {
      uploadedFileList = await uploadFiles();
    }

    // fileName을 제거한 리스트 생성
    const cleanedFileList = uploadedFileList.map(({ fileName, ...rest }) => rest);

    // 반품 등록 API 호출
    const returnData = {
      description: returnDescription.value,
      details: returnItems.value,
      files: cleanedFileList
    };

    console.log(returnData)

    await api.post(`/api/franchise/${auth.franchiseId}/return/regist`, returnData);
    
    toast.success('반품이 성공적으로 등록되었습니다.');
    emit('back-to-list');

  } catch (error) {
    console.error('반품 등록 실패:', error);
    
    // 실패 시 업로드된 파일 삭제
    if (uploadedFileList.length > 0) {
      await deleteUploadedFiles(uploadedFileList);
    }
    
    toast.error('반품 등록에 실패했습니다. 다시 시도해주세요.');
  } finally {
    isSubmitting.value = false;
  }
};

// 가격 포맷팅
const formatPrice = (price) => {
  return new Intl.NumberFormat('ko-KR').format(price);
};

onMounted(() => {
  fetchDeliveredOrders();
});
</script>

<style scoped>
.return-register {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  position: relative;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f8f9fa;
}

.section-title {
  margin: 0;
  color: #212529;
  font-size: 18px;
  font-weight: 600;
}

.list-btn {
  background: #f8f9fa;
  color: #212529;
  border: 1px solid #dee2e6;
  padding: 6px 13px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.list-btn:hover {
  background: #e9ecef;
}

.step-container {
  margin-bottom: 32px;
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.step.active .step-number {
  background: #4066fa;
  color: white;
}

.step.completed .step-number {
  background: #28a745;
  color: white;
}

.step-label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.step.active .step-label {
  color: #4066fa;
  font-weight: 600;
}

.step-line {
  width: 80px;
  height: 2px;
  background: #e9ecef;
  margin: 0 16px;
}

.step-line.completed {
  background: #28a745;
}

.step-content {
  margin-bottom: 24px;
}

.content-title {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 16px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.order-item:hover {
  border-color: #4066fa;
  background: #f8f9ff;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-code {
  font-weight: 600;
  color: #212529;
  font-family: monospace;
}

.order-date {
  font-size: 14px;
  color: #6c757d;
}

.order-status {
  padding: 4px 12px;
  background: #e0f0ff;
  color: #2563eb;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.product-table, .quantity-reason-table {
  border: 1px solid #eef0f4;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
}

.product-table-header, .product-row, .quantity-reason-header, .quantity-reason-row {
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.product-table-header, .quantity-reason-header {
  background: #f8f9fa;
  color: #495057;
  font-size: 13px;
  font-weight: 500;
  height: 48px;
  border-bottom: 1px solid #eef0f4;
}

.product-table-body .product-row, .quantity-reason-body .quantity-reason-row {
  border-bottom: 1px solid #eef0f4;
}

.product-table-body .product-row:last-child, .quantity-reason-body .quantity-reason-row:last-child {
  border-bottom: none;
}

.product-row, .quantity-reason-row {
  height: 64px;
  font-size: 14px;
  background: #fff;
}

.col {
  text-align: center;
  padding: 0 8px;
}

/* 2단계 상품 선택 테이블 컬럼 */
.product-table .col-select { flex-basis: 10%; }
.product-table .col-code { flex-basis: 20%; font-family: monospace; color: #6c757d; }
.product-table .col-name { flex-basis: 30%; text-align: left; font-weight: 500; }
.product-table .col-price { flex-basis: 20%; text-align: right; }
.product-table .col-ordered { flex-basis: 20%; }

/* 3단계 수량 및 사유 입력 테이블 컬럼 */
.quantity-reason-table .col-name { flex-basis: 30%; text-align: left; font-weight: 500; }
.quantity-reason-table .col-ordered { flex-basis: 20%; }
.quantity-reason-table .col-return { flex-basis: 20%; }
.quantity-reason-table .col-reason { flex-basis: 30%; }

.quantity-input {
  width: 80px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}

.return-type-select {
  width: 140px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.return-summary {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.return-summary h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #212529;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.summary-item:last-child {
  border-bottom: none;
}

.product-name {
  font-weight: 500;
}

.quantity {
  color: #4066fa;
  font-weight: 600;
}

.return-type {
  font-size: 12px;
  padding: 2px 8px;
  background: #fff3cd;
  color: #856404;
  border-radius: 12px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #212529;
}

.description-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
}

.description-input:focus {
  outline: none;
  border-color: #4066fa;
  box-shadow: 0 0 0 2px rgba(64, 102, 250, 0.1);
}

.file-upload-area {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.file-input {
  display: none;
}

.file-upload-btn {
  background: #f8f9fa;
  color: #212529;
  border: 1px solid #dee2e6;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.file-upload-btn:hover {
  background: #e9ecef;
}

.file-info {
  font-size: 12px;
  color: #6c757d;
}

.selected-files {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.file-name {
  font-size: 14px;
  color: #212529;
}

.file-remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  padding: 2px;
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

.btn-secondary {
  background: #f8f9fa;
  color: #212529;
  border: 1px solid #dee2e6;
  padding: 10px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.btn-primary {
  background: #4066fa;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #3553cc;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.empty-message {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 40px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4066fa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>