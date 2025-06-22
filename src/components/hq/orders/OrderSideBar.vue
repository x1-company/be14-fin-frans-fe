<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "@/lib/api";

const emit = defineEmits(["select-franchise"]);

const searchQuery = ref("");
const totalCount = ref(0);
const tab = ref('mine');    // 디폴트는 직원 담당으로 
const franchises = ref([]);
const selectedFranchise = ref(null);

// onMounted(async () => {
async function fetchFranchises() {
  try {
    let url = tab.value === 'team'
      ? "/api/hq/franchise/department"
      : "/api/hq/franchise/manager";
    const { data } = await api.get(url);
    franchises.value = data;
    totalCount.value = data.length;
  } 
  catch (error) {
    console.error("가맹점 목록 불러오기 실패", error);
    franchises.value = [];
    totalCount.value = 0;
    selectedFranchise.value = null;
  }
};
onMounted(fetchFranchises);
watch(tab, fetchFranchises);

const filteredFranchises = computed(() => {
  if (!searchQuery.value) return franchises.value;
  return franchises.value.filter((franchise) =>
    franchise.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

function handleFranchiseClick(franchise) {
  selectedFranchise.value = franchise;
  emit("select-franchise", franchise.id);
}
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-header">
        <div class="header-item">
            <img
            src="@/assets/menu-franchise.png"
            alt="가맹점 관리"
            class="sidebar__icon"
            />가맹점 관리
        </div>
        <div class="sidebar-toggle">
            <button :class="{active: tab==='mine'}" @click="tab='mine'">직원 담당</button>
            <button :class="{active: tab==='team'}" @click="tab='team'">부서 담당</button>
        </div>
        

        <div class="sidebar-total">전체 
            <span 
            class="total-count">{{ totalCount }}
            </span>
        </div>
      <!-- <div class="count-info">
        <span>전체 {{ totalCount }}</span>
      </div> -->

        <div class="search-container">
            <input
            v-model="searchQuery"
            type="text"
            placeholder="가맹점 검색"
            class="search-input"
            />
            <span class="search-icon">🔍</span>
        </div>
    </div>

    <!-- Scrollable Content -->
    <div class="sidebar-content">
      <div
        v-for="franchise in filteredFranchises"
        :key="franchise.id"
        class="company-item"
        :class="{ active: selectedFranchise && selectedFranchise.id === franchise.id }"
        @click="handleFranchiseClick(franchise)"
      >
        <div class="company-header">
          <img src="@/assets/franchise.png" class="franchise-icon" />
          <span class="company-name">{{ franchise.name }}</span>
          <span class="company-category">가맹점</span>
        </div>
        <div class="company-details">
          <div class="detail-row">
            <img src="@/assets/phone.png" class="sidebar__info-icon" />
            <span>{{ franchise.phone }}</span>
          </div>
          <div class="detail-row">
            <img src="@/assets/user.png" class="sidebar__info-icon" />
            <span>{{ franchise.ownerName }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  min-width: 260px;      /* 최소 너비 추가 */
  max-width: 340px;      /* 필요시 최대 너비도 지정 */
  width: 300px;
  flex-shrink: 0;        /* 줄어들지 않게 */
  background: #ffffff;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  height: 100vh;         /* 화면 전체 높이로 고정 */
  overflow-x: hidden;    /* 가로 스크롤 방지 */
  position: relative;    /* 겹침 방지 */
  z-index: 2;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  background: white;
}

.sidebar-toggle {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}

.sidebar-toggle button {
  flex: 1;
  padding: 8px 0;
  border: none;
  background: #f3f3f3;
  color: #888;
  border-radius: 8px 8px 0 0;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
}
.sidebar-toggle button.active {
  background: #ece6ff;
  color: #222;
}

.header-item {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.sidebar__icon {
  width: 26px;
  height: 23px;
}

.add-btn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #6c757d;
}

.franchise-icon {
  width: 28px;
  height: 27px;
}

.sidebar-total {
  font-size: 1rem;
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
  padding: 8px 32px 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
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
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.company-name {
  font-weight: 600;
  color: #212529;
}

.company-category {
  background-color: #7daff0;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: auto;
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