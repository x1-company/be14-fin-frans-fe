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
        :activeTabSwitch="
          currentTabIndex === 2
            ? 1
            : currentTabIndex === 1
            ? 0
            : currentTabIndex
        "
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
        @document-type="handleDocumentType"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import NavBar from "@/components/hq/common/NavBar.vue";
import SideBar from "@/components/hq/approval/SideBar.vue";
import TemplateSideBar from "@/components/hq/approval/TemplateSideBar.vue";
import Info from "@/components/hq/approval/Info.vue";
import api from "@/lib/api";
import { useToast } from "@/composables/useToast";

const toast = useToast();

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

// 현재 문서 타입 저장
const currentDocumentType = ref("ORDER");

// 쿼리스트링(tab)으로 진입 시 결재중/결재완료 탭 자동 활성화
if (route.query.tab === "결재중") {
  activeTab.value = "결재중";
  activeMenu.value = "결재중";
  currentTabIndex.value = 1;
}
if (route.query.tab === "결재완료") {
  activeTab.value = "결재완료";
  activeMenu.value = "결재완료";
  currentTabIndex.value = 1;
}

// 등록/수정 모드 감지
const isRegisterMode = computed(() => {
  return (
    route.name === "approval-register" ||
    route.path.includes("/approval/register")
  );
});

// 등록 모드일 때 자동으로 등록 모드 활성화
watch(
  isRegisterMode,
  (newValue) => {
    if (newValue) {
      console.log("등록 모드 감지됨:", route.path);
      isRegistrationMode.value = true;
      currentTabIndex.value = 1; // 전자결재 탭
      activeTab.value = "전자결재";
    }
  },
  { immediate: true }
);

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

  // 상세보기 모드일 때 사이드바 클릭하면 상세보기 종료
  if (approvalId.value) {
    approvalId.value = null;
    approvalDetail.value = null;
    router.push("/approval");
  }
};

const handleTabChange = (tab) => {
  activeTab.value = tab;
};

const handleActiveTabChange = (tabIndex) => {
  currentTabIndex.value = tabIndex;

  // 결재템플릿 탭으로 이동할 때 등록 모드 비활성화
  if (tabIndex === 2) {
    isRegistrationMode.value = false;
  }
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
  isRegistrationMode.value =
    value !== undefined ? value : !isRegistrationMode.value;
  if (value === false) {
    currentTabIndex.value = 1; // 전자결재 탭 인덱스
    activeTab.value = "임시저장"; // 임시저장 목록 탭 이름
  }
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
    toast.error("순서 변경에 실패했습니다.");

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
    임시저장: "/api/hq/approvals/list/submitted?status=DRAFT",
    결재중: "/api/hq/approvals/list/submitted?status=IN_PROGRESS",
    결재완료: "/api/hq/approvals/list/submitted?status=APPROVED",
    결재반려: "/api/hq/approvals/list/submitted?status=REJECTED",
    //수신
    결재대기: "/api/hq/approvals/list/received?status=WAITING",
    결재예정: "/api/hq/approvals/list/received?status=EXPECTED",
    내결재승인: "/api/hq/approvals/list/received/my-completed?status=APPROVED",
    내결재반려: "/api/hq/approvals/list/received/my-completed?status=REJECTED",
    협조대기: "/api/hq/approvals/list/cooperate?status=WAITING",
    협조예정: "/api/hq/approvals/list/cooperate?status=EXPECTED",
    내협조승인: "/api/hq/approvals/list/cooperate?status=APPROVED",
    내협조반려: "/api/hq/approvals/list/cooperate?status=REJECTED",
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
      임시저장: "/api/hq/approvals/list/submitted?status=DRAFT",
      결재중: "/api/hq/approvals/list/submitted?status=IN_PROGRESS",
      결재완료: "/api/hq/approvals/list/submitted?status=APPROVED",
      결재반려: "/api/hq/approvals/list/submitted?status=REJECTED",
    },
    수신: {
      "수신-전체": "/api/hq/approvals/list/received/all",
      "결재-전체": "/api/hq/approvals/list/received/approval/all",
      결재대기: "/api/hq/approvals/list/received?status=WAITING",
      결재예정: "/api/hq/approvals/list/received?status=EXPECTED",
      결재중: "/api/hq/approvals/list/received/in-progress",
      결재완료: "/api/hq/approvals/list/received/approved",
      결재반려: "/api/hq/approvals/list/received/rejected",
      "내 결재 승인":
        "/api/hq/approvals/list/received/my-completed?status=APPROVED",
      "내 결재 반려":
        "/api/hq/approvals/list/received/my-completed?status=REJECTED",
      "협조-전체": "/api/hq/approvals/list/cooperate/all",
      협조대기: "/api/hq/approvals/list/cooperate?status=WAITING",
      협조예정: "/api/hq/approvals/list/cooperate?status=EXPECTED",
      "내 협조 승인": "/api/hq/approvals/list/cooperate?status=APPROVED",
      "내 협조 반려": "/api/hq/approvals/list/cooperate?status=REJECTED",
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
    approvalList.value = [];
  }
};

const handleRefreshList = () => {
  fetchCounts();
  fetchApprovalList();
};

const handleApprovalSubmitted = (approvalData) => {
  // 결재 요청 성공 시 ApprovalCreateDetail 페이지로 이동
  console.log("결재 제출 완료, 데이터:", approvalData);
  if (approvalData && approvalData.id) {
    console.log(
      "ApprovalCreateDetail 페이지로 이동 시도:",
      `/approval/create/${approvalData.id}`
    );
    router.push(`/approval/create/${approvalData.id}`);
  } else {
    console.log("결재 ID가 없어서 이동하지 않음");
  }
};

onMounted(fetchCounts);

watch(
  () => route.params.approvalId,
  async (newId) => {
    console.log("라우터 파라미터 approvalId:", newId);
    approvalId.value = newId;

    // 등록 모드일 때는 상세 정보를 가져오지 않음
    if (isRegisterMode.value) {
      console.log("등록 모드이므로 상세 정보를 가져오지 않습니다.");
      approvalDetail.value = null;
      return;
    }

    if (newId) {
      try {
        // 문서 내용과 결재선 정보를 모두 가져오기
        const [contentResponse, linesResponse] = await Promise.all([
          api.get(`/api/hq/approvals/detail/${newId}/content`),
          api.get(`/api/hq/approvals/detail/${newId}/lines`),
        ]);

        // 문서 내용
        const documentContent = Array.isArray(contentResponse.data)
          ? contentResponse.data[0]
          : contentResponse.data;

        // 결재선 정보
        const approvalLines = linesResponse.data;

        // 두 정보를 합쳐서 approvalDetail 생성
        approvalDetail.value = {
          ...documentContent,
          lines: Array.isArray(approvalLines)
            ? approvalLines
            : approvalLines.line, // 객체면 .line을 사용
        };
        console.log("approvalDetail 세팅:", approvalDetail.value);
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

// 문서 타입 핸들러
const handleDocumentType = (type) => {
  currentDocumentType.value = type;
  console.log("InfoView에서 받은 문서 타입:", type);
  // 여기서 문서 타입에 따른 추가 로직을 구현할 수 있습니다
};
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
