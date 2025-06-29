<template>
  <div class="product-list-container">
    <!-- 헤더 섹션 -->
    <div class="product-list-header">
      <div class="product-list-title">발주 관리</div>
      <div class="product-list-controls">
        <!-- 필터 탭 -->
        <div class="filter-tabs">
          <div
            v-for="(tab, idx) in filterTabs"
            :key="tab"
            :class="['filter-tab', { active: idx === activeFilterTab }]"
            @click="selectFilterTab(idx)"
          >
            {{ tab }}
          </div>
        </div>
        <!-- 검색 및 액션 -->
        <div class="search-group">
          <select v-model="searchType" class="product-list-select" style="min-width:110px">
            <option value="title">제목</option>
            <option value="code">발주번호</option>
          </select>
          <input 
            v-model="searchKeyword" 
            class="product-list-search" 
            placeholder="검색어를 입력해주세요" 
            @keyup.enter="onSearch" 
          />
          <button class="product-list-search-btn" @click="onSearch">검색</button>
          <button class="product-list-register-btn" @click="emit('show-register-view')">
            <Pencil :size="16" color="white" />
            <span>발주 등록</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 테이블 -->
    <div class="product-list-table-wrapper">
      <table class="product-list-table">
        <thead>
          <tr>
            <th style="width: 6%">No.</th>
            <th style="width: 16%">발주 번호</th>
            <th style="width: 20%">제목</th>
            <th style="width: 14%">발주 금액</th>
            <th style="width: 12%">발주 상태</th>
            <th style="width: 16%">발주 요청일</th>
            <th style="width: 16%">납기 희망일</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="props.orders.length === 0">
            <td colspan="7" class="no-data">발주 내역이 없습니다.</td>
          </tr>
          <tr 
            v-for="(order, index) in props.orders" 
            :key="order.id"
            @click="emit('show-detail', order.id)"
            style="cursor:pointer;"
          >
            <td>{{ (props.page - 1) * pageSize + index + 1 }}</td>
            <td>
              <a 
                href="#" 
                class="product-link" 
                @click.prevent="emit('show-detail', order.id)"
              >
                {{ order.orderNumber }}
              </a>
            </td>
            <td style="text-align: left;">{{ order.title }}</td>
            <td style="text-align: right;">{{ formatCurrency(order.amount) }}원</td>
            <td>
              <span :class="['status-badge', getStatusClass(order.status)]">
                {{ getStatusText(order.status) }}
              </span>
            </td>
            <td>{{ formatDate(order.requestDate) }}</td>
            <td>{{ formatDate(order.deliveryDate) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 페이지네이션 -->
    <div class="product-list-pagination">
      <button :disabled="props.page === 1" @click="props.onPageChange(props.page - 1)">&lt;</button>
      <button 
        v-for="p in paginationPages" 
        :key="p" 
        :class="['page-btn', {active: p === props.page, ellipsis: p === '...'}]" 
        @click="typeof p === 'number' && props.onPageChange(p)"
      >
        {{ p }}
      </button>
      <button :disabled="props.page === totalPages" @click="props.onPageChange(props.page + 1)">&gt;</button>
    </div>
    
    <!-- 총 개수 표시 -->
    <div class="total-count">총 {{ props.totalCount }}개 항목</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { Pencil } from 'lucide-vue-next';

const props = defineProps({
  orders: {
    type: Array,
    default: () => []
  },
  filterTabs: {
    type: Array,
    default: () => ['전체', '진행중인 발주 목록', '완료된 발주 목록']
  },
  activeFilterTab: {
    type: Number,
    default: 0
  },
  onFilterTabChange: {
    type: Function,
    default: () => {}
  },
  page: {
    type: Number,
    default: 1
  },
  totalCount: {
    type: Number,
    default: 0
  },
  onPageChange: {
    type: Function,
    default: () => {}
  }
});

const emit = defineEmits(['show-register-view', 'show-detail', 'search']);

const pageSize = 10;
const totalPages = computed(() => Math.ceil(props.totalCount / pageSize) || 1);
const paginationPages = computed(() => {
  const pages = [];
  const current = props.page;
  const total = totalPages.value;
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      pages.push('...');
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    }
  }
  return pages;
});

const searchType = ref('title');
const searchKeyword = ref('');

function selectFilterTab(index) {
  props.onFilterTabChange(index);
}

function onSearch() {
  emit('search', { type: searchType.value, keyword: searchKeyword.value });
}

function formatCurrency(value) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatDate(dateString) {
  return dateString;
}

function getStatusClass(status) {
  switch (status) {
    case 'DRAFT':
    case '임시저장':
      return 'status-draft';
    case 'APPROVED':
    case '승인 완료':
      return 'status-approved';
    case 'REJECTED':
    case '반려':
      return 'status-rejected';
    case 'REQUEST_PENDING':
    case '발주 대기':
      return 'status-pending';
    case 'CANCELED':
    case '발주 취소':
      return 'status-canceled';
    default:
      return '';
  }
}

function getStatusText(status) {
  const statusLabels = {
    DRAFT: "임시저장",
    APPROVED: "승인 완료",
    REJECTED: "반려", 
    REQUEST_PENDING: "발주 대기",
    CANCELED: "발주 취소"
  };
  return statusLabels[status] || status;
}
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
  gap: 20px;
}

/* 필터 탭 */
.filter-tabs {
  display: flex;
  gap: 30px;
}

.filter-tab {
  position: relative;
  font-size: 1rem;
  color: #888;
  font-weight: 500;
  padding: 8px 0;
  cursor: pointer;
  transition: color 0.2s;
  border-bottom: 2px solid transparent;
}

.filter-tab.active {
  color: #4066fa;
  font-weight: 700;
  border-bottom-color: #4066fa;
}

.filter-tab:hover {
  color: #4066fa;
}

/* 검색 그룹 */
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

/* 테이블 */
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

.product-list-table th, 
.product-list-table td {
  padding: 12px 16px;
  text-align: center;
  vertical-align: middle;
  border-bottom: 1px solid #e5e7eb;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.product-list-table tbody tr:hover {
  background-color: #f8f9fa;
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

/* 상태 배지 */
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-pending {
  background: #fffcc4;
  color: #d97706;
}

.status-canceled {
  background: #ededed;
  color: #6b7280;
}

.status-rejected {
  background: #ffebeb;
  color: #ff2222;
}

.status-approved {
  background: #e6f9ed;
  color: #16a34a;
}

.status-draft {
  background: #f3f4f6;
  color: #6b7280;
}

.no-data {
  text-align: center;
  padding: 48px 0;
  color: #6b7280;
}

/* 페이지네이션 */
.product-list-pagination {
  position: absolute;
  bottom: 60px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin: 10px 0;
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

.product-list-pagination button {
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

.product-list-pagination button[disabled] {
  background: #e2e4ea;
  color: #bdbdbd;
  cursor: not-allowed;
}

/* 총 개수 */
.total-count {
  position: absolute;
  bottom: 32px;
  right: 100px;
  color: #888;
  font-size: 0.92rem;
}

/* 폰트 패밀리 적용 */
.product-list-header, 
.product-list-title, 
.product-list-controls, 
.product-list-select, 
.product-list-search, 
.product-list-search-btn, 
.product-list-register-btn, 
.product-list-table, 
.product-list-table th, 
.product-list-table td, 
.page-btn {
  font-family: 'NanumSquareOTF_acR', 'NanumSquareOTF_acB', 'NanumSquareOTF_acEB', 'NanumSquareOTF_acL', 'Apple SD Gothic Neo', Arial, sans-serif !important;
}
</style>
