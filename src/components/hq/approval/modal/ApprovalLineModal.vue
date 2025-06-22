<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <h2 class="modal-title">결재선 지정</h2>
      </div>

      <!-- 검색 영역 -->
      <!-- (상단 검색 input 및 결과 영역 전체 제거) -->

      <!-- 선택된 결재선 목록 -->
      <div class="approval-container">
        <!-- Header -->
        <div class="header">
          <h1 class="header-title">결재자 지정</h1>
        </div>

        <!-- Tabs -->
        <div class="tabs-container">
          <div class="tabs-left">
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
          <button class="add-btn" @click="addSelectedMembers">추가</button>
        </div>

        <div class="main-content">
          <!-- Left Sidebar -->
          <div class="sidebar">
            <div class="sidebar-content">
              <h3 class="sidebar-title">직원 검색</h3>
              <div class="sidebar-info">
                <span>선택된 직원: {{ selectedSearchUsers.length }}명</span>
                <span class="reset-link" @click="selectedSearchUsers = []"
                  >선택 초기화</span
                >
              </div>

              <!-- Search -->
              <div class="search-section">
                <div class="search-controls">
                  <input
                    type="text"
                    placeholder="이름"
                    class="search-input"
                    v-model="searchName"
                    @input="debouncedSearch"
                    @focus="showSearchResults = true"
                  />
                  <select
                    v-model="selectedDepartmentId"
                    class="department-filter"
                    @change="debouncedSearch"
                  >
                    <option value="">부서 필터</option>
                    <option
                      v-for="dept in departmentList"
                      :key="dept.id"
                      :value="dept.id"
                    >
                      {{ dept.name }}
                    </option>
                  </select>
                </div>

                <!-- 검색 결과 -->
                <div
                  v-if="showSearchResults && (isSearching || hasSearched)"
                  class="search-results"
                >
                  <div v-if="isSearching" class="loading-spinner-container">
                    <div class="loading-spinner"></div>
                  </div>
                  <div v-else-if="searchResults.length > 0">
                    <div
                      v-for="user in searchResults"
                      :key="user.id"
                      class="search-result-item"
                      :class="{ selected: isSelected(user) }"
                      @click="toggleUserSelection(user)"
                    >
                      <div class="user-initial">{{ user.name[0] }}</div>
                      <div class="user-info">
                        <div class="user-name">{{ user.name }}</div>
                        <div class="user-dept"
                          >{{ user.departmentName }} ·
                          {{ user.positionName }}</div
                        >
                      </div>
                    </div>
                  </div>
                  <div v-else class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <p>검색 결과가 없습니다</p>
                  </div>
                </div>
              </div>

              <!-- Department List -->
              <!-- 조직도 UI 제거 -->
            </div>
          </div>

          <!-- Main Content Area -->
          <div class="content-area">
            <div class="content-grid">
              <!-- 결재/협조 영역 -->
              <div class="content-column">
                <div class="column-header">
                  <h3 class="column-title">결재 / 협조</h3>
                </div>
                <div v-if="approvalList.length === 0" class="empty-box">
                  <span class="empty-text">결재자가 없습니다</span>
                </div>
                <div v-else>
                  <draggable
                    v-model="approvalList"
                    :group="'approval'"
                    :handle="'.user-card'"
                    item-key="id"
                    class="draggable-list"
                    :animation="200"
                  >
                    <template #item="{ element, index }">
                      <div
                        class="user-card"
                        :class="
                          element.type === 'COOPERATOR'
                            ? 'cooperator'
                            : 'approver'
                        "
                      >
                        <span class="user-initial">{{ element.name[0] }}</span>
                        <span class="user-name">{{ element.name }}</span>
                        <span class="user-dept"
                          >{{ element.dept }} · {{ element.position }}</span
                        >
                        <button
                          class="remove-user-btn"
                          @click.stop="removeMember(approvalList, element.id)"
                          >×</button
                        >
                      </div>
                    </template>
                  </draggable>
                </div>
              </div>
              <!-- 수신/참조 영역 (한 컬럼에 같이) -->
              <div class="content-column">
                <div class="column-header">
                  <h3 class="column-title">수신 / 참조</h3>
                </div>
                <div
                  v-if="receiverList.length === 0 && referenceList.length === 0"
                  class="empty-box"
                >
                  <span class="empty-text">수신/참조자가 없습니다</span>
                </div>
                <div v-else>
                  <div
                    v-for="user in receiverList"
                    :key="user.id"
                    class="user-card receiver"
                  >
                    <span class="user-initial">{{ user.name[0] }}</span>
                    <span class="user-name">{{ user.name }}</span>
                    <span class="user-dept"
                      >{{ user.dept }} · {{ user.position }}</span
                    >
                    <button
                      class="remove-user-btn"
                      @click.stop="removeMember(receiverList, user.id)"
                      >×</button
                    >
                  </div>
                  <div
                    v-for="user in referenceList"
                    :key="user.id"
                    class="user-card reference"
                  >
                    <span class="user-initial">{{ user.name[0] }}</span>
                    <span class="user-name">{{ user.name }}</span>
                    <span class="user-dept"
                      >{{ user.dept }} · {{ user.position }}</span
                    >
                    <button
                      class="remove-user-btn"
                      @click.stop="removeMember(referenceList, user.id)"
                      >×</button
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="footer-buttons">
            <button class="btn btn-outline" @click="emit('close')">취소</button>
            <button class="btn btn-primary" @click="confirmSelection"
              >등록</button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from "vue";
