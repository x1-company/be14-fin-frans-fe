<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>템플릿 수정</h2>
        <button @click="$emit('close')" class="close-button">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- 템플릿 기본 정보 -->
        <div class="form-section">
          <h3>기본 정보</h3>
          <div class="form-group">
            <label for="templateName">템플릿 이름 *</label>
            <input
              id="templateName"
              v-model="templateForm.name"
              type="text"
              placeholder="템플릿 이름을 입력하세요"
              class="form-input"
              required
            />
          </div>
          <div class="form-group">
            <label for="templateDescription">설명</label>
            <textarea
              id="templateDescription"
              v-model="templateForm.description"
              placeholder="템플릿 설명을 입력하세요"
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>
        </div>

        <!-- 사용자 검색 -->
        <div class="form-section">
          <h3>사용자 검색</h3>
          <div class="search-container">
            <div class="search-input-group">
              <input
                v-model="searchName"
                type="text"
                placeholder="이름으로 검색"
                class="search-input"
                @keyup.enter="handleSearch"
                @input="handleInputChange"
              />
              <select v-model="selectedDepartment" class="department-select">
                <option value="">전체 부서</option>
                <option
                  v-for="id in topLevelDepartmentIds"
                  :key="id"
                  :value="id"
                >
                  {{ getTopDepartmentNameById(id) }}
                </option>
              </select>
              <button @click="handleSearch" class="search-button">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                검색
              </button>
            </div>
          </div>

          <!-- 검색 결과 -->
          <div v-if="showSearchResults && searchResults.length > 0" class="search-results">
            <h4>검색 결과 ({{ searchResults.length }}명)</h4>
            <div class="search-results-list">
              <div
                v-for="user in searchResults"
                :key="user.id"
                class="result-item"
                @click="selectUser(user)"
              >
                <div class="user-avatar">
                  <img
                    v-if="user.profileUrl"
                    :src="user.profileUrl"
                    :alt="user.name"
                    class="avatar-image"
                  />
                  <div v-else class="avatar-placeholder">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                </div>
                <div class="user-info">
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-details">{{ user.positionName }} · {{ user.departmentName }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 검색 결과 없음 -->
          <div v-if="showSearchResults && searchResults.length === 0 && hasSearched" class="no-results">
            <p>검색 결과가 없습니다.</p>
          </div>
        </div>

        <!-- 선택된 사용자 목록 -->
        <div class="form-section">
          <h3>결재 라인 구성 <span class="drag-hint">(드래그하여 순서 변경 가능)</span></h3>
          <div class="section-actions">
            <button 
              v-if="templateForm.lines.length > 0" 
              @click="clearAllLines" 
              class="clear-all-button"
            >
              <!-- <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"></path>
              </svg> -->
              전체 삭제
            </button>
          </div>
          <div v-if="templateForm.lines.length === 0" class="empty-lines">
            <p>사용자를 검색하여 결재 라인을 구성하세요.</p>
          </div>
          <div v-else class="approval-lines">
            <div
              v-for="(line, index) in templateForm.lines"
              :key="`line-${line.user.id}-${line.seq}`"
              class="approval-line-item"
              :class="{ 
                'dragging': draggedIndex === index, 
                'drag-over': dragOverIndex === index && draggedIndex !== index,
                'drag-placeholder': dragPlaceholderIndex === index
              }"
              draggable="true"
              @dragstart="handleDragStart(index, $event)"
              @dragend="handleDragEnd"
              @dragover="handleDragOver(index, $event)"
              @dragenter="handleDragEnter(index, $event)"
              @dragleave="handleDragLeave(index, $event)"
              @drop="handleDrop(index, $event)"
            >
              <div class="drag-handle" @mousedown="startDrag">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
                </svg>
              </div>
              <div class="line-order">{{ index + 1 }}</div>
              <div class="line-user">
                <div class="user-avatar">
                  <img
                    v-if="line.user?.profileUrl"
                    :src="line.user.profileUrl"
                    :alt="line.user.name"
                    class="avatar-image"
                  />
                  <div v-else class="avatar-placeholder">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                </div>
                <div class="user-info">
                  <div class="user-name">{{ line.user?.name || line.userName }}</div>
                  <div class="user-details">{{ line.user?.positionName || line.positionName }} · {{ line.user?.departmentName || line.departmentName }}</div>
                </div>
              </div>
              <div class="line-type">
                <select v-model="line.type" class="type-select" @click.stop>
                  <option value="APPROVER">결재자</option>
                  <option value="COOPERATOR">협조자</option>
                  <option value="REFERENCE">참조자</option>
                  <option value="RECIPIENT">수신자</option>
                </select>
              </div>
              <button @click.stop="removeLine(index)" class="remove-button">
                X
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="cancel-button">취소</button>
        <button 
          @click="handleSubmit" 
          :disabled="isSubmitting || !isFormValid"
          class="submit-button"
          :class="{ 'loading': isSubmitting }"
        >
          <svg v-if="isSubmitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle>
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" class="opacity-75"></path>
          </svg>
          <span v-if="isSubmitting">수정 중...</span>
          <span v-else>수정</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { getTopDepartmentNameById, topLevelDepartmentIds } from '@/enums/hqEnums'
