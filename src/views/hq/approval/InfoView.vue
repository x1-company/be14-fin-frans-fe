<template>
  <div class="app">
    <NavBar />
    <div class="main-container">
      <!-- 일반 사이드바 (대시보드, 전자결재 탭) -->
      <SideBar
        v-if="currentTabIndex !== 2"
        :activeTab="activeTab.toString()"
        :activeMenu="activeMenu"
        :counts="approvalCounts"
        @select-menu="handleSelectMenu"
        @register-approval="handleRegisterApproval"
      />

      <!-- 템플릿 사이드바 (결재템플릿 탭) -->
      <TemplateSideBar
        v-if="currentTabIndex === 2"
        :selectedTemplate="selectedTemplate"
        :isReorderMode="isReorderMode"
        @select-template="handleTemplateSelect"
        @reorder-change="handleReorderChange"
        @reorder-cancel="handleReorderCancel"
        ref="templateSidebarRef"
      />

      <!-- Info 컴포넌트에 selectedTemplate 전달 -->
      <Info
        v-if="currentTabIndex !== 2"
        :approvalList="approvalList"
        :activeTab="activeTab"
        :activeMenu="activeMenu"
        :isRegistrationMode="isRegistrationMode"
        :reorderChanges="reorderChanges"
        :selectedTemplate="selectedTemplate"
        @update:activeTab="handleTabChange"
        @active-tab-change="handleActiveTabChange"
        @toggle-registration-mode="handleToggleRegistrationMode"
        @template-deleted="handleTemplateDeleted"
        @template-updated="handleTemplateUpdated"
        @reorder-mode-changed="handleReorderModeChanged"
        @reorder-complete="handleReorderComplete"
        @reorder-cancel="handleReorderCancel"
        @tab-change="handleTabChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from "vue";
import NavBar from "@/components/hq/common/NavBar.vue";
import SideBar from "@/components/hq/approval/SideBar.vue";
import TemplateSideBar from "@/components/hq/approval/TemplateSideBar.vue";
import Info from "@/components/hq/approval/Info.vue";
import api from "@/lib/api";

const approvalList = ref([]);
const activeMenu = ref("상신"); // 사이드바 메뉴 선택 (상신, 수신)
const activeTab = ref("전체"); // ApprovalList 탭 선택 (전체, 임시저장, 결재중, 결재완료, 결재반려)
const currentTabIndex = ref(0); // 현재 선택된 탭 인덱스 (0: 대시보드, 1: 전자결재, 2: 결재템플릿)
const isRegistrationMode = ref(false); // 등록 모드 활성화 여부

// 결재템플릿 관련 변수
const selectedTemplate = ref(null); // 선택된 템플릿 정보
const isReorderMode = ref(false); // 순서 변경 모드 활성화 여부
const templateSidebarRef = ref(null); // 결재템플릿 사이드바 참조
const reorderChanges = ref([]); // 순서 변경 정보 저장

const handleSelectMenu = (menuValue) => {
  activeMenu.value = menuValue;

  // 상신-전체, 수신-전체, 협조-전체, 결재-전체인 경우 activeTab을 "전체"로 설정
  if (
    menuValue === "상신-전체" ||
    menuValue === "수신-전체" ||
    menuValue === "협조-전체" ||
    menuValue === "결재-전체"
  ) {
    activeTab.value = "전체";
  } else {
    activeTab.value = menuValue;
  }

  // 사이드바 메뉴를 클릭하면 항상 전자결재 탭으로 이동
  currentTabIndex.value = 1; // 전자결재 탭으로 이동
  isRegistrationMode.value = false; // 등록 모드 비활성화
};

const handleTabChange = (tab) => {
  activeTab.value = tab;
};

const handleActiveTabChange = (tabIndex) => {
  currentTabIndex.value = tabIndex;
};

const handleTemplateSelect = (template) => {
  selectedTemplate.value = template;
};

const handleRegisterApproval = () => {
  // 어떤 탭에서든 결재 등록 버튼을 누르면 전자결재 탭으로 이동하고 등록 모드 활성화
  currentTabIndex.value = 1; // 전자결재 탭 선택
  activeTab.value = "전자결재"; // Info 컴포넌트의 탭을 전자결재로 변경
  isRegistrationMode.value = true; // 등록 모드 활성화
};