import draggable from "vuedraggable";
import { debounce } from "lodash";
import api from "@/lib/api";

const props = defineProps({
  initialLines: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(["close", "confirm"]);

const activeTab = ref("결재");
const tabs = ["결재", "협조", "수신", "참조"];

const searchName = ref("");
const selectedDepartmentId = ref("");
const departmentList = ref([
  { id: 1, name: "구매팀" },
  { id: 2, name: "영업팀" },
  { id: 3, name: "물류팀" },
  { id: 4, name: "영업1팀" },
  { id: 5, name: "영업2팀" },
  { id: 6, name: "영업3팀" },
  { id: 7, name: "물류1팀" },
  { id: 8, name: "물류2팀" },
  { id: 9, name: "물류3팀" },
  { id: 10, name: "인사팀" },
]);

const searchResults = ref([]);
const selectedSearchUsers = ref([]);
const isSearching = ref(false);
const hasSearched = ref(false);
const showSearchResults = ref(false);
let searchTimeout = null;

const approvalList = ref([]);
const receiverList = ref([]);
const referenceList = ref([]);

const searchUsers = async () => {
  if (!searchName.value && !selectedDepartmentId.value) {
    searchResults.value = [];
    hasSearched.value = false;
    return;
  }

  isSearching.value = true;
  hasSearched.value = true;
  showSearchResults.value = true;

  try {
    const params = {};
    if (searchName.value) params.name = searchName.value;
    if (selectedDepartmentId.value)
      params.departmentId = selectedDepartmentId.value;

    const response = await api.get("/api/hq/user/hq", { params });
    searchResults.value = response.data || [];
  } catch (error) {
    console.error("직원 검색 실패:", error);
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
};

const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchUsers();
  }, 300); // 300ms 디바운싱
};

const addSelectedMembers = () => {
  const targetList = getListByTab(activeTab.value);
  selectedSearchUsers.value.forEach((user) => {
    const isAlreadyAdded = [
      ...approvalList.value,
      ...receiverList.value,
      ...referenceList.value,
    ].some((member) => member.id === user.id);

    if (!isAlreadyAdded) {
      const member = {
        id: user.id,
        name: user.name,
        dept: user.departmentName,
        position: user.positionName,
        type: getTypeByTab(activeTab.value),
      };
      targetList.value.push(member);
    }
  });
  selectedSearchUsers.value = [];
  showSearchResults.value = false;
};

const getListByTab = (tab) => {
  switch (tab) {
    case "결재":
    case "협조":
      return approvalList;
    case "수신":
      return receiverList;
    case "참조":
      return referenceList;
    default:
      return approvalList;
  }
};

const getTypeByTab = (tab) => {
  switch (tab) {
    case "결재":
      return "APPROVER";
    case "협조":
      return "COOPERATOR";
    case "수신":
      return "RECEIVER";
    case "참조":
      return "REFERENCE";
    default:
      return "APPROVER";
  }
};

onMounted(() => {
  // 기존 조직도 로딩 로직 제거
  // 초기 결재선 설정
  if (props.initialLines && props.initialLines.length > 0) {
    props.initialLines.forEach((line) => {
      const user = {
        id: line.id || line.userId,
        name: line.name,
        dept: line.dept,
        position: line.position,
        type: line.type,
      };

      const list = getListByType(line.type);
      if (list) {
        list.value.push(user);
      }
    });
  }
  document.addEventListener("click", handleClickOutside);
});

