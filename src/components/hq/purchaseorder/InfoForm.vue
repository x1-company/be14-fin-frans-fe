<template>
    <div class="content-section">
      <!-- 필터 탭 -->
      <div class="filter-tabs">
        <span
          v-for="(tab, idx) in filterTabs"
          :key="tab"
          :class="['filter-tab', { active: idx === activeFilterTab }]"
          @click="selectFilterTab(idx)"
        >
          {{ tab }}
        </span>
      </div>
  
      <!-- 검색 및 필터 -->
      <div class="search-filter-section">
        <div class="search-type-filter">
          <select class="search-type-select" v-model="searchType">
            <option value="title">제목</option>
            <option value="code">발주번호</option>
          </select>
        </div>
        <div class="actions-container">
          <div class="search-box">
            <input
              type="text"
              v-model="searchKeyword"
              placeholder="검색어를 입력해주세요"
              class="search-input-main"
              @keyup.enter="onSearch"
            />
            <span class="search-icon">🔍</span>
          </div>
          <button class="register-btn" @click="emit('show-register-view')">발주 등록</button>
          <button class="search-btn" @click="onSearch">검색</button>
        </div>
      </div>
  
      <!-- 테이블 -->
      <div class="table-container">
        <table class="order-table">
          <thead>
            <tr>
              <th>No</th>
              <th>발주 번호</th>
              <th>제목</th>
              <th>발주 금액</th>
              <th>발주 상태</th>
              <th>발주 요청일</th>
              <th>납기 희망일</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="props.orders.length === 0">
              <td colspan="7" class="no-data">발주 내역이 없습니다.</td>
            </tr>
            <tr v-for="(order, index) in props.orders" :key="order.id" @click="emit('show-detail', order.id)" style="cursor:pointer;">
              <td>{{ (props.page - 1) * pageSize + index + 1 }}</td>
              <td class="order-number">{{ order.orderNumber }}</td>
              <td>{{ order.title }}</td>
              <td class="amount">{{ formatCurrency(order.amount) }}원</td>
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
      <div class="pagination">
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
      case 'REQUEST_PENDING': return 'status-pending';
      case 'COMPLETED': return 'status-completed'; // '완료' 상태 Enum 확인 필요
      case 'CANCELED': return 'status-cancel';
      case 'REJECTED': return 'status-rejected';
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
    };
    return statusLabels[status] || status;
  }
  </script>
  
  <style scoped>
  .content-section {
    background: #fff;
    border-radius: 0 0 16px 16px;
    box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.03);
    padding: 32px;
  }
  
  .filter-tabs {
    display: flex;
    gap: 50px;
    border-bottom: 1.5px solid #e9ecef;
    margin-top: -30px;
    margin-bottom: 10px;
    padding-left: 10px;
  }
  
  .filter-tab {
    position: relative;
    font-size: 0.9rem;
    color: #888;
    font-weight: 500;
    padding: 4px 0 7px 0;
    cursor: pointer;
    transition: color 0.2s;
    border-bottom: 2px solid transparent;
  }
  
  .filter-tab.active {
    color: #4066fa;
    border-bottom-color: #4066fa;
    font-weight: 700;
  }
  
  .search-filter-section {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 10px;
    gap: 10px;
  }
  
  .actions-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .search-type-filter {
    margin-right: 10px;
  }
  
  .search-type-select {
    padding: 8px 12px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 14px;
  }
  
  .search-box {
    position: relative;
    width: 180px;
  }
  
  .search-input-main {
    width: 100%;
    padding: 8px 40px 8px 12px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 0.9rem;
    box-sizing: border-box;
    height: 35px;
  }
  
  .search-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
  }
  
  .register-btn {
    background-color: #4066fa;
    color: white;
    border: none;
    padding: 0 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    height: 28px;
    white-space: nowrap;
    transition: background-color 0.2s;
  }
  
  .register-btn:hover {
    background-color: #2746b6;
  }
  
  .search-btn {
    background-color: #4066fa;
    color: white;
    border: none;
    padding: 0 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    height: 28px;
    white-space: nowrap;
    transition: background-color 0.2s;
    margin-left: 0;
  }
  
  .search-btn:hover {
    background-color: #2746b6;
  }
  
  .table-container {
    border: 1px solid #eef0f4;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 10px;
  }
  
  .order-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  
  .order-table th,
  .order-table td {
    padding: 12px 16px;
    text-align: center;
    border-bottom: 1px solid #f1f3f4;
    color: #212529;
    font-size: 14px;
  }
  
  .order-table th {
    background: #f8f9fa;
    color: #495057;
    font-weight: 600;
    text-align: center;
  }
  
  .order-table tbody tr:hover {
    background: #f8f9fa;
  }
  
  .order-table tbody tr:last-child td {
    border-bottom: none;
  }
  
  .order-number {
    color: #4066fa !important;
    font-weight: 500;
  }
  
  .amount {
    text-align: right;
    font-weight: 500;
  }
  
  .status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .status-approved {
    background: #e6f9ed;
    color: #16a34a;
  }
  
  .status-pending {
    background: #fffcc4;
    color: #d97706;
  }
  
  .status-completed {
    background: #e0f0ff;
    color: #2563eb;
  }
  
  .status-rejected {
    background: #ffebeb;
    color: #ff2222;
  }
  
  .status-cancel {
    background: #ededed;
    color: #6b7280;
  }
  
  .no-data {
    text-align: center;
    padding: 40px;
    color: #6c757d;
    font-style: italic;
  }
  
  .pagination {
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
  