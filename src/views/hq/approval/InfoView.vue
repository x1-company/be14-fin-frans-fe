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

      <!-- 상세 정보와 목록을 모두 Info 컴포넌트에서 관리 -->
      <Info
        :approvalList="approvalList"
        :activeTab="activeTab.toString()"
        :activeMenu="activeMenu"
        :isRegistrationMode="isRegistrationMode"
        :reorderChanges="reorderChanges"
        :selectedTemplate="selectedTemplate"
        :approvalId="approvalId"
        :approvalDetail="approvalDetail"
        @active-tab-change="handleActiveTabChange"
        @toggle-registration-mode="handleToggleRegistrationMode"
        @template-deleted="handleTemplateDeleted"
        @template-updated="handleTemplateUpdated"
        @reorder-mode-changed="handleReorderModeChanged"
        @reorder-complete="handleReorderComplete"
        @reorder-cancel="handleReorderCancel"
        @tab-change="handleTabChange"
        @select-menu="handleSelectMenu"
        @refresh-list="handleRefreshList"
        @approval-submitted="handleApprovalSubmitted"
        @close-detail="$router.push('/approval')"
        @counts-refresh="handleCountsRefresh"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import NavBar from "@/components/hq/common/NavBar.vue";
import SideBar from "@/components/hq/approval/SideBar.vue";
import TemplateSideBar from "@/components/hq/approval/TemplateSideBar.vue";
import Info from "@/components/hq/approval/Info.vue";
import api from "@/lib/api";

const approvalList = ref([]);
const mainTab = ref("상신"); // '상신' 또는 '수신'
const activeMenu = ref("상신-전체");
const activeTab = ref("전체");
const currentTabIndex = ref(0); // 현재 선택된 탭 인덱스 (0: 대시보드, 1: 전자결재, 2: 결재템플릿)
const isRegistrationMode = ref(false); // 등록 모드 활성화 여부

// 결재템플릿 관련 변수
const selectedTemplate = ref(null); // 선택된 템플릿 정보
const isReorderMode = ref(false); // 순서 변경 모드 활성화 여부
const templateSidebarRef = ref(null); // 결재템플릿 사이드바 참조
const reorderChanges = ref([]); // 순서 변경 정보 저장

const route = useRoute();
const router = useRouter();
const approvalId = ref(route.params.approvalId);
const approvalDetail = ref(null);

