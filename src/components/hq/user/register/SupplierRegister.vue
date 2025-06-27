<template>
  <div class="supplier-user-register">
    <div class="register-form-container">
      <form @submit.prevent="handleSubmit" class="register-form">
        <div class="form-section">
          <h3 class="section-title">기본 정보</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="name" class="form-label">이름 <span class="required">*</span></label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                class="form-input"
                placeholder="이름을 입력하세요"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="email" class="form-label">이메일 <span class="required">*</span></label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                class="form-input"
                placeholder="이메일을 입력하세요"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="phone" class="form-label">전화번호 <span class="required">*</span></label>
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                class="form-input"
                placeholder="01012345678"
                required
              />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">공급처 정보</h3>
          <div class="form-grid">
            <!-- 담당자 검색 - full-width로 한 줄 전체 차지 -->
            <div class="form-group full-width">
              <label class="form-label">담당자 검색 <span class="required">*</span></label>
              <div class="manager-search-container">
                <div class="search-input-container">
                  <input
                    v-model="searchQuery"
                    type="text"
                    class="form-input"
                    placeholder="영업팀 담당자 이름을 검색하세요"
                    @input="handleSearch"
                    @focus="showSearchResults = true"
                  />
                  <Search class="search-icon" />
                  <LoaderIcon v-if="searchLoading" class="search-loading" />
                </div>
                
                <!-- 선택된 담당자 표시 -->
                <div v-if="selectedManager" class="selected-manager">
                  <div class="manager-info">
                    <div class="manager-avatar">
                      <img 
                        v-if="selectedManager.profileUrl" 
                        :src="selectedManager.profileUrl" 
                        :alt="selectedManager.name"
                        class="avatar-image"
                      />
                      <div v-else class="avatar-placeholder">
                        {{ selectedManager.name.charAt(0) }}
                      </div>
                    </div>
                    <div class="manager-details">
                      <span class="manager-name">{{ selectedManager.name }}</span>
                      <span class="manager-code">{{ selectedManager.code }}</span>
                      <span class="manager-dept">{{ selectedManager.departmentName }}</span>
                      <span class="manager-position">{{ selectedManager.positionName }} · {{ selectedManager.dutyName }}</span>
                    </div>
                    <button type="button" @click="clearSelection" class="clear-btn">
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <!-- 검색 결과 없음 -->
                <div v-if="showSearchResults && searchQuery && searchResults.length === 0 && !searchLoading" class="no-results">
                  검색 결과가 없습니다.
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="supplierName" class="form-label">공급처명 <span class="required">*</span></label>
              <input
                id="supplierName"
                v-model="formData.supplierName"
                type="text"
                class="form-input"
                placeholder="공급처명을 입력해주세요."
                required
              />
            </div>
            
            <div class="form-group">
              <label for="ceoName" class="form-label">대표자명 <span class="required">*</span></label>
              <input
                id="ceoName"
                v-model="formData.ceoName"
                type="text"
                class="form-input"
                placeholder="대표자명을 입력해주세요."
                required
              />
            </div>
            
            <div class="form-group">
              <label for="businessNumber" class="form-label">사업자번호 <span class="required">*</span></label>
              <input
                id="businessNumber"
                v-model="formData.businessNumber"
                type="text"
                class="form-input"
                placeholder="123-45-67890"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="companyPhone" class="form-label">회사 전화번호 <span class="required">*</span></label>
              <input
                id="companyPhone"
                v-model="formData.companyPhone"
                type="tel"
                class="form-input"
                placeholder="02-1234-5678"
                required
              />
            </div>
            
            <div class="form-group full-width">
              <label for="address" class="form-label">주소 <span class="required">*</span></label>
              <input
                id="address"
                v-model="formData.address"
                type="text"
                class="form-input"
                placeholder="주소를 입력하세요"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="zipcode" class="form-label">우편번호 <span class="required">*</span></label>
              <input
                id="zipcode"
                v-model="formData.zipcode"
                type="text"
                class="form-input"
                placeholder="12345"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="signedAt" class="form-label">계약일 <span class="required">*</span></label>
              <input
                id="signedAt"
                v-model="formData.signedAt"
                type="date"
                class="form-input"
                required
              />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="button"
            @click="resetForm"
            class="btn btn-secondary"
            :disabled="isLoading"
          >
            초기화
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isLoading || !selectedManager"
          >
            <LoaderIcon v-if="isLoading" class="w-4 h-4 animate-spin" />
            <span v-if="isLoading">등록 중...</span>
            <span v-else>계정 등록</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Search Results Portal -->
    <Teleport to="body">
      <div 
        v-if="showSearchResults && (searchResults.length > 0 || (searchQuery && !searchLoading))"
        class="search-results-portal"
        :style="searchResultsStyle"
      >
        <!-- 검색 결과 -->
        <div v-if="searchResults.length > 0" class="search-results-content">
          <div
            v-for="manager in searchResults"
            :key="manager.id"
            @click="selectManager(manager)"
            class="search-result-item"
          >
            <div class="manager-info">
              <div class="manager-avatar">
                <img 
                  v-if="manager.profileUrl" 
                  :src="manager.profileUrl" 
                  :alt="manager.name"
                  class="avatar-image"
                />
                <div v-else class="avatar-placeholder">
                  {{ manager.name.charAt(0) }}
                </div>
              </div>
              <div class="manager-details">
                <span class="manager-name">{{ manager.name }}</span>
                <span class="manager-code">{{ manager.code }}</span>
                <span class="manager-dept">{{ manager.departmentName }}</span>
                <span class="manager-position">{{ manager.positionName }} · {{ manager.dutyName }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 검색 결과 없음 -->
        <div v-if="searchQuery && searchResults.length === 0 && !searchLoading" class="no-results">
          검색 결과가 없습니다.
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { LoaderIcon, Search, X } from 'lucide-vue-next'
import api from '@/lib/api'
import { useToast } from "@/composables/useToast";

const toast = useToast()
const isLoading = ref(false)
const searchLoading = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const showSearchResults = ref(false)
const selectedManager = ref(null)
const searchResultsStyle = ref({})
let searchTimeout = null

const formData = reactive({
  name: '',
  email: '',
  phone: '',
  userType: 'SUPPLIER',
  supplierName: '',
  ceoName: '',
  companyPhone: '',
  address: '',
  zipcode: '',
  businessNumber: '',
  signedAt: '',
  managerId: ''
})

// Calculate search results position
const updateSearchResultsPosition = () => {
  const searchInput = document.querySelector('.search-input-container input')
  if (searchInput) {
    const rect = searchInput.getBoundingClientRect()
    searchResultsStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      zIndex: '9999'
    }
  }
}

