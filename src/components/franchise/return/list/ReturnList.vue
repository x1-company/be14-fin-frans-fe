<template>
  <div class="return-form">
    <!-- 상단 탭 UI -->
    <div class="return-form__tabs" v-if="!showReturnRegister">
      <div
        v-for="(tab, idx) in tabs"
        :key="tab.value"
        :class="['return-form__tab', { active: activeTab === idx }]"
        @click="selectTab(idx)"
      >
        {{ tab.label }}
        <div v-if="activeTab === idx" class="return-form__tab-indicator"></div>
      </div>
    </div>
    
    <!-- 검색창 및 필터 -->
    <div v-if="!showReturnRegister" class="return-form__header">
      <div class="return-form__search-group">
        <Datepicker
          v-model="searchDate"
          :format="'yyyy-MM-dd'"
          placeholder="반품 날짜 범위 선택"
          :clearable="true"
          input-class-name="custom-datepicker-input"
          style="width: 270px"
          locale="ko"
          :enable-time-picker="false"
          auto-apply
          range
        />
        <input v-model="search" placeholder="검색어를 입력해주세요" />
        <select v-model="filter">
          <option value="product">품목명</option>
          <option value="code">반품 번호</option>
        </select>
      </div>
      <ReturnRegisterButton @click="showReturnRegister = true" />
    </div>

    <!-- 반품 등록 컴포넌트 -->
    <ReturnRegister 
      v-if="showReturnRegister" 
      @back-to-list="handleBackToList" 
    />

    <!-- 반품 목록 테이블 -->
    <div v-else class="return-table">
      <div class="return-table-header">
        <div class="col col-no">No.</div>
        <div class="col col-code">반품 번호</div>
        <div class="col col-name">품목명</div>
        <div class="col col-status">반품 상태</div>
        <div class="col col-date">반품일</div>
        <div class="col col-amount">총 반품 금액</div>
        <div class="col col-franchise">가맹점 명</div>
      </div>
      <div class="return-table-body">
        <div v-if="returns.length === 0" class="empty-message">반품 내역이 없습니다.</div>
        <div v-for="(returnItem, idx) in returns" :key="returnItem.id" class="return-row">
          <div class="col col-no">{{ idx + 1 + (page-1)*pageSize }}</div>
          <div class="col col-code">
            <a href="#" class="return-link" @click.prevent="showReturnDetail(returnItem.id)">
              {{ returnItem.code }}
            </a>
          </div>
          <div class="col col-name">{{ formatproductSummary(returnItem.productSummary) }}</div>
          <div class="col col-status">
            <span :class="['return-status', returnStatusClass(returnItem.status)]">
              {{ statusText(returnItem.status) }}
            </span>
          </div>
          <div class="col col-date">{{ returnItem.createdAt.slice(0, 10) }}</div>
          <div class="col col-amount">{{ returnItem.totalAmount.toLocaleString() }}원</div>
          <div class="col col-franchise">{{ returnItem.franchiseName }}</div>
        </div>
      </div>
    </div>

    <div v-if="!showReturnRegister" class="return-form__pagination">
      <button class="page-arrow" :disabled="page === 1" @click="page--">&lt;</button>
      <span
        v-for="p in paginationPages"
        :key="p"
        :class="['page-btn', {active: p === page, ellipsis: p === '...'}]"
        @click="typeof p === 'number' && (page = p)"
      >
        {{ p }}
      </span>
      <button class="page-arrow" :disabled="page === totalPages" @click="page++">&gt;</button>
    </div>
    <div v-if="!showReturnRegister" class="return-form__total">총 {{ totalCount }}개 항목</div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import api from '@/lib/api';
import ReturnRegisterButton from './ReturnRegisterButton.vue';
import ReturnRegister from './ReturnRegister.vue';

const props = defineProps({
  franchiseId: [String, Number],
  selectedFranchiseId: [String, Number],
});

const emit = defineEmits(['show-return-detail']);