const handleToggleRegistrationMode = (value) => {
  // 파라미터가 있으면 해당 값으로, 없으면 토글
  isRegistrationMode.value =
    value !== undefined ? value : !isRegistrationMode.value;
};

// 템플릿 삭제 처리
const handleTemplateDeleted = () => {
  selectedTemplate.value = null;
  // 사이드바 새로고침
  if (templateSidebarRef.value) {
    templateSidebarRef.value.refreshTemplates();
  }
};

// 템플릿 수정 처리
const handleTemplateUpdated = () => {
  // 사이드바 새로고침
  if (templateSidebarRef.value) {
    templateSidebarRef.value.refreshTemplates();
  }
};

// 순서 변경 모드 처리
const handleReorderModeChanged = (mode) => {
  isReorderMode.value = mode;
  if (!mode) {
    // 순서 변경 모드 종료 시 변경 정보 초기화
    reorderChanges.value = [];
  }
};

// 순서 변경 정보 저장
const handleReorderChange = (changeInfo) => {
  reorderChanges.value.push(changeInfo);
  console.log("순서 변경 정보 저장:", changeInfo);
};

// 순서 변경 완료 처리
const handleReorderComplete = async () => {
  if (reorderChanges.value.length === 0) {
    console.log("변경된 순서가 없습니다.");
    return;
  }

  try {
    // 모든 순서 변경을 API로 전송
    for (const change of reorderChanges.value) {
      await api.patch(
        `/api/hq/approvals/templates/${change.templateId}/seq/${
          change.newIndex + 1
        }`
      );
      console.log(
        `템플릿 ${change.templateId} 순서를 ${change.newIndex + 1}로 변경`
      );
    }

    console.log("모든 순서 변경 완료");

    // 사이드바 새로고침
    if (templateSidebarRef.value) {
      await templateSidebarRef.value.completeReorder();
    }

    // 변경 정보 초기화
    reorderChanges.value = [];
  } catch (error) {
    console.error("순서 변경 실패:", error);
    alert("순서 변경에 실패했습니다.");

    // 실패 시 사이드바 롤백
    if (templateSidebarRef.value) {
      templateSidebarRef.value.cancelReorder();
    }
  }
};

// 순서 변경 취소 처리
const handleReorderCancel = () => {
  reorderChanges.value = [];
  if (templateSidebarRef.value) {
    templateSidebarRef.value.cancelReorder();
  }
  console.log("순서 변경 취소됨");
};

const approvalCounts = ref({
  전체: 0,
  임시저장: 0,
  결재중: 0,
  결재완료: 0,
  결재반려: 0,
  결재대기: 0,
  결재예정: 0,
  내결재승인: 0,
  내결재반려: 0,
  협조대기: 0,
  협조예정: 0,
  내협조승인: 0,
  내협조반려: 0,
  참조문서: 0,
  수신문서: 0,
});

const fetchCounts = async () => {
  const endpoints = {
    전체: "/api/hq/approvals/list/submitted/all",
    임시저장: "/api/hq/approvals/list/submitted/draft",
    결재중: "/api/hq/approvals/list/submitted/in-progress",
    결재완료: "/api/hq/approvals/list/submitted/approved",
    결재반려: "/api/hq/approvals/list/submitted/rejected",
    //수신
    결재대기: "/api/hq/approvals/list/received/pending",
    결재예정: "/api/hq/approvals/list/received/upcoming",
    내결재승인: "/api/hq/approvals/list/received/my-completed/approved",
    내결재반려: "api/hq/approvals/list/received/my-completed/rejected",
    협조대기: "/api/hq/approvals/list/cooperate/pending",
    협조예정: "/api/hq/approvals/list/cooperate/upcoming",
    내협조승인: "/api/hq/approvals/list/cooperate/approved",
    내협조반려: "/api/hq/approvals/list/cooperate/rejected",
    참조문서: "/api/hq/approvals/list/references",
    수신문서: "/api/hq/approvals/list/notifications",
  };
  for (const key in endpoints) {
    try {
      const { data } = await api.get(endpoints[key]);
      approvalCounts.value[key] = data.length;
    } catch {
      approvalCounts.value[key] = 0;
    }
  }
};

