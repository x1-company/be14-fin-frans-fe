<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <h2 class="modal-title">결재선 지정</h2>
        <button class="close-button" @click="closeModal">×</button>
      </div>

      <!-- 액션 버튼들 -->
      <div class="action-buttons">
        <button
          class="action-button approval-button"
          @click="addSelectedToLine('approver')"
          :disabled="selectedMembers.length === 0"
        >
          👤 결재 추가
        </button>
        <button
          class="action-button collaboration-button"
          @click="addSelectedToLine('collaborator')"
          :disabled="selectedMembers.length === 0"
        >
          👥 협조 추가
        </button>
        <button
          class="action-button receive-button"
          @click="addSelectedToLine('receiver')"
          :disabled="selectedMembers.length === 0"
        >
          📨 수신 추가
        </button>
        <button
          class="action-button reference-button"
          @click="addSelectedToLine('reference')"
          :disabled="selectedMembers.length === 0"
        >
          📋 참조 추가
        </button>
      </div>

      <div class="modal-content">
        <!-- 좌측: 조직도 -->
        <div class="organization-panel">
          <div class="panel-header">
            <h3 class="panel-title">조직도</h3>
            <div class="panel-info">
              <span class="selected-count"
                >선택된 직원: {{ selectedMembers.length }}명</span
              >
              <span class="total-count">전체 초기화</span>
            </div>
          </div>

          <div class="search-box">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="이름 / 부서를 검색하세요"
              class="search-input"
            />
          </div>

          <div class="org-tree">
            <div v-for="dept in departments" :key="dept.id" class="dept-item">
              <div class="dept-header" @click="toggleDepartment(dept.id)">
                <span class="dept-toggle">{{ dept.expanded ? "▼" : "▶" }}</span>
                <span class="dept-name">{{ dept.name }}</span>
                <span class="dept-count">{{ dept.members.length }}</span>
              </div>

              <div v-if="dept.expanded" class="dept-members">
                <label
                  v-for="member in dept.members"
                  :key="member.id"
                  class="member-item"
                  :class="{ selected: selectedMembers.includes(member.id) }"
                >
                  <input
                    type="checkbox"
                    :value="member.id"
                    v-model="selectedMembers"
                    class="member-checkbox"
                  />
                  <span class="member-name"
                    >{{ member.name }} {{ member.position }}</span
                  >
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- 중앙: 직원 목록 -->
        <div class="member-panel">
          <div class="panel-header-center">
            <div class="header-sections">
              <span class="header-approval">결재</span>
              <span class="header-collaboration">협조</span>
            </div>
            <div class="header-sections">
              <span class="header-receive">수신 / 참조</span>
              <span class="header-action">선택 제외</span>
            </div>
          </div>

          <div class="selected-members-display">
            <!-- 결재 섹션 -->
            <div
              v-if="approvalLine.approvers.length > 0"
              class="display-section approval-section"
            >
              <div
                v-for="(member, index) in approvalLine.approvers"
                :key="`approver-${member.id}`"
                class="display-member"
              >
                <input type="checkbox" class="display-checkbox" />
                <span class="display-number">{{ index + 1 }}</span>
                <span class="display-initial">결</span>
                <div class="display-info">
                  <div class="display-name">{{ member.name }}</div>
                  <div class="display-position"
                    >{{ member.position }} / {{ member.department }}</div
                  >
                </div>
                <button class="display-action-btn approval-btn">결재</button>
              </div>
            </div>

            <!-- 협조 섹션 -->
            <div
              v-if="approvalLine.collaborators.length > 0"
              class="display-section collaboration-section"
            >
              <div
                v-for="(member, index) in approvalLine.collaborators"
                :key="`collaborator-${member.id}`"
                class="display-member"
                draggable="true"
                @dragstart="handleDragStart('collaborators', index, $event)"
                @dragend="handleDragEnd"
              >
                <input type="checkbox" class="display-checkbox" />
                <span class="display-number">{{ index + 1 }}</span>
                <span class="display-initial collaboration-initial">협</span>
                <div class="display-info">
                  <div class="display-name">{{ member.name }}</div>
                  <div class="display-position"
                    >{{ member.position }} / {{ member.department }}</div
                  >
                </div>
                <button class="display-action-btn collaboration-btn"
                  >협조</button
                >
              </div>
            </div>
          </div>
        </div>

        <!-- 우측: 선택된 결재선 -->
        <div class="approval-line-panel">
          <div class="panel-header-right">
            <span class="header-receive-ref">수신 / 참조</span>
            <span class="header-exclude">선택 제외</span>
          </div>

          <div class="approval-line-display">
            <!-- 수신 섹션 -->
            <div
              v-if="approvalLine.receivers.length > 0"
              class="line-section receive-section"
            >
              <h4 class="section-title receive-title">수신</h4>
              <div
                class="line-items"
                @dragover.prevent
                @drop="handleDrop('receivers', $event)"
              >
                <div
                  v-for="(member, index) in approvalLine.receivers"
                  :key="`receiver-${member.id}`"
                  class="line-member receive-member"
                  draggable="true"
                  @dragstart="handleDragStart('receivers', index, $event)"
                  @dragend="handleDragEnd"
                >
                  <input type="checkbox" class="line-checkbox" />
                  <span class="line-number">{{ index + 1 }}</span>
                  <span class="line-initial receive-initial">황</span>
                  <div class="line-info">
                    <div class="line-name">{{ member.name }}</div>
                    <div class="line-position"
                      >{{ member.position }} / {{ member.department }}</div
                    >
                  </div>
                  <button class="line-action-btn receive-btn">수신</button>
                </div>
              </div>
            </div>

            <!-- 참조 섹션 -->
            <div
              v-if="approvalLine.references.length > 0"
              class="line-section reference-section"
            >
              <h4 class="section-title reference-title">참조</h4>
              <div
                class="line-items"
                @dragover.prevent
                @drop="handleDrop('references', $event)"
              >
                <div
                  v-for="(member, index) in approvalLine.references"
                  :key="`reference-${member.id}`"
                  class="line-member reference-member"
                  draggable="true"
                  @dragstart="handleDragStart('references', index, $event)"
                  @dragend="handleDragEnd"
                >
                  <input type="checkbox" class="line-checkbox" />
                  <span class="line-number">{{ index + 1 }}</span>
                  <span class="line-initial reference-initial">박</span>
                  <div class="line-info">
                    <div class="line-name">{{ member.name }}</div>
                    <div class="line-position"
                      >{{ member.position }} / {{ member.department }}</div
                    >
                  </div>
                  <button class="line-action-btn reference-btn">참조</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 모달 푸터 -->
      <div class="modal-footer">
        <span class="footer-info">선택된 결재선 제외</span>
        <div class="footer-buttons">
          <button class="cancel-button" @click="closeModal">취소</button>
          <button class="confirm-button" @click="confirmSelection">등록</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// Props & Emits
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "confirm"]);

