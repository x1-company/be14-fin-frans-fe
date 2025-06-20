<template>
  <!-- Modal Overlay -->
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <h2 class="modal-title">결재선 템플릿</h2>
        <button class="close-btn" @click="closeModal">
          <svg
            width="20"
            height="20"
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

      <!-- Subtitle and Save Button -->
      <div class="modal-subheader">
        <p class="modal-subtitle">저장된 결재선 템플릿을 선택하세요</p>
        <button class="save-current-btn">현재 결재선 저장</button>
      </div>

      <!-- Template List -->
      <div class="template-list">
        <div v-if="isLoading" class="loading-container">
          <!-- 로딩 스피너나 메시지를 여기에 추가할 수 있습니다. -->
          <p>템플릿 목록을 불러오는 중입니다...</p>
        </div>
        <div v-else-if="templates.length === 0" class="empty-container">
          <p>저장된 결재선 템플릿이 없습니다.</p>
        </div>
        <div v-else>
          <!-- API로부터 받아온 템플릿 목록 -->
          <div
            v-for="template in templates"
            :key="template.id"
            class="template-item"
          >
            <div class="template-content">
              <div class="template-info">
                <h3 class="template-name">{{ template.name }}</h3>
                <p class="template-description">{{ template.description }}</p>
              </div>
              <!-- 
                결재선 미리보기(approver-flow)는 목록 API에 정보가 없으므로
                추후 상세 조회 API 연동 시 구현 가능합니다.
              -->
            </div>
            <button class="apply-btn" @click="applyTemplate(template)"
              >적용</button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/lib/api";

const emit = defineEmits(["close", "select-template"]);

const templates = ref([]);
const isLoading = ref(true);

const fetchTemplates = async () => {
  isLoading.value = true;
  try {
    const response = await api.get("/api/hq/approvals/templates");
    templates.value = response.data;
  } catch (error) {
    console.error("결재선 템플릿 목록 조회 실패:", error);
    templates.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchTemplates();
});

const closeModal = () => {
  emit("close");
};

const applyTemplate = (template) => {
  emit("select-template", template);
};

const saveCurrentTemplate = () => {
  console.log("Saving current approval line as template");
  // 현재 결재선 저장 로직
};
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* Modal Container */
.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

/* Subheader */
.modal-subheader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
}

.modal-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.save-current-btn {
  background: white;
  border: 1px solid #d1d5db;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.save-current-btn:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

/* Template List */
.template-list {
  padding: 0 32px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Template Item */
.template-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fafafa;
  transition: all 0.2s;
}

.template-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.template-content {
  flex: 1;
}

.template-info {
  margin-bottom: 16px;
}

.template-name {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.template-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Apply Button */
.apply-btn {
  background-color: #111827;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 80px;
}

.apply-btn:hover {
  background-color: #1f2937;
  transform: translateY(-1px);
}

.apply-btn:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    margin: 20px;
  }

  .modal-header,
  .modal-subheader {
    padding: 20px;
  }

  .template-list {
    padding: 0 20px 20px;
  }

  .template-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .apply-btn {
    align-self: flex-end;
  }
}

.loading-container,
.empty-container {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}
</style>
