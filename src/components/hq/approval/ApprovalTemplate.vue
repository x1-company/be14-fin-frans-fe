<template>
  <div class="approval-template">
    <div v-if="!selectedTemplate" class="no-selection">
      <div class="no-selection-content">
        <svg
          class="no-selection-icon"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1"
        >
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          ></path>
          <polyline points="14,2 14,8 20,8"></polyline>
        </svg>
        <h3>템플릿을 선택해주세요</h3>
        <p>왼쪽 목록에서 템플릿을 선택하면 상세 정보를 확인할 수 있습니다.</p>
      </div>
    </div>

    <div v-else-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>템플릿 상세 정보를 불러오는 중...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button
        @click="fetchTemplateDetail(selectedTemplate.id)"
        class="retry-button"
        >다시 시도</button
      >
    </div>

    <div v-else class="template-detail">
      <!-- 헤더 -->
      <div class="template-header">
        <div class="template-info">
          <!-- <h2 class="template-title">결재선 구성</h2> -->
          <!-- <p class="template-name">{{ selectedTemplate.name }}</p> -->
        </div>
        <div class="template-actions">
          <button @click="handleEdit" class="action-btn edit-btn">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6"
              ></path>
              <path
                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
              ></path>
            </svg>
            수정
          </button>
          <button @click="handleDelete" class="action-btn delete-btn">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="3,6 5,6 21,6"></polyline>
              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2h4a2 2 0 0 1 2 2v2"
              ></path>
            </svg>
            삭제
          </button>
          <button
            @click="toggleReorderMode"
            class="action-btn reorder-btn"
            :class="{ active: isReorderMode }"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5c-.621 0-1.125-.504-1.125-1.125V20.5"
              ></path>
              <path
                d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5c.621 0 1.125-.504 1.125-1.125V20.5"
              ></path>
              <path d="M12 4v16"></path>
            </svg>
            {{ isReorderMode ? "완료" : "순서 변경" }}
          </button>
        </div>
      </div>

      <!-- 결재 플로우 다이어그램 -->
      <div class="flow-diagram">
        <!-- 메인 결재 플로우 (기안자 + 결재자 + 협조자 순서대로) -->
        <div class="main-flow">
          <!-- 기안자 -->
          <div class="flow-node-container">
            <div class="flow-node initiator-node">
              <div class="node-avatar">
                <span class="node-label">{{
                  authStore.userName?.charAt(0) || "기"
                }}</span>
              </div>
              <div class="node-info">
                <span class="node-title">{{
                  authStore.userName || "기안자"
                }}</span>
                <span class="node-subtitle">{{
                  authStore.positionName || "작성자"
                }}</span>
                <span class="node-department">{{
                  authStore.departmentName || ""
                }}</span>
              </div>
            </div>
            <span class="node-type-label">기안</span>
          </div>

          <!-- 결재 라인 (결재자 + 협조자 순서대로) -->
          <div
            v-for="(item, index) in approvalFlow"
            :key="'flow-' + item.seq + '-' + item.type"
            class="flow-node-container"
          >
            <div :class="['flow-node', getNodeClass(item.type)]">
              <div class="node-avatar">
                <span class="node-label">{{ item.userName.charAt(0) }}</span>
              </div>
              <div class="node-info">
                <span class="node-title">{{ item.userName }}</span>
                <span class="node-subtitle">{{ item.positionName }}</span>
                <span class="node-department">{{ item.departmentName }}</span>
              </div>
            </div>
            <span class="node-type-label">{{
              getNodeTypeLabel(item.type)
            }}</span>
          </div>
        </div>

        <!-- 수신자/참조자 섹션 -->
        <div
          v-if="
            groupedApprovers.RECIPIENT.length > 0 ||
            groupedApprovers.REFERENCE.length > 0
          "
          class="additional-section"
        >
          <div class="section-divider">
            <span class="divider-label">수신 및 참조</span>
          </div>
          <div class="additional-flow">
            <!-- 수신자 -->
            <div
              v-if="groupedApprovers.RECIPIENT.length > 0"
              class="role-group"
            >
              <div
                v-for="recipient in groupedApprovers.RECIPIENT"
                :key="'recipient-' + recipient.seq"
                class="flow-node-container"
              >
                <div class="flow-node recipient-node">
                  <div class="node-avatar">
                    <span class="node-label">{{
                      recipient.userName.charAt(0)
                    }}</span>
                  </div>
                  <div class="node-info">
                    <span class="node-title">{{ recipient.userName }}</span>
                    <span class="node-subtitle">{{
                      recipient.positionName
                    }}</span>
                    <span class="node-department">{{
                      recipient.departmentName
                    }}</span>
                  </div>
                </div>
                <span class="node-type-label">수신</span>
              </div>
            </div>

            <!-- 참조자 -->
            <div
              v-if="groupedApprovers.REFERENCE.length > 0"
              class="role-group"
            >
              <div
                v-for="reference in groupedApprovers.REFERENCE"
                :key="'reference-' + reference.seq"
                class="flow-node-container"
              >
                <div class="flow-node reference-node">
                  <div class="node-avatar">
                    <span class="node-label">{{
                      reference.userName.charAt(0)
                    }}</span>
                  </div>
                  <div class="node-info">
                    <span class="node-title">{{ reference.userName }}</span>
                    <span class="node-subtitle">{{
                      reference.positionName
                    }}</span>
                    <span class="node-department">{{
                      reference.departmentName
                    }}</span>
                  </div>
                </div>
                <span class="node-type-label">참조</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 상세 목록 -->
      <div class="detail-sections">
        <div class="section-header">
          <h3>결재 참여자 상세 정보</h3>
        </div>

        <!-- 결재자 목록 -->
        <div v-if="groupedApprovers.APPROVER.length > 0" class="detail-section">
          <div
            class="section-title"
            :style="{ color: getTypeColor('APPROVER') }"
          >
            <div
              class="section-icon"
              :style="{ backgroundColor: getTypeColor('APPROVER') }"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
            </div>
            {{ getTypeLabel("APPROVER") }}
            <span class="member-count"
              >({{ groupedApprovers.APPROVER.length }}명)</span
            >
          </div>
          <div class="member-list">
            <div
              v-for="approver in groupedApprovers.APPROVER"
              :key="'detail-approver-' + approver.seq"
              class="member-item"
            >
              <div
                class="member-number"
                :style="{ backgroundColor: getTypeColor('APPROVER') }"
              >
                {{ approver.seq }}
              </div>
              <div
                class="member-avatar"
                :style="{ backgroundColor: getTypeColor('APPROVER') }"
              >
                {{ approver.userName.charAt(0) }}
              </div>
              <div class="member-info">
                <div class="member-name">{{ approver.userName }}</div>
                <div class="member-details"
                  >{{ approver.positionName }} ·
                  {{ approver.departmentName }}</div
                >
              </div>
              <div class="member-actions">
                <span class="member-badge approver-badge">결재</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 협조자 목록 -->
        <div
          v-if="groupedApprovers.COOPERATOR.length > 0"
          class="detail-section"
        >
          <div
            class="section-title"
            :style="{ color: getTypeColor('COOPERATOR') }"
          >
            <div
              class="section-icon"
              :style="{ backgroundColor: getTypeColor('COOPERATOR') }"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            {{ getTypeLabel("COOPERATOR") }}
            <span class="member-count"
              >({{ groupedApprovers.COOPERATOR.length }}명)</span
            >
          </div>
          <div class="member-list">
            <div
              v-for="cooperator in groupedApprovers.COOPERATOR"
              :key="'detail-cooperator-' + cooperator.seq"
              class="member-item"
            >
              <div
                class="member-avatar"
                :style="{ backgroundColor: getTypeColor('COOPERATOR') }"
              >
                {{ cooperator.userName.charAt(0) }}
              </div>
              <div class="member-info">
                <div class="member-name">{{ cooperator.userName }}</div>
                <div class="member-details"
                  >{{ cooperator.positionName }} ·
                  {{ cooperator.departmentName }}</div
                >
              </div>
              <div class="member-actions">
                <span class="member-badge cooperator-badge">협조</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 수신자 목록 -->
        <div
          v-if="groupedApprovers.RECIPIENT.length > 0"
          class="detail-section"
        >
          <div
            class="section-title"
            :style="{ color: getTypeColor('RECIPIENT') }"
          >
            <div
              class="section-icon"
              :style="{ backgroundColor: getTypeColor('RECIPIENT') }"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                ></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            {{ getTypeLabel("RECIPIENT") }}
            <span class="member-count"
              >({{ groupedApprovers.RECIPIENT.length }}명)</span
            >
          </div>
          <div class="member-list">
            <div
              v-for="recipient in groupedApprovers.RECIPIENT"
              :key="'detail-recipient-' + recipient.seq"
              class="member-item"
            >
              <div
                class="member-avatar"
                :style="{ backgroundColor: getTypeColor('RECIPIENT') }"
              >
                {{ recipient.userName.charAt(0) }}
              </div>
              <div class="member-info">
                <div class="member-name">{{ recipient.userName }}</div>
                <div class="member-details"
                  >{{ recipient.positionName }} ·
                  {{ recipient.departmentName }}</div
                >
              </div>
              <div class="member-actions">
                <span class="member-badge recipient-badge">수신</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 참조자 목록 -->
        <div
          v-if="groupedApprovers.REFERENCE.length > 0"
          class="detail-section"
        >
          <div
            class="section-title"
            :style="{ color: getTypeColor('REFERENCE') }"
          >
            <div
              class="section-icon"
              :style="{ backgroundColor: getTypeColor('REFERENCE') }"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                ></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
            {{ getTypeLabel("REFERENCE") }}
            <span class="member-count"
              >({{ groupedApprovers.REFERENCE.length }}명)</span
            >
          </div>
          <div class="member-list">
            <div
              v-for="reference in groupedApprovers.REFERENCE"
              :key="'detail-reference-' + reference.seq"
              class="member-item"
            >
              <div
                class="member-avatar"
                :style="{ backgroundColor: getTypeColor('REFERENCE') }"
              >
                {{ reference.userName.charAt(0) }}
              </div>
              <div class="member-info">
                <div class="member-name">{{ reference.userName }}</div>
                <div class="member-details"
                  >{{ reference.positionName }} ·
                  {{ reference.departmentName }}</div
                >
              </div>
              <div class="member-actions">
                <span class="member-badge reference-badge">참조</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 수정 모달 -->
    <TemplateModifyModal
      v-if="showEditModal"
      :template="selectedTemplate"
      :template-detail="templateDetail"
      @close="closeEditModal"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import api from "@/lib/api";
