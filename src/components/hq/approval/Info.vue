<script setup>
import { ref, onMounted, computed } from "vue";
import api from "@/lib/api";

import Breadcrumb from "@/components/hq/common/Breadcrumb.vue";
import InfoHeader from "@/components/hq/approval/InfoHeader.vue";
import InfoForm from "@/components/hq/approval/InfoForm.vue";
import ApprovalCard from "@/components/hq/approval/ApprovalCard.vue";

const supplier = ref(null);
const breadcrumbItems = ref();
const selectedApprovalId = ref(null);
const props = defineProps({
  approvalList: Array,
});
// const selectedSupplierId = computed(() => props.company?.id);
const updateBreadcrumb = (newItems) => {
  breadcrumbItems.value = newItems;
};
const tabs = ["전체", "임시저장", "결재중", "결재완료", "결재반려"];
const activeTab = ref("전체");
function selectTab(tab) {
  activeTab.value = tab;
  // 탭에 따라 데이터 필터링 등 추가 로직 작성 가능
}
// const tabs = ["전자결재", "납품관리", "발주관리"];
// const activeTab = ref("전자결재");

// const selectTab = (tab) => {
//   activeTab.value = tab;
// };
</script>

<template>
  <div class="info-container">
    <div class="breadcrumb-container">
      <Breadcrumb :items="breadcrumbItems || []" />
    </div>

    <!-- Scrollable Content -->
    <div class="info-content">
      <div class="header-banner">
        <div class="info-group">
          <InfoHeader
            title="전자 결재"
            desc="결재 정보를 확인하고 관리할 수 있습니다."
            :tabs="['전자결재', '납품관리', '발주관리']"
            :activeTab="0"
            @update-breadcrumb="updateBreadcrumb"
          />
          <!-- InfoForm에 supplierId만 넘겨주면 됨 -->
          <InfoForm :approvalId="selectedApprovalId" />
        </div>
      </div>
      <!-- 본문 시작 -->
      <div class="content-header">
        <button class="edit-btn">✏️ 수정</button>
      </div>

      <div v-if="supplier" class="info-sections">
        <!-- 기본 정보 -->
        <section class="info-section">
          <!-- 탭 영역 추가 -->
          <div class="approval-tabs">
            <ApprovalCard
              v-for="approval in approvalList"
              :key="approval.id"
              :approval="approval"
            />
          </div>
        </section>

        <!-- 연락처 정보 -->
        <section class="info-section"> </section>
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
  padding: 32px 24px;
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
