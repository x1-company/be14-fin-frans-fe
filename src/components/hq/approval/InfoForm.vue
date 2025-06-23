<template>
  <div class="info-form">
    <!-- 상신 관련 메뉴일 때 ApprovalList 표시 -->
    <ApprovalList
      v-if="shouldShowApprovalList"
      :approvalList="approvalList"
      :activeTab="activeTab"
      @tab-change="handleTabChange"
      @select-menu="handleSelectMenu"
    />

    <!-- 수신 관련 메뉴일 때 ReceptionList 표시 -->
    <ReceptionList
      v-if="shouldShowReceptionList"
      :approvalList="approvalList"
      :activeTab="activeTab"
      @tab-change="handleTabChange"
    />

    <!-- 결재문서 관련 메뉴일 때 ReceptionApproverList 표시 -->
    <ReceptionApproverList
      v-if="shouldShowReceptionApproverList"
      :approvalList="approvalList"
      :activeTab="activeTab"
      @tab-change="handleTabChange"
      @select-menu="handleSelectMenu"
    />

    <!-- 협조문서 관련 메뉴일 때 ReceptionCooperatorList 표시 -->
    <ReceptionCooperatorList
      v-if="shouldShowReceptionCooperatorList"
      :approvalList="approvalList"
      :activeTab="activeTab"
      @tab-change="handleTabChange"
      @select-menu="handleSelectMenu"
    />

    <!-- 참조문서 관련 메뉴일 때 ReferenceList 표시 -->
    <ReferenceList
      v-if="shouldShowReferenceList"
      :approvalList="approvalList"
    />

    <!-- 수신문서 관련 메뉴일 때 NotificationList 표시 -->
    <NotificationList
      v-if="shouldShowNotificationList"
      :approvalList="approvalList"
    />
  </div>
</template>

<script setup>
import { defineProps, computed } from "vue";
import ApprovalList from "@/components/hq/approval/ApprovalList.vue";
import ReceptionList from "@/components/hq/approval/sidebarReception/ReceptionList.vue";
import ReceptionApproverList from "@/components/hq/approval/sidebarReception/ReceptionApproverList.vue";
import ReceptionCooperatorList from "@/components/hq/approval/sidebarReception/ReceptionCooperatorList.vue";
import ReferenceList from "@/components/hq/approval/sidebarReception/ReferenceList.vue";
import NotificationList from "@/components/hq/approval/sidebarReception/NotificationList.vue";

// 둘다 있어야 메뉴와 탭들이 움직임
const handleTabChange = (tabValue) => {
  emit("tab-change", tabValue); // Info.vue 로 전달
};
const handleSelectMenu = (menuValue) => {
  emit("select-menu", menuValue); // Info.vue 로 전달
};
const emit = defineEmits(["tab-change", "select-menu"]);

const props = defineProps({
  approvalList: {
    type: Array,
    required: true,
  },
  activeTab: { type: String, required: true },
  activeMenu: { type: String, required: true },
});

// 상신 관련 메뉴인지 확인
const isSentMenu = computed(() => {
  const sentMenus = ["상신", "임시저장", "결재중", "결재완료", "결재반려"];
  return sentMenus.includes(props.activeMenu);
});

// 수신 관련 메뉴인지 확인 (협조문서 제외)
const isReceivedMenu = computed(() => {
  const receivedMenus = [
    "수신",
    "결재요청",
    "결재예정",
    "내결재 승인",
    "내결재 반려",
  ];
  return receivedMenus.includes(props.activeMenu);
});

// 결재문서 관련 메뉴인지 확인
const isApproverMenu = computed(() => {
  const approverMenus = [
    "결재-전체",
    "결재대기",
    "결재예정",
    "내 결재 승인",
    "내 결재 반려",
  ];
  return approverMenus.includes(props.activeMenu);
});

// 협조문서 관련 메뉴인지 확인
const isCooperatorMenu = computed(() => {
  const cooperatorMenus = [
    "협조-전체",
    "협조대기",
    "협조예정",
    "내 협조 승인",
    "내 협조 반려",
  ];
  return (
    cooperatorMenus.includes(props.activeMenu) ||
    cooperatorMenus.includes(props.activeTab)
  );
});

// 전체 메뉴는 현재 활성화된 탭에 따라 결정
const isSentTab = computed(() => {
  // activeTab이 상신 관련 탭이거나, activeMenu가 상신 관련 메뉴인 경우
  const sentTabs = ["전체", "임시저장", "결재중", "결재완료", "결재반려"];
  return (
    sentTabs.includes(props.activeTab) || sentTabs.includes(props.activeMenu)
  );
});

// 최종 렌더링 조건 - activeMenu를 기준으로 결정
const shouldShowApprovalList = computed(() => {
  // 상신 관련 메뉴이거나 상신-전체인 경우
  return isSentMenu.value || props.activeMenu === "상신-전체";
});

const shouldShowReceptionList = computed(() => {
  // 수신 관련 메뉴이거나 수신-전체인 경우 (결재문서, 협조문서 메뉴 제외)
  return (
    (isReceivedMenu.value || props.activeMenu === "수신-전체") &&
    !isApproverMenu.value &&
    !isCooperatorMenu.value
  );
});

const shouldShowReceptionApproverList = computed(() => {
  // 결재문서 관련 메뉴인 경우 (수신-전체 제외)
  return isApproverMenu.value && props.activeMenu !== "수신-전체";
});

const shouldShowReceptionCooperatorList = computed(() => {
  // 협조문서 관련 메뉴인 경우
  return isCooperatorMenu.value;
});

const shouldShowReferenceList = computed(() => {
  // 참조문서 관련 메뉴인 경우
  return props.activeMenu === "참조문서";
});

const shouldShowNotificationList = computed(() => {
  // 수신문서 관련 메뉴인 경우
  return props.activeMenu === "수신문서";
});

// const getStatusClass = (status) => {
//   const statusMap = {
//     DRAFT: "status-draft",
//     IN_PROGRESS: "status-progress",
//     APPROVED: "status-approved",
//     REJECTED: "status-rejected",
//   };
//   return statusMap[status] || "";
// };

// const getStatusText = (status) => {
//   const statusMap = {
//     DRAFT: "임시저장",
//     IN_PROGRESS: "결재 중",
//     APPROVED: "결재완료",
//     REJECTED: "결재반려",
//   };
//   return statusMap[status] || status;
// };

// const formatDate = (dateString) => {
//   const date = new Date(dateString);
//   return date.toLocaleDateString("ko-KR", {
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };
</script>

<style scoped>
.info-form {
  background: #fff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.03);
  padding: 24px 32px;
  width: 100%;
  box-sizing: border-box;
}

.approval-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  text-align: center;
  padding: 48px;
  color: #6c757d;
  font-size: 1.1rem;
  width: 100%;
  box-sizing: border-box;
}

.approval-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.approval-item {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;
}

.approval-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.approval-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.approval-item__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
}

.approval-item__status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-draft {
  background: #e9ecef;
  color: #495057;
}

.status-progress {
  background: #e3f2fd;
  color: #1976d2;
}

.status-approved {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-rejected {
  background: #ffebee;
  color: #c62828;
}

.approval-item__content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.approval-item__info {
  display: flex;
  gap: 16px;
  color: #6c757d;
  font-size: 0.9rem;
}

.approval-item__description {
  color: #495057;
  font-size: 0.95rem;
  line-height: 1.5;
}
</style>
