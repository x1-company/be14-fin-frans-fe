<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/lib/api"; // axios instance가 여기 있다고 가정
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const emit = defineEmits(["select-company"]);

const searchQuery = ref("");
const totalCount = ref(0);
const companies = ref([]);
const selectedCompany = ref(null);

onMounted(async () => {
  if (!authStore.accessToken) return; // 토큰 없을 경우 일단 막기

  try {
    const { data } = await api.get("/api/hq/suppliers/list");
    companies.value = data;
    totalCount.value = data.length;
  } catch (error) {
    console.error("공급처 목록 불러오기 실패", error);
  }
});

const filteredCompanies = computed(() => {
  if (!searchQuery.value) return companies.value;
  return companies.value.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const handleCompanyClick = (company) => {
  if (selectedCompany.value?.id === company.id) {
    // 이미 선택된 공급처를 다시 클릭 → 전체 보기(선택 해제)
    selectedCompany.value = null;
    emit("select-company", null);
  } else {
    selectedCompany.value = company;
    emit("select-company", company);
  }
};
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="header-item">
        <img
          src="@/assets/menu-supplier.png"
          alt="공급처 관리"
          class="sidebar__icon"
        />공급처 관리
      </div>

      <div class="sidebar-total"
        >전체
        <span class="total-count">{{ totalCount }}</span>
      </div>

      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="공급처 검색"
          class="search-input"
        />
        <span class="search-icon">🔍</span>
      </div>
    </div>

    <!-- Scrollable Content -->
    <div class="sidebar-content">
      <div
        v-for="company in filteredCompanies"
        :key="company.id"
        class="company-item"
        :class="{ active: selectedCompany?.id === company.id }"
        @click="handleCompanyClick(company)"
      >
        <div class="company-header">
          <img src="@/assets/menu-supplier-2.png" class="supplier-icon" />
          <div class="company-name-wrap">
            <span class="company-name">{{ company.name }}</span>
          </div>
          <span class="company-category">공급처</span>
        </div>
        <div class="company-details">
          <div class="detail-row">
            <img src="@/assets/phone.png" class="sidebar__info-icon" />
            <span>{{ company.companyPhone }}</span>
          </div>
          <div class="detail-row">
            <img src="@/assets/user.png" class="sidebar__info-icon" />
            <span>{{ company.ceoName }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 230px; /* 최소 너비 추가 */
  flex-shrink: 0; /* 줄어들지 않게 */
  background: #ffffff;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  height: 100%; /* 화면 전체 높이로 고정 */
  overflow-x: hidden; /* 가로 스크롤 방지 */
  position: relative; /* 겹침 방지 */
  z-index: 2;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  background: white;
}

.header-item {
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.sidebar__icon {
  width: 22px;
  height: 22px;
}

.sidebar__info-icon {
  width: 16px;
  height: 16px;
  opacity: 0.6;
}

.supplier-icon {
  width: 28px;
  margin-bottom: 5px;
  /* object-fit: contain; */
}

.sidebar-total {
  font-size: 0.85rem;
  margin-bottom: 8px;
  margin-left: 5px;
}

.total-count {
  color: #6c47ff;
  font-weight: 450;
  margin-left: 2px;
}

.search-container {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 6px 25px 5px 10px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 12px;
  box-sizing: border-box;
}

.search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.company-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.company-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.company-item.active {
  border-color: #667eea;
  background: #f8f9ff;
}

.company-header {
  position: relative;
  display: flex;
  align-items: flex-start;
  min-height: 32px;
}

.company-name-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  margin-top: 5px;
}

.company-name {
  font-size: 13px;
  font-weight: 600;
  color: #212529;
  margin-left: 6px;
  word-break: break-all;
  white-space: normal;
  line-height: 1.3;
}

.company-category {
  position: absolute;
  right: 0;
  top: 0;
  background-color: #7daff0;
  color: white;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 650;
  margin-left: 0;
  margin-top: 5px;
}

.company-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6c757d;
}
</style>
