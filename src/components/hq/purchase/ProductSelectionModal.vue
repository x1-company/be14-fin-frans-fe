<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">자재 선택</h2>
        <button class="modal-close-btn" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <div class="controls-grid">
          <div class="filter-group">
            <select v-model="filterType" class="control-select">
              <option value="">자재 분류</option>
              <option v-for="type in typeOptions" :key="type.value" :value="type.value">{{ type.label }}</option>
            </select>
            <select v-model="filterGroup" class="control-select">
              <option value="">자재 구분</option>
              <option v-for="group in groupOptions" :key="group.value" :value="group.value">{{ group.label }}</option>
            </select>
            <select v-model="filterAttr" class="control-select">
              <option value="">자재 속성</option>
              <option v-for="attr in attrOptions" :key="attr.value" :value="attr.value">{{ attr.label }}</option>
            </select>
            <select v-model="filterActive" class="control-select">
              <option value="">사용여부</option>
              <option value="true">Y</option>
              <option value="false">N</option>
            </select>
          </div>
          <div class="search-group">
            <select v-model="searchType" class="control-select" style="min-width:110px">
              <option value="all">전체</option>
              <option value="name">자재명</option>
              <option value="code">자재코드</option>
              <option value="supplier">공급처명</option>
            </select>
            <input v-model="searchQuery" class="search-input" :disabled="searchType==='all'" placeholder="검색어 입력" @keyup.enter="fetchProducts" />
            <button class="search-btn" @click="fetchProducts">검색</button>
          </div>
        </div>

        <div class="table-container">
          <table class="product-table">
            <thead>
              <tr>
                <th style="width: 5%"><input type="checkbox" @change="toggleSelectAll" :checked="isAllSelectedOnPage" /></th>
                <th style="width: 8%">No.</th>
                <th style="width: 15%">자재 코드</th>
                <th style="width: 22%">자재명</th>
                <th style="width: 15%">공급처</th>
                <th style="width: 10%">구매 단가</th>
                <th style="width: 10%">구매 단위</th>
                <th style="width: 15%">규격</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="pagedProducts.length === 0">
                <td colspan="8" class="no-data">해당하는 자재가 없습니다.</td>
              </tr>
              <tr
                v-for="(product, index) in pagedProducts"
                :key="product.id"
                @click="toggleSelection(product)"
                :class="{ 'selected-row': isSelected(product) }"
              >
                <td><input type="checkbox" :checked="isSelected(product)" @click.stop="toggleSelection(product)" /></td>
                <td style="color: #222;">{{ (page - 1) * pageSize + index + 1 }}</td>
                <td style="color: #222;">{{ product.code }}</td>
                <td style="color: #222;">{{ product.name }}</td>
                <td style="color: #222;">{{ product.supplierName }}</td>
                <td class="text-right" style="color: #222;">{{ formatCurrency(product.purchasePrice) }}</td>
                <td style="color: #222;">{{ product.purchaseUnit }}</td>
                <td style="color: #222;">{{ product.spec }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="totalPages > 1" class="pagination">
          <button @click="changePage(page - 1)" :disabled="page <= 1">&lt;</button>
          <button
            v-for="p in totalPages"
            :key="p"
            @click="changePage(p)"
            :class="{ active: p === page }"
          >{{ p }}</button>
          <button @click="changePage(page + 1)" :disabled="page >= totalPages">&gt;</button>
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
import { ref, watch, computed, onMounted } from "vue";
import api from "@/lib/api";
import { PRODUCT_TYPE_MAP, PRODUCT_GROUP_MAP, PRODUCT_ATTRIBUTE_MAP } from '@/enums/hqEnums';
import { useToast } from "@/composables/useToast";

const toast = useToast();

const props = defineProps({
  isVisible: Boolean,
});
const emit = defineEmits(["close", "add-products"]);

const allProducts = ref([]);
const selectedProducts = ref([]);

const page = ref(1);
const pageSize = 10;

const searchQuery = ref("");
const searchType = ref('all');

const filterType = ref('');
const filterGroup = ref('');
const filterAttr = ref('');
const filterActive = ref('');

const typeOptions = computed(() => Object.entries(PRODUCT_TYPE_MAP).map(([value, label]) => ({ value: Number(value), label })));
const groupOptions = computed(() => Object.entries(PRODUCT_GROUP_MAP).map(([value, label]) => ({ value: Number(value), label })));
const attrOptions = computed(() => Object.entries(PRODUCT_ATTRIBUTE_MAP).map(([value, label]) => ({ value: Number(value), label })));

const pagedProducts = computed(() => {
  return allProducts.value.slice((page.value - 1) * pageSize, page.value * pageSize);
});

const totalPages = computed(() => {
  return Math.ceil(allProducts.value.length / pageSize) || 1;
});

async function fetchProducts() {
  page.value = 1;
  try {
    let data = [];
    let response;

    if (searchType.value === 'all') {
      const params = {};
      if (filterType.value) params.productTypeId = Number(filterType.value);
      if (filterGroup.value) params.productGroupId = Number(filterGroup.value);
      if (filterAttr.value) params.productAttributeId = Number(filterAttr.value);
      if (filterActive.value) params.isActive = filterActive.value;
      response = await api.get('/api/hq/products/list', { params });
      data = response.data;
    } else {
      if (!searchQuery.value) {
        allProducts.value = [];
        return;
      }
      if (searchType.value === 'name') {
        response = await api.get(`/api/hq/products/name/${encodeURIComponent(searchQuery.value)}`);
      } else if (searchType.value === 'code') {
        response = await api.get(`/api/hq/products/code/${encodeURIComponent(searchQuery.value)}`);
      } else if (searchType.value === 'supplier') {
        response = await api.get(`/api/hq/products/supplier-name/${encodeURIComponent(searchQuery.value)}`);
      }
      data = response.data ? (Array.isArray(response.data) ? response.data : [response.data]) : [];
    }

    const productsWithPrice = await Promise.all(
      data.map(async (product) => {
        try {
          const detailResponse = await api.get(`/api/hq/products/details/${product.id}`);
          return { ...product, purchasePrice: detailResponse.data.purchasePrice };
        } catch (e) {
          console.error(`Failed to fetch details for product ${product.id}`, e);
          return { ...product, purchasePrice: 0 }; // 상세 정보 실패 시 가격 0으로 설정
        }
      })
    );
    allProducts.value = productsWithPrice;

  } catch (error) {
    console.error("자재 목록을 불러오는 데 실패했습니다.", error);
    toast.error("자재 목록을 불러오는 데 실패했습니다.");
    allProducts.value = [];
  }
}

const isAllSelectedOnPage = computed(() => {
    if (pagedProducts.value.length === 0) return false;
    const pageProductIds = pagedProducts.value.map(p => p.id);
    return pageProductIds.every(id => selectedProducts.value.some(sp => sp.id === id));
});

function toggleSelectAll() {
    const isChecked = isAllSelectedOnPage.value;
    pagedProducts.value.forEach(product => {
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

function changePage(newPage) {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage;
  }
}

function addSelectedProducts() {
  if (selectedProducts.value.length === 0) {
    toast.warning("추가할 자재를 선택해주세요.");
    return;
  }
  emit("add-products", [...selectedProducts.value]);
}

function formatCurrency(value) {
  if (value == null || value === 0) return "-";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '원';
}

onMounted(fetchProducts);

watch([filterType, filterGroup, filterAttr, filterActive], () => {
    fetchProducts();
});

watch(() => props.isVisible, (newVal) => {
    if (newVal) {
      page.value = 1;
      searchQuery.value = "";
      searchType.value = "all";
      filterType.value = "";
      filterGroup.value = "";
      filterAttr.value = "";
      filterActive.value = "";
      selectedProducts.value = [];
      fetchProducts();
    }
  }
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-container {
  width: 70%;
  max-width: 1200px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  color: #222;
}
.modal-header {
  padding: 20px 30px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  color: #222;
}
.modal-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #222;
}
.modal-close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  font-weight: 300;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
}
.modal-body {
  padding: 20px 30px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.controls-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  margin-bottom: 8px;
}
.filter-group, .search-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.control-select, .search-input {
  height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 0.9rem;
  background: #f8f9fa;
  color: #222;
}
.search-input {
  background: #fff;
  width: 200px;
}
.search-btn {
  height: 36px;
  background: #4066fa;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0 18px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
}
.table-container {
  border: 1px solid #e0e7ef;
  border-radius: 8px;
  overflow-x: auto;
}
.product-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  table-layout: fixed;
}
.product-table th, .product-table td {
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.product-table th {
  background: #f8f9fa;
  color: #374151;
  font-weight: 600;
}
.product-table tbody tr:last-child td {
  border-bottom: none;
}
.product-table tbody tr {
  cursor: pointer;
  color: #222;
}
.product-table tbody tr:hover {
  background-color: #f3f4f6;
}
.product-table .selected-row {
  background-color: #eef2ff;
}
.no-data, .text-right {
  text-align: right;
}
input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 12px;
  flex-shrink: 0;
}
.pagination button {
  background: #fff;
  border: 1px solid #d1d5db;
  color: #222;
  padding: 6px 12px;
  margin: 0 4px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 0.9rem;
}
.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.pagination button.active {
  background: #4066fa;
  color: #fff;
  border-color: #4066fa;
}
.modal-footer {
  padding: 20px 30px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.btn-cancel {
  background-color: #e5e7eb;
  color: #374151;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  min-width: 100px;
}
.btn-confirm {
  background-color: #4066fa;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  min-width: 100px;
}
.product-table td {
  color: #374151;
  height: 48px;
}
.product-table td.text-right {
  text-align: right;
}
.product-table tbody tr.selected-row {
  text-align: center;
  padding: 48px 0;
  color: #6b7280;
}
</style> 