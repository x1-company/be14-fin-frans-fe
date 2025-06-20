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
            placeholder="주문 날짜"
            :clearable="true"
            input-class-name="custom-datepicker-input"
            style="width: 150px"
            locale="ko"
            :enable-time-picker="false"
            auto-apply
          />
          <input v-model="search" placeholder="검색어를 입력해주세요" />
          <select v-model="filter">
            <option value="itemName">품목명</option>
            <option value="status">주문 상태</option>
            <option value="orderNo">주문 번호</option>
          </select>
        </div>
      </div>
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
            <tr v-for="(order, idx) in pagedOrders" :key="order.orderId">
              <td>{{ idx + 1 + (page-1)*pageSize }}</td>
              <td>
                <router-link :to="`/orders/${order.orderId}`" class="order-link">
                  {{ order.orderCode }}
                </router-link>
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
        <button :disabled="page === 1" @click="page--">이전</button>
        <span v-for="p in totalPages" :key="p" :class="['page-btn', {active: p === page}]" @click="page = p">{{ p }}</span>
        <button :disabled="page === totalPages" @click="page++">다음</button>
      </div>
      <div class="order-form__total">총 {{ filteredOrders.length }}개 항목</div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { RouterLink } from 'vue-router';
  import Datepicker from '@vuepic/vue-datepicker';
  import '@vuepic/vue-datepicker/dist/main.css';
  const props = defineProps({
    orders: Array
  });
  const search = ref('');
  const searchDate = ref('');
  const filter = ref('itemName');
  const page = ref(1);
  const pageSize = 10;
  
  // 탭 관련
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
  }
  
  function statusText(status) {
    switch(status) {
      case 'REJECTED': return '반려';
      case 'REVIEWING': return '검토 중';
      case 'REVIEW_COMPLETED': return '검토 완료';
      case 'APPROVED': return '결재 완료';
      case 'DELIVERING': return '배송 중';
      case 'DELIVERED': return '배송 완료';
      default: return status;
    }
  }
  
  function tabStatusFilter(order) {
    if (activeTab.value === 1) {
      return order.status === 'REVIEWING';
    } else if (activeTab.value === 2) {
      return order.status === 'REVIEW_COMPLETED' || order.status === 'DELIVERING';
    } else if (activeTab.value === 3) {
      return order.status === 'DELIVERED';
    }
    return true; // 전체
  }
  
  const filteredOrders = computed(() => {
    let result = props.orders || [];
    // 날짜 필터
    if (searchDate.value) {
      const dateStr = typeof searchDate.value === 'string'
        ? searchDate.value
        : searchDate.value?.toISOString().slice(0, 10);
      result = result.filter(order => order.createdAt.slice(0, 10) === dateStr);
    }
    // 탭 필터링
    result = result.filter(tabStatusFilter);
    // 검색/필터
    if (search.value) {
      result = result.filter(order => {
        if (filter.value === 'orderNo') return order.orderCode.includes(search.value);
        if (filter.value === 'itemName') return order.productSummary.includes(search.value);
        if (filter.value === 'status') return statusText(order.status).includes(search.value);
        return true;
      });
    }
    return result;
  });
  const pagedOrders = computed(() => filteredOrders.value.slice((page.value-1)*pageSize, page.value*pageSize));

  function orderStatusClass(status) {
    switch(status) {
      case 'REJECTED': return 'status-reject';
      case 'REVIEWING': return 'status-reviewing';
      case 'REVIEW_COMPLETED': return 'status-reviewed';
      case 'APPROVED': return 'status-approved';
      case 'DELIVERING': return 'status-delivering';
      case 'DELIVERED': return 'status-delivered';
      default: return '';
    }
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
    margin-bottom: 16px;
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
    gap: 4px;
    align-items: center;
    justify-content: center;
    margin: 16px 0;
  }
  .page-btn {
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid #e9ecef;
    background: #fff;
    cursor: pointer;
    margin: 0 2px;
  }
  .page-btn.active {
    background: #4066fa;
    color: #fff;
    border-color: #4066fa;
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
    width: 130px;
  }
  </style> 