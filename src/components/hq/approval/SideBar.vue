<template>
  <div class="sidebar">
    <!-- Header -->
    <div class="sidebar-header">
      <div class="header-content">
        <div class="logo">
          <FileTextIcon class="logo-icon" />
        </div>
        <div class="header-text">
          <span class="app-name">FRAMS</span>
          <span class="app-subtitle">전자결재</span>
        </div>
      </div>
    </div>

    <div class="register-button-container">
      <button @click="openRegisterModal" class="register-button">
        결재 등록
      </button>
    </div>

    <!-- Tab Headers -->
    <div class="tab-headers">
      <div class="tab-container">
        <button
          @click="changeTab('상신')"
          :class="['tab-button', { active: activeTab === '상신' }]"
        >
          <SendIcon class="tab-icon" />
          <span>상신</span>
        </button>
        <button
          @click="changeTab('수신')"
          :class="['tab-button', { active: activeTab === '수신' }]"
        >
          <InboxIcon class="tab-icon" />
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
          :class="{ active: activeItem === '전체' }"
          @click="selectMenu('전체')"
        >
          <span class="menu-title">전체</span>
          <span class="count-badge">{{ props.counts.전체 }}</span>
        </div>
        <div
          class="menu-item"
          :class="{ active: activeItem === '임시저장' }"
          @click="selectMenu('임시저장')"
        >
          <span class="menu-title">임시저장</span>
          <span class="count-badge">{{ props.counts.임시저장 }}</span>
        </div>
        <div
          class="menu-item"
          :class="{ active: activeItem === '결재중' }"
          @click="selectMenu('결재중')"
        >
          <span class="menu-title">결재중</span>
          <span class="count-badge">{{ props.counts.결재중 }}</span>
        </div>
        <div
          class="menu-item"
          :class="{ active: activeItem === '결재완료' }"
          @click="selectMenu('결재완료')"
        >
          <span class="menu-title">결재완료</span>
          <span class="count-badge">{{ props.counts.결재완료 }}</span>
        </div>
        <div
          class="menu-item"
          :class="{ active: activeItem === '결재반려' }"
          @click="selectMenu('결재반려')"
        >
          <span class="menu-title">결재반려</span>
          <span class="count-badge">{{ props.counts.결재반려 }}</span>
        </div>
      </div>

      <!-- 수신 탭 (기존 구조 유지) -->
      <div v-if="activeTab === '수신'" class="tab-panel">
        <!-- 전체 -->
        <div class="menu-section">
          <div
            class="menu-item"
            :class="{ active: activeItem === '/approval/incoming/all' }"
            @click="setActiveItem('/approval/incoming/all')"
          >
            <span class="menu-title">전체</span>
            <span class="count-badge">35</span>
          </div>
        </div>

        <!-- 결재문서 -->
        <div class="accordion-section">
          <div
            class="accordion-header"
            @click="toggleAccordion('approval-docs')"
          >
            <div class="accordion-title">
              <ClipboardListIcon class="accordion-icon" />
              <span>결재문서</span>
            </div>
            <div class="accordion-controls">
              <span class="count-badge">15</span>
              <ChevronDownIcon
                :class="[
                  'chevron',
                  { rotated: openAccordions.includes('approval-docs') },
                ]"
              />
            </div>
          </div>
          <div
            v-if="openAccordions.includes('approval-docs')"
            class="accordion-content"
          >
            <div
              class="menu-item"
              :class="{
                active: activeItem === '/approval/incoming/approval-pending',
              }"
              @click="setActiveItem('/approval/incoming/approval-pending')"
            >
              <div class="menu-content">
                <AlertCircleIcon class="menu-icon urgent" />
                <span class="menu-title">결재대기</span>
              </div>
              <span class="count-badge">3</span>
            </div>
            <div
              class="menu-item"
              :class="{
                active: activeItem === '/approval/incoming/approval-scheduled',
              }"
              @click="setActiveItem('/approval/incoming/approval-scheduled')"
            >
              <div class="menu-content">
                <CalendarIcon class="menu-icon scheduled" />
                <span class="menu-title">결재예정</span>
              </div>
              <span class="count-badge">2</span>
            </div>

            <!-- 내 결재 완료 -->
            <div class="nested-accordion">
              <div
                class="nested-header"
                @click="toggleAccordion('approval-completed')"
              >
                <span>내 결재 완료</span>
                <div class="nested-controls">
                  <span class="count-badge">10</span>
                  <ChevronDownIcon
                    :class="[
                      'chevron-small',
                      {
                        rotated: openAccordions.includes('approval-completed'),
                      },
                    ]"
                  />
                </div>
              </div>
              <div
                v-if="openAccordions.includes('approval-completed')"
                class="nested-content"
              >
                <div
                  class="menu-item nested"
                  :class="{
                    active:
                      activeItem ===
                      '/approval/incoming/approval-completed/all',
                  }"
                  @click="
                    setActiveItem('/approval/incoming/approval-completed/all')
                  "
                >
                  <span class="menu-title">전체</span>
                  <span class="count-badge">10</span>
                </div>
                <div
                  class="menu-item nested"
                  :class="{
                    active:
                      activeItem ===
                      '/approval/incoming/approval-completed/approved',
                  }"
                  @click="
                    setActiveItem(
                      '/approval/incoming/approval-completed/approved'
                    )
                  "
                >
                  <span class="menu-title">승인</span>
                  <span class="count-badge">8</span>
                </div>
                <div
                  class="menu-item nested"
                  :class="{
                    active:
                      activeItem ===
                      '/approval/incoming/approval-completed/rejected',
                  }"
                  @click="
                    setActiveItem(
                      '/approval/incoming/approval-completed/rejected'
                    )
                  "
                >
                  <span class="menu-title">반려</span>
                  <span class="count-badge">2</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 협조문서 -->
        <div class="accordion-section">
          <div
            class="accordion-header"
            @click="toggleAccordion('collaboration-docs')"
          >
            <div class="accordion-title">
              <UsersIcon class="accordion-icon" />
              <span>협조문서</span>
            </div>
            <div class="accordion-controls">
              <span class="count-badge">8</span>
              <ChevronDownIcon
                :class="[
                  'chevron',
                  { rotated: openAccordions.includes('collaboration-docs') },
                ]"
              />
            </div>
          </div>
          <div
            v-if="openAccordions.includes('collaboration-docs')"
            class="accordion-content"
          >
            <div
              class="menu-item"
              :class="{
                active:
                  activeItem === '/approval/incoming/collaboration-pending',
              }"
              @click="setActiveItem('/approval/incoming/collaboration-pending')"
            >
              <div class="menu-content">
                <AlertCircleIcon class="menu-icon collaboration" />
                <span class="menu-title">협조대기</span>
              </div>
              <span class="count-badge">2</span>
            </div>
            <div
              class="menu-item"
              :class="{
                active:
                  activeItem === '/approval/incoming/collaboration-scheduled',
              }"
              @click="
                setActiveItem('/approval/incoming/collaboration-scheduled')
              "
            >
              <div class="menu-content">
                <CalendarIcon class="menu-icon collaboration-scheduled" />
                <span class="menu-title">협조예정</span>
              </div>
              <span class="count-badge">1</span>
            </div>

            <!-- 내 협조 완료 -->
            <div class="nested-accordion">
              <div
                class="nested-header"
                @click="toggleAccordion('collab-completed')"
              >
                <span>내 협조 완료</span>
                <div class="nested-controls">
                  <span class="count-badge">5</span>
                  <ChevronDownIcon
                    :class="[
                      'chevron-small',
                      { rotated: openAccordions.includes('collab-completed') },
                    ]"
                  />
                </div>
              </div>
              <div
                v-if="openAccordions.includes('collab-completed')"
                class="nested-content"
              >
                <div
                  class="menu-item nested"
                  :class="{
                    active:
                      activeItem ===
                      '/approval/incoming/collaboration-completed/all',
                  }"
                  @click="
                    setActiveItem(
                      '/approval/incoming/collaboration-completed/all'
                    )
                  "
                >
                  <span class="menu-title">전체</span>
                  <span class="count-badge">5</span>
                </div>
                <div
                  class="menu-item nested"
                  :class="{
                    active:
                      activeItem ===
                      '/approval/incoming/collaboration-completed/approved',
                  }"
                  @click="
                    setActiveItem(
                      '/approval/incoming/collaboration-completed/approved'
                    )
                  "
                >
                  <span class="menu-title">협조 승인</span>
                  <span class="count-badge">4</span>
                </div>
                <div
                  class="menu-item nested"
                  :class="{
                    active:
                      activeItem ===
                      '/approval/incoming/collaboration-completed/rejected',
                  }"
                  @click="
                    setActiveItem(
                      '/approval/incoming/collaboration-completed/rejected'
                    )
                  "
                >
                  <span class="menu-title">협조 반려</span>
                  <span class="count-badge">1</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 참조문서 -->
        <div class="accordion-section">
          <div
            class="accordion-header"
            @click="toggleAccordion('reference-docs')"
          >
            <div class="accordion-title">
              <EyeIcon class="accordion-icon" />
              <span>참조문서</span>
            </div>
            <div class="accordion-controls">
              <span class="count-badge">4</span>
              <ChevronDownIcon
                :class="[
                  'chevron',
                  { rotated: openAccordions.includes('reference-docs') },
                ]"
              />
            </div>
          </div>
          <div
            v-if="openAccordions.includes('reference-docs')"
            class="accordion-content"
          >
            <div
              class="menu-item"
              :class="{
                active: activeItem === '/approval/incoming/reference/all',
              }"
              @click="setActiveItem('/approval/incoming/reference/all')"
            >
              <span class="menu-title">전체</span>
              <span class="count-badge">4</span>
            </div>
            <div
              class="menu-item"
              :class="{
                active: activeItem === '/approval/incoming/reference/unread',
              }"
              @click="setActiveItem('/approval/incoming/reference/unread')"
            >
              <span class="menu-title">미열람</span>
              <span class="count-badge">2</span>
            </div>
          </div>
        </div>

        <!-- 수신문서 -->
        <div class="accordion-section">
          <div
            class="accordion-header"
            @click="toggleAccordion('received-docs')"
          >
            <div class="accordion-title">
              <MessageCircleIcon class="accordion-icon" />
              <span>수신문서</span>
            </div>
            <div class="accordion-controls">
              <span class="count-badge">3</span>
              <ChevronDownIcon
                :class="[
                  'chevron',
                  { rotated: openAccordions.includes('received-docs') },
                ]"
              />
            </div>
          </div>
          <div
            v-if="openAccordions.includes('received-docs')"
            class="accordion-content"
          >
            <div
              class="menu-item"
              :class="{
                active: activeItem === '/approval/incoming/received/all',
              }"
              @click="setActiveItem('/approval/incoming/received/all')"
            >
              <span class="menu-title">전체</span>
              <span class="count-badge">3</span>
            </div>
            <div
              class="menu-item"
              :class="{
                active:
                  activeItem === '/approval/incoming/received/unconfirmed',
              }"
              @click="setActiveItem('/approval/incoming/received/unconfirmed')"
            >
              <span class="menu-title">미확인</span>
              <span class="count-badge">1</span>
            </div>
          </div>
        </div>

        <!-- 종료된 문서 -->
        <div class="accordion-section">
          <div
            class="accordion-header"
            @click="toggleAccordion('completed-docs')"
          >
            <div class="accordion-title">
              <ArchiveIcon class="accordion-icon" />
              <span>종료된 문서</span>
            </div>
            <div class="accordion-controls">
              <span class="count-badge">5</span>
              <ChevronDownIcon
                :class="[
                  'chevron',
                  { rotated: openAccordions.includes('completed-docs') },
                ]"
              />
            </div>
          </div>
          <div
            v-if="openAccordions.includes('completed-docs')"
            class="accordion-content"
          >
            <div
              class="menu-item"
              :class="{
                active: activeItem === '/approval/incoming/completed/all',
              }"
              @click="setActiveItem('/approval/incoming/completed/all')"
            >
              <span class="menu-title">전체</span>
              <span class="count-badge">5</span>
            </div>

            <!-- 결재 -->
            <div class="nested-accordion">
              <div
                class="nested-header"
                @click="toggleAccordion('completed-approval')"
              >
                <span>결재</span>
                <div class="nested-controls">
                  <span class="count-badge">3</span>
                  <ChevronDownIcon
                    :class="[
                      'chevron-small',
                      {
                        rotated: openAccordions.includes('completed-approval'),
                      },
                    ]"
                  />
                </div>
              </div>
              <div
                v-if="openAccordions.includes('completed-approval')"
                class="nested-content"
              >
                <div
                  class="menu-item nested"
                  :class="{
                    active:
                      activeItem ===
                      '/approval/incoming/completed/approval/approved',
                  }"
                  @click="
                    setActiveItem(
                      '/approval/incoming/completed/approval/approved'
                    )
                  "
                >
                  <span class="menu-title">승인</span>
                  <span class="count-badge">2</span>
                </div>
                <div
                  class="menu-item nested"
                  :class="{
                    active:
                      activeItem ===
                      '/approval/incoming/completed/approval/rejected',
                  }"
                  @click="
                    setActiveItem(
                      '/approval/incoming/completed/approval/rejected'
                    )
                  "
                >
                  <span class="menu-title">반려</span>
                  <span class="count-badge">1</span>
                </div>
              </div>
            </div>

            <!-- 협조 -->
            <div class="nested-accordion">
              <div
                class="nested-header"
                @click="toggleAccordion('completed-collaboration')"
              >
                <span>협조</span>
                <div class="nested-controls">
                  <span class="count-badge">2</span>
                  <ChevronDownIcon
                    :class="[
                      'chevron-small',
                      {
                        rotated: openAccordions.includes(
                          'completed-collaboration'
                        ),
                      },
                    ]"
                  />
                </div>
              </div>
              <div
                v-if="openAccordions.includes('completed-collaboration')"
                class="nested-content"
              >
                <div
                  class="menu-item nested"
                  :class="{
                    active:
                      activeItem ===
                      '/approval/incoming/completed/collaboration/approved',
                  }"
                  @click="
                    setActiveItem(
                      '/approval/incoming/completed/collaboration/approved'
                    )
                  "
                >
                  <span class="menu-title">승인</span>
                  <span class="count-badge">2</span>
                </div>
                <div
                  class="menu-item nested"
                  :class="{
                    active:
                      activeItem ===
                      '/approval/incoming/completed/collaboration/rejected',
                  }"
                  @click="
                    setActiveItem(
                      '/approval/incoming/completed/collaboration/rejected'
                    )
                  "
                >
                  <span class="menu-title">반료</span>
                  <span class="count-badge">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="user-avatar">황</div>
        <div class="user-info">
          <span class="user-name">황수민</span>
          <span class="user-role">대리</span>
        </div>
      </div>
    </div>
  </div>
  <!-- 생략 -->
