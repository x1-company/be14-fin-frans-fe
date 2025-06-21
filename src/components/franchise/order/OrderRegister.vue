<template>
    <div class="order-register">
        <!-- 헤더 영역 -->
        <div class="header-section">
            <div class="header-left">
                <h2 class="section-title">📦 자재 정보</h2>
            </div>
            <div class="header-right">
                <button class="recent-order-btn" @click="loadRecentOrder">
                    📋 최근 주문 불러오기
                </button>
                <Outbutton />
            </div>
        </div>

        <!-- 검색 영역 -->
        <div class="search-section">
            <div class="search-container">
                <input v-model="searchQuery" @keyup.enter="searchProducts" type="text" placeholder="자재명을 입력하세요"
                    class="search-input" />
                <button @click="searchProducts" class="search-btn">검색</button>
            </div>

            <!-- 검색 결과 드롭다운 -->
            <div v-if="searchResults.length > 0" class="search-results">
                <div v-for="product in searchResults" :key="product.id" @click="addToOrderList(product)"
                    class="search-result-item">
                    <div class="product-info">
                        <span class="product-code">{{ product.code }}</span>
                        <span class="product-name">{{ product.name }}</span>
                        <span class="product-spec">{{ product.spec }}</span>
                    </div>
                    <div class="product-price">
                        {{ formatPrice(product.sale_price) }}원/{{ product.unit }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 주문 목록 테이블 -->
        <div class="table-section">
            <div class="table-header">
                <span class="total-info">총 {{ orderList.length }}개 품목</span>
                <span class="total-amount">총 금액: {{ formatPrice(totalAmount) }}원</span>
            </div>

            <div class="table-container">
                <table class="order-table">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>자재 번호</th>
                            <th>자재명</th>
                            <th>구매 단가</th>
                            <th>수량</th>
                            <th>단위</th>
                            <th>자재 분류</th>
                            <th>자재 구분</th>
                            <th>자재 속성</th>
                            <th>금액</th>
                            <th>협력 업체</th>
                            <th>삭제</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="orderList.length === 0">
                            <td colspan="12" class="empty-message">
                                주문할 자재를 검색하여 추가해주세요
                            </td>
                        </tr>
                        <tr v-for="(item, index) in orderList" :key="item.id" class="order-row">
                            <td>{{ index + 1 }}</td>
                            <td class="product-code-cell">{{ item.code }}</td>
                            <td class="product-name-cell">{{ item.name }}</td>
                            <td class="price-cell">{{ formatPrice(item.sale_price) }}</td>
                            <td class="quantity-cell">
                                <input v-model.number="item.quantity" @input="updateAmount(item)" type="number" min="1"
                                    class="quantity-input" />
                            </td>
                            <td>{{ item.unit }}</td>
                            <td>{{ getProductGroupName(item.productGroupId) }}</td>
                            <td>{{ getProductTypeName(item.productTypeId) }}</td>
                            <td>{{ getProductAttributeName(item.productAttributeId) }}</td>
                            <td class="amount-cell">{{ formatPrice(item.totalAmount) }}</td>
                            <td>{{ item.supplierName }}</td>
                            <td class="action-cell">
                                <button @click="removeFromOrderList(index)" class="remove-btn">
                                    ❌
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 주문 등록 버튼 -->
        <div class="action-section">
            <button @click="submitOrder" :disabled="orderList.length === 0 || isSubmitting" class="submit-btn">
                {{ isSubmitting ? '주문 등록 중...' : '주문 등록' }}
            </button>
        </div>

        <!-- 로딩 오버레이 -->
        <div v-if="isLoading" class="loading-overlay">
            <div class="loading-spinner"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from "@/stores/auth.js"
import Outbutton from './button/Outbutton.vue'
import api from "@/lib/api"

const emit = defineEmits(['back-to-list'])
const auth = useAuthStore()

// 상태 관리
const searchQuery = ref('')
const searchResults = ref([])
const orderList = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)

// 검색 디바운스를 위한 타이머
let searchTimer = null

// 자재 검색
const searchProducts = async () => {
    if (!searchQuery.value.trim()) {
        searchResults.value = []
        return
    }

    isLoading.value = true
    try {
        const response = await api.get(`/api/franchise/products/name/${encodeURIComponent(searchQuery.value)}`)
        searchResults.value = response.data.filter(product => product.isActive)
    } catch (error) {
        console.error('자재 검색 실패:', error)
        searchResults.value = []
    } finally {
        isLoading.value = false
    }
}

// 주문 목록에 추가
const addToOrderList = (product) => {
    // 이미 추가된 상품인지 확인
    const existingItem = orderList.value.find(item => item.id === product.id)
    if (existingItem) {
        existingItem.quantity += 1
        updateAmount(existingItem)
        alert('이미 추가된 상품입니다. 수량을 1 증가시켰습니다.')
    } else {
        const orderItem = {
            ...product,
            quantity: 1,
            totalAmount: product.sale_price
        }
        orderList.value.push(orderItem)
    }

    // 검색 결과 초기화
    searchResults.value = []
    searchQuery.value = ''
}

// 주문 목록에서 제거
const removeFromOrderList = (index) => {
    orderList.value.splice(index, 1)
}

// 금액 업데이트
const updateAmount = (item) => {
    item.totalAmount = item.sale_price * item.quantity
}

// 총 금액 계산
const totalAmount = computed(() => {
    return orderList.value.reduce((sum, item) => sum + item.totalAmount, 0)
})

