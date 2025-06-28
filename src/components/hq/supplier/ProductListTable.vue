<template>
  <div class="product-list-container">
    <div class="product-list-header">
      <div class="product-list-title">자재 목록</div>
      <div class="product-list-controls">
        <div class="filter-group">
          <select v-model="filterGroup" class="product-list-select">
            <option value="">자재 분류</option>
            <option v-for="group in groupOptions" :key="group.value" :value="group.value">{{ group.label }}</option>
          </select>
          <select v-model="filterType" class="product-list-select">
            <option value="">자재 구분</option>
            <option v-for="type in typeOptions" :key="type.value" :value="type.value">{{ type.label }}</option>
          </select>
          <select v-model="filterAttr" class="product-list-select">
            <option value="">자재 속성</option>
            <option v-for="attr in attrOptions" :key="attr.value" :value="attr.value">{{ attr.label }}</option>
          </select>
          <select v-model="filterActive" class="product-list-select">
            <option value="">자재 사용여부</option>
            <option value="true">Y</option>
            <option value="false">N</option>
          </select>
        </div>
        <div class="search-group">
          <select v-model="searchType" class="product-list-select" style="min-width:110px">
            <option value="all">검색 조건</option>
            <option value="name">자재명</option>
            <option value="code">자재코드</option>
            <option value="supplier">공급처명</option>
          </select>
          <input v-model="search" class="product-list-search" :disabled="searchType==='all'" placeholder="검색어를 입력해주세요" @keyup.enter="fetchList" />
          <button class="product-list-search-btn" @click="fetchList">검색</button>
          <button class="product-list-reset-btn" @click="resetFilters">초기화</button>
          <button class="product-list-register-btn" @click="goToRegister">
            <span>등록</span>
          </button>
        </div>
      </div>
    </div>
    <div class="product-list-table-wrapper">
      <table class="product-list-table">
        <thead>
          <tr>
            <th style="width: 4%">No.</th>
            <th style="width: 14%">자재 번호</th>
            <th style="width: 14%">자재명</th>
            <th style="width: 10%">규격</th>
            <th style="width: 8%">구매 단위</th>
            <th style="width: 8%">재고단위</th>
            <th style="width: 8%">자재 분류</th>
            <th style="width: 8%">자재 구분</th>
            <th style="width: 8%">자재 속성</th>
            <th style="width: 10%">공급처</th>
            <th style="width: 8%">사용여부</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in pagedList" :key="item.id">
            <td>{{ (page - 1) * pageSize + idx + 1 }}</td>
            <td><span class="product-code">{{ item.code }}</span></td>
            <td>{{ item.name }}</td>
            <td>{{ item.spec }}</td>
            <td>{{ item.purchaseUnit }}</td>
            <td>{{ item.unit }}</td>
            <td><span class="badge blue">{{ groupLabel(item.productGroupId) }}</span></td>
            <td><span class="badge purple">{{ typeLabel(item.productTypeId) }}</span></td>
            <td><span class="badge green">{{ attrLabel(item.productAttributeId) }}</span></td>
            <td>{{ item.supplierName }}</td>
            <td>{{ item.isActive ? 'Y' : 'N' }}</td>
          </tr>
          <tr v-if="list.length === 0">
            <td colspan="11" class="no-data">자재 내역이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="product-list-bottom">
      <div class="pagination">
        <button class="page-arrow" :disabled="page===1" @click="page--">&lt;</button>
        <span
          v-for="p in paginationPages"
          :key="p"
          :class="['page-btn', {active: p === page, ellipsis: p === '...'}]"
          @click="typeof p === 'number' && goPage(p)"
        >
          {{ p }}
        </span>
        <button class="page-arrow" :disabled="page===totalPages" @click="page++">&gt;</button>
      </div>
      <div class="order-form__total">총 {{ total }}개 항목</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/lib/api';

const props = defineProps({
  supplierId: {
    type: [String, Number],
    default: null,
  },
});
const emit = defineEmits(['show-register']);

const page = ref(1);
const pageSize = 10;
const total = ref(0);
const list = ref([]);
const search = ref('');
const filterType = ref('');
const filterGroup = ref('');
const filterAttr = ref('');
const filterActive = ref('');
const searchType = ref('all');

const PRODUCT_GROUP_MAP = { 1: '상온', 2: '냉장', 3: '냉동', 4: '기타' };
const PRODUCT_TYPE_MAP = {
  1: '원재료',
  2: '상품',
  3: '저장품',
  4: '소모품',
  5: '시설소모품',
  6: '경품',
  7: '기타',
};
const PRODUCT_ATTRIBUTE_MAP = {
  1: '신선식품',
  2: '비신선식품',
  3: '비식품',
};

const typeOptions = Object.entries(PRODUCT_TYPE_MAP).map(([value, label]) => ({ value: Number(value), label }));
const groupOptions = Object.entries(PRODUCT_GROUP_MAP).map(([value, label]) => ({ value: Number(value), label }));
const attrOptions = Object.entries(PRODUCT_ATTRIBUTE_MAP).map(([value, label]) => ({ value: Number(value), label }));

function typeLabel(val) {
  return PRODUCT_TYPE_MAP[val] || val;
}
function groupLabel(val) {
  return PRODUCT_GROUP_MAP[val] || val;
}
function attrLabel(val) {
  return PRODUCT_ATTRIBUTE_MAP[val] || val;
}

const pagedList = computed(() => {
  return list.value.slice((page.value - 1) * pageSize, page.value * pageSize);
});

const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1);

const paginationPages = computed(() => {
  const pages = [];
  const current = page.value;
  const totalP = totalPages.value;
  if (totalP <= 7) {
    for (let i = 1; i <= totalP; i++) pages.push(i);
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(totalP);
    } else if (current >= totalP - 3) {
      pages.push(1);
      pages.push('...');
      for (let i = totalP - 4; i <= totalP; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(totalP);
    }
  }
  return pages;
});