import TemplateModifyModal from "./TemplateModifyModal.vue";
import { useToast } from "@/composables/useToast";

const toast = useToast();

const props = defineProps({
  selectedTemplate: Object,
  reorderChanges: Array,
});

const emit = defineEmits([
  "template-deleted",
  "template-updated",
  "reorder-mode-changed",
  "reorder-complete",
  "reorder-cancel",
]);

const authStore = useAuthStore();
const templateDetail = ref([]);
const loading = ref(false);
const error = ref("");
const showEditModal = ref(false);
const isReorderMode = ref(false);

// 템플릿 상세 정보 조회
const fetchTemplateDetail = async (templateId) => {
  loading.value = true;
  error.value = "";

  try {
    const { data } = await api.get(`/api/hq/approvals/templates/${templateId}`);
    templateDetail.value = data;
  } catch (err) {
    console.error("템플릿 상세 조회 실패:", err);
    error.value = "템플릿 상세 정보를 불러오는데 실패했습니다.";
  } finally {
    loading.value = false;
  }
};

// 템플릿 변경 감지
watch(
  () => props.selectedTemplate,
  (newTemplate) => {
    if (newTemplate?.id) {
      fetchTemplateDetail(newTemplate.id);
    }
  },
  { immediate: true }
);

// 타입별 그룹화
const groupedApprovers = computed(() => {
  const groups = {
    APPROVER: [],
    COOPERATOR: [],
    REFERENCE: [],
    RECIPIENT: [],
  };

  templateDetail.value.forEach((item) => {
    if (groups[item.type]) {
      groups[item.type].push(item);
    }
  });

  // seq 순으로 정렬
  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => a.seq - b.seq);
  });

  return groups;
});

