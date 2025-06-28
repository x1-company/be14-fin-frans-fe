<template>
  <div v-if="isVisible" class="modal-overlay" @click="$emit('close')">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">자재 선택</h2>
        <button class="modal-close-btn" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <div class="table-container">
          <table class="product-table">
            <thead>
              <tr>
                <th style="width: 5%"><input type="checkbox" @change="toggleSelectAll" :checked="isAllSelectedOnPage" /></th>
                <th style="width: 5%">No.</th>
                <th style="width: 10%">자재 코드</th>
                <th style="width: 15%">자재명</th>
                <th style="width: 10%">구매 단가</th>
                <th style="width: 10%">구매 단위</th>
                <th style="width: 10%">자재 구분</th>
                <th style="width: 10%">자재 분류</th>
                <th style="width: 10%">자재 속성</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="products.length === 0">
                <td colspan="9" class="no-data">해당 공급처의 자재가 없습니다.</td>
              </tr>
              <tr
                v-for="(product, index) in products"
                :key="product.id"
                @click="toggleSelection(product)"
                :class="{ 'selected-row': isSelected(product) }"
              >
                <td><input type="checkbox" :checked="isSelected(product)" @click.stop="toggleSelection(product)" /></td>
                <td>{{ index + 1 }}</td>
                <td>{{ product.code }}</td>
                <td>{{ product.name }}</td>
                <td class="text-right">{{ formatCurrency(product.purchasePrice) }}</td>
                <td>{{ product.purchaseUnit }}</td>
                <td>{{ product.productTypeName }}</td>
                <td>{{ product.productGroupName }}</td>
                <td>{{ product.productAttributeName }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">취소</button>
        <button class="btn-confirm" @click="addSelectedProducts">추가</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import api from "@/lib/api";

const props = defineProps({
  isVisible: Boolean,
  supplierId: {
    type: Number,
    required: true,
  }
});
const emit = defineEmits(["close", "add-products"]);

const products = ref([]);
const selectedProducts = ref([]);

async function fetchProductsBySupplier(id) {
  if (!id) {
    products.value = [];
    return;
  }
  try {
    // NOTE: This endpoint needs to be implemented in the backend.
    // It should return a list of products for a given supplier.
    const response = await api.get(`/api/hq/products/list-by-supplier/${id}`);
    products.value = response.data || [];
  } catch (error) {
    console.error(`Failed to fetch products for supplier ${id}:`, error);
    products.value = [];
    alert('공급처의 자재 목록을 불러오는 데 실패했습니다.');
  }
}

watch(() => props.supplierId, (newId) => {
  if (props.isVisible) {
    fetchProductsBySupplier(newId);
  }
}, { immediate: true });

watch(() => props.isVisible, (newVal) => {
    if (newVal && props.supplierId) {
        selectedProducts.value = [];
        fetchProductsBySupplier(props.supplierId);
    }
});

const isAllSelectedOnPage = computed(() => {
    if (products.value.length === 0) return false;
    const pageProductIds = products.value.map(p => p.id);
    return pageProductIds.every(id => selectedProducts.value.some(sp => sp.id === id));
});

function toggleSelectAll() {
    const isChecked = isAllSelectedOnPage.value;
    products.value.forEach(product => {
        const index = selectedProducts.value.findIndex(p => p.id === product.id);
        if (!isChecked && index === -1) {
            selectedProducts.value.push(product);
        } else if (isChecked && index !== -1) {
            selectedProducts.value.splice(index, 1);
        }
    });
}

function isSelected(product) {
  return selectedProducts.value.some((p) => p.id === product.id);
}

function toggleSelection(product) {
  const index = selectedProducts.value.findIndex(p => p.id === product.id);
  if (index === -1) {
    selectedProducts.value.push(product);
  } else {
    selectedProducts.value.splice(index, 1);
  }
}

function addSelectedProducts() {
  if (selectedProducts.value.length === 0) {
    alert("추가할 자재를 선택해주세요.");
    return;
  }
  emit("add-products", [...selectedProducts.value]);
  emit("close");
}

function formatCurrency(value) {
  if (value == null || value === 0) return "-";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '원';
}
</script>

<style scoped>
/* Styles are copied from ProductSelectionModal and can be adjusted if needed */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-container {
  background: white;
  border-radius: 8px;
  width: 80%;
  max-width: 1000px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}
.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
}
.modal-close-btn {
  border: none;
  background: none;
  font-size: 1.75rem;
  cursor: pointer;
  color: #6c757d;
}
.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}
.table-container {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  overflow: hidden;
}
.product-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}
.product-table th, .product-table td {
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}
.product-table thead {
  background-color: #f8f9fa;
}
.product-table tbody tr:hover {
  background-color: #f1f3f5;
}
.selected-row {
  background-color: #e3e8ff !important;
}
.no-data {
  text-align: center;
  padding: 48px;
  color: #6c757d;
}
.text-right {
  text-align: right;
}
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.btn-cancel, .btn-confirm {
  padding: 10px 20px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  font-size: 1rem;
  cursor: pointer;
}
.btn-confirm {
  background-color: #4066fa;
  color: white;
  border-color: #4066fa;
}
</style> 