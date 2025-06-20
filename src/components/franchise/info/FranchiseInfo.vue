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
        <div v-else-if="franchiseData" class="info-content">
            <!-- 기본 정보 섹션 -->
            <div class="info-section">
                <div class="section-header">
                    <h3 class="section-title">기본 정보</h3>
                    <div class="status-badge" :class="{ active: franchiseData.isActive }">
                        {{ franchiseData.isActive ? '운영중' : '운영중단' }}
                    </div>
                </div>

                <div class="info-grid">
                    <div class="info-row">
                        <div class="info-item">
                            <label>가맹점 코드</label>
                            <span class="code-text">{{ franchiseData.code }}</span>
                        </div>
                        <div class="info-item">
                            <label>가맹점명</label>
                            <span class="name-text">{{ franchiseData.name }}</span>
                        </div>
                    </div>

                    <div class="info-row">
                        <div class="info-item">
                            <label>대표자명</label>
                            <span>{{ franchiseData.ownerName }}</span>
                        </div>
                        <div class="info-item">
                            <label>사업자등록번호</label>
                            <span>{{ formatBusinessNumber(franchiseData.businessNumber) }}</span>
                        </div>
                    </div>

                    <div class="info-row">
                        <div class="info-item">
                            <label>연락처</label>
                            <span>{{ formatPhoneNumber(franchiseData.phone) }}</span>
                        </div>
                        <div class="info-item">
                            <label>계약일</label>
                            <span>{{ formatDate(franchiseData.signedAt) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 주소 정보 섹션 -->
            <div class="info-section">
                <div class="section-header">
                    <h3 class="section-title">주소 정보</h3>
                </div>

                <div class="address-content">
                    <div class="address-item">
                        <label>우편번호</label>
                        <span class="zipcode">{{ franchiseData.zipcode }}</span>
                    </div>
                    <div class="address-item full-width">
                        <label>주소</label>
                        <span class="address-text">{{ franchiseData.address }}</span>
                        <span v-if="franchiseData.addressDetail" class="address-detail">
                            {{ franchiseData.addressDetail }}
                        </span>
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
    min-height: 400px;
}

.loading-container {
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
    border-top: 3px solid #4066fa;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
}

.error-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.error-container h3 {
    color: #dc3545;
    margin: 0 0 8px 0;
}

.error-container p {
    color: #6c757d;
    margin: 0 0 24px 0;
}

.retry-btn {
    background: #4066fa;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
}

.retry-btn:hover {
    background: #3453c7;
}

.info-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.info-section {
    background: #fff;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f8f9fa;
}

.section-title {
    margin: 0;
    color: #212529;
    font-size: 18px;
    font-weight: 600;
}

.status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    background: #dc3545;
    color: white;
}

.status-badge.active {
    background: #28a745;
}

.info-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.info-row {
    display: flex;
    gap: 32px;
}

.info-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.info-item label {
    font-size: 14px;
    color: #6c757d;
    font-weight: 500;
}

.info-item span {
    font-size: 15px;
    color: #212529;
    font-weight: 400;
}

.code-text {
    font-family: 'Courier New', monospace;
    background: #f8f9fa;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 600 !important;
    color: #4066fa !important;
}

.name-text {
    font-weight: 600 !important;
    color: #212529 !important;
    font-size: 16px !important;
}

.address-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.address-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.address-item.full-width {
    flex: 1;
}

.address-item label {
    font-size: 14px;
    color: #6c757d;
    font-weight: 500;
}

.zipcode {
    font-family: 'Courier New', monospace;
    background: #f8f9fa;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 600;
    color: #4066fa;
    display: inline-block;
    width: fit-content;
}

.address-text {
    font-size: 15px;
    color: #212529;
    font-weight: 500;
    line-height: 1.4;
}

.address-detail {
    font-size: 14px;
    color: #6c757d;
    margin-top: 4px;
    line-height: 1.4;
}

@media (max-width: 768px) {
    .info-row {
        flex-direction: column;
        gap: 16px;
    }

    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
}
</style>