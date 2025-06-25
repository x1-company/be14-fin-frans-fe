<template>
  <div class="franchise-info">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>가맹점 정보를 불러오는 중...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>정보를 불러올 수 없습니다</h3>
      <p>{{ error }}</p>
      <button @click="fetchFranchiseInfo" class="retry-btn">다시 시도</button>
    </div>

    <!-- No Selection State -->
    <div v-else-if="!selectedFranchiseId" class="no-selection">
      <div class="no-selection-icon">🏪</div>
      <h3>가맹점을 선택해주세요</h3>
      <p>왼쪽 목록에서 가맹점을 선택하면 상세 정보를 확인할 수 있습니다.</p>
    </div>

    <!-- Franchise Info Content -->
    <div v-else-if="franchiseData" class="franchise-content">
      <div class="franchise-header">
        <div class="franchise-title">
          <h2>{{ franchiseData.name }}</h2>
          <span class="franchise-code">{{ franchiseData.code }}</span>
          <span class="status-badge" :class="{ active: franchiseData.isActive, inactive: !franchiseData.isActive }">
            {{ franchiseData.isActive ? '운영중' : '운영중지' }}
          </span>
        </div>
      </div>

      <div class="info-grid">
        <!-- 기본 정보 -->
        <div class="info-card">
          <h3 class="card-title">기본 정보</h3>
          <div class="info-rows">
            <div class="info-row">
              <span class="label">가맹점명</span>
              <span class="value">{{ franchiseData.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">가맹점 코드</span>
              <span class="value">{{ franchiseData.code }}</span>
            </div>
            <div class="info-row">
              <span class="label">사업자번호</span>
              <span class="value">{{ franchiseData.businessNumber }}</span>
            </div>
            <div class="info-row">
              <span class="label">대표자명</span>
              <span class="value">{{ franchiseData.ownerName }}</span>
            </div>
            <div class="info-row">
              <span class="label">연락처</span>
              <span class="value">{{ franchiseData.phone }}</span>
            </div>
            <div class="info-row">
              <span class="label">계약일</span>
              <span class="value">{{ formatDate(franchiseData.signedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- 주소 정보 -->
        <div class="info-card">
          <h3 class="card-title">주소 정보</h3>
          <div class="info-rows">
            <div class="info-row">
              <span class="label">우편번호</span>
              <span class="value">{{ franchiseData.zipcode }}</span>
            </div>
            <div class="info-row">
              <span class="label">기본주소</span>
              <span class="value">{{ franchiseData.address }}</span>
            </div>
            <div class="info-row" v-if="franchiseData.addressDetail">
              <span class="label">상세주소</span>
              <span class="value">{{ franchiseData.addressDetail }}</span>
            </div>
          </div>
        </div>

        <!-- 운영 상태 -->
        <div class="info-card">
          <h3 class="card-title">운영 상태</h3>
          <div class="info-rows">
            <div class="info-row">
              <span class="label">운영 상태</span>
              <span class="value">
                <span class="status-indicator" :class="{ active: franchiseData.isActive, inactive: !franchiseData.isActive }">
                  {{ franchiseData.isActive ? '운영중' : '운영중지' }}
                </span>
              </span>
            </div>
            <div class="info-row">
              <span class="label">계약 기간</span>
              <span class="value">{{ formatDate(franchiseData.signedAt) }} ~ </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button class="btn btn-primary">정보 수정</button>
        <button class="btn btn-secondary">계약서 보기</button>
        <button class="btn btn-secondary">연락하기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import api from '@/lib/api'

const props = defineProps({
  selectedFranchiseId: {
    type: [String, Number],
    default: null
  }
})

const franchiseData = ref(null)
const loading = ref(false)
const error = ref(null)

const fetchFranchiseInfo = async () => {
  if (!props.selectedFranchiseId) {
    franchiseData.value = null
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await api.get(`/api/hq/franchise/${props.selectedFranchiseId}`)
    franchiseData.value = response.data
  } catch (err) {
    console.error('가맹점 정보 조회 실패:', err)
    error.value = err.response?.data?.message || '가맹점 정보를 불러오는데 실패했습니다.'
    franchiseData.value = null
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Watch for changes in selectedFranchiseId
watch(() => props.selectedFranchiseId, fetchFranchiseInfo, { immediate: true })

onMounted(() => {
  if (props.selectedFranchiseId) {
    fetchFranchiseInfo()
  }
})
</script>

<style scoped>
.franchise-info {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 30px;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #6c757d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-container h3 {
  color: #dc3545;
  margin-bottom: 8px;
}

.error-container p {
  color: #6c757d;
  margin-bottom: 16px;
}

.retry-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.retry-btn:hover {
  background: #5a6fd8;
}

/* No Selection State */
.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  color: #6c757d;
}

.no-selection-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-selection h3 {
  margin-bottom: 8px;
  color: #495057;
}

/* Franchise Content */
.franchise-content {
  flex: 1;
  overflow-y: auto;
}

.franchise-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.franchise-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.franchise-title h2 {
  margin: 0;
  color: #212529;
  font-size: 1.5rem;
  font-weight: 600;
}

.franchise-code {
  background: #f8f9fa;
  color: #6c757d;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: monospace;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.info-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
}

.card-title {
  margin: 0 0 16px 0;
  color: #495057;
  font-size: 1.1rem;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 2px solid #667eea;
}

.info-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-row .label {
  color: #6c757d;
  font-weight: 500;
  min-width: 100px;
}

.info-row .value {
  color: #212529;
  font-weight: 400;
  text-align: right;
  flex: 1;
}

.status-indicator {
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-indicator.active {
  background: #d4edda;
  color: #155724;
}

.status-indicator.inactive {
  background: #f8d7da;
  color: #721c24;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
}

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.btn-secondary:hover {
  background: #e9ecef;
}

/* Responsive */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .franchise-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>