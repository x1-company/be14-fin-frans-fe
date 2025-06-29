<template>
    <div class="purchase-register-container">
      <div class="header-row">
        <div class="action-buttons">
          <button class="btn btn-draft" @click="openDraftModal">임시저장 불러오기</button>
          <button class="btn btn-outline" @click="savePurchaseRequest(false)">임시저장</button>
          <button class="btn btn-primary" @click="savePurchaseRequest(true)">등록</button>
          <button class="btn btn-cancel" @click="cancelRegister">취소</button>
        </div>
      </div>
  
      <div class="info-card">
        <div class="info-card-title">
          <span class="emoji">📝</span>
          <span>구매 요청 정보</span>
        </div>
        <div class="info-box-row">
          <div class="info-box blue">
            <span class="label">구매 요청 번호</span>
            <span class="value">{{ purchaseRequest.requestNo || '-' }}</span>
          </div>
          <div class="info-box green">
            <span class="label">총 요청 금액</span>
            <span class="value info-amount">{{ formatCurrency(totalAmount) }}원</span>
          </div>
        </div>
        <table class="info-table">
          <tr>
            <td class="label">제목</td>
            <td><input class="info-input" v-model="purchaseRequest.title" placeholder="제목을 입력하세요" /></td>
            <td class="label">사유</td>
            <td><textarea class="info-input" v-model="purchaseRequest.description" placeholder="사유를 입력하세요" rows="1"></textarea></td>
          </tr>
          <tr>
            <td class="label">요청일</td>
            <td><input class="info-input" v-model="purchaseRequest.requestDate" readonly /></td>
            <td class="label">납기희망일</td>
            <td><input class="info-input" type="date" v-model="purchaseRequest.requestedDeliveryDate" /></td>
          </tr>
          <tr>
            <td class="label">담당자</td>
            <td><input class="info-input" :value="authStore.userName" readonly /></td>
            <td class="label">담당자 이메일</td>
            <td><input class="info-input" :value="authStore.userEmail" readonly /></td>
          </tr>
        </table>
      </div>
  
      <div class="info-card-material">
        <div class="section-header">
          <span class="section-title">구매 요청 자재</span>
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
          <span class="material-amount-label">총 금액:</span> <span class="material-amount">{{ formatCurrency(totalAmount) }}원</span>
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
  import { useToast } from "@/composables/useToast";

  const emit = defineEmits(['close']);
  
  const toast = useToast();
  
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

      toast.success('임시저장 내용을 불러왔습니다.');
    } catch (error) {
      console.error('임시저장 내용을 불러오는 데 실패했습니다.', error);
      toast.error('임시저장 내용을 불러오는 데 실패했습니다.');
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
    emit('close');
  }
  
  async function savePurchaseRequest(isRequested) {
    if (!purchaseRequest.value.title) {
      toast.warning('제목을 입력해주세요.');
      return;
    }
    if (requestedProducts.value.length === 0) {
      toast.warning('요청할 자재를 하나 이상 추가해주세요.');
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
      const res = await api.post('/api/hq/purchase/requests', payload);
      toast.success(isRequested ? '구매 요청이 등록되었습니다.' : '내용이 임시저장되었습니다.');
      // 등록 성공 시 emit('close', id)로 InfoForm에 알림
      if (isRequested && res.data && res.data.id) {
        emit('close', res.data.id);
      } else {
        emit('close');
      }
    } catch (error) {
      console.error('구매 요청 저장에 실패했습니다.', error);
      toast.error('요청 저장에 실패했습니다.');
    }
  }

  onMounted(() => {
    resetForm();
  });
  </script>
  
  <style scoped>
  .purchase-register-container {
    padding: 24px;
    position: relative;
    min-height: 100vh;
    color: #333; /* 전체 텍스트 색상 명시 */
  }
  
  .header-row {
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    margin-bottom: 20px;
  }
  
  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0;
  }
  
  .action-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 0;
    justify-content: flex-end;
  }
  
  .btn {
    padding: 8px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 5px;
    background: transparent;
    transition: background 0.15s, color 0.15s, border 0.15s;
  }
  
  .btn-draft {
    border-color: #bbdefb;
    color: #4066fa;
  }
  .btn-draft:hover {
    background: #e3f0ff;
  }
  
  .btn-outline {
    border-color: #bbdefb;
    color: #1976d2;
  }
  .btn-outline:hover {
    background: #f5faff;
  }
  
  .btn-primary {
    border-color: #c8e6c9;
    color: #388e3c;
  }
  .btn-primary:hover {
    background: #e8f5e8;
  }
  
  .btn-cancel {
    border-color: #ffd6d6;
    color: #d32f2f;
  }
  .btn-cancel:hover {
    background: #fff0f0;
  }
  
  .form-section {
    background-color: white;
    padding: 24px;
    border-radius: 8px;
    margin-bottom: 24px;
    /* box-shadow: 0 1px 3px rgba(0,0,0,0.1); */
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .button-group {
    display: flex;
    gap: 12px;
  }
  
  .button-group .btn-danger {
    min-width: 64px;
    padding: 8px 16px;
    border: 1px solid #ffd6d6;
    border-radius: 8px;
    color: #d32f2f;
    background: transparent;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 5px;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border 0.15s;
  }
  
  .button-group .btn-danger:hover {
    background: #fff0f0;
  }
  
  .button-group .btn-primary {
    min-width: 64px;
    padding: 8px 16px;
    border: 1px solid #c8e6c9;
    border-radius: 8px;
    color: #388e3c;
    background: transparent;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 5px;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border 0.15s;
  }
  
  .button-group .btn-primary:hover {
    background: #e8f5e8;
  }
  
  .form-table {
    border-top: 2px solid #6b7280;
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: 150px 1fr 150px 1fr;
    row-gap: 12px;
    column-gap: 16px;
    align-items: center;
  }
  
  .form-grid .form-label-cell {
    background-color: #f9fafb;
    font-weight: 500;
    padding: 12px;
    border-radius: 6px;
  }
  
  .form-grid .form-input-cell {
    padding: 12px;
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
    border: none;
    border-radius: 0;
    overflow: visible;
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
  
  @media (max-width: 900px) {
    .form-grid {
      grid-template-columns: 120px 1fr 120px 1fr;
    }
  }
  
  @media (max-width: 600px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
    .form-grid .form-label-cell, .form-grid .form-input-cell {
      border-radius: 0;
      padding: 10px 6px;
    }
  }

  .info-card {
    background: #fcfdff;
    border: 1.5px solid #e3e8f0;
    border-radius: 14px;
    padding: 28px 28px 18px 28px;
    margin-bottom: 32px;
    box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.03);
  }
  .info-card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.18rem;
    font-weight: 700;
    color: #222;
    margin-bottom: 18px;
  }
  .emoji {
    font-size: 1.35em;
    margin-right: 2px;
  }

  .info-box-row {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
  }
  .info-box {
    flex: 1;
    padding: 10px 14px;
    border-radius: 7px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    border: 1px solid #e0e0e0;
  }
  .info-box.blue {
    background: #e3f2fd;
    border: 1px solid #bbdefb;
  }
  .info-box.green {
    background: #e8f5e8;
    border: 1px solid #c8e6c9;
  }
  .info-box .label {
    font-size: 12px;
    color: #666;
    font-weight: 500;
  }
  .info-box .value {
    font-size: 18px;
    font-weight: 700;
    color: #222;
  }
  .info-amount {
    color: #388e3c;
  }
  .info-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 8px;
    margin-bottom: 10px;
  }
  .info-table .label {
    width: 120px;
    font-weight: 500;
    /* color: #444; */
    /* background: #f9fafb; */
    border-radius: 6px;
    padding: 10px 12px;
  }
  .info-table td {
    padding: 8px 10px;
  }
  .info-input {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 1rem;
    background: #fff;
  }
  .info-input:read-only {
    background: #e5e7eb;
    color: #888;
  }
  .info-input[readonly] {
    cursor: not-allowed;
  }

  .info-card-material {
    background: #fcfdff;
    border: 1.5px solid #e3e8f0;
    border-radius: 14px;
    padding: 28px 28px 18px 28px;
    margin-bottom: 32px;
    box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.03);
    overflow: hidden;
  }
  .table-container {
    border: none;
    border-radius: 0;
    overflow: visible;
  }

  </style>