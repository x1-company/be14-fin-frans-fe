<template>
  <div class="order-form">
    <!-- 필터 탭 -->
    <div class="order-form__tabs">
      <div
        v-for="(tab, idx) in filterTabs"
        :key="tab"
        :class="['order-form__tab', { active: idx === activeFilterTab }]"
        @click="selectFilterTab(idx)"
      >
        {{ tab }}
        <div v-if="activeFilterTab === idx" class="order-form__tab-indicator"></div>
      </div>
    </div>

    <!-- 검색 및 필터 -->
    <div class="order-form__header">
      <div class="order-form__search-group">
        <select class="search-type-select" v-model="searchType">
          <option value="title">제목</option>
          <option value="code">발주번호</option>
        </select>
        <input
          type="text"
          v-model="searchKeyword"
          placeholder="검색어를 입력해주세요"
          @keyup.enter="onSearch"
        />
        <button @click="onSearch">검색</button>
      </div>
      <button class="register-btn" @click="emit('show-register-view')">발주 등록</button>
    </div>

    <!-- 테이블 -->
    <div class="order-table">
      <div class="order-table-header">
        <div class="col col-no">No</div>
        <div class="col col-code">발주 번호</div>
        <div class="col col-name">제목</div>
        <div class="col col-amount">발주 금액</div>
        <div class="col col-status">발주 상태</div>
        <div class="col col-date">발주 요청일</div>
        <div class="col col-delivery">납기 희망일</div>
      </div>
      <div class="order-table-body">
        <div v-if="props.orders.length === 0" class="empty-message">발주 내역이 없습니다.</div>
        <div 
          v-for="(order, index) in props.orders" 
          :key="order.id" 
          class="order-row"
          @click="emit('show-detail', order.id)"
          style="cursor:pointer;"
        >
          <div class="col col-no">{{ (props.page - 1) * pageSize + index + 1 }}</div>
          <div class="col col-code">
            <a href="#" class="order-link" @click.prevent="emit('show-detail', order.id)">
              {{ order.orderNumber }}
            </a>
          </div>
          <div class="col col-name">{{ order.title }}</div>
          <div class="col col-amount">{{ formatCurrency(order.amount) }}원</div>
          <div class="col col-status">
            <span :class="['order-status', getStatusClass(order.status)]">
              {{ getStatusText(order.status) }}
            </span>
          </div>
          <div class="col col-date">{{ formatDate(order.requestDate) }}</div>
          <div class="col col-delivery">{{ formatDate(order.deliveryDate) }}</div>
        </div>
      </div>
    </div>

    <!-- 페이지네이션 -->
    <div class="order-form__pagination">
      <button class="page-arrow" :disabled="props.page === 1" @click="props.onPageChange(props.page - 1)">&lt;</button>
      <span
        v-for="p in paginationPages"
        :key="p"
        :class="['page-btn', {active: p === props.page, ellipsis: p === '...'}]"
        @click="typeof p === 'number' && props.onPageChange(p)"
      >
        {{ p }}
      </span>
      <button class="page-arrow" :disabled="props.page === totalPages" @click="props.onPageChange(props.page + 1)">&gt;</button>
    </div>
    <div class="order-form__total">총 {{ props.totalCount }}개 항목</div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

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
  // 백엔드 Enum 이름 기준
  switch (status) {
    case 'APPROVED': return 'status-approved';
    case 'REQUEST_PENDING': return 'status-waiting';
    case 'COMPLETED': return 'status-delivered';
    case 'CANCELED': return 'status-canceled';
    case 'REJECTED': return 'status-reject';
    default: return '';
  }
}

function getStatusText(status) {
  // 백엔드 Enum 이름 -> 한글 레이블 변환
  const statusLabels = {
    DRAFT: "임시저장",
    APPROVED: "승인 완료",
    REJECTED: "반려",
    REQUEST_PENDING: "발주 대기",
    CANCELED: "발주 취소",
    COMPLETED: "발주 완료",
  };
  return statusLabels[status] || status;
}
</script>

<style scoped>
.order-form {
  background: #fff;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.03);
  padding: 32px;
}

.order-form__tabs {
  display: flex;
  gap: 50px;
  border-bottom: 1.5px solid #e9ecef;
  margin-top: -30px;
  margin-bottom: 10px;
  padding-left: 10px;
}

.order-form__tab {
  position: relative;
  font-size: 0.9rem;
  color: #888;
  font-weight: 500;
  padding: 4px 0 7px 0;
  cursor: pointer;
  transition: color 0.2s;
}

.order-form__tab.active {
  color: #4066fa;
  font-weight: 700;
}

.order-form__tab-indicator {
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 2px;
  background: #4066fa;
  border-radius: 2px 2px 0 0;
}

.order-form__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}

.order-form__search-group {
  display: flex;
  gap: 5px;
  align-items: center;
}

.order-form__search-group select {
  height: 35px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 0 7px;
  font-size: 0.8rem;
  background: #fff;
}

.order-form__search-group input {
  height: 35px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px 8px;
  font-size: 0.8rem;
  width: 180px;
}

.order-form__search-group button {
  height: 35px;
  background: #4066fa;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.order-form__search-group button:hover {
  background: #2746b6;
}

.register-btn {
  background: #4066fa;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.register-btn:hover {
  background: #2746b6;
}

.order-table {
  border: 1px solid #eef0f4;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

.order-table-header, .order-row {
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.order-table-header {
  background: #f8f9fa;
  color: #495057;
  font-size: 13px;
  font-weight: 500;
  height: 40px;
  border-bottom: 1px solid #eef0f4;
}

.order-table-body {
  min-height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.order-table-body .order-row {
  border-bottom: 1px solid #eef0f4;
}

.order-table-body .order-row:last-child {
  border-bottom: none;
}

.order-row {
  height: 48px;
  font-size: 14px;
  background: #fff;
  transition: background 0.2s;
}

.order-row:hover {
  background: #f8f9fa;
}

.col {
  text-align: center;
  padding: 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-no        { flex-basis: 7%; }
.col-code      { flex-basis: 18%; color: #222; overflow: visible; text-overflow: unset; white-space: nowrap; }
.col-name      { flex-basis: 20%; text-align: center; }
.col-amount    { flex-basis: 15%; text-align: right; }
.col-status    { flex-basis: 15%; }
.col-date      { flex-basis: 12%; }
.col-delivery  { flex-basis: 13%; }

.empty-message {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 40px;
}

.order-link {
  color: #4066fa;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.95rem;
}

.order-status {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.status-reject {
  color: #ff2222;
  background: #ffebeb;
}

.status-waiting {
  background: #fffcc4;
  color: #d97706;
}

.status-canceled {
  background: #ededed;
  color: #6b7280;
}

.status-approved {
  background: #e6f9ed;
  color: #16a34a;
}

.status-delivered {
  background: #e0f0ff;
  color: #2563eb;
}

.order-form__pagination {
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
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

.order-form__total {
  text-align: right;
  color: #888;
  margin-top: 4px;
  font-size: 0.92rem;
}
</style>