// 상태 관리
const searchQuery = ref("");
const selectedMembers = ref([]);
const draggedItem = ref(null);

// 조직도 데이터
const departments = ref([
  {
    id: 1,
    name: "영업1팀",
    expanded: true,
    members: [
      { id: 1, name: "김영희", position: "주임", department: "영업1팀" },
      { id: 2, name: "이은규", position: "과장", department: "영업1팀" },
      { id: 3, name: "황수민", position: "대리", department: "영업1팀" },
    ],
  },
  {
    id: 2,
    name: "영업2팀",
    expanded: true,
    members: [
      { id: 4, name: "박지훈", position: "사원", department: "영업2팀" },
      { id: 5, name: "최서연", position: "대리", department: "영업2팀" },
      { id: 6, name: "차은우", position: "차장", department: "영업2팀" },
    ],
  },
  {
    id: 3,
    name: "물류1팀",
    expanded: false,
    members: [
      { id: 7, name: "정민수", position: "과장", department: "물류1팀" },
      { id: 8, name: "윤하늘", position: "대리", department: "물류1팀" },
    ],
  },
]);

// 결재선 데이터
const approvalLine = ref({
  approvers: [
    { id: 1, name: "김영희", position: "주임", department: "영업1팀" },
  ],
  collaborators: [
    { id: 2, name: "이은규", position: "과장", department: "영업1팀" },
  ],
  receivers: [
    { id: 3, name: "황수민", position: "대리", department: "영업1팀" },
  ],
  references: [
    { id: 4, name: "박지훈", position: "사원", department: "영업2팀" },
  ],
});

