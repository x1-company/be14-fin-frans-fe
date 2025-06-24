<template>
  <div class="return-form">
    <!-- 상단 탭 UI (반품 상태별 필터 등 필요시) -->
    <div class="return-form__tabs">
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
    <div class="return-form__header">
      <div class="return-form__search-group">
        <input v-model="search" placeholder="검색어를 입력해주세요" />
        <select v-model="filter">
          <option value="returnNo">반품 번호</option>
          <option value="itemName">품목명</option>
        </select>
      </div>
    </div>
    <div class="return-form__table-wrapper">
      <table class="return-form__table">
        <thead>
          <tr>
            <th>No.</th>
            <th>반품 번호</th>
            <th>품목명</th>
            <th>반품 상태</th>
            <th>반품일</th>
            <th>총 반품 금액</th>
            <th>가맹점 명</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(ret, idx) in returns" :key="ret.id">
            <td>{{ idx + 1 + (page-1)*pageSize }}</td>
            <td>
              <span 
                @click="handleReturnClick(ret.id)" 
                @cilck.stop = "handleReturnClick(ret.id)" 
                class="return-link"
                :data-return-id="ret.id"
                style="cursor: pointer; color: #4066fa; text-decoration: underline;"
              >
                {{ ret.code }}
              </span>
            </td>
            <td>{{ ret.productSummary }}</td>
            <td><span :class="['return-status', returnStatusClass(ret.status)]">{{ statusText(ret.status) }}</span></td>
            <td>{{ ret.createdAt.slice(0, 10) }}</td>
            <td>{{ ret.totalAmount.toLocaleString() }}원</td>
            <td>{{ ret.franchiseName }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="return-form__pagination">
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
    <div class="return-form__total">총 {{ totalCount }}개 항목</div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import api from '@/lib/api';

const props = defineProps({
  selectedFranchiseId: {
    type: [String, Number],
    default: null
  },
  onReturnSelect: {
    type: Function,
    default: null
  }
});

// 이벤트 정의
const emit = defineEmits(['select-return']);

const search = ref('');
const filter = ref('itemName');
const page = ref(1);
const pageSize = 10;
const totalPages = ref(1);
const totalCount = ref(0);
const loading = ref(false);
const returns = ref([]);
const searchDate = ref(null);

const tabs = [
  { label: '전체', value: 'all' },
  { label: '승인 대기중인 반품 목록', value: 'pending' },
  { label: '진행중인 반품 목록', value: 'progress' },
  { label: '완료된 반품 목록', value: 'complete' }
];
const activeTab = ref(0);

const paginationPages = computed(() => {
  const C = page.value;
  const T = totalPages.value;
  if (T < 1) return [];
  if (T <= 7) {
    return Array.from({ length: T }, (_, i) => i + 1);
  }
  if (C < 5) {
    return [1, 2, 3, 4, 5, '...', T];
  }
  if (C > T - 4) {
    return [1, '...', T - 4, T - 3, T - 2, T - 1, T];
  }
  return [1, '...', C - 1, C, C + 1, '...', T];
});

function selectTab(idx) {
  activeTab.value = idx;
  page.value = 1;
  fetchReturns();
}

function statusText(status) {
  switch(status) {
    case 'WAITING_FOR_RECEIPT': return '접수 대기';
    case 'REJECTED': return '반려';
    case 'REVIEW_COMPLETED': return '검토 완료';
    case 'APPROVED': return '결재 완료';
    case 'PICKING_UP': return '반품 수거 중';
    case 'PICKED_UP': return '반품 수거 완료';
    case 'COMPLETED': return '반품 완료';
    default: return status;
  }
}

function returnStatusClass(status) {
  switch(status) {
    case 'WAITING_FOR_RECEIPT': return 'status-waiting';
    case 'REJECTED': return 'status-reject';
    case 'REVIEW_COMPLETED': return 'status-reviewed';
    case 'APPROVED': return 'status-approved';
    case 'PICKING_UP': return 'status-pickingup';
    case 'PICKED_UP': return 'status-pickedup';
    case 'COMPLETED': return 'status-completed';
    default: return '';
  }
}

// 반품 클릭 핸들러 - 상위 컴포넌트로 이벤트 전달
function handleReturnClick(returnId) {
  console.log('=== 반품 클릭 디버그 ===');
  console.log('클릭된 반품 ID:', returnId);
  console.log('현재 returns 데이터:', returns.value);
  console.log('emit 함수:', emit);
  console.log('props.onReturnSelect:', props.onReturnSelect);
  
  try {
    emit('select-return', returnId);
    console.log('selectReturn 이벤트 발생 완료');
  } catch (error) {
    console.error('이벤트 발생 실패:', error);
  }
  
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
      if (start) params.append('startDate', start.toISOString().slice(0, 10));
      if (end) params.append('endDate', end.toISOString().slice(0, 10));
    }

    // 검색어 필터
    if (search.value) {
      if (filter.value === 'returnNo') {
        params.append('code', search.value);
      } else if (filter.value === 'itemName') {
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

    const { data } = await api.get('/api/hq/franchise/return', { params });
    returns.value = data.list;
    totalPages.value = data.totalPages;
    totalCount.value = data.totalCount;
  } catch (error) {
    console.error('Error fetching returns:', error);
  } finally {
    loading.value = false;
  }
}

watch([search, filter], () => {
  page.value = 1;
  fetchReturns();
});

watch(page, fetchReturns);

watch(() => props.selectedFranchiseId, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    page.value = 1;
    fetchReturns();
  }
});