import api from '@/lib/api'
import { useToast } from "@/composables/useToast";

const toast = useToast();

const props = defineProps({
  template: Object,
  templateDetail: Array
})

const emit = defineEmits(['close', 'success'])

// 템플릿 폼 데이터
const templateForm = ref({
  name: '',
  description: '',
  lines: []
})

// 사용자 검색 관련
const searchName = ref('')
const selectedDepartment = ref('')
const searchResults = ref([])
const showSearchResults = ref(false)
const hasSearched = ref(false)
const isSearching = ref(false)
const isSubmitting = ref(false)

// 드래그앤드랍 관련
const draggedIndex = ref(null)
const dragOverIndex = ref(null)
const dragPlaceholderIndex = ref(null)
const isDragging = ref(false)

// 폼 유효성 검사
const isFormValid = computed(() => {
  return templateForm.value.name.trim() && templateForm.value.lines.length > 0
})

// 기존 데이터로 폼 초기화
const initializeForm = () => {
  if (props.template && props.templateDetail) {
    templateForm.value = {
      name: props.template.name || '',
      description: props.template.description || '',
      lines: props.templateDetail.map(item => ({
        user_id: item.userId,
        type: item.type,
        seq: item.seq,
        user: {
          id: item.userId,
          name: item.userName,
          positionName: item.positionName,
          departmentName: item.departmentName,
          profileUrl: item.profileUrl
        },
        // 기존 데이터 호환성을 위해 추가
        userName: item.userName,
        positionName: item.positionName,
        departmentName: item.departmentName
      })).sort((a, b) => a.seq - b.seq)
    }
  }
}

// 컴포넌트 마운트 시 폼 초기화
onMounted(() => {
  initializeForm()
})

// props 변경 감지
watch(() => [props.template, props.templateDetail], () => {
  initializeForm()
}, { deep: true })

// 사용자 검색
const searchUsers = async () => {
  if (!searchName.value.trim()) {
    searchResults.value = []
    showSearchResults.value = false
    return
  }

  isSearching.value = true
  hasSearched.value = true

  try {
    const params = {
      name: searchName.value,
    }
    if (selectedDepartment.value) {
      params.departmentId = selectedDepartment.value
    }

    const response = await api.get("/api/hq/user/hq", { params })
    searchResults.value = response.data || []
    showSearchResults.value = true
  } catch (error) {
    console.error("검색 중 오류 발생:", error)
    searchResults.value = []
    showSearchResults.value = true
  } finally {
    isSearching.value = false
  }
}

// 검색 핸들러
const handleSearch = () => {
  searchUsers()
}

const handleInputChange = () => {
  if (!searchName.value.trim()) {
    showSearchResults.value = false
    searchResults.value = []
    hasSearched.value = false
  }
}

// 사용자 선택
const selectUser = (user) => {
  // 이미 추가된 사용자인지 확인
  const isAlreadyAdded = templateForm.value.lines.some(line => line.user_id === user.id)
  if (isAlreadyAdded) {
    toast.warning('이미 추가된 사용자입니다.')
    return
  }

  // 새로운 라인 추가
  const newLine = {
    user_id: user.id,
    type: 'APPROVER',
    seq: templateForm.value.lines.length + 1,
    user: user,
    // 기존 데이터 호환성을 위해 추가
    userName: user.name,
    positionName: user.positionName,
    departmentName: user.departmentName
  }
  
  templateForm.value.lines.push(newLine)
  updateSequences()
  
  // 검색 결과 숨기기
  showSearchResults.value = false
  searchName.value = ''
  searchResults.value = []
}

// 라인 제거
const removeLine = (index) => {
  templateForm.value.lines.splice(index, 1)
  updateSequences()
}

// 전체 라인 삭제
const clearAllLines = () => {
  if (confirm('모든 결재 라인을 삭제하시겠습니까?')) {
    templateForm.value.lines = []
  }
}

// 순서 업데이트
const updateSequences = () => {
  templateForm.value.lines.forEach((line, idx) => {
    line.seq = idx + 1
  })
}

// 드래그 시작 준비
const startDrag = () => {
  isDragging.value = true
}

// 드래그앤드랍 핸들러 - 개선된 버전
const handleDragStart = (index, event) => {
  draggedIndex.value = index
  isDragging.value = true
  
  // 드래그 이미지 설정
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', index.toString())
  
  // 약간의 지연을 두어 드래그 상태 적용
  setTimeout(() => {
    if (draggedIndex.value === index) {
      // 드래그 중인 요소 스타일 적용
    }
  }, 0)
}

const handleDragEnd = (event) => {
  // 모든 드래그 상태 초기화
  draggedIndex.value = null
  dragOverIndex.value = null
  dragPlaceholderIndex.value = null
  isDragging.value = false
}

const handleDragEnter = (index, event) => {
  event.preventDefault()
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    dragOverIndex.value = index
  }
}

const handleDragOver = (index, event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    dragOverIndex.value = index
  }
}