// 결재 플로우 (결재자 + 협조자를 seq 순으로 정렬)
const approvalFlow = computed(() => {
  const flowItems = [
    ...groupedApprovers.value.APPROVER,
    ...groupedApprovers.value.COOPERATOR,
  ];

  return flowItems.sort((a, b) => a.seq - b.seq);
});

// 노드 클래스 반환
const getNodeClass = (type) => {
  const classes = {
    APPROVER: "approver-node",
    COOPERATOR: "cooperator-node",
    REFERENCE: "reference-node",
    RECIPIENT: "recipient-node",
  };
  return classes[type] || "approver-node";
};

// 노드 타입 라벨 반환 (간단하게)
const getNodeTypeLabel = (type) => {
  const labels = {
    APPROVER: "결재",
    COOPERATOR: "협조",
    REFERENCE: "참조",
    RECIPIENT: "수신",
  };
  return labels[type] || "결재";
};

// 타입 라벨 반환
const getTypeLabel = (type) => {
  const labels = {
    APPROVER: "결재자",
    COOPERATOR: "협조자",
    REFERENCE: "참조자",
    RECIPIENT: "수신자",
  };
  return labels[type] || type;
};

// 타입별 색상 반환
const getTypeColor = (type) => {
  const colors = {
    APPROVER: "#4285f4",
    COOPERATOR: "#34a853",
    REFERENCE: "#9aa0a6",
    RECIPIENT: "#9c27b0",
  };
  return colors[type] || "#666";
};

