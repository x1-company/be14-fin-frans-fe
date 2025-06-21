<template>
  <div class="product-list-container">
    <div class="product-list-header">
      <div class="product-list-title">자재 목록</div>
      <div class="product-list-controls">
        <div class="filter-group">
          <select v-model="filterType" class="product-list-select">
            <option value="">자재 분류</option>
            <option v-for="type in typeOptions" :key="type.value" :value="type.value">{{ type.label }}</option>
          </select>
          <select v-model="filterGroup" class="product-list-select">
            <option value="">자재 구분</option>
            <option v-for="group in groupOptions" :key="group.value" :value="group.value">{{ group.label }}</option>
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
            <option value="all">전체</option>
            <option value="name">자재명</option>
            <option value="code">자재코드</option>
            <option value="supplier">공급처명</option>
          </select>
          <input v-model="search" class="product-list-search" :disabled="searchType==='all'" placeholder="검색어를 입력해주세요" @keyup.enter="fetchList" />
          <button class="product-list-search-btn" @click="fetchList">검색</button>
          <button class="product-list-register-btn" @click="goToRegister">
            <Pencil :size="16" color="white" />
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
            <td>
              <router-link
                :to="`/warehouse/product/${item.id}`"
                class="product-link"
                >{{ item.code }}</router-link
              >
            </td>
            <td>{{ item.name }}</td>
            <td>{{ item.spec }}</td>
            <td>{{ item.purchaseUnit }}</td>
            <td>{{ item.unit }}</td>
            <td>{{ groupLabel(item.productGroupId) }}</td>
            <td>{{ typeLabel(item.productTypeId) }}</td>
            <td>{{ attrLabel(item.productAttributeId) }}</td>
            <td>{{ item.supplierName }}</td>
            <td>{{ item.isActive ? 'Y' : 'N' }}</td>
          </tr>
          <tr v-if="list.length === 0">
            <td colspan="11" class="no-data">데이터가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="product-list-pagination">
      <button :disabled="page===1" @click="page--">&lt;</button>
      <button v-for="p in totalPages" :key="p" :class="['page-btn', {active: p===page}]" @click="goPage(p)">{{ p }}</button>
      <button :disabled="page===totalPages" @click="page++">&gt;</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Pencil } from 'lucide-vue-next';
import api from '@/lib/api';

const router = useRouter();
const page = ref(1);
const pageSize = 10;
const total = ref(0);
const list = ref([]);
const search = ref('');
const filterType = ref('');
const filterGroup = ref('');
const filterAttr = ref('');
const filterActive = ref('');
const searchType = ref('all'); // 'all', 'name', 'code', 'supplier'

// === ENUM 매핑 테이블 ===
const PRODUCT_TYPE_MAP = {
  1: '원재료',
  2: '상품',
  3: '저장품',
  4: '소모품',
  5: '시설소모품',
  6: '경품',
  7: '기타',
};
const PRODUCT_GROUP_MAP = { 1: '상온', 2: '냉장', 3: '냉동', 4: '기타' };
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

function goPage(p) {
  if (p < 1 || p > totalPages.value) return;
  page.value = p;
}

function goToRegister() {
  router.push('/warehouse/product/register');
}

async function fetchList() {
  const params = {};
  if (filterType.value) params.productTypeId = Number(filterType.value);
  if (filterGroup.value) params.productGroupId = Number(filterGroup.value);
  if (filterAttr.value) params.productAttributeId = Number(filterAttr.value);
  if (filterActive.value) params.isActive = filterActive.value;
  // 전체
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
  // 검색 타입별 API
  if (!search.value) {
    list.value = [];
    total.value = 0;
    return;
  }
  try {
    let data = [];
    if (searchType.value === 'name') {
      const res = await api.get(`/api/hq/products/name/${encodeURIComponent(search.value)}`);
      data = res.data;
    } else if (searchType.value === 'code') {
      const res = await api.get(`/api/hq/products/code/${encodeURIComponent(search.value)}`);
      data = res.data ? [res.data] : [];
    } else if (searchType.value === 'supplier') {
      const res = await api.get(`/api/hq/products/supplier-name/${encodeURIComponent(search.value)}`);
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
watch([filterType, filterGroup, filterAttr, filterActive], fetchList);

</script>

<style scoped>
.product-list-container {
  position: relative;
  min-height: 800px;
  background: #fff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.03);
  padding: 40px 100px 32px 100px;
  margin-top: 0;
  font-family: 'NanumSquareOTF_acR', 'NanumSquareOTF_acB', 'NanumSquareOTF_acEB', 'NanumSquareOTF_acL', 'Apple SD Gothic Neo', Arial, sans-serif !important;
}
.product-list-header {
  margin-bottom: 18px;
}
.product-list-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #222;
  margin-bottom: 16px;
}
.product-list-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.filter-group,
.search-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.product-list-select {
  height: 32px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 1rem;
  background: #f8f9fa;
  color: #222;
}
.product-list-search {
  height: 32px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 1rem;
  background: #fff;
  color: #222;
  width: 180px;
}
.product-list-search-btn {
  height: 32px;
  background: #4066fa;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0 18px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-left: 2px;
  transition: background 0.2s;
}
.product-list-search-btn:hover {
  background: #3453c7;
}
.product-list-register-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 32px;
  background: #4066fa;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0 18px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-left: 8px;
  transition: background 0.2s;
}
.product-list-register-btn:hover {
  background: #3453c7;
}
.product-list-table-wrapper {
  margin-top: 8px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  background: #fff;
}
.product-list-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 1rem;
  background: #fff;
}
.product-list-table thead {
  background: #f4f6fa;
  font-weight: bold;
}
.product-list-table th, .product-list-table td {
  padding: 12px 16px;
  text-align: center;
  vertical-align: middle;
  border-bottom: 1px solid #e5e7eb;
  font-size: 1rem;
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
  background-color: #f9fafb;
  color: #374151;
  font-weight: 600;
}
.product-list-table td {
  color: #374151;
  height: 49px;
}
.product-list-table tbody tr:last-child td {
  border-bottom: none;
}
.product-link {
  color: #4066fa;
  text-decoration: none;
  cursor: pointer;
  transition: text-decoration 0.2s;
}
.product-link:hover {
  text-decoration: underline;
}
.no-data {
  text-align: center;
  padding: 48px 0;
  color: #6b7280;
}
.product-list-pagination {
  position: absolute;
  bottom: 32px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.page-btn {
  background: #fff;
  border: 1px solid #d1d5db;
  color: #4066fa;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 1rem;
  margin: 0 2px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.page-btn.active, .page-btn:hover {
  background: #4066fa;
  color: #fff;
  border-color: #4066fa;
}
.product-list-pagination button[disabled] {
  opacity: 0.4;
  cursor: not-allowed;
}
.product-list-header, .product-list-title, .product-list-controls, .product-list-select, .product-list-search, .product-list-search-btn, .product-list-register-btn, .product-list-table, .product-list-table th, .product-list-table td, .page-btn {
  font-family: 'NanumSquareOTF_acR', 'NanumSquareOTF_acB', 'NanumSquareOTF_acEB', 'NanumSquareOTF_acL', 'Apple SD Gothic Neo', Arial, sans-serif !important;
}
</style> 