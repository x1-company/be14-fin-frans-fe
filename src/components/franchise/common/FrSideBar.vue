<script setup>
import { ref, onMounted } from "vue";
import api from "@/lib/api";

const franchise = ref(null);

async function fetchFranchise() {
  try {
    const { data } = await api.get("/api/franchise");
    if (data && data.length > 0) {
      const franchiseData = data[0];
      if (franchiseData.address) {
        const addressParts = franchiseData.address.split(' ');
        if (addressParts.length > 1) {
          franchiseData.district = addressParts[1];
        }
      }
      franchise.value = franchiseData;
    }
  } catch (error) {
    console.error("가맹점 정보 불러오기 실패", error);
    franchise.value = null;
  }
}
onMounted(fetchFranchise);
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="header-item">
        <img
          src="@/assets/menu-franchise.png"
          alt="매장관리"
          class="sidebar__icon"
        />매장관리
      </div>
    </div>

    <div class="sidebar-content" v-if="franchise">
      <div class="company-item">
        <div class="company-header">
          <img
            src="@/assets/franchise.png"
            class="franchise-icon"
            alt="franchise icon"
            />
          <span class="company-name">{{ franchise.name }}</span>
          <span class="company-district">{{ franchise.district }}</span>
        </div>
        <div class="company-details">
          <div class="detail-row">
            <img
              src="@/assets/phone.png"
              class="sidebar__info-icon"
              alt="phone icon"
            />
            <span>{{ franchise.phone }}</span>
          </div>
          <div class="detail-row">
            <img
              src="@/assets/user.png"
              class="sidebar__info-icon"
              alt="user icon"
            />
            <span>{{ franchise.ownerName }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  min-width: 260px;
  max-width: 340px;
  width: 300px;
  flex-shrink: 0;
  background: #ffffff;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-x: hidden;
  position: relative;
  z-index: 2;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  background: white;
}

.sidebar__info-icon {
  width: 16px;
  height: 16px;
  opacity: 0.6;
}

.header-item {
  font-weight: 600;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar__icon {
  width: 26px;
  height: 23px;
}

.franchise-icon {
  width: 28px;
  height: 27px;
}

.sidebar-content {
  flex: 1;
  padding: 16px;
}

.company-item {
  background: #eaf3ff;
  border: 1px solid #d1e3ff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
}

.company-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.company-name {
  font-weight: 600;
  color: #212529;
  font-size: 1.1rem;
}

.company-district {
  background-color: #d4edda;
  color: #155724;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-left: auto;
}

.company-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #495057;
}
</style> 