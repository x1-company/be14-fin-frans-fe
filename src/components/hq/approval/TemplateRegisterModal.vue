<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>템플릿 등록</h2>
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
          <div class="form-group">
            <label for="templateSeq">순서</label>
            <input
              id="templateSeq"
              v-model.number="templateForm.seq"
              type="number"
              placeholder="순서를 입력하세요"
              class="form-input"
              min="1"
            />
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
          <h3>결재 라인 구성</h3>
          <div v-if="templateForm.lines.length === 0" class="empty-lines">
            <p>사용자를 검색하여 결재 라인을 구성하세요.</p>
          </div>
          <div v-else class="approval-lines">
            <div
              v-for="(line, index) in templateForm.lines"
              :key="index"
              class="approval-line-item"
            >
              <div class="line-order">{{ index + 1 }}</div>
              <div class="line-user">
                <div class="user-avatar">
                  <img
                    v-if="line.user.profileUrl"
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
                  <div class="user-name">{{ line.user.name }}</div>
                  <div class="user-details">{{ line.user.positionName }} · {{ line.user.departmentName }}</div>
                </div>
              </div>
              <div class="line-type">
                <select v-model="line.type" class="type-select">
                  <option value="APPROVER">결재자</option>
                  <option value="COOPERATOR">협조자</option>
                  <option value="REFERENCE">참조자</option>
                  <option value="RECIPIENT">수신자</option>
                </select>
              </div>
              <button @click="removeLine(index)" class="remove-button">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
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
          <span v-if="isSubmitting">등록 중...</span>
          <span v-else>등록</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getTopDepartmentNameById, topLevelDepartmentIds } from '@/enums/hqEnums'
import api from '@/lib/api'

const emit = defineEmits(['close', 'success'])

// 템플릿 폼 데이터
const templateForm = ref({
  name: '',
  description: '',
  seq: 1,
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

// 폼 유효성 검사
const isFormValid = computed(() => {
  return templateForm.value.name.trim() && templateForm.value.lines.length > 0
})

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
  const isAlreadyAdded = templateForm.value.lines.some(line => line.userId === user.id)
  if (isAlreadyAdded) {
    alert('이미 추가된 사용자입니다.')
    return
  }

  // 새로운 라인 추가
  const newLine = {
    userId: user.id,
    type: 'APPROVER',
    seq: templateForm.value.lines.length + 1,
    user: user
  }
  
  templateForm.value.lines.push(newLine)
  
  // 검색 결과 숨기기
  showSearchResults.value = false
  searchName.value = ''
  searchResults.value = []
}

// 라인 제거
const removeLine = (index) => {
  templateForm.value.lines.splice(index, 1)
  // seq 재정렬
  templateForm.value.lines.forEach((line, idx) => {
    line.seq = idx + 1
  })
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
      seq: templateForm.value.seq,
      lines: templateForm.value.lines.map(line => ({
        userId: line.userId,
        type: line.type,
        seq: line.seq
      }))
    }

    await api.post('/api/hq/approvals/templates', submitData)
    
    alert('템플릿이 성공적으로 등록되었습니다.')
    emit('success')
  } catch (error) {
    console.error('템플릿 등록 실패:', error)
    alert('템플릿 등록에 실패했습니다.')
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
  gap: 12px;
}

.approval-line-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #f8f9fa;
}

.line-order {
  width: 24px;
  height: 24px;
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
  background: rgba(220, 53, 69, 0.1);
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