<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <div class="approval-container">
        <!-- Header -->
        <div class="header">
          <h1 class="header-title">결재자 지정</h1>
          <button class="close-btn">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="tabs-container">
          <button
            v-for="tab in tabs"
            :key="tab"
            @click="activeTab = tab"
            :class="['tab-btn', { 'tab-active': activeTab === tab }]"
          >
            <svg
              class="tab-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            {{ tab }}
          </button>
        </div>

        <div class="main-content">
          <!-- Left Sidebar -->
          <div class="sidebar">
            <div class="sidebar-content">
              <h3 class="sidebar-title">조직도</h3>
              <div class="sidebar-info">
                <span>선택된 직원: 0명</span>
                <span class="reset-link">선택 초기화</span>
              </div>

              <!-- Search -->
              <div class="search-container">
                <svg
                  class="search-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="이름 / 부서를 검색하세요"
                  class="search-input"
                  v-model="searchQuery"
                />
              </div>

              <!-- Department List -->
              <div class="department-list">
                <div
                  v-for="(dept, index) in departments"
                  :key="index"
                  class="department-item"
                >
                  <button
                    @click="toggleDepartment(index)"
                    class="department-header"
                  >
                    <div class="department-header-left">
                      <svg
                        :class="[
                          'chevron-icon',
                          { 'chevron-rotated': dept.expanded },
                        ]"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <polyline points="6,9 12,15 18,9"></polyline>
                      </svg>
                      <span class="department-name">{{ dept.name }}</span>
                    </div>
                    <span class="department-count">{{ dept.count }}</span>
                  </button>

                  <div v-if="dept.expanded" class="member-list">
                    <div
                      v-for="(member, memberIndex) in dept.members"
                      :key="memberIndex"
                      class="member-item"
                    >
                      <input
                        type="checkbox"
                        :id="`member-${index}-${memberIndex}`"
                        v-model="member.checked"
                        class="member-checkbox"
                      />
                      <label
                        :for="`member-${index}-${memberIndex}`"
                        class="member-name"
                      >
                        {{ member.name }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content Area -->
          <div class="content-area">
            <div class="content-grid">
              <!-- Left Column - 결재 / 협조 -->
              <div class="content-column">
                <div class="column-header">
                  <h3 class="column-title">결재 / 협조</h3>
                  <span class="exclude-text">선택 제외</span>
                </div>
                <div
                  v-if="
                    approverList.length === 0 && collaboratorList.length === 0
                  "
                  class="empty-box"
                >
                  <span class="empty-text">결재자가 없습니다</span>
                </div>
                <div v-else>
                  <div
                    v-for="(item, idx) in approverList"
                    :key="'approver-' + idx"
                    class="user-card approver"
                  >
                    <span class="user-initial">{{ item.name[0] }}</span>
                    <span class="user-name">{{ item.name }}</span>
                    <span class="user-dept">{{ item.dept }}</span>
                    <span class="user-type">결재</span>
                  </div>
                  <div
                    v-for="(item, idx) in collaboratorList"
                    :key="'collab-' + idx"
                    class="user-card collaborator"
                  >
                    <span class="user-initial">{{ item.name[0] }}</span>
                    <span class="user-name">{{ item.name }}</span>
                    <span class="user-dept">{{ item.dept }}</span>
                    <span class="user-type">협조</span>
                  </div>
                </div>
              </div>

              <!-- Right Column - 수신 / 참조 -->
              <div class="content-column">
                <div class="column-header">
                  <h3 class="column-title">수신 / 참조</h3>
                  <span class="exclude-text">선택 제외</span>
                </div>
                <div
                  v-if="receiverList.length === 0 && referenceList.length === 0"
                  class="empty-box"
                >
                  <span class="empty-text">수신/참조자가 없습니다</span>
                </div>
                <div v-else>
                  <div
                    v-for="(item, idx) in receiverList"
                    :key="'receiver-' + idx"
                    class="user-card receiver"
                  >
                    <span class="user-initial">{{ item.name[0] }}</span>
                    <span class="user-name">{{ item.name }}</span>
                    <span class="user-dept">{{ item.dept }}</span>
                    <span class="user-type">수신</span>
                  </div>
                  <div
                    v-for="(item, idx) in referenceList"
                    :key="'ref-' + idx"
                    class="user-card reference"
                  >
                    <span class="user-initial">{{ item.name[0] }}</span>
                    <span class="user-name">{{ item.name }}</span>
                    <span class="user-dept">{{ item.dept }}</span>
                    <span class="user-type">참조</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <span class="footer-text">선택된 결재자 제외</span>
          <div class="footer-buttons">
            <button class="btn btn-outline" @click="emit('close')">취소</button>
            <button class="btn btn-primary" @click="handleRegister"
              >등록</button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
const emit = defineEmits(["close", "confirm"]);

const activeTab = ref("결재 추가");
const searchQuery = ref("");

const tabs = ["결재 추가", "협조 추가", "수신 추가", "참조 추가"];

const departments = reactive([
  {
    name: "영업1팀",
    count: 3,
    expanded: true,
    members: [
      { name: "김영희 주임", checked: false },
      { name: "이종규 과장", checked: false },
      { name: "황수민 대리", checked: false },
    ],
  },
  {
    name: "영업2팀",
    count: 3,
    expanded: true,
    members: [
      { name: "박지훈 사원", checked: false },
      { name: "최서연 대리", checked: false },
    ],
  },
  {
    name: "물류팀",
    count: 2,
    expanded: true,
    members: [
      { name: "차은우 차장", checked: false },
      { name: "정민수 과장", checked: false },
    ],
  },
]);

// 각 영역별 리스트
const approverList = ref([]); // 결재
const collaboratorList = ref([]); // 협조
const receiverList = ref([]); // 수신
const referenceList = ref([]); // 참조

function addSelectedMembers() {
  const selected = [];
  departments.forEach((dept) => {
    dept.members.forEach((member) => {
      if (member.checked) {
        selected.push({ ...member, dept: dept.name });
        member.checked = false;
      }
    });
  });
  if (activeTab.value === "결재 추가") {
    approverList.value.push(...selected);
  } else if (activeTab.value === "협조 추가") {
    collaboratorList.value.push(...selected);
  } else if (activeTab.value === "수신 추가") {
    receiverList.value.push(...selected);
  } else if (activeTab.value === "참조 추가") {
    referenceList.value.push(...selected);
  }
}

watch(activeTab, () => {
  addSelectedMembers();
});

function toggleDepartment(index) {
  departments[index].expanded = !departments[index].expanded;
}

function handleRegister() {
  emit("confirm", {
    approvers: approverList.value,
    collaborators: collaboratorList.value,
    receivers: receiverList.value,
    references: referenceList.value,
  });
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  max-width: 1200px;
  width: 90vw;
  max-height: 90vh;
  overflow: auto;
  position: relative;
}

/* Container */
.approval-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  color: #6b7280;
}