const returns = ref([]);
const search = ref('');
const searchDate = ref(null);
const filter = ref('product');
const page = ref(1);
const pageSize = 10;
const totalPages = ref(1);
const totalCount = ref(0);
const loading = ref(false);
const showReturnRegister = ref(false);

const tabs = [
  { label: '전체', value: 'all' },
  { label: '승인 대기중인 반품 목록', value: 'pending' },
  { label: '진행중인 반품 목록', value: 'progress' },
  { label: '완료된 반품 목록', value: 'complete' },
];
const activeTab = ref(0);

function selectTab(idx) {
  activeTab.value = idx;
  page.value = 1;
  fetchReturns();
}

// 반품 등록 완료 후 목록으로 돌아갈 때 호출되는 함수
function handleBackToList() {
  showReturnRegister.value = false;
  // 반품 목록 새로고침
  fetchReturns();
}

function statusText(status) {
  switch (status) {
    case 'WAITING_FOR_RECEIPT': return '접수 대기';
    case 'RECEIPT_CANCELED': return '접수 취소';
    case 'REJECTED': return '반려';
    case 'REVIEWING': return '검토 중';
    case 'REVIEW_COMPLETED': return '검토 완료';
    case 'APPROVED': return '결재 완료';
    case 'PICKING_UP': return '수거 중';
    case 'PICKED_UP': return '수거 완료';
    case 'COMPLETED': return '반품 완료';
    default: return status;
  }
}

function returnStatusClass(status) {
  switch (status) {
    case 'WAITING_FOR_RECEIPT': return 'status-waiting';
    case 'RECEIPT_CANCELED': return 'status-canceled';
    case 'REJECTED': return 'status-reject';
    case 'REVIEWING': return 'status-reviewing';
    case 'REVIEW_COMPLETED': return 'status-reviewed';
    case 'APPROVED': return 'status-approved';
    case 'PICKING_UP': return 'status-picking';
    case 'PICKED_UP': return 'status-picked';
    case 'COMPLETED': return 'status-completed';
    default: return '';
  }
}

// 날짜 포맷 함수
function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = (`0${date.getMonth() + 1}`).slice(-2);
  const day = (`0${date.getDate()}`).slice(-2);
  return `${year}-${month}-${day}`;
}

async function fetchReturns() {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    params.append('page', page.value);
    params.append('size', pageSize);
    if (props.selectedFranchiseId) {
      params.append('franchiseId', props.selectedFranchiseId);
    }

    // 날짜 필터
    if (searchDate.value && searchDate.value.length === 2) {
      const [start, end] = searchDate.value;
      if (start) params.append('startDate', formatDateToYYYYMMDD(start));
      if (end) params.append('endDate', formatDateToYYYYMMDD(end));
    }

    // 검색어 필터
    if (search.value) {
      if (filter.value === 'code') {
        params.append('code', search.value);
      } else if (filter.value === 'product') {
        params.append('product', search.value);
      }
    }

    // 상태 필터 (탭)
    const tab = tabs[activeTab.value].value;
    const statusMap = {
      pending: ['WAITING_FOR_RECEIPT'],
      progress: ['REVIEW_COMPLETED', 'APPROVED', 'PICKING_UP', 'PICKED_UP'],
      complete: ['COMPLETED', 'REJECTED'],
    };
    if (statusMap[tab]) {
      statusMap[tab].forEach(s => params.append('statusList', s));
    }

    const { data } = await api.get('/api/franchise/return', { params });
    
    returns.value = data.list || [];
    totalPages.value = data.totalPages || 1;
    totalCount.value = data.totalCount || 0;
  } catch (error) {
    console.error('Error fetching returns:', error);
    returns.value = [];
    totalPages.value = 1;
    totalCount.value = 0;
  } finally {
    loading.value = false;
  }
}

watch([search, searchDate, filter], () => {
  page.value = 1;
  fetchReturns();
});

watch(page, fetchReturns);
onMounted(fetchReturns);

const showReturnDetail = (returnId) => {
  emit('show-return-detail', returnId);
}

