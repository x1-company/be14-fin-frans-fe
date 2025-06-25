<template>
    <div class="franchise-info">
        <!-- 로딩 상태 -->
        <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>가맹점 정보를 불러오는 중...</p>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="error" class="error-container">
            <div class="error-icon">⚠️</div>
            <h3>정보를 불러올 수 없습니다</h3>
            <p>{{ error }}</p>
            <button @click="fetchFranchiseInfo" class="retry-btn">다시 시도</button>
        </div>

        <!-- 가맹점 정보 표시 -->
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
                            <span class="value">{{ formatBusinessNumber(franchiseData.businessNumber) }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">대표자명</span>
                            <span class="value">{{ franchiseData.ownerName }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">연락처</span>
                            <span class="value">{{ formatPhoneNumber(franchiseData.phone) }}</span>
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
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from "@/stores/auth.js"
import api from "@/lib/api"

const auth = useAuthStore()
const franchiseData = ref(null)
const loading = ref(false)
const error = ref(null)

const fetchFranchiseInfo = async () => {
    if (!auth.franchiseId) {
        error.value = "가맹점 ID를 찾을 수 없습니다."
        return
    }

    loading.value = true
    error.value = null

    try {
        const response = await api.get(`/api/franchise/${auth.franchiseId}`)
        franchiseData.value = response.data
    } catch (err) {
        console.error('가맹점 정보 조회 실패:', err)
        error.value = "가맹점 정보를 불러오는데 실패했습니다."
    } finally {
        loading.value = false
    }
}

// 사업자등록번호 포맷팅 (000-00-00000)
const formatBusinessNumber = (businessNumber) => {
    if (!businessNumber) return '-'
    return businessNumber.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')
}

// 전화번호 포맷팅 (000-0000-0000)
const formatPhoneNumber = (phone) => {
    if (!phone) return '-'
    return phone.replace(/(\d{2,3})(\d{3,4})(\d{4})/, '$1-$2-$3')
}

// 날짜 포맷팅
const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

onMounted(() => {
    fetchFranchiseInfo()
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
    background: #ffffff;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
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

/* Responsive */
@media (max-width: 768px) {
    .franchise-info {
        padding: 15px;
    }
    .info-grid {
        grid-template-columns: 1fr;
    }
    
    .franchise-title {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
}
</style>