const handleSelectMenu = (menuValue) => {
  const sentMenus = ["상신-전체", "임시저장", "결재중", "결재완료", "결재반려"];

  if (sentMenus.includes(menuValue)) {
    mainTab.value = "상신";
  } else {
    mainTab.value = "수신";
  }

  activeMenu.value = menuValue;

  if (menuValue.endsWith("-전체")) {
    activeTab.value = "전체";
  } else {
    activeTab.value = menuValue;
  }

  currentTabIndex.value = 1;
  isRegistrationMode.value = false;
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
    내결재반려: "/api/hq/approvals/list/received/my-completed/rejected",
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

// 카운트 새로고침 핸들러 추가
const handleCountsRefresh = () => {
  console.log("카운트 새로고침 요청됨");
  fetchCounts();
};

const fetchApprovalList = async () => {
  const apiGroups = {
    상신: {
      "상신-전체": "/api/hq/approvals/list/submitted/all",
      임시저장: "/api/hq/approvals/list/submitted/draft",
      결재중: "/api/hq/approvals/list/submitted/in-progress",
      결재완료: "/api/hq/approvals/list/submitted/approved",
      결재반려: "/api/hq/approvals/list/submitted/rejected",
    },
    수신: {
      "수신-전체": "/api/hq/approvals/list/received/all",
      "결재-전체": "/api/hq/approvals/list/received/all",
      결재대기: "/api/hq/approvals/list/received/pending",
      결재예정: "/api/hq/approvals/list/received/upcoming",
      결재중: "/api/hq/approvals/list/received/in-progress",
      결재완료: "/api/hq/approvals/list/received/approved",
      결재반려: "/api/hq/approvals/list/received/rejected",
      "내 결재 승인": "/api/hq/approvals/list/received/my-completed/approved",
      "내 결재 반려": "/api/hq/approvals/list/received/my-completed/rejected",
      "협조-전체": "/api/hq/approvals/list/cooperate/all",
      협조대기: "/api/hq/approvals/list/cooperate/pending",
      협조예정: "/api/hq/approvals/list/cooperate/upcoming",
      "내 협조 승인": "/api/hq/approvals/list/cooperate/approved",
      "내 협조 반려": "/api/hq/approvals/list/cooperate/rejected",
      참조문서: "/api/hq/approvals/list/references",
      수신문서: "/api/hq/approvals/list/notifications",
    },
  };

  const apiGroup = apiGroups[mainTab.value];
  if (!apiGroup) {
    console.warn(`Invalid main tab: ${mainTab.value}`);
    return;
  }

  let endpointKey;

  // 1. 특정 탭(예: 결재중, 결재대기)이 선택되면, 해당 탭을 API 키로 사용
  if (activeTab.value !== "전체") {
    endpointKey = activeTab.value;
  } else {
    // 2. '전체' 탭이 선택된 경우
    if (mainTab.value === "상신") {
      endpointKey = "상신-전체";
    } else {
      // '수신' 탭의 경우, 현재 메뉴가 어느 카테고리에 속하는지 확인
      const is결재Category = [
        "결재-전체",
        "결재대기",
        "결재예정",
        "내 결재 승인",
        "내 결재 반려",
      ].includes(activeMenu.value);
      const is협조Category = [
        "협조-전체",
        "협조대기",
        "협조예정",
        "내 협조 승인",
        "내 협조 반려",
      ].includes(activeMenu.value);

      if (is결재Category) {
        endpointKey = "결재-전체";
      } else if (is협조Category) {
        endpointKey = "협조-전체";
      } else {
        // '수신-전체', '참조문서', '수신문서'
        endpointKey = activeMenu.value;
      }
    }
  }

  const url = apiGroup[endpointKey];

  console.log(
    `Fetching data for: [${mainTab.value}] ${endpointKey}, URL: ${url}`
  );

  if (url) {
    try {
      const { data } = await api.get(url);
      approvalList.value = data;
    } catch (error) {
      console.error("결재 목록 조회 실패:", error);
      approvalList.value = [];
    }
  } else {
    console.warn(
      `No endpoint found for key: ${endpointKey} in ${mainTab.value}`
    );
    approvalList.value = [];
  }
};

const handleRefreshList = () => {
  fetchCounts();
  fetchApprovalList();
};

const handleApprovalSubmitted = (approvalData) => {
  // 결재 요청 성공 시 해당 결재의 상세 페이지로 이동
  console.log("결재 제출 완료, 데이터:", approvalData);
  if (approvalData && approvalData.id) {
    console.log(
      "결재 상세 페이지로 이동 시도:",
      `/approval/${approvalData.id}`
    );
    router.push(`/approval/${approvalData.id}`);
  } else {
    console.log("결재 ID가 없어서 이동하지 않음");
  }
};

onMounted(fetchCounts);

watch(
  () => route.params.approvalId,
  async (newId) => {
    approvalId.value = newId;
    if (newId) {
      try {
        const response = await api.get(
          `/api/hq/approvals/detail/${newId}/content`
        );
        // API 응답이 배열 형태일 수 있으므로 첫 번째 항목을 사용합니다.
        approvalDetail.value = Array.isArray(response.data)
          ? response.data[0]
          : response.data;
      } catch (error) {
        console.error("결재 상세 정보 조회 실패:", error);
        approvalDetail.value = null;
      }
    } else {
      approvalDetail.value = null;
    }
  },
  { immediate: true }
);

watch(
  [mainTab, activeMenu, activeTab],
  async ([currentMainTab, menu, tab]) => {
    fetchApprovalList();
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
