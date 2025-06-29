<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>자재 선택 <span v-if="purchaseRequest" class="request-title">({{ purchaseRequest.title }})</span></h2>
        <button class="close-button" @click="close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th><input type="checkbox" @change="selectAll" :checked="allSelected" /></th>
                <th>자재 번호</th>
                <th>자재명</th>
                <th>요청 수량</th>
                <th>단위</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="5">로딩 중...</td>
              </tr>
              <tr v-else-if="products.length === 0">
                <td colspan="5">이 공급처에서 공급하는 자재가 없습니다.</td>
              </tr>
              <tr v-for="product in products" :key="product.id">
                <td><input type="checkbox" :value="product" v-model="selectedProducts" /></td>
                <td>{{ product.productCode }}</td>
                <td>{{ product.productName }}</td>
                <td>{{ product.quantity }}</td>
                <td>{{ product.purchaseUnit }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn" @click="close">취소</button>
        <button class="btn btn-primary" @click="addProducts" :disabled="selectedProducts.length === 0">선택 추가</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import api from '@/lib/api';
import { useToast } from '@/composables/useToast';

const props = defineProps({
  isVisible: { type: Boolean, required: true },
  purchaseRequest: { type: Object, default: null },
  supplierId: { type: Number, required: true },
});

const emit = defineEmits(['close', 'add-products']);

const products = ref([]);
const selectedProducts = ref([]);
const loading = ref(false);
const { showToast } = useToast();

async function fetchProducts() {
  if (!props.purchaseRequest) return;
  loading.value = true;
  selectedProducts.value = [];
  try {
    const response = await api.get(`/api/hq/purchase/requests/${props.purchaseRequest.id}`);
    
    if (response.data && response.data.products) {
      const allProducts = response.data.products;
      // TODO: 백엔드 응답의 Product DTO에 supplierId가 포함되어야 합니다.
      // 현재는 supplierId가 없으므로, 임시로 필터링 없이 모든 자재를 보여줍니다.
      // 추후 supplierId가 추가되면 아래 주석을 해제하고 필드명을 맞춰주세요.
      products.value = allProducts.filter(p => p.supplierId == props.supplierId);
    } else {
      products.value = [];
    }
  } catch (error) {
    console.error('Failed to fetch products for purchase request:', error);
    products.value = [];
  } finally {
    loading.value = false;
  }
}

watch(() => props.purchaseRequest, (newVal) => {
  if (newVal && props.isVisible) {
    fetchProducts();
  }
}, { immediate: true });


const allSelected = computed(() => {
  return products.value.length > 0 && selectedProducts.value.length === products.value.length;
});

function selectAll(event) {
  if (event.target.checked) {
    selectedProducts.value = [...products.value];
  } else {
    selectedProducts.value = [];
  }
}

function addProducts() {
  emit('add-products', selectedProducts.value);
  emit('close');
}

function close() {
  products.value = [];
  selectedProducts.value = [];
  emit('close');
}
</script>

<style scoped>
/* Re-using similar modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050; /* Higher than the first modal */
}

.modal-content {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  width: 700px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 16px;
  margin-bottom: 16px;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
}

.request-title {
  font-size: 1rem;
  font-weight: 500;
  color: #555;
  margin-left: 8px;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
}

.table-container {
  max-height: 400px;
  overflow-y: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th, .table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: center;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.modal-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  border: 1px solid #ccc;
  background-color: white;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}
.btn-primary:disabled {
  background-color: #a0cfff;
  border-color: #a0cfff;
  cursor: not-allowed;
}
</style> 