onMounted(fetchCounts);

watch(
  [activeMenu, activeTab],
  async ([menu, tab]) => {
    const activeTab = tab || menu;
    let url = "";
    console.log("activeMenu:", menu, "activeTab:", activeTab);

    // 상신 관련 메뉴인지 확인
    const isSentMenu =
      menu === "상신-전체" ||
      ["임시저장", "결재중", "결재완료", "결재반려"].includes(activeTab);

    // 협조문서 관련 메뉴인지 확인 (activeMenu와 activeTab 모두 확인)
    const isCooperatorMenu =
      [
        "협조-전체",
        "협조대기",
        "협조예정",
        "내 협조 승인",
        "내 협조 반려",
      ].includes(activeTab) ||
      [
        "협조-전체",
        "협조대기",
        "협조예정",
        "내 협조 승인",
        "내 협조 반려",
      ].includes(menu);

    if (isSentMenu) {
      // 상신 관련 API
      if (activeTab === "임시저장") {
        url = "/api/hq/approvals/list/submitted/draft";
      } else if (activeTab === "전체") {
        url = "/api/hq/approvals/list/submitted/all";
      } else if (activeTab === "결재중") {
        url = "/api/hq/approvals/list/submitted/in-progress";
      } else if (activeTab === "결재완료") {
        url = "/api/hq/approvals/list/submitted/approved";
      } else if (activeTab === "결재반려") {
        url = "/api/hq/approvals/list/submitted/rejected";
      }
    } else if (isCooperatorMenu) {
      // 협조문서 관련 API
      if (activeTab === "전체" || menu === "협조-전체") {
        url = "/api/hq/approvals/list/cooperate/all";
      } else if (activeTab === "협조대기") {
        url = "/api/hq/approvals/list/cooperate/pending";
      } else if (activeTab === "협조예정") {
        url = "/api/hq/approvals/list/cooperate/upcoming";
      } else if (activeTab === "내 협조 승인") {
        url = "/api/hq/approvals/list/cooperate/approved";
      } else if (activeTab === "내 협조 반려") {
        url = "/api/hq/approvals/list/cooperate/rejected";
      }
    } else if (menu === "참조문서") {
      // 참조문서 관련 API
      url = "/api/hq/approvals/list/references";
    } else if (menu === "수신문서") {
      // 수신문서 관련 API
      url = "/api/hq/approvals/list/notifications";
    } else {
      // 수신 관련 API (결재문서)
      if (activeTab === "전체" || menu === "결재-전체") {
        // 결재문서의 "전체"인지 수신의 "전체"인지 구분
        if (menu === "수신-전체") {
          url = "/api/hq/approvals/list/received/all";
        } else {
          // 결재문서의 "전체"
          url = "/api/hq/approvals/list/received/all";
        }
      } else if (activeTab === "결재중") {
        url = "/api/hq/approvals/list/received/in-progress"; // 결재중
      } else if (activeTab === "결재완료") {
        url = "/api/hq/approvals/list/received/approved"; // 결재완료
      } else if (activeTab === "결재반려") {
        url = "/api/hq/approvals/list/received/rejected"; // 결재반려
      } else if (activeTab === "결재대기") {
        url = "/api/hq/approvals/list/received/pending";
      } else if (activeTab === "결재예정") {
        url = "/api/hq/approvals/list/received/upcoming";
      } else if (activeTab === "내결재 승인") {
        url = "/api/hq/approvals/list/received/my-completed/approved";
      } else if (activeTab === "내결재 반려") {
        url = "/api/hq/approvals/list/received/my-completed/rejected";
      }
    }

    if (url) {
      try {
        const { data } = await api.get(url);
        approvalList.value = data;
      } catch (error) {
        console.error("결재 목록 조회 실패:", error);
        approvalList.value = [];
      }
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>