.close-btn:hover {
  background-color: #f3f4f6;
}

/* Tabs */
.tabs-container {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-icon {
  margin-right: 8px;
}

.tab-btn:hover {
  color: #374151;
  background-color: #f9fafb;
}

.tab-active {
  color: #2563eb !important;
  border-bottom-color: #2563eb !important;
  background-color: #eff6ff !important;
}

/* Main Content */
.main-content {
  display: flex;
}

/* Sidebar */
.sidebar {
  width: 33.333%;
  border-right: 1px solid #e5e7eb;
  padding: 24px;
}

.sidebar-content {
  margin-bottom: 24px;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin: 0 0 16px 0;
}

.sidebar-info {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 16px;
}

.reset-link {
  margin-left: 16px;
  cursor: pointer;
}

.reset-link:hover {
  color: #374151;
}

/* Search */
.search-container {
  position: relative;
  margin-bottom: 24px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}

.search-input:focus {
  border-color: #d1d5db;
  background-color: white;
}

/* Department List */
.department-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.department-item {
  width: 100%;
}

.department-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.department-header:hover {
  background-color: #f9fafb;
}

.department-header-left {
  display: flex;
  align-items: center;
}

.chevron-icon {
  margin-right: 8px;
  transition: transform 0.2s;
}

.chevron-rotated {
  transform: rotate(180deg);
}

.department-name {
  font-weight: 500;
  color: #374151;
}

.department-count {
  font-size: 14px;
  color: #6b7280;
}

/* Member List */
.member-list {
  margin-left: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 8px;
}

.member-checkbox {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  accent-color: #3b82f6;
}

.member-name {
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

/* Content Area */
.content-area {
  flex: 1;
  padding: 24px;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.content-column {
  width: 100%;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.column-title {
  font-size: 16px;
  font-weight: 500;
  color: #111827;
  margin: 0;
}

.exclude-text {
  font-size: 14px;
  color: #6b7280;
}

.empty-box {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 32px;
  min-height: 400px;
  background-color: rgba(249, 250, 251, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-text {
  color: #6b7280;
  font-size: 14px;
}

/* Footer */
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.footer-text {
  font-size: 14px;
  color: #6b7280;
}

.footer-buttons {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn-outline {
  background: white;
  color: #374151;
  border-color: #d1d5db;
}

.btn-outline:hover {
  background-color: #f9fafb;
}

.btn-primary {
  background-color: #111827;
  color: white;
}

.btn-primary:hover {
  background-color: #1f2937;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f4f7fd;
  border-radius: 8px;
  padding: 10px 16px;
  margin-bottom: 8px;
  font-size: 15px;
}
.user-card.approver {
  border-left: 4px solid #2563eb;
}
.user-card.collaborator {
  border-left: 4px solid #f472b6;
}
.user-card.receiver {
  border-left: 4px solid #fbbf24;
}
.user-card.reference {
  border-left: 4px solid #a78bfa;
}
.user-initial {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #dbeafe;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
}
.user-card.collaborator .user-initial {
  background: #fbcfe8;
  color: #f472b6;
}
.user-card.receiver .user-initial {
  background: #fde68a;
  color: #b45309;
}
.user-card.reference .user-initial {
  background: #e9e1fa;
  color: #7c3aed;
}
.user-name {
  font-weight: 600;
  color: #222;
}
.user-dept {
  color: #666;
  font-size: 13px;
  margin-left: 4px;
}
.user-type {
  margin-left: auto;
  font-size: 13px;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: 8px;
  background: #fff;
  border: 1.5px solid #d1d5db;
  color: #888;
}
.user-card.approver .user-type {
  border-color: #2563eb;
  color: #2563eb;
}
.user-card.collaborator .user-type {
  border-color: #f472b6;
  color: #f472b6;
}
.user-card.receiver .user-type {
  border-color: #fbbf24;
  color: #b45309;
}
.user-card.reference .user-type {
  border-color: #a78bfa;
  color: #7c3aed;
}
</style>
