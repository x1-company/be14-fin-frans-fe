<template>
    <div class="order-form">
      <!-- 상단 탭 UI -->
      <div class="order-form__tabs">
        <div
          v-for="(tab, idx) in tabs"
          :key="tab.value"
          :class="['order-form__tab', { active: activeTab === idx }]"
          @click="selectTab(idx)"
        >
          {{ tab.label }}
          <div v-if="activeTab === idx" class="order-form__tab-indicator"></div>
        </div>
      </div>
      <!-- 검색창 및 필터 -->
      <div class="order-form__header">
        <div class="order-form__search-group">
          <Datepicker
            v-model="searchDate"
            :format="'yyyy-MM-dd'"
            placeholder="주문 날짜 범위 선택"
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
            <option value="itemName">품목명</option>
            <option value="orderNo">주문 번호</option>
          </select>
        </div>
        <OrderRegisterButton @click="$emit('show-register-view')" />
      </div>
      <div class="order-table">
        <div class="order-table-header">
          <div class="col col-no">No.</div>
          <div class="col col-code">주문 번호</div>
          <div class="col col-name">품목명</div>
          <div class="col col-status">주문 상태</div>
          <div class="col col-date">주문일</div>
          <div class="col col-amount">총 주문 금액</div>
          <div class="col col-franchise">가맹점 명</div>
        </div>
        <div class="order-table-body">
          <div v-if="orders.length === 0" class="empty-message">주문 내역이 없습니다.</div>
          <div v-for="(order, idx) in orders" :key="order.orderId" class="order-row">
            <div class="col col-no">{{ idx + 1 + (page-1)*pageSize }}</div>
            <div class="col col-code">
              <a href="#" class="order-link" @click.prevent="showOrderDetail(order.orderId)">
                {{ order.orderCode }}
              </a>
            </div>
            <div class="col col-name">{{ order.productSummary }}</div>
            <div class="col col-status"><span :class="['order-status', orderStatusClass(order.status)]">{{ statusText(order.status) }}</span></div>
            <div class="col col-date">{{ order.createdAt.slice(0, 10) }}</div>
            <div class="col col-amount">{{ order.totalAmount.toLocaleString() }}원</div>
            <div class="col col-franchise">{{ order.franchiseName }}</div>
          </div>
        </div>
      </div>
      <div class="order-form__pagination">
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
      <div class="order-form__total">총 {{ totalCount }}개 항목</div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted } from 'vue';
  import Datepicker from '@vuepic/vue-datepicker';
  import '@vuepic/vue-datepicker/dist/main.css';
  import api from '@/lib/api';
  import OrderRegisterButton from './button/OrderRegisterButton.vue';

  const props = defineProps({
    franchiseId: [String, Number],
    selectedFranchiseId: [String, Number],
  });

  const emit = defineEmits(['show-register-view', 'show-order-detail']);

  const orders = ref([]);
  const search = ref('');
  const searchDate = ref(null);
  const filter = ref('itemName');
  const page = ref(1);
  const pageSize = 10;
  const totalPages = ref(1);
  const totalCount = ref(0);
  const loading = ref(false);

  const tabs = [
    { label: '전체', value: 'all' },
    { label: '승인 대기중인 주문 목록', value: 'pending' },
    { label: '진행중인 주문 목록', value: 'progress' },
    { label: '완료된 주문 목록', value: 'complete' },
  ];
  const activeTab = ref(0);

  function selectTab(idx) {
    activeTab.value = idx;
    page.value = 1;
    fetchOrders();
  }

  function statusText(status) {
    switch (status) {
      case 'WAITING_FOR_RECEIPT': return '접수 대기';
      case 'RECEIPT_CANCELED': return '접수 취소';
      case 'REJECTED': return '반려';
      case 'REVIEWING': return '검토 중';
      case 'REVIEW_COMPLETED': return '검토 완료';
      case 'APPROVED': return '결재 완료';
      case 'DELIVERING': return '배송 중';
      case 'DELIVERED': return '배송 완료';
      default: return status;
    }
  }

  function orderStatusClass(status) {
    switch (status) {
      case 'WAITING_FOR_RECEIPT': return 'status-waiting';
      case 'RECEIPT_CANCELED': return 'status-canceled';
      case 'REJECTED': return 'status-reject';
      case 'REVIEWING': return 'status-reviewing';
      case 'REVIEW_COMPLETED': return 'status-reviewed';
      case 'APPROVED': return 'status-approved';
      case 'DELIVERING': return 'status-delivering';
      case 'DELIVERED': return 'status-delivered';
      default: return '';
    }
  }

  // ✅ 날짜 포맷 함수 (UTC로 변환 안 하고 로컬 기준으로 유지)
  function formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  }

  async function fetchOrders() {
    loading.value = true;
    try {
      const params = new URLSearchParams();
      params.append('page', page.value);
      params.append('size', pageSize);

      // ✅ 날짜 필터 (로컬 기준 변환)
      if (Array.isArray(searchDate.value) && searchDate.value.length === 2) {
        const [start, end] = searchDate.value.map(d => new Date(d));
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          params.append('startDate', formatDateToYYYYMMDD(start));
          params.append('endDate', formatDateToYYYYMMDD(end));
        }
      }

      // 검색어 필터 (품목명, 주문번호)
      if (search.value) {
        if (filter.value === 'orderNo') {
          params.append('code', search.value);
        } else if (filter.value === 'itemName') {
          params.append('product', search.value);
        }
      }

      // 상태 필터 (탭)
      const tab = tabs[activeTab.value].value;
      const statusMap = {
        pending: ['WAITING_FOR_RECEIPT'],
        progress: ['REVIEWING', 'REVIEW_COMPLETED', 'APPROVED', 'DELIVERING'],
        complete: ['DELIVERED', 'REJECTED', 'RECEIPT_CANCELED'],
      };
      if (statusMap[tab]) {
        statusMap[tab].forEach(s => params.append('statusList', s));
      }

      const { data } = await api.get('/api/franchise/orders', { params });
      orders.value = data.content;
      totalPages.value = data.totalPages;
      totalCount.value = data.totalCount;
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      loading.value = false;
    }
  }

  watch([search, searchDate, filter], () => {
    page.value = 1;
    fetchOrders();
  });

  watch(page, fetchOrders);
  onMounted(fetchOrders);

  const showOrderDetail = (orderId) => {
    emit('show-order-detail', orderId);
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
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 10px;
    gap: 10px;
  }
  .order-form__search-group {
    display: flex;
    gap: 5px;
    align-items: center;
  }
  .order-form__search-group input {
    height: 35px;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    padding: 12px 8px;
    font-size: 0.8rem;
    width: 180px;
  }
  .order-form__search-group select {
    height: 35px;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    padding: 0 7px;
    font-size: 0.8rem;
    background: #fff;
  }
  .order-form__search-group button {
    height: 28px;
    background: #4066fa;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 0 12px;
    font-size: 0.5rem;
    font-weight: 100;
    cursor: pointer;
    transition: background 0.2s;
  }
  .order-form__search-group button:hover {
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
  .status-delivering,
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
  /* .custom-datepicker-input {
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
  } */
  
  .order-register-btn:hover {
    font-size: 10px;
    height: 10px;
    width: 10px;
    background: #2746b6;
  }

  :deep(.dp__input) {
  font-size: 0.8rem !important;  /* 원하는 크기로 */
  height: 33px !important;
  padding: 0 4px !important;
  width: 270px !important;
  min-width: 0 !important;
  max-width: 270px !important;
  border-radius: 6px !important;
  border: 1px solid #e9ecef !important;
  text-align: center !important;
}
  </style>