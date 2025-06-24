<template>
    <div class="purchase-register-container">
      <div class="action-buttons">
        <button class="btn-secondary" @click="openDraftModal">임시저장 불러오기</button>
        <button class="btn-outline" @click="savePurchaseRequest(false)">임시저장</button>
        <button class="btn-primary" @click="savePurchaseRequest(true)">등록</button>
        <button class="btn-cancel" @click="cancelRegister">취소</button>
      </div>
  
      <div class="form-section">
        <h3 class="section-title">구매 요청 정보</h3>
        <div v-if="currentDraftId" class="draft-info">
          <span class="draft-badge">임시저장 불러옴</span>
          <span class="draft-text">임시저장 내용을 불러왔습니다. 수정 후 등록하시면 기존 임시저장이 삭제됩니다.</span>
        </div>
        <div class="form-table">
          <div class="form-row">
            <div class="form-label-cell">납기희망일</div>
            <div class="form-input-cell">
              <div class="input-wrapper">
                <input
                  type="date"
                  class="form-input"
                  v-model="purchaseRequest.requestedDeliveryDate"
                />
              </div>
            </div>
            <div class="form-label-cell">요청일</div>
            <div class="form-input-cell">
              <div class="input-wrapper">
                <input 
                  type="date" 
                  class="form-input" 
                  v-model="purchaseRequest.requestDate" 
                  readonly 
                />
                <CalendarIcon class="input-icon" />
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-label-cell">담당자</div>
            <div class="form-input-cell">
              <input 
                type="text" 
                class="form-input" 
                :value="authStore.userName" 
                readonly 
              />
            </div>
            <div class="form-label-cell">담당자 이메일</div>
            <div class="form-input-cell">
              <input 
                type="text" 
                class="form-input" 
                :value="authStore.userEmail" 
                readonly 
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-label-cell">제목</div>
            <div class="form-input-cell full-width">
              <input
                type="text"
                class="form-input"
                v-model="purchaseRequest.title"
                placeholder="제목을 입력하세요"
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-label-cell">사유</div>
            <div class="form-input-cell full-width">
              <textarea
                class="form-textarea"
                v-model="purchaseRequest.description"
                placeholder="사유를 입력하세요"
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
  
      <div class="form-section">
        <div class="section-header">
          <h3 class="section-title">구매 요청 자재</h3>
          <div class="button-group">
            <button class="btn-danger" @click="deleteSelectedProducts">삭제</button>
            <button class="btn-primary" @click="openProductModal">추가</button>
          </div>
        </div>
        
        <div class="table-container">
          <table class="product-table">
            <thead>
              <tr>
                <th style="width: 40px"><input type="checkbox" @change="toggleSelectAllProducts" :checked="isAllProductsSelected" /></th>
                <th style="width: 40px">No.</th>
                <th style="width: 120px">자재 번호</th>
                <th style="width: 120px">자재명</th>
                <th style="width: 100px">구매 단가</th>
                <th style="width: 80px">수량</th>
                <th style="width: 60px">단위</th>
                <th style="width: 100px">자재 구분</th>
                <th style="width: 100px">자재 분류</th>
                <th style="width: 100px">자재 속성</th>
                <th style="width: 150px">비고</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="requestedProducts.length === 0">
                <td colspan="11" class="no-data">요청할 자재를 추가해주세요.</td>
              </tr>
              <tr v-for="(product, index) in requestedProducts" :key="product.productId">
                <td><input type="checkbox" v-model="product.selected" /></td>
                <td>{{ index + 1 }}</td>
                <td>{{ product.code }}</td>
                <td>{{ product.name }}</td>
                <td class="text-right">{{ formatCurrency(product.purchasePrice) }}</td>
                <td><input type="number" class="table-input" v-model.number="product.quantity" min="1" /></td>
                <td class="text-center">{{ product.purchaseUnit }}</td>
                <td class="text-center">{{ typeLabel(product.productTypeId) }}</td>
                <td class="text-center">{{ groupLabel(product.productGroupId) }}</td>
                <td class="text-center">{{ attrLabel(product.productAttributeId) }}</td>
                <td><input type="text" class="table-input" v-model="product.remarks" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="total-amount">
          <strong>총 금액: {{ formatCurrency(totalAmount) }}원</strong>
        </div>
      </div>
  
      <ProductSelectionModal
        v-if="isModalVisible"
        @close="isModalVisible = false"
        @add-products="addProductsToList"
      />

      <DraftListModal
        :is-visible="isDraftModalVisible"
        @close="isDraftModalVisible = false"
        @load-draft="loadDraft"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
  import { Calendar as CalendarIcon } from 'lucide-vue-next';
  import api from '@/lib/api';
  import ProductSelectionModal from './ProductSelectionModal.vue';
  import DraftListModal from './DraftListModal.vue';
  import { PRODUCT_TYPE_MAP, PRODUCT_GROUP_MAP, PRODUCT_ATTRIBUTE_MAP } from '@/enums/hqEnums';
  
  const router = useRouter();
  const authStore = useAuthStore();
  
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const purchaseRequest = ref({
    title: '',
    description: '',
    requestDate: getTodayDate(),
    requestedDeliveryDate: '',
  });
  
  const requestedProducts = ref([]);
  const isModalVisible = ref(false);
  const isDraftModalVisible = ref(false);
  const currentDraftId = ref(null);
  
  const typeLabel = (val) => PRODUCT_TYPE_MAP[val] || val;
  const groupLabel = (val) => PRODUCT_GROUP_MAP[val] || val;
  const attrLabel = (val) => PRODUCT_ATTRIBUTE_MAP[val] || val;
  
  const totalAmount = computed(() => {
    return requestedProducts.value.reduce((sum, product) => {
      const price = Number(product.purchasePrice) || 0;
      const quantity = Number(product.quantity) || 0;
      return sum + price * quantity;
    }, 0);
  });
  
  const isAllProductsSelected = computed(() => {
    return requestedProducts.value.length > 0 && requestedProducts.value.every(p => p.selected);
  });
  
  function toggleSelectAllProducts(event) {
    const checked = event.target.checked;
    requestedProducts.value.forEach(p => p.selected = checked);
  }
  
  function formatCurrency(value) {
    if (!value) return '0';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  function openProductModal() {
    isModalVisible.value = true;
  }
  
  function openDraftModal() {
    isDraftModalVisible.value = true;
  }

  function resetForm() {
    purchaseRequest.value = {
      title: '',
      description: '',
      requestDate: getTodayDate(),
      requestedDeliveryDate: '',
    };
    requestedProducts.value = [];
    currentDraftId.value = null; // draftId 초기화
  }

  async function loadDraft(draft) {
    if (!draft || !draft.id) return;

    try {
      // 1. 선택한 임시저장 데이터의 상세 정보 조회
      const response = await api.get(`/api/hq/purchase/requests/draft/${draft.id}`);
      const draftDetail = response.data;

      // 2. draftId 저장
      currentDraftId.value = draft.id;

      // 3. 폼 기본 정보 채우기
      purchaseRequest.value.title = draftDetail.title;
      purchaseRequest.value.description = draftDetail.description || draftDetail.desc || draftDetail.content || draftDetail.reason || '';
      purchaseRequest.value.requestedDeliveryDate = draftDetail.requestedDeliveryDate.split('T')[0];

      // 4. 자재 목록 채우기 (각 자재의 상세정보를 다시 조회)
      if (draftDetail.products && draftDetail.products.length > 0) {
        const productDetails = await Promise.all(
          draftDetail.products.map(async (p) => {
            try {
              const detailRes = await api.get(`/api/hq/products/details/${p.productId || p.id}`);
              return {
                ...detailRes.data,
                productId: p.productId || p.id,
                quantity: p.quantity,
                remarks: p.remarks,
                selected: false,
              };
            } catch (e) {
              console.error(`Failed to fetch product details for ${p.productId || p.id}`, e);
              // Fallback: 최소 정보로 자재 추가
              return {
                productId: p.productId || p.id,
                code: p.code,
                name: p.name,
                purchasePrice: p.purchasePrice || 0,
                purchaseUnit: p.purchaseUnit || '',
                productTypeId: p.productTypeId,
                productGroupId: p.productGroupId,
                productAttributeId: p.productAttributeId,
                quantity: p.quantity,
                remarks: p.remarks,
                selected: false,
              };
            }
          })
        );
        requestedProducts.value = productDetails.filter(p => p !== null);
      } else {
        requestedProducts.value = [];
      }

      alert('임시저장 내용을 불러왔습니다.');
    } catch (error) {
      console.error('임시저장 내용을 불러오는 데 실패했습니다.', error);
      alert('임시저장 내용을 불러오는 데 실패했습니다.');
    } finally {
      isDraftModalVisible.value = false;
    }
  }
  
  function addProductsToList(productsFromModal) {
    productsFromModal.forEach(newProduct => {
      const isExisting = requestedProducts.value.some(existing => existing.productId === newProduct.id);
      if (!isExisting) {
        requestedProducts.value.push({
          ...newProduct,
          productId: newProduct.id,
          quantity: 1,
          remarks: '',
          selected: false,
        });
      }
    });
    isModalVisible.value = false;
  }
  
  function deleteSelectedProducts() {
    requestedProducts.value = requestedProducts.value.filter(p => !p.selected);
  }
  
  function cancelRegister() {
    if (confirm('작성을 취소하시겠습니까? 변경사항이 저장되지 않을 수 있습니다.')) {
      router.push('/purchase');
    }
  }
  
  async function savePurchaseRequest(isRequested) {
    if (!purchaseRequest.value.title) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (requestedProducts.value.length === 0) {
      alert('요청할 자재를 하나 이상 추가해주세요.');
      return;
    }
  
    const payload = {
      title: purchaseRequest.value.title,
      description: purchaseRequest.value.description,
      requestedDeliveryDate: purchaseRequest.value.requestedDeliveryDate,
      isRequested,
      products: requestedProducts.value.map(p => ({
        productId: p.productId,
        quantity: p.quantity,
        remarks: p.remarks,
      })),
    };

    // 임시저장을 불러온 경우 draftId 포함
    if (currentDraftId.value) {
      payload.draftId = currentDraftId.value;
    }
  
    try {
      await api.post('/api/hq/purchase/requests', payload);
      alert(isRequested ? '구매 요청이 등록되었습니다.' : '내용이 임시저장되었습니다.');
      router.push('/purchase');
    } catch (error) {
      console.error('구매 요청 저장에 실패했습니다.', error);
      alert('요청 저장에 실패했습니다.');
    }
  }

  onMounted(() => {
    resetForm();
  });
  </script>
  
  <style scoped>
  .purchase-register-container {
    padding: 24px;
    background-color: #f9fafb;
    position: relative;
    min-height: 100vh;
    color: #333; /* 전체 텍스트 색상 명시 */
  }
  
  .action-buttons {
    position: absolute;
    top: 24px;
    right: 24px;
    display: flex;
    gap: 8px;
    z-index: 10;
  }
  
  .btn-primary, .btn-outline, .btn-cancel, .btn-secondary, .btn-danger {
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid transparent;
  }
  
  .btn-primary, .btn-secondary {
    background-color: #4066fa;
    color: white;
  }
  
  .btn-outline {
    background-color: #4066fa;
    color: white;
  }
  
  .btn-cancel {
    background-color: #4066fa;
    color: white;
  }
  
  .btn-danger {
    background-color: #ef4444;
    color: white;
  }
  
  .form-section {
    background-color: white;
    padding: 24px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 16px;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .button-group {
    display: flex;
    gap: 8px;
  }
  
  .form-table {
    border-top: 2px solid #6b7280;
  }
  
  .form-row {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .form-row:last-child {
    border-bottom: none;
  }
  
  .form-row:has(.full-width) {
    flex-basis: 100%;
  }
  
  .form-label-cell, .form-input-cell {
    padding: 12px;
    display: flex;
    align-items: center;
  }
  
  .form-label-cell {
    background-color: #f9fafb;
    font-weight: 500;
    width: 150px;
  }
  
  .form-input-cell {
    flex: 1;
  }
  
  .form-input-cell.full-width {
    flex-basis: 100%;
  }
  
  .input-wrapper {
    position: relative;
    width: 100%;
  }
  
  .form-input, .form-textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
  }
  
  .form-input:read-only {
    background-color: #e5e7eb;
    cursor: not-allowed;
  }
  
  .form-textarea {
    resize: vertical;
  }
  
  .input-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
  }
  
  .table-container {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .product-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 0.9rem;
  }
  
  .product-table th, .product-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
    vertical-align: middle;
  }
  
  .product-table th {
    background-color: #f9fafb;
    font-weight: 600;
  }
  
  .product-table tbody tr:last-child td {
    border-bottom: none;
  }
  
  .no-data {
    text-align: center;
    padding: 32px;
    color: #6b7280;
  }
  
  .table-input {
    width: 100%;
    padding: 6px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
  }
  
  .text-right {
    text-align: right;
  }
  
  .text-center {
    text-align: center;
  }
  
  .total-amount {
    text-align: right;
    font-size: 1.1rem;
    font-weight: bold;
    margin-top: 16px;
    padding-right: 12px;
  }
  
  /* 플레이스홀더 색상 */
  .form-input::placeholder,
  .form-textarea::placeholder,
  .table-input::placeholder {
    color: #9ca3af;
  }
  
  @media (max-width: 768px) {
    .form-row {
      flex-direction: column;
    }
    
    .form-row:has(.full-width) {
      flex-basis: 100%;
    }
    
    .form-label-cell {
      border-right: none;
      border-bottom: 1px solid #e0e7ef;
    }
    
    .form-input-cell {
      border-right: none;
    }
    
    .action-buttons {
      position: static;
      justify-content: flex-end;
      margin-bottom: 24px;
    }
    
    .purchase-register-container {
      padding: 16px;
    }
  }

  .draft-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background-color: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .draft-badge {
    background-color: #f59e0b;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .draft-text {
    color: #92400e;
    font-size: 0.875rem;
  }
  </style>