function goPage(p) {
  if (typeof p !== 'number' || p < 1 || p > totalPages.value) return;
  page.value = p;
}

function goToRegister() {
  emit('show-register');
}

function resetFilters() {
  filterType.value = '';
  filterGroup.value = '';
  filterAttr.value = '';
  filterActive.value = '';
  searchType.value = 'all';
  search.value = '';
  fetchList();
}

async function fetchList() {
  const params = {};
  if (props.supplierId) params.supplierId = props.supplierId;
  if (filterType.value) params.productTypeId = Number(filterType.value);
  if (filterGroup.value) params.productGroupId = Number(filterGroup.value);
  if (filterAttr.value) params.productAttributeId = Number(filterAttr.value);
  if (filterActive.value) params.isActive = filterActive.value;
  if (searchType.value === 'all') {
    try {
      const { data } = await api.get('/api/hq/products/list', { params });
      list.value = data;
      total.value = data.length;
      page.value = 1;
    } catch (e) {
      list.value = [];
      total.value = 0;
    }
    return;
  }
  if (!search.value) {
    list.value = [];
    total.value = 0;
    return;
  }
  try {
    let data = [];
    if (searchType.value === 'name') {
      const res = await api.get(`/api/hq/products/name/${encodeURIComponent(search.value)}`, { params });
      data = res.data;
    } else if (searchType.value === 'code') {
      const res = await api.get(`/api/hq/products/code/${encodeURIComponent(search.value)}`, { params });
      data = res.data ? [res.data] : [];
    } else if (searchType.value === 'supplier') {
      const res = await api.get(`/api/hq/products/supplier-name/${encodeURIComponent(search.value)}`, { params });
      data = res.data;
    }
    list.value = data;
    total.value = data.length;
    page.value = 1;
  } catch (e) {
    list.value = [];
    total.value = 0;
  }
}

onMounted(fetchList);
watch([
  () => props.supplierId,
  filterType, filterGroup, filterAttr, filterActive
], fetchList);
</script>

<style scoped>
.product-list-container {
  background: #fff;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.03);
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
}
.product-list-header {
  margin-bottom: 18px;
}
.product-list-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #222;
  margin-bottom: 16px;
}
.product-list-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}
.filter-group,
.search-group {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.product-list-select {
  height: 35px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 0 10px;
  font-size: 0.9rem;
  background: #f8f9fa;
  color: #222;
}
.product-list-search {
  height: 35px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 0 10px;
  font-size: 0.9rem;
  background: #fff;
  color: #222;
  width: 180px;
}
.product-list-search-btn {
  height: 28px;
  background: #4066fa;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  margin-left: 2px;
  transition: background 0.2s;
}
.product-list-search-btn:hover {
  background: #2746b6;
}
.product-list-reset-btn {
  height: 28px;
  background: #e9ecef;
  color: #4066fa;
  border: none;
  border-radius: 6px;
  padding: 0 10px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  margin-left: 2px;
  transition: background 0.2s, color 0.2s;
}
.product-list-reset-btn:hover {
  background: #d0d7e6;
  color: #3453c7;
}
.product-list-register-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 28px;
  background: #4066fa;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  margin-left: 8px;
  transition: background 0.2s;
}
.product-list-register-btn:hover {
  background: #2746b6;
}
.product-list-table-wrapper {
  margin-top: 8px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #eef0f4;
  background: #fff;
  width: 100%;
}
.product-list-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  background: #fff;
  table-layout: auto;
}
.product-list-table thead {
  background: #f8f9fa;
  font-weight: bold;
}
.product-list-table th, .product-list-table td {
  padding: 12px 16px;
  text-align: center;
  vertical-align: middle;
  border-bottom: 1px solid #f1f3f4;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.product-list-table th:nth-child(2),
.product-list-table td:nth-child(2),
.product-list-table th:nth-child(3),
.product-list-table td:nth-child(3) {
  text-align: left;
}
.product-list-table th {
  background-color: #f8f9fa;
  color: #495057;
  font-weight: 600;
  text-align: center;
}
.product-list-table td {
  color: #212529;
  height: 44px;
}
.product-list-table tbody tr:last-child td {
  border-bottom: none;
}
.no-data {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-style: italic;
}
.product-list-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 18px;
  position: relative;
}
.pagination {
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
}
.order-form__total {
  color: #888;
  font-size: 0.92rem;
  text-align: right;
  min-width: 120px;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}
.page-btn {
  min-width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e2e4ea;
  background: #fff;
  color: #222;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border 0.2s, color 0.2s;
  user-select: none;
}
.page-btn.active {
  border: 2px solid #6c47ff;
  color: #6c47ff;
  font-weight: 700;
  background: #f8f6ff;
}
.page-btn.ellipsis {
  cursor: default;
  color: #bdbdbd;
  border: none;
  background: transparent;
  pointer-events: none;
}
.page-arrow {
  min-width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e2e4ea;
  background: #f5f6fa;
  color: #bdbdbd;
  font-size: 1.05rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.page-arrow:disabled {
  background: #e2e4ea;
  color: #bdbdbd;
  cursor: not-allowed;
}
.badge {
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 12px;
  font-weight: 700;
  display: inline-block;
}
.badge.blue {
  background: #e0f0ff;
  color: #2563eb;
}
.badge.purple {
  background: #f3e8ff;
  color: #9333ea;
}
.badge.green {
  background: #e6f9ed;
  color: #16a34a;
}
.product-code {
  color: #4066fa !important;
  font-weight: 500;
}
</style> 