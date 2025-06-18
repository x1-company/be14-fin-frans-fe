<script setup>
import { ref, computed } from "vue";

import Breadcrumb from "@/components/hq/common/Breadcrumb.vue";
import InfoHeader from "@/components/hq/user/common/InfoHeader.vue";
import UserTypeHeader from "@/components/hq/user/common/UserTypeHeader.vue";
import HqSearch from "@/components/hq/user/search/HqSearch.vue";
import FranchiseSearch from "@/components/hq/user/search/FranchiseSearch.vue";
import SupplierSearch from "@/components/hq/user/search/SupplierSearch.vue";
import FranchiseRegister from "../register/FranchiseRegister.vue";
import HqRegister from "../register/HqRegister.vue";
import SupplierRegister from "../register/SupplierRegister.vue";

const props = defineProps({
  company: Object,
});

const breadcrumbItems = ref(["HOME", "인사관리", "계정 정보", "본사"]);
const updateBreadcrumb = (newItems) => {
  breadcrumbItems.value = newItems;
};

const tabInfo = ref([
    { title: "계정 정보", desc: "계정 정보 확인 및 수정이 가능합니다." },
    { title: "계정 등록", desc: "새로운 계정 정보를 등록할 수 있습니다." },
])

const activeTab = ref(0)

const title = computed(() => tabInfo.value[activeTab.value].title);
const desc = computed(() => tabInfo.value[activeTab.value].desc);

const updateTab = (newTabIndex) => {
  activeTab.value = newTabIndex;
  const currentUserTypeText = ['본사', '가맹점', '공급처'][currentUserTypeTab.value];
  updateBreadcrumb(["HOME", "인사관리", tabInfo.value[newTabIndex].title, currentUserTypeText]);
};

const currentUserTypeTab = ref(0);

const handleUserTypeSelect = (index, tabText) => {
    currentUserTypeTab.value = index;

    const currentTitle = tabInfo.value[activeTab.value].title;

    updateBreadcrumb(["HOME", "인사관리", currentTitle, tabText]);
}

</script>

<template>
  <div class="info-container">
    <div class="breadcrumb-container">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <!-- Scrollable Content -->
    <div class="info-content">
      <div class="header-banner">
        <div class="info-group">
          <InfoHeader
            :title="title"
            :desc="desc"
            :tabs="['계정 정보', '계정 등록']"
            :activeTab="activeTab"
            @select-tab="updateTab"
            @update-breadcrumb="updateBreadcrumb"
          />
          <UserTypeHeader 
            :active-tab="currentUserTypeTab"
            @select-user-type="handleUserTypeSelect"
          />
        </div>
      </div>
      <div v-if="currentUserTypeTab === 0 && activeTab === 0">
        <HqSearch />
      </div>
      <div v-if="currentUserTypeTab === 1 && activeTab === 0">
        <FranchiseSearch />
      </div>
      <div v-if="currentUserTypeTab === 2 && activeTab === 0">
        <SupplierSearch />
      </div>

      <div v-if="currentUserTypeTab === 0 && activeTab === 1">
        <HqRegister />
      </div>
      <div v-if="currentUserTypeTab === 1 && activeTab === 1">
        <FranchiseRegister />
      </div>
      <div v-if="currentUserTypeTab === 2 && activeTab === 1">
        <SupplierRegister />
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8f9fa;
}

.info-header {
  /* background: transparent; */
  border-bottom: 1px solid #e9ecef;
}

.breadcrumb {
  padding: 16px 24px;
  font-size: 14px;
  color: #6c757d;
}

.separator {
  margin: 0 8px;
}

.header-banner {
  /* background: blue; */
  color: white;
  padding: 32px 24px 0 24px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 8px 0;
}

.page-description {
  margin: 0 0 24px 0;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-primary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.info-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.content-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 24px;
}

.content-header h2 {
  margin: 0;
  color: #212529;
}

.edit-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.info-sections {
  background: white;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  margin: 0 0 20px 0;
  color: #212529;
  font-size: 18px;
  font-weight: 600;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  gap: 24px;
}

.info-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  flex: 2;
}

.info-item label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.info-item span {
  font-size: 15px;
  color: #212529;
}

.postal-code {
  font-size: 13px;
  color: #6c757d;
  margin-top: 4px;
}

.contact-grid {
  display: flex;
  gap: 32px;
}

.contact-item {
  flex: 1;
}

.contact-item label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 12px;
}

.contact-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f4;
}

.contact-details:last-child {
  border-bottom: none;
}

.contact-label {
  font-size: 14px;
  color: #6c757d;
}

.contact-value {
  font-size: 14px;
  color: #212529;
  font-weight: 500;
}
</style>
