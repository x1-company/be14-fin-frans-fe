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
      </div>

      <!-- 주문 목록 테이블 -->
      <div>
        <div class="order-form__table-wrapper">
          <table class="order-form__table">
            <thead>
              <tr>
                <th>No.</th>
                <th>주문 번호</th>
                <th>품목명</th>
                <th>주문 상태</th>
                <th>주문일</th>
                <th>총 주문 금액</th>
                <th>가맹점 명</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(order, idx) in orders" :key="order.orderId">
                <td>{{ idx + 1 + (page-1)*pageSize }}</td>
                <td>
                  <a href="#" class="order-link" @click.prevent="emit('show-order-detail', order.orderId)">
                    {{ order.orderCode }}
                  </a>
                </td>
                <td>{{ order.productSummary }}</td>
                <td><span :class="['order-status', orderStatusClass(order.status)]">{{ statusText(order.status) }}</span></td>
                <td>{{ order.createdAt.slice(0, 10) }}</td>
                <td>{{ order.totalAmount.toLocaleString() }}원</td>
                <td>{{ order.franchiseName }}</td>
              </tr>
            </tbody>
          </table>
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
    </div>
  </template>
  
  <script setup>
    import { ref, computed, watch, onMounted } from 'vue';
    import { RouterLink } from 'vue-router';
    import Datepicker from '@vuepic/vue-datepicker';
    import '@vuepic/vue-datepicker/dist/main.css';
    import api from '@/lib/api';

    const emit = defineEmits(['show-register-view', 'franchise-deselect', 'show-order-detail']);

    const props = defineProps({
      selectedFranchiseId: [String, Number]
    });

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
        case 'REJECTED': return 'status-reject';
        case 'REVIEWING': return 'status-reviewing';
        case 'REVIEW_COMPLETED': return 'status-reviewed';
        case 'APPROVED': return 'status-approved';
        case 'DELIVERING': return 'status-delivering';
        case 'DELIVERED': return 'status-delivered';
        default: return '';
    }
    }

    // ✅ 날짜 포맷 유틸 (UTC 밀림 방지)
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
        if (props.selectedFranchiseId) {
          params.append('franchiseId', props.selectedFranchiseId)
        }
        
        // ✅ 로컬 기준 날짜 필터
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
        pending: ['REVIEWING'],
        progress: ['REVIEW_COMPLETED', 'APPROVED', 'DELIVERING'],
        complete: ['DELIVERED', 'REJECTED'],
        };
        if (statusMap[tab]) {
        statusMap[tab].forEach(s => params.append('statusList', s));
        }

        const { data } = await api.get('/api/hq/orders', { params });
        orders.value = data.content;
        totalPages.value = data.totalPages;
        totalCount.value = data.totalCount;
    } catch (error) {
        console.error('Error fetching orders:', error);
    } finally {
        loading.value = false;
    }
    }

    // 기존 watchers
    watch([search, searchDate, filter], () => {
    page.value = 1;
    fetchOrders();
    });

    watch(page, fetchOrders);

    // ✅ selectedFranchiseId prop 변경 시 fetchOrders 호출
    watch(() => props.selectedFranchiseId, (newValue, oldValue) => {
      if (newValue !== oldValue) {
        page.value = 1; // 페이지를 1로 리셋
        fetchOrders();
      }
    });

    // 기존 computed 속성들 다음에 추가
    const paginationPages = computed(() => {
      const pages = [];
      const current = page.value;
      const total = totalPages.value;
      
      if (total <= 7) {
        // 총 페이지가 7개 이하면 모든 페이지 표시
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // 총 페이지가 7개 초과면 생략 표시 포함
        if (current <= 4) {
          // 현재 페이지가 앞쪽에 있을 때
          for (let i = 1; i <= 5; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(total);
        } else if (current >= total - 3) {
          // 현재 페이지가 뒤쪽에 있을 때
          pages.push(1);
          pages.push('...');
          for (let i = total - 4; i <= total; i++) {
            pages.push(i);
          }
        } else {
          // 현재 페이지가 중간에 있을 때
          pages.push(1);
          pages.push('...');
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(total);
        }
      }
      
      return pages;
    });

    onMounted(fetchOrders);
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
    gap: 57px;
    border-bottom: 1.5px solid #e9ecef;
    margin-top: -15px;
    margin-bottom: 15px;
    padding-left: 15px;
  }
  .order-form__tab {
    position: relative;
    font-size: 1.05rem;
    color: #888;
    font-weight: 500;
    padding: 8px 0 12px 0;
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
    height: 3px;
    background: #4066fa;
    border-radius: 2px 2px 0 0;
  }
  .order-form__header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 16px;
    gap: 16px;
  }
  .order-form__search-group {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .order-form__search-group input {
    height: 36px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 0 14px;
    font-size: 1rem;
    width: 220px;
  }
  .order-form__search-group select {
    height: 36px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 0 12px;
    font-size: 1rem;
    background: #fff;
  }
  .order-form__search-group button {
    height: 36px;
    background: #4066fa;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 0 22px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }
  .order-form__search-group button:hover {
    background: #2746b6;
  }
  .order-form__table-wrapper {
    overflow-x: auto;
  }
  .order-form__table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;
  }
  .order-form__table th, .order-form__table td {
    border: 1px solid #e9ecef;
    padding: 12px 8px;
    text-align: center;
    font-size: 1rem;
  }
  .order-form__table th {
    background: #f4f6fb;
    font-weight: bold;
  }
  .order-link {
    color: #4066fa;
    text-decoration: underline;
    cursor: pointer;
  }
  .order-status {
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
  .order-form__total {
    text-align: right;
    color: #888;
    margin-top: 8px;
    font-size: 0.98rem;
  }
  .custom-datepicker-input {
    height: 36px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 0 14px;
    font-size: 1rem;
    width: 250px;
  }
  .order-register-btn:hover {
    background: #2746b6;
  }
  </style>