// 페이지네이션 번호 계산
const paginationPages = computed(() => {
  const pages = [];
  if (totalPages.value <= 7) {
    for (let i = 1; i <= totalPages.value; i++) pages.push(i);
  } else {
    if (page.value <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages.value);
    } else if (page.value >= totalPages.value - 3) {
      pages.push(1, '...', totalPages.value - 4, totalPages.value - 3, totalPages.value - 2, totalPages.value - 1, totalPages.value);
    } else {
      pages.push(1, '...', page.value - 1, page.value, page.value + 1, '...', totalPages.value);
    }
  }
  return pages;
});

const formatproductSummary = (text) => {
  const match = text.match(/^(.+?) 외 0건$/);
  if (match) {
    return match[1]; // "자재1"만 반환
  }
  return text; // 나머지는 원본 그대로 반환
}
</script>

<style scoped>
.return-form {
  background: #fff;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.03);
  padding: 32px;
}
.return-form__tabs {
  display: flex;
  gap: 50px;
  border-bottom: 1.5px solid #e9ecef;
  margin-top: -30px;
  margin-bottom: 10px;
  padding-left: 10px;
}
.return-form__tab {
  position: relative;
  font-size: 0.9rem;
  color: #888;
  font-weight: 500;
  padding: 4px 0 7px 0;
  cursor: pointer;
  transition: color 0.2s;
}
.return-form__tab.active {
  color: #4066fa;
  font-weight: 700;
}
.return-form__tab-indicator {
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 2px;
  background: #4066fa;
  border-radius: 2px 2px 0 0;
}
.return-form__header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}
.return-form__search-group {
  display: flex;
  gap: 5px;
  align-items: center;
}
.return-form__search-group input {
  height: 35px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px 8px;
  font-size: 0.8rem;
  width: 180px;
}
.return-form__search-group select {
  height: 35px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 0 7px;
  font-size: 0.8rem;
  background: #fff;
}
.return-table {
  border: 1px solid #eef0f4;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}
.return-table-header, .return-row {
  display: flex;
  align-items: center;
  padding: 0 16px;
}
.return-table-header {
  background: #f8f9fa;
  color: #495057;
  font-size: 13px;
  font-weight: 500;
  height: 40px;
  border-bottom: 1px solid #eef0f4;
}
.return-table-body .return-row {
  border-bottom: 1px solid #eef0f4;
}
.return-table-body .return-row:last-child {
  border-bottom: none;
}
.return-row {
  height: 48px;
  font-size: 14px;
  background: #fff;
  transition: background 0.2s;
}
.return-row:hover {
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
.col-code      { flex-basis: 20%; color: #222; font-family: monospace; overflow: visible; text-overflow: unset; white-space: nowrap; }
.col-name      { flex-basis: 25%; text-align: center; font-weight: 500; }
.col-status    { flex-basis: 15%; }
.col-date      { flex-basis: 15%; }
.col-amount    { flex-basis: 15%; text-align: right; font-weight: 500; }
.col-franchise { flex-basis: 20%; }
.empty-message {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 40px;
}
.return-link {
  color: #4066fa;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.95rem;
}
.return-status {
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
.status-reviewing {
  background: #f3e8ff;
  color: #9333ea;
}
.status-reviewed {
  color: #179a2b;
  background: #e6ffe6;
}
.status-approved {
  background: #e6f9ed;
  color: #16a34a;
}
.status-picking,
.status-picked {
  background: #fff3e0;
  color: #ef6c00;
}
.status-completed {
  background: #e0f0ff;
  color: #2563eb;
}
.return-form__pagination {
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
.return-form__total {
  text-align: right;
  color: #888;
  margin-top: 4px;
  font-size: 0.92rem;
}
.custom-datepicker-input {
  height: 22px !important;
  font-size: 0.8rem !important;
  padding: 0 5px !important;
  width: 90px !important;
  border-radius: 5px !important;
  text-align: right !important;
}
.custom-datepicker-input:focus {
  outline: none !important;
  box-shadow: none !important;
}
</style>