const getListByType = (type) => {
  switch (type) {
    case "APPROVER":
    case "COOPERATOR":
      return approvalList;
    case "RECEIVER":
      return receiverList;
    case "REFERENCE":
      return referenceList;
    default:
      return null;
  }
};

const closeModal = () => {
  emit("close");
};

const confirmSelection = () => {
  emit("confirm", {
    approvalAndCollaboratorLines: approvalList.value,
    receivers: receiverList.value,
    references: referenceList.value,
  });
  closeModal();
};

const removeMember = (list, userId) => {
  const arr = Array.isArray(list) ? list : list.value;
  if (!arr) return;
  const idx = arr.findIndex((user) => user.id === userId);
  if (idx > -1) arr.splice(idx, 1);
};

const resetSelection = () => {
  approvalList.value = [];
  receiverList.value = [];
  referenceList.value = [];
};

function toggleType(idx) {
  // 결재/협조 타입 토글
  if (approvalList.value[idx].type === "APPROVER") {
    approvalList.value[idx].type = "COOPERATOR";
  } else {
    approvalList.value[idx].type = "APPROVER";
  }
}

const handleClickOutside = (event) => {
  const searchSection = document.querySelector(".search-section");
  if (searchSection && !searchSection.contains(event.target)) {
    showSearchResults.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

const isSelected = (user) => {
  return selectedSearchUsers.value.some((u) => u.id === user.id);
};

const toggleUserSelection = (user) => {
  if (isSelected(user)) {
    selectedSearchUsers.value = selectedSearchUsers.value.filter(
      (u) => u.id !== user.id
    );
  } else {
    selectedSearchUsers.value.push(user);
  }
};
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

/* Tabs */
.tabs-container {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  justify-content: space-between;
  position: relative;
}
.tabs-left {
  display: flex;
  align-items: center;
  gap: 0;
}
.add-btn {
  margin-left: auto;
  margin-right: 8px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 32px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  letter-spacing: 1px;
}
.add-btn:hover {
  background: #1746a2;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.18);
  transform: translateY(-50%) scale(1.04);
}
.draggable-list {
  margin-bottom: 8px;
}
.user-card {
  cursor: grab;
}
.user-card:active {
  cursor: grabbing;
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
.search-section {
  padding: 0;
  border-bottom: none;
  position: relative;
}

.search-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-input {
  flex-grow: 1;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.department-filter {
  width: 130px;
  padding: 10px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: #fff;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-top: 8px;
  max-height: 250px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.loading-spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
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
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.member-item:hover {
  background-color: #f3f4f6;
}

.member-item.selected {
  background-color: #eef2ff;
  font-weight: 500;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  margin-right: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  color: #111827;
  font-weight: 500;
}

.user-meta {
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
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
  border-left-color: #3b82f6;
}
.user-card.approver .user-initial {
  background-color: #3b82f6;
}
.user-card.cooperator {
  border-left-color: #ec4899;
}
.user-card.cooperator .user-initial {
  background-color: #ec4899;
}
.user-card.receiver {
  border-left-color: #f59e0b;
}
.user-card.receiver .user-initial {
  background-color: #f59e0b;
}
.user-card.reference {
  border-left-color: #8b5cf6;
}
.user-card.reference .user-initial {
  background-color: #8b5cf6;
}
.user-initial {
  width: 32px;
  height: 32px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 15px;
  margin-right: 12px;
}
.user-card.cooperator .user-initial {
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
.user-card.cooperator .user-type {
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

.search-result-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
}
.search-result-item:hover {
  background-color: #f9fafb;
}
.search-result-item.selected {
  background-color: #eff6ff;
  color: #1d4ed8;
}
.search-result-item.selected .user-name {
  font-weight: 600;
}

.search-user-checkbox {
  margin-right: 10px;
}

.badge.approver {
  background-color: #eef2ff;
  color: #3b82f6;
}

.badge.cooperator {
  background-color: #fdf2f8;
  color: #ec4899;
}

.badge.receiver {
  background-color: #fffbeb;
  color: #f59e0b;
}

.badge.reference {
  background-color: #f5f3ff;
  color: #8b5cf6;
}

.remove-user-btn {
  background: none;
  border: none;
  color: #bdbdbd;
  font-size: 20px;
  margin-left: 8px;
  cursor: pointer;
  transition: color 0.2s;
}
.remove-user-btn:hover {
  color: #ef4444;
}
</style>