// 주문 등록
const submitOrder = async () => {
    if (orderList.value.length === 0) {
        alert('주문할 상품을 추가해주세요.')
        return
    }

    if (!auth.franchiseId) {
        alert('가맹점 정보를 찾을 수 없습니다.')
        return
    }

    isSubmitting.value = true
    try {
        const orderData = {
            franchiseId: auth.franchiseId,
            materials: orderList.value.map(item => ({
                productId: item.id,
                quantity: item.quantity
            }))
        }

        await api.post('/api/franchise/orders', orderData)
        alert('주문이 성공적으로 등록되었습니다.')

        // 주문 목록 초기화
        orderList.value = []
        emit('back-to-list')

    } catch (error) {
        console.error('주문 등록 실패:', error)
        alert('주문 등록에 실패했습니다. 다시 시도해주세요.')
    } finally {
        isSubmitting.value = false
    }
}

// 최근 주문 불러오기 (임시)
const loadRecentOrder = () => {
    alert('최근 주문 불러오기 기능은 준비 중입니다.')
}

// 가격 포맷팅
const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
}

// 임시 분류 데이터 (실제로는 API에서 가져와야 함)
const getProductGroupName = (id) => {
    const groups = { 1: '조미료', 2: '육류', 3: '채소' }
    return groups[id] || '기타'
}

const getProductTypeName = (id) => {
    const types = { 1: '원재료', 2: '반제품', 3: '완제품' }
    return types[id] || '기타'
}

const getProductAttributeName = (id) => {
    const attributes = { 1: '냉장', 2: '상온', 3: '냉동' }
    return attributes[id] || '기타'
}

// 컴포넌트 외부 클릭 시 검색 결과 숨기기
onMounted(() => {
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-section')) {
            searchResults.value = []
        }
    })
})
</script>

<style scoped>
.order-register {
    padding: 24px;
    background: #fff;
    border-radius: 8px;
    position: relative;
}

.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #f8f9fa;
}

.section-title {
    margin: 0;
    color: #212529;
    font-size: 20px;
    font-weight: 600;
}

.header-right {
    display: flex;
    gap: 8px;
}

.list-btn {
    background: #f8f9fa;
    color: #212529;
    border: 1px solid #dee2e6;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s;
}

.list-btn:hover {
    background: #e9ecef;
}

.recent-order-btn {
    background: #6c757d;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
}

.recent-order-btn:hover {
    background: #5a6268;
}

.search-section {
    position: relative;
    margin-bottom: 24px;
}

.search-container {
    display: flex;
    gap: 8px;
    max-width: 400px;
}

.search-input {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
}

.search-input:focus {
    outline: none;
    border-color: #4066fa;
    box-shadow: 0 0 0 2px rgba(64, 102, 250, 0.1);
}

.search-btn {
    background: #4066fa;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
}

.search-btn:hover {
    background: #3453c7;
}

.search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-width: 400px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    max-height: 300px;
    overflow-y: auto;
}

.search-result-item {
    padding: 12px;
    border-bottom: 1px solid #f1f3f4;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background-color 0.2s;
}

.search-result-item:hover {
    background: #f8f9fa;
}

.search-result-item:last-child {
    border-bottom: none;
}

.product-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.product-code {
    font-size: 12px;
    color: #6c757d;
    font-family: monospace;
}

.product-name {
    font-size: 14px;
    font-weight: 500;
    color: #212529;
}

.product-spec {
    font-size: 12px;
    color: #6c757d;
}

.product-price {
    font-size: 14px;
    font-weight: 600;
    color: #4066fa;
}

.table-section {
    margin-bottom: 24px;
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 0 4px;
}

.total-info {
    font-size: 14px;
    color: #6c757d;
}

.total-amount {
    font-size: 16px;
    font-weight: 600;
    color: #4066fa;
}

.table-container {
    border: 1px solid #e9ecef;
    border-radius: 8px;
    overflow: hidden;
}

.order-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

.order-table th {
    background: #f8f9fa;
    padding: 12px 8px;
    text-align: center;
    font-weight: 600;
    color: #495057;
    border-bottom: 1px solid #e9ecef;
    white-space: nowrap;
}

.order-table td {
    padding: 12px 8px;
    text-align: center;
    border-bottom: 1px solid #f1f3f4;
    vertical-align: middle;
}

.order-row:hover {
    background: #f8f9fa;
}

.empty-message {
    color: #6c757d;
    font-style: italic;
    padding: 40px !important;
}

.product-code-cell {
    font-family: monospace;
    font-size: 12px;
    color: #6c757d;
}

.product-name-cell {
    text-align: left !important;
    font-weight: 500;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.price-cell,
.amount-cell {
    text-align: right !important;
    font-weight: 500;
}

.quantity-cell {
    padding: 8px !important;
}

.quantity-input {
    width: 60px;
    padding: 4px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    text-align: center;
}

.quantity-input:focus {
    outline: none;
    border-color: #4066fa;
}

.action-cell {
    padding: 8px !important;
}

.remove-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.remove-btn:hover {
    background: #f8f9fa;
}

.action-section {
    display: flex;
    justify-content: center;
    padding-top: 24px;
    border-top: 1px solid #e9ecef;
}

.submit-btn {
    background: #28a745;
    color: white;
    border: none;
    padding: 12px 32px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
    background: #218838;
}

.submit-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #4066fa;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@media (max-width: 1200px) {
    .order-table {
        font-size: 12px;
    }

    .order-table th,
    .order-table td {
        padding: 8px 4px;
    }
}
</style>