</template>

<script setup>
import { ref } from "vue";
// import {
//   FileText as FileTextIcon,
//   Send as SendIcon,
//   Inbox as InboxIcon,
//   BarChart3 as BarChart3Icon,
//   Plus as PlusIcon,
// } from "lucide-vue-next";
import {
  FileText as FileTextIcon,
  Send as SendIcon,
  Inbox as InboxIcon,
  Save as SaveIcon,
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  AlertCircle as AlertCircleIcon,
  Users as UsersIcon,
  Eye as EyeIcon,
  MessageCircle as MessageCircleIcon,
  Archive as ArchiveIcon,
  BarChart3 as BarChart3Icon,
  Plus as PlusIcon,
  ClipboardList as ClipboardListIcon,
  Calendar as CalendarIcon,
  ChevronDown as ChevronDownIcon,
} from "lucide-vue-next";

const emit = defineEmits(["select-menu", "tab-change", "register-approval"]);
const counts = ref({
  전체: 0,
  임시저장: 0,
  결재중: 0,
  결재완료: 0,
  결재반려: 0,
});

const activeTab = ref("상신");
const activeItem = ref("전체");

const openAccordions = ref(["approval-docs", "collaboration-docs"]);

// 탭 변경
const changeTab = (tabValue) => {
  activeTab.value = tabValue;
  emit("tab-change", tabValue);
};

// 메뉴 선택
const selectMenu = (menu) => {
  activeItem.value = menu;
  emit("select-menu", menu);
};
const props = defineProps({
  activeTab: [String, Number], // 받기
  counts: Object,
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
</script>

<style scoped>
/* 메인 사이드바 컨테이너 */
.sidebar {
  width: 300px;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 헤더 */
.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  width: 32px;
  height: 32px;
  background: #007bff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo-icon {
  width: 16px;
  height: 16px;
}

.header-text {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.app-name {
  font-weight: 600;
  font-size: 14px;
  color: #212529;
}

.app-subtitle {
  font-size: 12px;
  color: #6c757d;
}

/* 탭 헤더 */
.tab-headers {
  border-bottom: 1px solid #e9ecef;
}

.tab-container {
  display: flex;
  width: 100%;
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

.accordion-title {
  display: flex;
  align-items: center;
  gap: 8px;
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

/* 중첩 아코디언 */
.nested-accordion {
  margin-left: 8px;
}

.nested-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  font-size: 14px;
}

.nested-header:hover {
  background: #e9ecef;
}

.nested-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nested-content {
  padding: 4px 0;
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