onMounted(fetchReturns);
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
  gap: 57px;
  border-bottom: 1.5px solid #e9ecef;
  margin-top: -15px;
  margin-bottom: 15px;
  padding-left: 15px;
}
.return-form__tab {
  position: relative;
  font-size: 1.05rem;
  color: #888;
  font-weight: 500;
  padding: 8px 0 12px 0;
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
  height: 3px;
  background: #4066fa;
  border-radius: 2px 2px 0 0;
}
.return-form__header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}
.return-form__search-group {
  display: flex;
  gap: 8px;
  align-items: center;
}
.return-form__search-group input {
  height: 36px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0 14px;
  font-size: 1rem;
  width: 220px;
}
.return-form__search-group select {
  height: 36px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 1rem;
  background: #fff;
}
.return-form__table-wrapper {
  overflow-x: auto;
}
.return-form__table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}
.return-form__table th, .return-form__table td {
  border: 1px solid #ffffff;
  padding: 12px 8px;
  text-align: center;
  font-size: 1rem;
}
.return-form__table th {
  background: #f4f6fb;
  font-weight: bold;
}
.return-link {
  color: #4066fa;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.2s;
}
.return-link:hover {
  color: #2d4dd1;
}
.return-status {
  display: inline-block;
  min-width: 80px;
  text-align: center;
  padding: 4px 10px;
  border-radius: 24px;
  font-size: 0.9rem;
  font-weight: 700;
  margin: 4px 0;
  background: #fff;
  letter-spacing: 1px;
  box-sizing: border-box;
  border: none;
}
.status-waiting {
  background: #fffcc4;
  color: #d97706;
}
.status-reject {
  color: #ff2222;
  background: #ffebeb;
}
.status-reviewed {
  color: #179a2b;
  background: #e6ffe6;
}
.status-approved {
  background: #e6f9ed;
  color: #16a34a;
}
.status-pickingup {
  background: #e0f7fa;
  color: #00796b;
}
.status-pickedup {
  background: #fff3e0;
  color: #ef6c00;
}
.status-completed {
  background: #e6ffe6;
  color: #179a2b;
}
.return-form__pagination {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
}
.page-btn {
  min-width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1.5px solid #e2e4ea;
  background: #fff;
  color: #222;
  font-size: 1.1rem;
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
  min-width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1.5px solid #e2e4ea;
  background: #f5f6fa;
  color: #bdbdbd;
  font-size: 1.3rem;
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
  margin-top: 8px;
  font-size: 0.98rem;
}
</style>