// 삭제 처리
const handleDelete = async () => {
  if (!props.selectedTemplate) return;

  if (confirm(`"${props.selectedTemplate.name}" 템플릿을 삭제하시겠습니까?`)) {
    try {
      await api.delete(
        `/api/hq/approvals/templates/${props.selectedTemplate.id}`
      );
      toast.success("템플릿이 성공적으로 삭제되었습니다.");
      emit("template-deleted");
    } catch (error) {
      console.error("템플릿 삭제 실패:", error);
      toast.error("템플릿 삭제에 실패했습니다.");
    }
  }
};

// 수정 처리
const handleEdit = () => {
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
};

const handleEditSuccess = () => {
  closeEditModal();
  if (props.selectedTemplate?.id) {
    fetchTemplateDetail(props.selectedTemplate.id);
  }
  emit("template-updated");
};

// 순서 변경 모드 토글
const toggleReorderMode = async () => {
  if (isReorderMode.value) {
    // 완료 버튼을 눌렀을 때
    if (props.reorderChanges && props.reorderChanges.length > 0) {
      try {
        const selectedTemplateId = props.selectedTemplate.id;
        const newSeq = props.reorderChanges[0].newIndex;

        await api.patch(
          `/api/hq/approvals/templates/${selectedTemplateId}/seq/${newSeq}`
        )
        toast.success("순서 변경이 완료되었습니다.");

        // 완료 이벤트 emit
        emit("reorder-complete");
      } catch (error) {
        console.error("순서 변경 API 호출 실패:", error);
        toast.error("순서 변경에 실패했습니다.");

        // 취소 이벤트 emit (롤백)
        emit("reorder-cancel");
        return;
      }
    } else {
      console.log("변경된 순서가 없습니다.");
    }
  }

  isReorderMode.value = !isReorderMode.value;
  emit("reorder-mode-changed", isReorderMode.value);
};
</script>

<style scoped>
.approval-template {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: 100%;
}

