<template>
  <div class="sidebar">
    <!-- Header -->
    <div class="sidebar-header">
      <div class="header-item">
        <img
          src="@/assets/approval.png"
          alt="결재 관리"
          class="sidebar__icon"
        />결재 관리
      </div>
    </div>

    <div class="register-button-container">
      <button @click="handleRegisterApproval" class="register-button">
        결재 등록
      </button>
    </div>

    <!-- Tab Headers -->
    <div class="tab-headers">
      <div class="tab-container">
        <button
          @click="
            changeTab('상신');
            selectMenu('상신');
          "
          :class="['tab-button', { active: activeTab === '상신' }]"
        >
          <span>상신</span>
        </button>
        <button
          @click="
            changeTab('수신');
            selectMenu('수신');
          "
          :class="['tab-button', { active: activeTab === '수신' }]"
        >
          <span>수신</span>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- 상신 탭 -->
      <div v-if="activeTab === '상신'" class="tab-panel">
        <div
          class="menu-item"
          :class="{ active: computedActiveItem === '임시저장' }"
          @click="selectMenu('임시저장')"
        >
          <div class="menu-content">
            <span class="menu-title">임시저장</span>
          </div>
          <span class="count-badge">{{ props.counts.임시저장 }}</span>
        </div>
        <div
          class="menu-item"
          :class="{ active: computedActiveItem === '결재중' }"
          @click="selectMenu('결재중')"
        >
          <div class="menu-content">
            <span class="menu-title">결재중</span>
          </div>
          <span class="count-badge">{{ props.counts.결재중 }}</span>
        </div>
        <div
          class="menu-item"
          :class="{ active: computedActiveItem === '결재완료' }"
          @click="selectMenu('결재완료')"
        >
          <div class="menu-content">
            <span class="menu-title">결재완료</span>
          </div>
          <span class="count-badge">{{ props.counts.결재완료 }}</span>
        </div>
        <div
          class="menu-item"
          :class="{ active: computedActiveItem === '결재반려' }"
          @click="selectMenu('결재반려')"
        >
          <div class="menu-content">
            <span class="menu-title">결재반려</span>
          </div>
          <span class="count-badge">{{ props.counts.결재반려 }}</span>
        </div>
      </div>

      <!-- 수신 탭 (기존 구조 유지) -->
      <div v-if="activeTab === '수신'" class="tab-panel">
        <!-- 결재문서 -->
        <div class="accordion-section">
          <div
            class="accordion-header"
            :class="{ active: computedActiveItem === '결재-전체' }"
            @click="handleApprovalDocsClick"
          >
            <div class="accordion-title">
              <span>결재문서</span>
            </div>
            <div class="accordion-controls">
              <span class="count-badge">{{
                props.counts.결재대기 +
                props.counts.결재예정 +
                props.counts.내결재승인 +
                props.counts.내결재반려
              }}</span>
            </div>
          </div>
          <div
            v-if="openAccordions.includes('approval-docs')"
            class="accordion-content"
          >
            <div
              class="menu-item"
              :class="{
                active: computedActiveItem === '결재대기',
              }"
              @click="selectMenu('결재대기')"
            >
              <div class="menu-content">
                <span class="menu-title">결재대기</span>
              </div>
              <span class="count-badge">{{ props.counts.결재대기 }}</span>
            </div>
            <div
              class="menu-item"
              :class="{
                active: computedActiveItem === '결재예정',
              }"
              @click="selectMenu('결재예정')"
            >
              <div class="menu-content">
                <span class="menu-title">결재예정</span>
              </div>
              <span class="count-badge">{{ props.counts.결재예정 }}</span>
            </div>
            <div
              class="menu-item"
              :class="{
                active: computedActiveItem === '내 결재 승인',
              }"
              @click="selectMenu('내 결재 승인')"
            >
              <div class="menu-content">
                <span class="menu-title">내결재 승인</span>
              </div>
              <span class="count-badge">{{ props.counts.내결재승인 }}</span>
            </div>
            <div
              class="menu-item"
              :class="{
                active: computedActiveItem === '내 결재 반려',
              }"
              @click="selectMenu('내 결재 반려')"
            >
              <div class="menu-content">
                <span class="menu-title">내결재 반려</span>
              </div>
              <span class="count-badge">{{ props.counts.내결재반려 }}</span>
            </div>
          </div>
        </div>

        <!-- 협조문서 -->
        <div class="accordion-section">
          <div
            class="accordion-header"
            :class="{ active: computedActiveItem === '협조-전체' }"
            @click="handleCollaborationDocsClick"
          >
            <div class="accordion-title">
              <span>협조문서</span>
            </div>
            <div class="accordion-controls">
              <span class="count-badge">{{
                props.counts.협조대기 +
                props.counts.협조예정 +
                props.counts.내협조승인 +
                props.counts.내협조반려
              }}</span>
            </div>
          </div>
          <div
            v-if="openAccordions.includes('collaboration-docs')"
            class="accordion-content"
          >
            <div
              class="menu-item"
              :class="{
                active: computedActiveItem === '협조대기',
              }"
              @click="selectMenu('협조대기')"
            >
              <div class="menu-content">
                <span class="menu-title">협조대기</span>
              </div>
              <span class="count-badge">{{ props.counts.협조대기 }}</span>
            </div>
            <div
              class="menu-item"
              :class="{
                active: computedActiveItem === '협조예정',
              }"
              @click="selectMenu('협조예정')"
            >
              <div class="menu-content">
                <span class="menu-title">협조예정</span>
              </div>
              <span class="count-badge">{{ props.counts.협조예정 }}</span>
            </div>
            <div
              class="menu-item"
              :class="{
                active: computedActiveItem === '내 협조 승인',
              }"
              @click="selectMenu('내 협조 승인')"
            >
              <div class="menu-content">
                <span class="menu-title">내협조 승인</span>
              </div>
              <span class="count-badge">{{ props.counts.내협조승인 }}</span>
            </div>
            <div
              class="menu-item"
              :class="{
                active: computedActiveItem === '내 협조 반려',
              }"
              @click="selectMenu('내 협조 반려')"
            >
              <div class="menu-content">
                <span class="menu-title">내협조 반려</span>
              </div>
              <span class="count-badge">{{ props.counts.내협조반려 }}</span>
            </div>
          </div>
        </div>

        <!-- 참조문서 -->
        <div class="accordion-section">
          <div
            class="accordion-header"
            :class="{ active: computedActiveItem === '참조문서' }"
            @click="selectMenu('참조문서')"
          >
            <div class="accordion-title">
              <span>참조문서</span>
            </div>
            <div class="accordion-controls">
              <span class="count-badge">{{ props.counts.참조문서 }}</span>
            </div>
          </div>
        </div>

        <!-- 수신문서 -->
        <div class="accordion-section">
          <div
            class="accordion-header"
            :class="{ active: computedActiveItem === '수신문서' }"
            @click="selectMenu('수신문서')"
          >
            <div class="accordion-title">
              <span>수신문서</span>
            </div>
            <div class="accordion-controls">
              <span class="count-badge">{{ props.counts.수신문서 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const emit = defineEmits(["select-menu", "tab-change", "register-approval"]);
const counts = ref({
  전체: 0,
  임시저장: 0,
  결재중: 0,
  결재완료: 0,
  결재반려: 0,
});

const activeTab = ref("상신");
const activeItem = ref(""); // 복원

const openAccordions = ref(["approval-docs", "collaboration-docs"]);

// 탭 변경
const changeTab = (tabValue) => {
  activeTab.value = tabValue;
  if (tabValue === "상신") {
    activeItem.value = "상신";
    emit("select-menu", "상신-전체");
  } else if (tabValue === "수신") {
    activeItem.value = "수신";
    emit("select-menu", "수신-전체");
  }
  emit("tab-change", tabValue);
};

// 메뉴 선택
const selectMenu = (menu) => {
  if (menu === "상신") {
    activeItem.value = "상신";
    emit("select-menu", "상신-전체");
  } else if (menu === "수신") {
    activeItem.value = "수신";
    emit("select-menu", "수신-전체");
  } else {
    activeItem.value = menu;
    emit("select-menu", menu);
  }
};

const props = defineProps({
  activeTab: [String, Number], // 받기
  activeMenu: String, // 현재 선택된 메뉴
  counts: Object,
});

// activeItem을 props.activeMenu와 동기화
const computedActiveItem = computed(() => {
  // props.activeMenu가 있으면 그것을 우선 사용, 없으면 로컬 activeItem 사용
  return props.activeMenu || activeItem.value;
});

// 메서드
const toggleAccordion = (accordionId) => {
  if (openAccordions.value.includes(accordionId)) {
    openAccordions.value = openAccordions.value.filter(
      (id) => id !== accordionId
    );
  } else {
    openAccordions.value.push(accordionId);
  }
};

const setActiveItem = (item) => {
  activeItem.value = item;
};

const handleRegisterApproval = () => {
  emit("register-approval");
};

const handleApprovalDocsClick = () => {
  // 결재문서 헤더 클릭 시 "결재-전체" 선택
  selectMenu("결재-전체");
  // 아코디언 토글
  toggleAccordion("approval-docs");
};

const handleCollaborationDocsClick = () => {
  // 협조문서 헤더 클릭 시 "협조-전체" 선택
  selectMenu("협조-전체");
  // 아코디언 토글
  toggleAccordion("collaboration-docs");
};
</script>

<style scoped>
/* 메인 사이드바 컨테이너 */
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

/* 헤더 */
.sidebar-header {
  padding: 20px 20px 0 20px;
  /* border-bottom: 1px solid #e9ecef; */
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
  width: 15px;
  height: 15px;
}

/* 탭 헤더 */
.tab-headers {
  border-bottom: 1px solid #e9ecef;
  background-color: white;
}

.tab-container {
  display: flex;
  width: 100%;
  background-color: white;
}

.tab-button {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-bottom: 2px solid transparent;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #6c757d;
  transition: all 0.15s ease;
}

.tab-button:hover {
  color: #495057;
}

.tab-button.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

.tab-icon {
  width: 16px;
  height: 16px;
}

/* 탭 컨텐츠 */
.tab-content {
  flex: 1;
  overflow-y: auto;
  background-color: white;
}

.tab-panel {
  padding: 8px;
}

/* 메뉴 섹션 */
.menu-section {
  padding: 0 8px 8px 8px;
}

/* 메뉴 아이템 */
.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #495057;
}

.menu-item:hover {
  background: #e9ecef;
  color: #212529;
}

.menu-item.active {
  background: #e3f2fd;
  color: #1976d2;
  font-weight: 500;
}

.menu-item.nested {
  margin-left: 16px;
  padding: 6px 12px;
}

.menu-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-title {
  font-size: 14px;
}

.menu-icon {
  width: 16px;
  height: 16px;
}

.menu-icon.urgent {
  color: #dc3545;
}

.menu-icon.scheduled {
  color: #fd7e14;
}

.menu-icon.collaboration {
  color: #007bff;
}

.menu-icon.collaboration-scheduled {
  color: #6f42c1;
}

.menu-icon.approved {
  color: #28a745;
}

.menu-icon.rejected {
  color: #dc3545;
}

/* 아코디언 */
.accordion-section {
  margin-bottom: 4px;
}

.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.accordion-header:hover {
  background: #e9ecef;
}

.accordion-header.active {
  background: #e3f2fd;
  color: #1976d2;
  font-weight: 500;
}

.accordion-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.accordion-icon {
  width: 16px;
  height: 16px;
}

.accordion-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.accordion-content {
  padding: 4px 8px 8px 8px;
}

/* 카운트 배지 */
.count-badge {
  background: #e9ecef;
  color: #495057;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  min-width: 20px;
  text-align: center;
}

/* 푸터 */
.sidebar-footer {
  padding: 8px;
  border-top: 1px solid #e9ecef;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.user-profile:hover {
  background: #e9ecef;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
}

.user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: #212529;
}

.user-role {
  font-size: 12px;
  color: #6c757d;
}

.register-button-container {
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
  background: white;
}

.register-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.register-button:hover {
  background: #5a67d8;
}
</style>
