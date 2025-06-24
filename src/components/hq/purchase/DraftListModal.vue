<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <div class="header-content">
          <div class="header-icon">
            <FileTextIcon class="icon" />
          </div>
          <div class="header-text">
            <h2 class="modal-title">임시 저장 불러오기</h2>
            <p class="modal-description">저장된 임시 발주서를 선택하여 불러올 수 있습니다.</p>
          </div>
        </div>
        <button class="close-button" @click="closeModal">
          <XIcon class="close-icon" />
        </button>
      </div>

      <!-- 검색 및 필터 영역 -->
      <div class="search-section">
        <div class="total-count">총 {{ filteredDraftList.length }}건</div>
        <div class="search-wrapper">
          <SearchIcon class="search-icon" />
          <input 
            type="text" 
            class="search-input" 
            placeholder="발주서 검색"
            v-model="searchQuery"
          />
        </div>
      </div>

      <!-- 액션 버튼 영역 -->
      <div class="action-section">
        <div class="select-all-wrapper">
          <input 
            type="checkbox" 
            id="selectAll"
            :checked="isAllSelected"
            @change="toggleSelectAll"
          />
          <label for="selectAll" class="select-all-label">
            전체 선택 ({{ selectedCount }}/{{ filteredDraftList.length }})
          </label>
        </div>
        <div class="action-buttons">
          <button 
            class="btn-delete" 
            @click="deleteSelected"
            :disabled="selectedCount === 0"
          >
            선택 삭제
          </button>
          <button 
            class="btn-load" 
            @click="loadSelected"
            :disabled="selectedCount !== 1"
          >
            선택 불러오기
          </button>
        </div>
      </div>

      <!-- 테이블 영역 -->
      <div class="table-container">
        <table class="draft-table">
          <thead>
            <tr>
              <th style="width: 40px">선택</th>
              <th style="width: 150px">구매요청번호</th>
              <th>제목</th>
              <th style="width: 100px">담당자</th>
              <th style="width: 120px">요청일</th>
              <th style="width: 120px">납기희망일</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredDraftList.length === 0">
              <td colspan="6" class="no-data">저장된 임시 발주서가 없습니다.</td>
            </tr>
            <tr 
              v-for="draft in filteredDraftList" 
              :key="draft.id"
              class="table-row"
              @click="toggleSelection(draft)"
            >
              <td>
                <input 
                  type="checkbox" 
                  :checked="draft.selected"
                  @click.stop
                  @change="toggleSelection(draft)"
                />
              </td>
              <td>{{ draft.code }}</td>
              <td class="draft-name-cell">
                <div class="draft-name">{{ draft.title }}</div>
              </td>
              <td class="text-center">{{ draft.userName }}</td>
              <td class="text-center">{{ formatDate(draft.createdAt) }}</td>
              <td class="text-center">{{ formatDate(draft.requestedDeliveryDate) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { 
  FileText as FileTextIcon, 
  X as XIcon, 
  Search as SearchIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon
} from 'lucide-vue-next';
import api from '@/lib/api';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'load-draft']);

const searchQuery = ref('');
const draftList = ref([]);

async function fetchDrafts() {
  try {
    const response = await api.get('/api/hq/purchase/requests/draft');
    draftList.value = response.data.content.map(d => ({ ...d, selected: false }));
  } catch (error) {
    console.error("임시저장 목록을 불러오는 데 실패했습니다.", error);
    alert("임시저장 목록을 불러오는 데 실패했습니다.");
  }
}

// 필터링된 목록
const filteredDraftList = computed(() => {
  if (!searchQuery.value) return draftList.value;
  
  return draftList.value.filter(draft => 
    draft.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (draft.description && draft.description.toLowerCase().includes(searchQuery.value.toLowerCase()))
  );
});

// 선택 관련 computed
const selectedDrafts = computed(() => filteredDraftList.value.filter(draft => draft.selected));
const selectedCount = computed(() => selectedDrafts.value.length);

const isAllSelected = computed(() => 
  filteredDraftList.value.length > 0 && 
  selectedCount.value === filteredDraftList.value.length
);

// 전체 선택/해제
function toggleSelectAll(event) {
  const checked = event.target.checked;
  filteredDraftList.value.forEach(draft => {
    draft.selected = checked;
  });
}

function toggleSelection(draft) {
    draft.selected = !draft.selected;
}

// 유틸리티 함수들
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\./g, '.').replace(/\s/g, '');
}

function formatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

// 액션 함수들
function closeModal() {
  emit('close');
}

function loadSelected() {
  if (selectedCount.value === 1) {
    emit('load-draft', selectedDrafts.value[0]);
    closeModal();
  }
}

async function deleteSelected() {
  const idsToDelete = selectedDrafts.value.map(d => d.id);
  if (idsToDelete.length === 0) {
    alert('삭제할 항목을 선택해주세요.');
    return;
  }

  if (confirm(`선택한 ${idsToDelete.length}개의 임시저장을 삭제하시겠습니까?`)) {
    try {
      for (const id of idsToDelete) {
        await api.delete(`/api/hq/purchase/requests/${id}`);
      }
      alert('선택한 항목이 삭제되었습니다.');
      await fetchDrafts();
    } catch (error) {
      console.error('임시저장 삭제에 실패했습니다.', error);
      alert('삭제에 실패했습니다.');
    }
  }
}

// 모달이 열릴 때 데이터 로드 및 초기화
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    fetchDrafts();
    searchQuery.value = '';
  }
});

onMounted(() => {
    if(props.isVisible) {
        fetchDrafts();
    }
});
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
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* 헤더 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 32px;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  display: flex;
  gap: 16px;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: #dbeafe;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon {
  width: 24px;
  height: 24px;
  color: #3b82f6;
}

.header-text {
  flex: 1;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.modal-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;
  margin-left: 16px;
}

.close-button:hover {
  background: #f3f4f6;
}

.close-icon {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

/* 검색 섹션 */
.search-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.total-count {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.search-wrapper {
  position: relative;
  width: 280px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 액션 섹션 */
.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 32px;
  border-bottom: 1px solid #e5e7eb;
}

.select-all-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-all-label {
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-delete, .btn-load {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-delete {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.btn-delete:hover:not(:disabled) {
  background: #fee2e2;
}

.btn-load {
  background: #3b82f6;
  color: white;
}

.btn-load:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 테이블 */
.table-container {
  overflow-y: auto;
}

.draft-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.draft-table th,
.draft-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
  white-space: nowrap;
}

.draft-table th {
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
}

.table-row {
    cursor: pointer;
}

.table-row:hover {
  background: #f9fafb;
}

.draft-name-cell {
  text-align: left !important;
}

.draft-name {
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
}

.draft-description {
  font-size: 0.8rem;
  color: #6b7280;
}

.text-center {
  text-align: center !important;
}

.datetime-cell {
  text-align: left !important;
}

.date, .time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
}

.date-icon, .time-icon {
  width: 12px;
  height: 12px;
  color: #9ca3af;
}

.date {
  color: #374151;
  margin-bottom: 4px;
}

.time {
  color: #6b7280;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}

/* 체크박스 스타일 */
input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #d1d5db;
}
</style> 