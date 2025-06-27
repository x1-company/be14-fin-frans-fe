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
        <div class="date-filter">
          <select class="date-select">
            <option>지난 30일</option>
            <option>지난 7일</option>
            <option>지난 3개월</option>
          </select>
        </div>
        
        <div class="actions-container">
          <div class="search-box">
            <input
              type="text"
              placeholder="검색어를 입력해주세요"
              class="search-input-main"
            />
            <span class="search-icon">🔍</span>
          </div>
          <button class="register-btn" @click="emit('show-register-view')">발주 등록</button>
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
            <tr v-if="orders.length === 0">
              <td colspan="7" class="no-data">발주 내역이 없습니다.</td>
            </tr>
            <tr v-for="(order, index) in filteredOrders" :key="order.id">
              <td>{{ index + 1 }}</td>
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
        <button class="page-btn" disabled>‹</button>
        <button class="page-btn active">1</button>
        <button class="page-btn">2</button>
        <span class="page-dots">...</span>
        <button class="page-btn">9</button>
        <button class="page-btn">10</button>
        <button class="page-btn">›</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
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
    }
  });
  
  const emit = defineEmits(['show-register-view']);
  
  const filteredOrders = computed(() => {
    // 필터 로직 구현 (필요시)
    return props.orders;
  });
  
  function selectFilterTab(index) {
    props.onFilterTabChange(index);
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
    background: white;
    padding: 40px 32px;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.03);
  }
  
  .filter-tabs {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;
    border-bottom: 1px solid #e9ecef;
  }
  
  .filter-tab {
    padding: 12px 0;
    color: #6c757d;
    cursor: pointer;
    font-weight: 500;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }
  
  .filter-tab.active {
    color: #5468ff;
    border-bottom-color: #5468ff;
  }
  
  .search-filter-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  
  .actions-container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .date-select {
    padding: 8px 12px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 14px;
  }
  
  .search-box {
    position: relative;
    width: 300px;
  }
  
  .search-input-main {
    width: 100%;
    padding: 8px 40px 8px 12px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 14px;
    box-sizing: border-box;
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
    padding: 8px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap; /* Prevent text wrapping */
    transition: background-color 0.2s;
  }
  
  .register-btn:hover {
    background-color: #3453c7;
  }
  
  .table-container {
    border: 1px solid #e9ecef;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 24px;
  }
  
  .order-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  
  .order-table th,
  .order-table td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #f1f3f4;
    color: #212529;
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
    color: #5468ff;
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
    background: #d4edda;
    color: #155724;
  }
  
  .status-pending {
    background: #fff3cd;
    color: #856404;
  }
  
  .status-completed {
    background: #cce5ff;
    color: #004085;
  }
  
  .status-rejected {
    background: #f8d7da;
    color: #721c24;
  }
  
  .status-cancel {
    background: #e0e0e0;
    color: #888;
  }
  
  .no-data {
    text-align: center;
    padding: 40px;
    color: #6c757d;
    font-style: italic;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    gap: 8px;
    align-items: center;
  }
  
  .page-btn {
    padding: 8px 12px;
    border: 1px solid #dee2e6;
    background: white;
    color: #495057;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }
  
  .page-btn:hover:not(:disabled) {
    background: #f8f9fa;
  }
  
  .page-btn.active {
    background: #5468ff;
    color: white;
    border-color: #5468ff;
  }
  
  .page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .page-dots {
    color: #6c757d;
    padding: 0 8px;
  }
  </style>
  