// 계산된 속성
const allMembers = computed(() => {
  return departments.value.flatMap((dept) => dept.members);
});

// 메서드
const toggleDepartment = (deptId) => {
  const dept = departments.value.find((d) => d.id === deptId);
  if (dept) {
    dept.expanded = !dept.expanded;
  }
};

const addSelectedToLine = (lineType) => {
  if (selectedMembers.value.length === 0) return;

  const lineKey = getLineKey(lineType);

  selectedMembers.value.forEach((memberId) => {
    const member = allMembers.value.find((m) => m.id === memberId);
    if (
      member &&
      !approvalLine.value[lineKey].some((item) => item.id === member.id)
    ) {
      approvalLine.value[lineKey].push({ ...member });
    }
  });

  // 선택 해제
  selectedMembers.value = [];
};

const getLineKey = (lineType) => {
  const keyMap = {
    approver: "approvers",
    collaborator: "collaborators",
    receiver: "receivers",
    reference: "references",
  };
  return keyMap[lineType];
};

// 드래그 앤 드롭 처리
const handleDragStart = (lineType, index, event) => {
  draggedItem.value = {
    lineType,
    index,
    item: approvalLine.value[lineType][index],
  };
  event.dataTransfer.effectAllowed = "move";
};

const handleDragEnd = () => {
  draggedItem.value = null;
};

const handleDrop = (lineType, event) => {
  event.preventDefault();

  if (!draggedItem.value || draggedItem.value.lineType !== lineType) return;

  const dropIndex = getDropIndex(event, lineType);
  const dragIndex = draggedItem.value.index;

  if (dropIndex !== dragIndex) {
    const items = approvalLine.value[lineType];
    const draggedItemData = items.splice(dragIndex, 1)[0];
    items.splice(dropIndex, 0, draggedItemData);
  }
};

const getDropIndex = (event, lineType) => {
  const container = event.currentTarget;
  const items = container.querySelectorAll(".line-member");
  const mouseY = event.clientY;

  for (let i = 0; i < items.length; i++) {
    const rect = items[i].getBoundingClientRect();
    if (mouseY < rect.top + rect.height / 2) {
      return i;
    }
  }
  return items.length;
};

const closeModal = () => {
  emit("close");
};

const confirmSelection = () => {
  const result = {
    approvers: approvalLine.value.approvers,
    collaborators: approvalLine.value.collaborators,
    receivers: approvalLine.value.receivers,
    references: approvalLine.value.references,
  };
  emit("confirm", result);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 95vw;
  max-width: 1400px;
  height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
}

