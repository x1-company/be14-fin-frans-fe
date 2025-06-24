<template>
    <div class="info-form">
      <div class="info-section">
        <div class="info-section__header purchase-header">
          <span class="purchase-title">구매 요청 목록</span>
          <button class="register-btn" @click="goToRegister">등록</button>
        </div>
        
        <div class="purchase-filters">
          <div class="filter-group">
            <div class="filter-select-wrapper">
              <CalendarIcon class="filter-icon" />
              <select v-model="dateFilter" class="filter-select">
                <option value="30">지난 30일</option>
                <option value="7">지난 7일</option>
                <option value="90">지난 90일</option>
              </select>
            </div>
          </div>
          <div class="search-group">
            <select v-model="searchType" class="search-type-select">
              <option value="title">제목</option>
              <option value="code">요청번호</option>
            </select>
            <div class="search-wrapper">
              <SearchIcon @click="handleSearch" class="search-icon" style="cursor: pointer;" />
              <input v-model="searchQuery" @keyup.enter="handleSearch" class="search-input" placeholder="검색어를 입력해주세요" />
            </div>
          </div>
        </div>
  
        <div class="purchase-tabs">
          <span 
            v-for="(tab, idx) in tabLabels" 
            :key="tab" 
            :class="['purchase-tab', { active: idx === activeTab }]"
            @click="changeTab(idx)"
          >
            {{ tab }}
          </span>
        </div>
  
        <div class="purchase-table-wrapper">
          <table class="purchase-table">
            <thead>
              <tr>
                <th>No</th>
                <th>구매 요청 번호</th>
                <th>제목</th>
                <th>담당자</th>
                <th>요청 상태</th>
                <th>구매 요청일</th>
                <th>납기 희망일</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in purchaseList" :key="row.id" @click="goToDetail(row.id)" class="purchase-row">
                <td>{{ (currentPage - 1) * 10 + idx + 1 }}</td>
                <td>
                  <span class="purchase-link">{{ row.requestNo }}</span>
                </td>
                <td>{{ row.title }}</td>
                <td>{{ row.manager }}</td>
                <td>
                  <span :class="['status-badge', getStatusClass(row.status)]">{{ getStatusText(row.status) }}</span>
                </td>
                <td>{{ row.requestDate }}</td>
                <td>{{ row.dueDate }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div class="pagination">
          <button @click="changePage(currentPage - 1)" :disabled="currentPage <= 1"> &lt; </button>
          <button
            v-for="page in totalPages"
            :key="page"
            :class="{ active: page === currentPage }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          <button @click="changePage(currentPage + 1)" :disabled="currentPage >= totalPages"> > </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import api from '@/lib/api';
  import { Search as SearchIcon, Calendar as CalendarIcon } from 'lucide-vue-next'
  import { useRouter } from 'vue-router';
  
  const tabLabels = [
    '전체',
    '대기 중인 구매 요청 목록',
    '진행중인 구매 요청 목록',
    '완료된 구매 요청 목록',
    '취소된 구매 요청 목록',
    '반려된 구매 요청 목록'
  ];
  const statusMap = {
    0: 'ALL',
    1: 'REQUEST_PENDING',
    2: 'REVIEWING',
    3: 'APPROVED',
    4: 'REQUEST_CANCEL',
    5: 'REJECTED'
  };
  const activeTab = ref(0);
  const dateFilter = ref('30');
  const searchType = ref('title');
  const searchQuery = ref('');
  const purchaseList = ref([]);
  const loading = ref(true);
  const error = ref(null);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const router = useRouter();
  
  function changeTab(idx) {
    activeTab.value = idx;
    currentPage.value = 1;
    searchQuery.value = '';
    fetchData();
  }
  
  async function fetchData() {
    loading.value = true;
    error.value = null;
    try {
      let response;
      const params = {
        page: currentPage.value - 1,
        size: 10
      };
      let url;
      if (searchQuery.value) {
        if (searchType.value === 'title') {
          params.title = searchQuery.value;
          url = '/api/hq/purchase/requests/search';
        } else {
          params.code = searchQuery.value;
          url = '/api/hq/purchase/requests/search/code';
        }
      } else {
        if (activeTab.value === 0) {
          url = '/api/hq/purchase/requests';
        } else {
          params.status = statusMap[activeTab.value];
          url = '/api/hq/purchase/requests/status';
        }
      }
      response = await api.get(url, { params });
      const { data } = response;
      purchaseList.value = data.content.map(item => ({
        id: item.id,
        requestNo: item.code,
        title: item.title,
        manager: item.userName,
        status: item.status,
        requestDate: item.createdAt.split('T')[0].replace(/-/g, '.'),
        dueDate: item.requestedDeliveryDate.replace(/-/g, '.'),
      }));
      totalPages.value = data.totalPages;
    } catch (err) {
      error.value = '데이터를 불러오는 중 오류가 발생했습니다.';
      console.error("Error during fetchData:", err);
    } finally {
      loading.value = false;
    }
  }
  
  function getStatusText(status) {
    switch (status) {
        case 'DRAFT': return '임시저장';
        case 'REQUEST_CANCEL': return '요청 취소';
        case 'REQUEST_PENDING': return '요청 대기';
        case 'REVIEWING': return '검토중';
        case 'APPROVED': return '승인';
        case 'REJECTED': return '반려';
        default: return status;
    }
  }

  function getStatusClass(status) {
    switch (status) {
      case 'APPROVED': return 'approved';
      case 'REQUEST_PENDING': return 'pending';
      case 'REVIEWING': return 'review';
      case 'REJECTED': return 'rejected';
      case 'REQUEST_CANCEL': return 'cancel';
      default: return '';
    }
  }
  
  function changePage(page) {
    if (page > 0 && page <= totalPages.value) {
      currentPage.value = page;
      fetchData();
    }
  }
  
  function handleSearch() {
    currentPage.value = 1;
    fetchData();
  }
  
  function goToRegister() {
    router.push('/purchase/register');
  }
  
  function goToDetail(id) {
    router.push(`/purchase/detail/${id}`);
  }
  
  watch(() => activeTab.value, () => {
    currentPage.value = 1;
    searchQuery.value = '';
    fetchData();
  });
  
  watch([dateFilter, searchType], fetchData);
  
  onMounted(fetchData);
  </script>
  
  <style scoped>
  .info-form {
    background: #fff;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.03);
    padding: 40px 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .info-section {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    padding: 24px 32px;
    margin-bottom: 0;
  }
  
  .info-section__header.purchase-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1.3rem;
    font-weight: bold;
    color: #222;
    margin-bottom: 20px;
  }
  
  .purchase-title {
    color: #333;
    font-weight: 600;
  }
  
  .register-btn {
    padding: 8px 16px;
    background-color: #6a7bff;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  .register-btn:hover {
    background-color: #5566d4;
  }
  
  .purchase-filters {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 16px;
  }
  
  .filter-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .filter-select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .filter-icon {
    position: absolute;
    left: 12px;
    color: #888;
    width: 18px;
    height: 18px;
  }
  
  .filter-select {
    padding: 10px 36px 10px 38px !important;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #fff;
    font-size: 0.9rem;
    color: #555;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-chevron-down' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center !important;
  }
  
  .search-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .search-type-select {
      padding: 10px 36px 10px 38px !important;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #fff;
      font-size: 0.9rem;
      color: #555;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-chevron-down' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 16px center !important;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
  }
  
  .search-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .search-icon {
    position: absolute;
    left: 12px;
    color: #888;
    width: 18px;
    height: 18px;
  }
  
  .search-input {
    padding: 10px 12px 10px 38px;
    border: 1px solid #ddd;
    border-radius: 8px;
    width: 250px;
    font-size: 0.9rem;
  }
  
  .purchase-tabs {
    display: flex;
    gap: 20px;
    border-bottom: 1px solid #eee;
    margin-bottom: 24px;
  }
  
  .purchase-tab {
    padding: 12px 4px;
    cursor: pointer;
    font-size: 1rem;
    color: #888;
    position: relative;
    transition: color 0.2s;
  }
  
  .purchase-tab.active {
    color: #333;
    font-weight: 600;
  }
  
  .purchase-tab.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #6a7bff;
  }
  
  .purchase-table-wrapper {
    overflow-x: auto;
  }
  
  .purchase-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }
  
  .purchase-table th, .purchase-table td {
    padding: 14px 12px;
    text-align: center;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .purchase-table th {
    background-color: #f9fafb;
    color: #555;
    font-weight: 500;
  }
  
  .purchase-table td {
    color: #444;
  }
  
  .purchase-link {
    color: #5566d4;
    text-decoration: none;
  }
  
  .purchase-link:hover {
    text-decoration: underline;
  }
  
  .status-badge {
    padding: 5px 12px;
    border-radius: 16px;
    font-size: 0.8rem;
    font-weight: 500;
  }
  
  .status-badge.approved {
    background-color: #e6f7f0;
    color: #27a36a;
  }
  
  .status-badge.pending {
    background-color: #fff4e6;
    color: #f5a623;
  }
  
  .status-badge.review {
    background-color: #e9f3ff;
    color: #4a90e2;
  }
  
  .status-badge.rejected {
    background-color: #fbe9e9;
    color: #d0021b;
  }
  
  .status-badge.cancel {
    background-color: #f0f0f0;
    color: #888;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 24px;
  }
  
  .pagination button {
    border: 1px solid #ddd;
    background-color: #fff;
    color: #555;
    padding: 6px 12px;
    margin: 0 4px;
    cursor: pointer;
    border-radius: 6px;
  }
  
  .pagination button:disabled {
    color: #bbb;
    cursor: not-allowed;
  }
  
  .pagination button.active {
    background-color: #6a7bff;
    color: white;
    border-color: #6a7bff;
  }
  
  .purchase-row {
    cursor: pointer;
  }
  .purchase-row:hover {
    background: #f3f4f6;
  }
  </style>