.no-selection {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.no-selection-content {
  text-align: center;
  color: #6c757d;
}

.no-selection-icon {
  color: #dee2e6;
  margin-bottom: 24px;
}

.no-selection-content h3 {
  margin: 0 0 12px 0;
  color: #495057;
  font-size: 20px;
  font-weight: 600;
}

.no-selection-content p {
  margin: 0;
  font-size: 14px;
  color: #6c757d;
}

.loading-container,
.error-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6c757d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  margin: 0 0 20px 0;
  color: #dc3545;
  font-size: 16px;
}

.retry-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s ease;
}

.retry-button:hover {
  background: #5a67d8;
}

.template-detail {
  height: 100%;
  overflow-y: auto;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 40px;
  background: white;
  /* border-bottom: 1px solid #e9ecef; */
}

.template-info h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #212529;
}

.template-name {
  margin: 0;
  font-size: 16px;
  color: #6c757d;
}

.template-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #bbdefb;
  background: white;
  color: #1976d2;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f8f9fa;
  /* border-color: #adb5bd; */
}

.delete-btn {
  border: 1px solid #ffcdd2;
  color: #d32f2f;
  background: white;
}

.delete-btn:hover {
  background: #fff4f5;
  /* color: #b71c1c; */
}

.reorder-btn.active {
  background: #28a745;
  border-color: #28a745;
  color: white;
}

.flow-diagram {
  padding: 20px 20px 20px 20px;
  background: white;
}

.main-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  /* margin-bottom: 40px;
  margin-top: 20px; */
}

.flow-node-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.flow-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px;
  border-radius: 50%;
  width: 110px;
  height: 110px;
  text-align: center;
  color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  justify-content: center;
}

.flow-node:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

.initiator-node {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.approver-node {
  background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
}

.cooperator-node {
  background: linear-gradient(135deg, #34a853 0%, #137333 100%);
}

.recipient-node {
  background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
}

.reference-node {
  background: linear-gradient(135deg, #9aa0a6 0%, #5f6368 100%);
}

.node-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.node-label {
  font-size: 11px;
  font-weight: bold;
}

.node-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.node-title {
  font-size: 11px;
  font-weight: 600;
  color: white;
  margin-bottom: 2px;
}

.node-subtitle {
  font-size: 10px;
  color: white;
  opacity: 1;
}

.node-department {
  font-size: 9px;
  color: white;
  opacity: 1;
}

.node-type-label {
  font-size: 12px;
  font-weight: 600;
  color: #4066fa;
  background: #e3f0ff;
  padding: 2px 8px;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
}

.section-divider {
  margin-bottom: 12px;
}

.divider-label {
  padding: 4px 12px;
  font-size: 12px;
}

.additional-section {
  margin-top: 20px;
}

.additional-flow {
  gap: 12px;
}

.role-group {
  gap: 12px;
}

.detail-sections {
  padding: 40px;
  background: white;
}

.section-header h3 {
  margin: 0 0 32px 0;
  color: #212529;
  font-size: 15px;
  font-weight: 700;
}

.detail-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #e9ecef;
  font-size: 0.9em;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 10px;
}

.section-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.member-count {
  font-size: 14px;
  color: #6c757d;
  font-weight: 400;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  font-size: 0.9em;
}

.member-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.member-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 13px;
  font-weight: bold;
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 13px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 4px;
}

.member-details {
  font-size: 14px;
  color: #6c757d;
}

.member-actions {
  margin-left: auto;
}

.member-badge {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.approver-badge {
  background: #4285f4;
}

.cooperator-badge {
  background: #34a853;
}

.recipient-badge {
  background: #9c27b0;
}

.reference-badge {
  background: #9aa0a6;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .template-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .main-flow {
    flex-direction: column;
  }

  .additional-flow {
    flex-direction: column;
    align-items: center;
  }

  .flow-diagram {
    padding: 20px;
  }

  .detail-sections {
    padding: 20px;
  }
}
</style>