const handleDragLeave = (index, event) => {
  // 실제로 요소를 벗어났는지 확인
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY
  
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    if (dragOverIndex.value === index) {
      dragOverIndex.value = null
    }
  }
}

const handleDrop = (dropIndex, event) => {
  event.preventDefault()

  if (draggedIndex.value === null || draggedIndex.value === dropIndex) return

  const dragIndex = draggedIndex.value
  const lines = [...templateForm.value.lines]

  // 드래그된 아이템을 제거
  const [draggedItem] = lines.splice(dragIndex, 1)

  // 👉 드래그가 아래 방향 & 맨 뒤로 이동할 경우엔 그대로 삽입
  let insertIndex = dropIndex
  if (dragIndex < dropIndex) {
    insertIndex = dropIndex >= lines.length ? lines.length : dropIndex
  }

  lines.splice(insertIndex, 0, draggedItem)

  // 반응성 있게 반영
  templateForm.value.lines.splice(0, lines.length, ...lines)

  updateSequences()

  // 상태 초기화
  draggedIndex.value = null
  dragOverIndex.value = null
  dragPlaceholderIndex.value = null
  isDragging.value = false
}


// 부서 변경 시 재검색
watch(selectedDepartment, () => {
  if (searchName.value.trim() && hasSearched.value) {
    searchUsers()
  }
})

// 폼 제출
const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return

  isSubmitting.value = true

  try {
    const submitData = {
      name: templateForm.value.name,
      description: templateForm.value.description,
      lines: templateForm.value.lines.map(line => ({
        userId: line.user.id,
        type: line.type,
        seq: line.seq
      }))
    }

    console.log('제출 데이터:', submitData)

    await api.put(`/api/hq/approvals/templates/${props.template.id}`, submitData)
    
    toast.success('템플릿이 성공적으로 수정되었습니다.')
    emit('success')
  } catch (error) {
    console.error('템플릿 수정 실패:', error)
    toast.error('템플릿 수정에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

// 모달 오버레이 클릭 처리
const handleOverlayClick = () => {
  emit('close')
}
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
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #212529;
}

.close-button {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-button:hover {
  background: #f8f9fa;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.form-section {
  margin-bottom: 32px;
}

.form-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #212529;
}

.drag-hint {
  font-size: 12px;
  font-weight: 400;
  color: #6c757d;
  margin-left: 8px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-container {
  margin-bottom: 16px;
}

.search-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: nowrap;
}

.search-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  min-width: 0;
}

.department-select {
  padding: 10px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  min-width: 120px;
  flex-shrink: 0;
}

.search-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.search-button:hover {
  background: #5a67d8;
}

.search-results {
  margin-top: 16px;
}

.search-results h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
}

.search-results-list {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f1f3f4;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background: #f8f9fa;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #6c757d;
  font-size: 14px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
}

.no-results p {
  margin: 0;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: #212529;
  margin-bottom: 2px;
  font-size: 14px;
}

.user-details {
  font-size: 12px;
  color: #6c757d;
}

.empty-lines {
  padding: 40px 20px;
  text-align: center;
  color: #6c757d;
  font-size: 14px;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
}

.empty-lines p {
  margin: 0;
}

.approval-lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.approval-line-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #f8f9fa;
  cursor: move;
  transition: all 0.2s ease;
  position: relative;
}

.approval-line-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.1);
}

.approval-line-item.dragging {
  opacity: 0.6;
  transform: rotate(3deg) scale(1.02);
  z-index: 1000;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  border-color: #667eea;
}

.approval-line-item.drag-over {
  border-color: #28a745;
  background: #e8f5e8;
  border-width: 2px;
  border-style: dashed;
}

.approval-line-item.drag-placeholder {
  opacity: 0.3;
  background: #f1f3f4;
}

.drag-handle {
  color: #6c757d;
  cursor: grab;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
  user-select: none;
}

.drag-handle:hover {
  background: #e9ecef;
  color: #495057;
}

.drag-handle:active {
  cursor: grabbing;
  background: #dee2e6;
}

.line-order {
  width: 28px;
  height: 28px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.line-user {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.line-type {
  flex-shrink: 0;
}

.type-select {
  padding: 6px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 12px;
  background: white;
  cursor: pointer;
}

.remove-button {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.remove-button:hover {
  /* background: rgba(220, 53, 69, 0.2); */
  border-color: #dc3545;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
}

.cancel-button {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-button:hover {
  background: #5a6268;
}

.submit-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background: #5a67d8;
}

.submit-button:disabled {
  background: #adb5bd;
  cursor: not-allowed;
}

.submit-button.loading {
  background: #6c757d;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.section-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.clear-all-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid hsl(356, 79%, 66%);
  color: #e6293d;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  background: none;
  /* transition: background-color 0.2s; */
}

/* .clear-all-button:hover {
  background: #c82333;
} */

/* 스크롤바 스타일링 */
.modal-body::-webkit-scrollbar,
.search-results-list::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track,
.search-results-list::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body::-webkit-scrollbar-thumb,
.search-results-list::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover,
.search-results-list::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}
</style>