// Search functionality
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (!searchQuery.value.trim()) {
    searchResults.value = []
    showSearchResults.value = false
    return
  }

  // Update position when showing results
  nextTick(() => {
    updateSearchResultsPosition()
  })

  // Debounce search to avoid too many API calls
  searchTimeout = setTimeout(async () => {
    await searchManagers()
  }, 300)
}

const searchManagers = async () => {
  if (!searchQuery.value.trim()) return

  searchLoading.value = true
  try {
    const response = await api.get('/api/hq/user/hq', {
      params: {
        name: searchQuery.value,
        departmentId: 2, // 영업팀 id
      }
    })
    
    if (response.status !== 200) {
      throw new Error('검색 요청 실패')
    }

    searchResults.value = response.data || []
    showSearchResults.value = true
    
    // Update position after results are loaded
    nextTick(() => {
      updateSearchResultsPosition()
    })
  } catch (error) {
    console.error('담당자 검색 실패:', error)
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}

const selectManager = (manager) => {
  selectedManager.value = manager
  formData.managerId = manager.id
  searchQuery.value = manager.name
  showSearchResults.value = false
}

const clearSelection = () => {
  selectedManager.value = null
  formData.managerId = ''
  searchQuery.value = ''
  searchResults.value = []
}

// Close search results when clicking outside or scrolling
const handleClickOutside = (event) => {
  const searchContainer = event.target.closest('.manager-search-container')
  const searchPortal = event.target.closest('.search-results-portal')
  if (!searchContainer && !searchPortal) {
    showSearchResults.value = false
  }
}

const handleScroll = () => {
  if (showSearchResults.value) {
    updateSearchResultsPosition()
  }
}

const handleResize = () => {
  if (showSearchResults.value) {
    updateSearchResultsPosition()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', handleResize)
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})

const resetForm = () => {
  Object.assign(formData, {
    name: '',
    email: '',
    phone: '',
    userType: 'SUPPLIER',
    supplierName: '',
    ceoName: '',
    companyPhone: '',
    address: '',
    zipcode: '',
    businessNumber: '',
    signedAt: '',
    managerId: ''
  })
  clearSelection()
}

const handleSubmit = async () => {
  if (isLoading.value || !selectedManager.value) return

  isLoading.value = true
  try {
    // 날짜를 00:00:00으로 설정
    const signedAtDateTime = formData.signedAt ? `${formData.signedAt}T00:00:00` : ''
    
    const submitData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      userType: formData.userType,
      supplierName: formData.supplierName,
      ceoName: formData.ceoName,
      companyPhone: formData.companyPhone,
      address: formData.address,
      zipcode: formData.zipcode,
      businessNumber: formData.businessNumber,
      signedAt: signedAtDateTime,
      managerId: parseInt(formData.managerId)
    }

    await api.post('/api/hq/user/supplier', submitData)

    toast.success('공급처 계정이 성공적으로 등록되었습니다.')
    resetForm()
  } catch (error) {
    console.error('계정 등록 실패:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.supplier-user-register {
  background: white;
  border-radius: 0;
  overflow: visible;
  margin: 0 24px;
}

.register-form-container {
  padding: 32px;
}

.register-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 32px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  padding-bottom: 8px;
  border-bottom: 2px solid #4066fa;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #dc3545;
}

.form-input,
.form-select {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #4066fa;
  box-shadow: 0 0 0 3px rgba(64, 102, 250, 0.1);
}

.form-select {
  background: white;
  cursor: pointer;
}

/* Manager Search Styles */
.manager-search-container {
  position: relative;
  width: 100%;
}

.search-input-container {
  position: relative;
  width: 100%;
}

.search-input-container .form-input {
  width: 100%;
  box-sizing: border-box;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #9ca3af;
  pointer-events: none;
}

.search-loading {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #4066fa;
  animation: spin 1s linear infinite;
}

.selected-manager {
  margin-top: 8px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.manager-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.manager-avatar {
  flex-shrink: 0;
}

.avatar-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4066fa;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.manager-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.manager-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 16px;
}

.manager-code {
  font-size: 12px;
  color: #6b7280;
}

.manager-dept {
  font-size: 14px;
  color: #4066fa;
  font-weight: 500;
}

.manager-position {
  font-size: 12px;
  color: #6b7280;
}

.clear-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.clear-btn:hover {
  background: #dc2626;
}

/* Search Results Portal Styles */
.search-results-portal {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-height: 300px;
  overflow-y: auto;
}

.search-result-item {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
  box-sizing: border-box;
}

.search-result-item:hover {
  background: #f9fafb;
}

.search-result-item:last-child {
  border-bottom: none;
}

.no-results {
  padding: 12px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.btn-secondary:hover:not(:disabled) {
  background: #e9ecef;
}

.btn-primary {
  background: #4066fa;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3557e8;
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