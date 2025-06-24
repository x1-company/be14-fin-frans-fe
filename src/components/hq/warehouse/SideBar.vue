<template>
  <div class="sidebar">
    <!-- Fixed Header -->
    <div class="sidebar-header">
      <div class="header-item">
        <span class="star-icon">★</span>
        <span>즐겨찾기</span>
        <button class="add-btn">+</button>
      </div>

      <div class="header-item">
        <img
          src="@/assets/menu-supplier.png"
          alt="창고 관리"
          class="sidebar__icon"
          style="width: 20px; height: 20px"
        />창고 관리
      </div>

      <div class="count-info">
        <span>전체 {{ totalCount }}</span>
      </div>

      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="창고 검색"
          class="search-input"
        />
        <span class="search-icon">🔍</span>
      </div>
    </div>

    <!-- Scrollable Content -->
    <div class="sidebar-content">
      <div
        v-for="warehouse in filteredWarehouses"
        :key="warehouse.id"
        class="company-item"
        :class="{ active: selectedWarehouse?.id === warehouse.id }"
        @click="handleWarehouseClick(warehouse)"
      >
        <div class="company-header">
          <img src="@/assets/menu-supplier-2.png" class="sidebar__info-icon" />
          <span class="company-name">{{ warehouse.name }}</span>
          <span class="company-category">창고</span>
        </div>
        <div class="company-details">
          <div class="detail-row">
            <img src="@/assets/phone.png" class="sidebar__info-icon" />
            <span>{{ warehouse.phone }}</span>
          </div>
          <div class="detail-row">
            <img src="@/assets/address.png" class="sidebar__info-icon" />
            <span>{{ warehouse.address }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const emit = defineEmits(["select-warehouse"]);

const searchQuery = ref("");
const totalCount = ref(0);
const warehouses = ref([]);
const selectedWarehouse = ref(null);

onMounted(async () => {
  if (!authStore.accessToken) return;
  try {
    // 창고 목록 API 엔드포인트로 변경
    // const { data } = await api.get("/api/hq/warehouses/list");
    // warehouses.value = data;
    // totalCount.value = data.length;
  } catch (error) {
    console.error("창고 목록 불러오기 실패", error);
  }
});

const filteredWarehouses = computed(() => {
  if (!searchQuery.value) return warehouses.value;
  return warehouses.value.filter((warehouse) =>
    warehouse.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const handleWarehouseClick = (warehouse) => {
  selectedWarehouse.value = warehouse;
  emit("select-warehouse", warehouse);
};
</script>

<style scoped>
.sidebar {
  width: 300px;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  background: white;
}

.header-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.add-btn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #6c757d;
}

.count-info {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 16px;
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
  background: #667eea;
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