.action-buttons {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.action-button {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.approval-button:not(:disabled):hover {
  background: #dbeafe;
  border-color: #3b82f6;
  color: #1d4ed8;
}

.collaboration-button:not(:disabled):hover {
  background: #fce7f3;
  border-color: #ec4899;
  color: #be185d;
}

.receive-button:not(:disabled):hover {
  background: #fed7aa;
  border-color: #f97316;
  color: #c2410c;
}

.reference-button:not(:disabled):hover {
  background: #e9d5ff;
  border-color: #8b5cf6;
  color: #6d28d9;
}

.modal-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.organization-panel {
  width: 280px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.member-panel {
  flex: 1;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.approval-line-panel {
  width: 320px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.panel-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
}

.selected-count {
  color: #3b82f6;
}

.total-count {
  cursor: pointer;
  text-decoration: underline;
}

.panel-header-center {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 500;
}

.header-sections {
  display: flex;
  gap: 40px;
}

.header-approval {
  color: #3b82f6;
}

.header-collaboration {
  color: #ec4899;
}

.header-receive {
  color: #f97316;
}

.header-action {
  color: #6b7280;
}

.panel-header-right {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 500;
}

.header-receive-ref {
  color: #8b5cf6;
}

.header-exclude {
  color: #6b7280;
}

.search-box {
  padding: 16px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
}

.org-tree {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.dept-item {
  margin-bottom: 8px;
}

.dept-header {
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
}

.dept-header:hover {
  background: #f3f4f6;
}

.dept-toggle {
  width: 16px;
  color: #6b7280;
}

.dept-name {
  flex: 1;
  font-weight: 500;
  margin-left: 8px;
}

.dept-count {
  background: #e5e7eb;
  color: #374151;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.dept-members {
  margin-left: 24px;
  padding: 4px 0;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 4px;
}

.member-item:hover,
.member-item.selected {
  background: #dbeafe;
}

.member-checkbox {
  margin-right: 8px;
}

.member-name {
  font-size: 14px;
}

.selected-members-display {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.display-section {
  margin-bottom: 20px;
}

.display-member {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: #f8fafc;
  border-radius: 6px;
  border-left: 4px solid;
}

.approval-section .display-member {
  border-left-color: #3b82f6;
}

.collaboration-section .display-member {
  border-left-color: #ec4899;
}

.display-checkbox {
  margin-right: 12px;
}

.display-number {
  width: 24px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-right: 8px;
}

.display-initial {
  width: 24px;
  height: 24px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
}

.collaboration-initial {
  background: #ec4899;
}

.display-info {
  flex: 1;
}

.display-name {
  font-weight: 500;
  font-size: 14px;
}

.display-position {
  color: #6b7280;
  font-size: 12px;
  margin-top: 2px;
}

.display-action-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.approval-btn {
  background: #3b82f6;
  color: white;
}

.collaboration-btn {
  background: #ec4899;
  color: white;
}

.approval-line-display {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.line-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.receive-title {
  color: #f97316;
}

.reference-title {
  color: #8b5cf6;
}

.line-items {
  min-height: 40px;
}

.line-member {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: #f8fafc;
  border-radius: 6px;
  border-left: 4px solid;
  cursor: move;
}

.receive-member {
  border-left-color: #f97316;
}

.reference-member {
  border-left-color: #8b5cf6;
}

.line-checkbox {
  margin-right: 12px;
}

.line-number {
  width: 24px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-right: 8px;
}

.line-initial {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
  color: white;
}

.receive-initial {
  background: #f97316;
}

.reference-initial {
  background: #8b5cf6;
}

.line-info {
  flex: 1;
}

.line-name {
  font-weight: 500;
  font-size: 14px;
}

.line-position {
  color: #6b7280;
  font-size: 12px;
  margin-top: 2px;
}

.line-action-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  color: white;
}

.receive-btn {
  background: #f97316;
}

.reference-btn {
  background: #8b5cf6;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.footer-info {
  color: #6b7280;
  font-size: 14px;
}

.footer-buttons {
  display: flex;
  gap: 12px;
}

.cancel-button,
.confirm-button {
  padding: 8px 24px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-button {
  background: white;
  color: #374151;
}

.confirm-button {
  background: #374151;
  color: white;
  border-color: #374151;
}

/* 반응형 */
@media (max-width: 1200px) {
  .modal-container {
    width: 98vw;
    height: 90vh;
  }

  .organization-panel {
    width: 240px;
  }

  .approval-line-panel {
    width: 280px;
  }
}
</style>
