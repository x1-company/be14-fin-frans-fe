<template>
  <div class="franchise-user-search">
    <!-- 검색 영역 -->
    <div class="search-section">
      <div class="search-form">
        <div class="search-input-group">
          <input
            v-model="searchName"
            type="text"
            placeholder="이름으로 검색"
            class="search-input"
            @keyup.enter="handleSearch"
            @input="handleInputChange"
          />
          <button @click="handleSearch" class="search-button">
            <SearchIcon class="w-5 h-5" />
            검색
          </button>
        </div>
      </div>
    </div>

    <!-- 검색 결과 목록 -->
    <div v-if="showSearchResults && searchResults.length > 0 && !selectedUser" class="search-results-section">
      <h3 class="results-title">검색 결과 ({{ searchResults.length }}명)</h3>
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
              <UserIcon class="w-6 h-6" />
            </div>
          </div>
          <div class="user-info">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-details">{{ user.franchiseName }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 검색 결과 없음 -->
    <div v-if="showSearchResults && searchResults.length === 0 && hasSearched && !selectedUser" class="no-results-section">
      <p class="no-results">검색 결과가 없습니다.</p>
    </div>

    <!-- 선택된 사용자 상세 정보 -->
    <div v-if="selectedUser" class="user-detail-section">
      <div class="detail-header">
        <h3>가맹점 사용자 상세 정보</h3>
        <div class="header-actions">
          <button 
            @click="handleResetPassword" 
            :disabled="isResetPasswordLoading"
            class="reset-password-button"
            :class="{ 'loading': isResetPasswordLoading }"
          >
            <LoaderIcon v-if="isResetPasswordLoading" class="w-4 h-4 animate-spin" />
            <span v-else>비밀번호 초기화</span>
            <span v-if="isResetPasswordLoading">처리 중...</span>
          </button>
          <button @click="clearSelection" class="clear-button">
            <XIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div class="detail-content">
        <div class="detail-row">
          <div class="detail-avatar">
            <img
              v-if="selectedUser.profileUrl"
              :src="selectedUser.profileUrl"
              :alt="selectedUser.name"
              class="detail-avatar-image"
            />
            <div v-else class="detail-avatar-placeholder">
              <UserIcon class="w-12 h-12" />
            </div>
          </div>
          <div class="detail-basic-info">
            <h4>{{ selectedUser.name }}</h4>
            <p>{{ selectedUser.franchiseName }}</p>
          </div>
        </div>

        <!-- 개인 정보 -->
        <div class="info-section">
          <h5 class="section-title">개인 정보</h5>
          <div class="detail-grid">
            <div class="detail-item">
              <label>사용자 코드</label>
              <span>{{ selectedUser.code }}</span>
            </div>
            <div class="detail-item">
              <label>이름</label>
              <span>{{ selectedUser.name }}</span>
            </div>
            <div class="detail-item">
              <label>전화번호</label>
              <span>{{ selectedUser.phone }}</span>
            </div>
            <div class="detail-item">
              <label>이메일</label>
              <span>{{ selectedUser.email }}</span>
            </div>
            <div class="detail-item">
              <label>유형</label>
              <span>{{ selectedUser.type }}</span>
            </div>
          </div>
        </div>

        <!-- 가맹점 정보 -->
        <div class="info-section">
          <h5 class="section-title">가맹점 정보</h5>
          <div class="detail-grid">
            <div class="detail-item">
              <label>가맹점 코드</label>
              <span>{{ selectedUser.franchiseCode }}</span>
            </div>
            <div class="detail-item">
              <label>가맹점명</label>
              <span>{{ selectedUser.franchiseName }}</span>
            </div>
            <div class="detail-item">
              <label>사업자번호</label>
              <span>{{ selectedUser.franchiseBusinessNumber }}</span>
            </div>
            <div class="detail-item">
              <label>가맹점 전화번호</label>
              <span>{{ selectedUser.franchisePhone }}</span>
            </div>
            <div class="detail-item full-width">
              <label>주소</label>
              <span>
                {{ selectedUser.franchiseAddress }}
                <span v-if="selectedUser.franchiseAddressDetail"> {{ selectedUser.franchiseAddressDetail }}</span>
                ({{ selectedUser.franchiseZipcode }})
              </span>
            </div>
            <div class="detail-item">
              <label>계약일</label>
              <span>{{ formatDate(selectedUser.franchiseSignedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { SearchIcon, UserIcon, XIcon, KeyIcon, LoaderIcon } from 'lucide-vue-next'
import api from '@/lib/api'
import { resetPassword } from '@/utils/user/userUtils.js'

const searchName = ref('')
const searchResults = ref([])
const selectedUser = ref(null)
const showSearchResults = ref(false)
const hasSearched = ref(false)
const isLoading = ref(false)
const isResetPasswordLoading = ref(false)

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 검색 API 호출
const searchUsers = async () => {
  if (!searchName.value.trim()) {
    searchResults.value = [];
    showSearchResults.value = false;
    return;
  }

  // 검색 시 상세 정보 숨김
  selectedUser.value = null;
  isLoading.value = true;
  hasSearched.value = true;

  try {
    const params = {
      name: searchName.value,
    };

    const response = await api.get("/api/hq/user/franchise", { params });

    searchResults.value = response.data || [];
    showSearchResults.value = true;
  } catch (error) {
    console.error("검색 중 오류 발생:", error);
    searchResults.value = [];
    showSearchResults.value = true;
  } finally {
    isLoading.value = false;
  }
};

// 검색 버튼 클릭 또는 엔터키 처리
const handleSearch = () => {
  searchUsers()
}

// 입력 변경 시 처리
const handleInputChange = () => {
  if (!searchName.value.trim()) {
    showSearchResults.value = false
    searchResults.value = []
    hasSearched.value = false
    selectedUser.value = null
  }
}

// 사용자 선택
const selectUser = (user) => {
  selectedUser.value = user
  showSearchResults.value = false
}

// 선택 해제
const clearSelection = () => {
  selectedUser.value = null
  searchName.value = ''
  searchResults.value = []
  showSearchResults.value = false
  hasSearched.value = false
}

// 비밀번호 초기화
const handleResetPassword = async () => {
  if (!selectedUser.value || isResetPasswordLoading.value) return
  
  if (confirm(`${selectedUser.value.name}님의 비밀번호를 초기화하시겠습니까?`)) {
    isResetPasswordLoading.value = true
    try {
      await resetPassword(selectedUser.value.code)
      alert('비밀번호가 성공적으로 초기화되었습니다.')
    } catch (error) {
      alert('비밀번호 초기화에 실패했습니다.')
    } finally {
      isResetPasswordLoading.value = false
    }
  }
}
</script>

<style scoped>
.franchise-user-search {
  background: white;
  border-radius: 0;
  overflow: hidden;
  margin: 0 24px;
}

.search-section {
  position: relative;
  padding: 24px;
  border-bottom: 1px solid #e9ecef;
}

.search-form {
  margin-bottom: 16px;
}

.search-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #4066fa;
}

.search-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #4066fa;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-button:hover {
  background: #3557e8;
}

.search-results-section {
  padding: 0 24px 24px 24px;
}

.results-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #212529;
}

.search-results-list {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
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

.no-results-section {
  padding: 0 24px 24px 24px;
}

.no-results {
  padding: 40px 20px;
  text-align: center;
  color: #6c757d;
  font-size: 14px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin: 0;
}

.user-avatar {
  width: 40px;
  height: 40px;
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
  margin-bottom: 4px;
}

.user-details {
  font-size: 13px;
  color: #6c757d;
}

.user-detail-section {
  padding: 24px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #212529;
}

.clear-button {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.clear-button:hover {
  background: #f8f9fa;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.detail-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.detail-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.detail-basic-info h4 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #212529;
}

.detail-basic-info p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.info-section {
  margin-bottom: 32px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  padding-bottom: 8px;
  border-bottom: 2px solid #4066fa;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-size: 12px;
  font-weight: 500;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item span {
  font-size: 14px;
  color: #212529;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reset-password-button {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reset-password-button:hover {
  background: #c82333;
}

.reset-password-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.reset-password-button.loading {
  background: #6c757d;
}

.reset-password-button.loading:hover {
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
</style>
