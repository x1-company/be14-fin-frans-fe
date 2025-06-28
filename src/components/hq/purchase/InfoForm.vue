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
  
        <div class="purchase-table-wrapper">
          <table class="purchase-table">
            <thead>
              <tr>
                <th>No</th>
                <th>구매 요청 번호</th>
                <th>제목</th>
                <th>담당자</th>
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
                <td>{{ row.requestDate }}</td>
                <td>{{ row.dueDate }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div class="pagination">
          <button class="page-arrow" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">&lt;</button>
          <span
            v-for="p in paginationPages"
            :key="p"
            :class="['page-btn', {active: p === currentPage, ellipsis: p === '...'}]"
            @click="typeof p === 'number' && changePage(p)"
          >
            {{ p }}
          </span>
          <button class="page-arrow" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">&gt;</button>
        </div>
        <div class="order-form__total">총 {{ totalCount }}개 항목</div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch, computed } from 'vue';
  import api from '@/lib/api';
  import { Search as SearchIcon, Calendar as CalendarIcon } from 'lucide-vue-next'
  import { useRouter } from 'vue-router';
  
  const tabLabels = [
    '전체'
  ];
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
  
  const totalCount = computed(() => purchaseList.value.length ? purchaseList.value.length + (totalPages.value - 1) * 10 : 0);
  
  // 페이지네이션 버튼 배열 생성
  const paginationPages = computed(() => {
    const pages = [];
    const total = totalPages.value;
    const current = currentPage.value;
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
    background-color: #4066fa;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: background-color 0.2s;
  }
  
  .register-btn:hover {
    background-color: #2746b6;
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
  
  .purchase-row {
    cursor: pointer;
  }
  .purchase-row:hover {
    background: #f3f4f6;
  }
  
  .order-form__total {
    text-align: right;
    color: #888;
    margin-top: 4px;
    font-size: 0.92rem;
  }
  </style>