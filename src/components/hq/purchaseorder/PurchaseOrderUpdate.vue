<template>
  <div class="purchase-detail-container">
    <!-- Header with action buttons -->
    <div class="action-buttons">
      <button class="btn btn-primary" @click="submitEdit">수정완료</button>
      <button class="btn" @click="cancel">취소</button>
    </div>

    <!-- 발주 정보 Section -->
    <div class="info-section">
      <div class="section-content">
        <h2 class="section-title">발주 정보</h2>
        <div class="info-table">
          <div class="info-grid">
            <div class="info-label">제목</div>
            <div class="info-value"><input type="text" v-model="orderInfo.title" class="form-input" /></div>
            <div class="info-label">발주 상태</div>
            <div class="info-value">{{ orderInfo.status }}</div>
            <div class="info-label">납기희망일</div>
            <div class="info-value"><input type="date" v-model="orderInfo.deliveryDate" class="form-input" /></div>
            <div class="info-label">발주번호</div>
            <div class="info-value">{{ orderInfo.orderNumber }}</div>
            <div class="info-label">담당자</div>
            <div class="info-value">{{ orderInfo.manager }}</div>
            <div class="info-label">담당자 이메일</div>
            <div class="info-value">{{ orderInfo.managerEmail }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 공급처 정보 Section -->
    <div class="info-section">
      <div class="section-content">
        <h2 class="section-title">공급처 정보</h2>
        <div class="info-table">
          <div class="info-grid">
            <div class="info-label">공급처 명</div>
            <div class="info-value">{{ supplier.name }}</div>
            <div class="info-label">대표자명</div>
            <div class="info-value">{{ supplier.ceoName }}</div>
            <div class="info-label">사업자 번호</div>
            <div class="info-value">{{ supplier.businessNumber }}</div>
            <div class="info-label">우편번호</div>
            <div class="info-value">{{ supplier.zipcode }}</div>
            <div class="info-label">공급처 번호</div>
            <div class="info-value">{{ supplier.code }}</div>
            <div class="info-label">전화번호</div>
            <div class="info-value">{{ supplier.companyPhone }}</div>
            <div class="info-label">주소</div>
            <div class="info-value">{{ supplier.address }}</div>
            <div class="info-label">계약일자</div>
            <div class="info-value contract-date">{{ supplier.signedAt ? supplier.signedAt.split('T')[0] : '-' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 자재 정보 Section -->
    <div class="info-section">
      <div class="section-content">
        <div class="section-header">
          <h2 class="section-title">자재 정보</h2>
          <div class="button-group">
            <button class="btn btn-danger" @click="deleteMaterials" :disabled="selectedMaterials.length === 0">
              <Trash2Icon class="icon" /> 삭제
            </button>
            <button class="btn btn-primary" @click="openPurchaseRequestModal">
              <PlusIcon class="icon" /> 추가
            </button>
          </div>
        </div>

        <div class="table-container">
          <table class="materials-table">
            <thead>
              <tr>
                <th><input type="checkbox" @change="selectAll" :checked="allSelected" /></th>
                <th>No.</th>
                <th>자재 번호</th>
                <th>자재명</th>
                <th>구매 단가</th>
                <th>수량</th>
                <th>단위</th>
                <th>자재 구분</th>
                <th>자재 분류</th>
                <th>자재 속성</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="materials.length === 0">
                <td colspan="11" class="no-materials">자재를 추가해주세요.</td>
              </tr>
              <tr v-for="(material, index) in materials" :key="material.productId">
                <td><input type="checkbox" v-model="selectedMaterials" :value="material.productId" /></td>
                <td class="text-center">{{ index + 1 }}</td>
                <td class="text-center">{{ material.code }}</td>
                <td class="text-center">{{ material.name }}</td>
                <td class="text-center">{{ formatCurrency(material.purchasePrice) }}원</td>
                <td class="text-center">
                  <input type="number" v-model.number="material.quantity" class="form-input quantity-input" min="1" />
                </td>
                <td class="text-center">{{ material.purchaseUnit }}</td>
                <td class="text-center">{{ material.productTypeName }}</td>
                <td class="text-center">{{ material.productGroupName }}</td>
                <td class="text-center">{{ material.productAttributeName }}</td>
                <td class="text-center">
                   <input type="text" v-model="material.remarks" class="form-input" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Total Amount -->
        <div class="total-amount">
          <div class="total-text">총 금액: {{ formatCurrency(totalAmount) }}원</div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <DraftListModal
      :is-visible="isDraftListModalVisible"
      :supplier-id="supplier.id"
      @close="isDraftListModalVisible = false"
      @load-draft="handleLoadDraft"
    />
    <PurchaseRequestListModal
      :is-visible="isRequestListModalVisible"
      @close="isRequestListModalVisible = false"
      @request-selected="handleRequestSelected"
    />
    <PurchaseRequestProductModal
      :is-visible="isProductModalVisible"
      :supplier-id="supplier.id"
      :purchase-request="selectedRequest"
      @close="isProductModalVisible = false"
      @add-products="handleAddProducts"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { Trash2 as Trash2Icon, Plus as PlusIcon } from 'lucide-vue-next';
import api from '@/lib/api';
import PurchaseRequestListModal from './modal/PurchaseRequestListModal.vue';
import PurchaseRequestProductModal from './modal/PurchaseRequestProductModal.vue';
import { useToast } from '@/composables/useToast';
import { useRouter } from 'vue-router';
import DraftListModal from './modal/DraftListModal.vue';

const props = defineProps({
  supplier: {
    type: Object,
    required: true,
  },
  orderData: {
    type: Object,
    required: true,
  }
});

const emit = defineEmits(['cancel-update', 'update-complete']);
const authStore = useAuthStore();
const { success, error } = useToast();
const router = useRouter();

const isRequestListModalVisible = ref(false);
const isProductModalVisible = ref(false);
const selectedRequest = ref(null);
const isDraftListModalVisible = ref(false);
const currentDraftId = ref(null);

const orderInfo = ref({
  id: '',
  title: '',
  status: '',
  deliveryDate: '',
  orderNumber: '',
  manager: '', 
  managerEmail: '',
});

onMounted(() => {
  if (props.orderData) {
    // 발주 정보 매핑
    orderInfo.value = {
      id: props.orderData.id,
      title: props.orderData.title,
      status: props.orderData.statusLabel || props.orderData.status,
      deliveryDate: props.orderData.requestedDeliveryDate,
      orderNumber: props.orderData.code,
      manager: props.orderData.userName,
      managerEmail: props.orderData.userEmail,
    };
    // 자재 정보 매핑
    materials.value = (props.orderData.products || []).map(m => ({
      productId: m.productId || m.id,
      code: m.productCode,
      name: m.productName,
      purchasePrice: m.purchasePrice,
      quantity: m.quantity,
      purchaseUnit: m.purchaseUnit,
      productTypeName: m.productTypeName,
      productGroupName: m.productGroupName,
      productAttributeName: m.productAttributeName,
      standard: m.standard,
      remarks: m.remarks || '',
      purchaseRequestId: m.purchaseRequestId,
      supplierId: m.supplierId
    }));
  }
});

const materials = ref([]);
const selectedMaterials = ref([]);

const allSelected = computed(() => {
  return materials.value.length > 0 && selectedMaterials.value.length === materials.value.length;
});

function selectAll(event) {
  if (event.target.checked) {
    selectedMaterials.value = materials.value.map(m => m.productId);
  } else {
    selectedMaterials.value = [];
  }
}

function deleteMaterials() {
  materials.value = materials.value.filter(m => !selectedMaterials.value.includes(m.productId));
  selectedMaterials.value = [];
}

function openPurchaseRequestModal() {
  isRequestListModalVisible.value = true;
}

function handleRequestSelected(request) {
  selectedRequest.value = request;
  isProductModalVisible.value = true;
}

function handleAddProducts(products) {
  // 중복 방지
  const existingIds = new Set(materials.value.map(m => m.productId));
  const newProducts = products
    .filter(p => !existingIds.has(p.productId || p.id))
    .map(p => ({
      productId: p.productId || p.id,
      code: p.productCode,      // 자재번호
      name: p.productName,      // 자재명
      purchasePrice: p.purchasePrice,
      quantity: p.quantity || 1,
      purchaseUnit: p.purchaseUnit,
      productTypeName: p.productTypeName,
      productGroupName: p.productGroupName,
      productAttributeName: p.productAttributeName,
      standard: p.standard,
      remarks: p.remarks || '',
      purchaseRequestId: p.purchaseRequestId,
      supplierId: p.supplierId
    }));
  materials.value.push(...newProducts);
  isProductModalVisible.value = false;
}

function handleLoadDraft(draft) {
  orderInfo.value = { ...draft };
  materials.value = [...draft.products];
  isDraftListModalVisible.value = false;
}

const totalAmount = computed(() => {
  return materials.value.reduce((sum, m) => sum + (m.purchasePrice * m.quantity), 0);
});

function formatCurrency(value) {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0';
}

function cancel() {
  emit('cancel-update');
}

async function submitEdit() {
  try {
    const payload = {
      title: orderInfo.value.title,
      requestedDeliveryDate: orderInfo.value.deliveryDate,
      products: materials.value.map(material => ({
        id: material.id, // 기존 발주상품 id (신규는 null)
        productId: material.productId,
        quantity: material.quantity,
        remarks: material.remarks || '',
        purchaseRequestId: material.purchaseRequestId
      }))
    };
    
    console.log('수정 요청 payload:', payload);
    
    // PUT API 호출
    await api.put(`/api/hq/purchaseorder/${orderInfo.value.id}`, payload);
    success('수정이 완료되었습니다.');
    emit('update-complete');
  } catch (e) {
    console.error('수정 오류:', e);
    error('수정에 실패했습니다.');
  }
}
</script>

<style scoped>
.purchase-detail-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 24px;
  color: #333;
}
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 24px;
}
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  background-color: white;
  color: #606266;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}
.btn-primary {
  background-color: #5468ff;
  color: white;
  border-color: #5468ff;
}
.btn:hover {
  opacity: 0.9;
}
.btn-danger {
  background-color: #ef4444;
  color: white;
  border-color: #ef4444;
}
.info-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}
.section-content {
  padding: 24px;
}
.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
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
.info-table {
  border: 1px solid #e0e7ef;
  border-radius: 8px;
  overflow: hidden;
}
.info-grid {
  display: grid;
  grid-template-columns: 150px 1fr 150px 1fr;
}
.info-label {
  background-color: #f8f9fa;
  padding: 12px 16px;
  border-right: 1px solid #e0e7ef;
  border-bottom: 1px solid #e0e7ef;
  font-weight: 500;
  color: #555;
  font-size: 14px;
  display: flex;
  align-items: center;
}
.info-value {
  padding: 12px 16px;
  border-right: 1px solid #e0e7ef;
  border-bottom: 1px solid #e0e7ef;
  color: #333;
  font-size: 14px;
  display: flex;
  align-items: center;
}
.info-grid > div:nth-child(4n) {
  border-right: none;
}
.info-grid > div:nth-last-child(-n + 4) {
  border-bottom: none;
}
.form-input {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 14px;
  color: #333;
}
.contract-date {
  color: #5468ff;
}
.table-container {
  border: 1px solid #e0e7ef;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}
.materials-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.materials-table th,
.materials-table td {
  padding: 12px 8px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
}
.materials-table th {
  background-color: #f8f9fa;
  color: #555;
  font-weight: 600;
  border-bottom: 1px solid #e0e7ef;
}
.materials-table tbody tr:hover {
  background-color: #f8f9fa;
}
.materials-table tbody tr:last-child td {
  border-bottom: none;
}
.no-materials {
  padding: 40px;
  text-align: center;
  color: #909399;
}
.text-center {
  text-align: center;
}
.total-amount {
  display: flex;
  justify-content: flex-end;
}
.total-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}
.icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}
.quantity-input {
  width: 80px;
  text-align: center;
}
</style> 