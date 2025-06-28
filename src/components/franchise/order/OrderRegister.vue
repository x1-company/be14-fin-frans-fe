<template>
    <div class="order-register">
        <!-- 헤더 영역 -->
        <div class="header-section">
            <div class="header-left">
                <h2 class="section-title">📝 주문 등록</h2>
            </div>
            <div class="header-right">
                <Outbutton @close="$emit('back-to-list')" />
            </div>
        </div>

        <div class="actions-container">
            <!-- 검색 영역 -->
            <div class="search-section">
                <!-- 기존 검색창 숨김 -->
                <!-- <div class="search-container">
                    <input v-model="searchQuery" @keyup.enter="searchProducts" type="text" placeholder="자재명을 입력하세요"
                        class="search-input" />
                    <button @click="searchProducts" class="search-btn">검색</button>
                </div> -->
                <button @click="isMaterialModalVisible = true" class="search-btn">자재 검색</button>
            </div>
            <div class="right-actions">
                <!-- <button class="recent-order-btn" @click="loadRecentOrder">
                    📋 최근 주문 불러오기
                </button> -->
                <button class="recent-order-btn" @click="loadOrderTemplate">
                    📄 주문 템플릿 불러오기
                </button>
            </div>
        </div>

        <!-- 주문 목록 테이블 -->
        <div class="table-section">
            <div class="table-header">
                <span class="total-info">총 {{ orderList.length }}개 품목</span>
                <span class="total-amount">총 금액: {{ formatPrice(totalAmount) }}원</span>
            </div>

            <div class="product-table">
                <div class="product-table-header">
                    <div class="col col-no">No.</div>
                    <div class="col col-code">자재 번호</div>
                    <div class="col col-name">자재명</div>
                    <div class="col col-price">구매 단가</div>
                    <div class="col col-quantity">수량</div>
                    <div class="col col-unit">단위</div>
                    <div class="col col-spec">규격</div>
                    <div class="col col-group">자재 분류</div>
                    <div class="col col-type">자재 구분</div>
                    <div class="col col-attr">자재 속성</div>
                    <div class="col col-amount">금액</div>
                    <div class="col col-supplier">협력 업체</div>
                    <div class="col col-delete">삭제</div>
                </div>
                <div class="product-table-body">
                    <div v-if="orderList.length === 0" class="empty-message">
                        주문할 자재를 검색하여 추가해주세요
                    </div>
                    <div v-for="(item, index) in orderList" :key="item.id" class="product-row">
                        <div class="col col-no">{{ index + 1 }}</div>
                        <div class="col col-code">{{ item.code }}</div>
                        <div class="col col-name">{{ item.name }}</div>
                        <div class="col col-price">{{ formatPrice(item.sale_price) }}</div>
                        <div class="col col-quantity">
                            <input v-model.number="item.quantity" @input="updateAmount(item)" type="number" min="1"
                                class="quantity-input" />
                        </div>
                        <div class="col col-unit">{{ item.unit }}</div>
                        <div class="col col-spec">{{ item.spec }}</div>
                        <div class="col col-group"><span :class="getTagClass('group')">{{ getProductGroupName(item.productGroupId) }}</span></div>
                        <div class="col col-type"><span :class="getTagClass('type')">{{ getProductTypeName(item.productTypeId) }}</span></div>
                        <div class="col col-attr"><span :class="getTagClass('attr')">{{ getProductAttributeName(item.productAttributeId) }}</span></div>
                        <div class="col col-amount">{{ formatPrice(item.totalAmount) }}</div>
                        <div class="col col-supplier">{{ item.supplierName }}</div>
                        <div class="col col-delete">
                            <button @click="removeFromOrderList(index)" class="remove-btn">
                                ❌
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 주문 등록 버튼 -->
        <div class="action-section">
            <button @click="openConfirmModal" :disabled="orderList.length === 0 || isSubmitting" class="submit-btn">
                {{ isSubmitting ? '주문 등록 중...' : '주문 등록' }}
            </button>
        </div>

        <!-- 주문 등록 확인 모달 (리디자인) -->
        <div v-if="isConfirmModalVisible" class="modal-overlay" @click.self="closeConfirmModal">
            <div class="modal-content confirm-modal">
                <div class="modal-header-confirm">
                    <span class="modal-icon">🛒</span>
                    <span class="modal-title-confirm">주문 등록</span>
                    <button class="modal-close-btn" @click="closeConfirmModal">&times;</button>
                </div>
                <div class="modal-message-box">
                    <span>주문을 등록하시겠습니까?</span>
                </div>
                <div class="modal-actions-confirm">
                    <button class="btn-cancel" @click="closeConfirmModal">취소</button>
                    <button class="btn-confirm" @click="confirmSubmitOrder">주문 등록</button>
                </div>
            </div>
        </div>

        <!-- 로딩 오버레이 -->
        <div v-if="isLoading" class="loading-overlay">
            <div class="loading-spinner"></div>
        </div>

        <!-- 주문 템플릿 모달 -->
        <OrderTemplateModal 
            :isVisible="isTemplateModalVisible" 
            @close="isTemplateModalVisible = false"
            @select-template="handleSelectTemplate"
        />
        <!-- 자재 선택 모달 -->
        <MaterialSelectModal
            v-if="isMaterialModalVisible"
            :products="allProducts"
            :visible="isMaterialModalVisible"
            @close="isMaterialModalVisible = false"
            @register="(products) => { products.forEach(addToOrderList); isMaterialModalVisible = false; }"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from "@/stores/auth.js"
import Outbutton from './button/Outbutton.vue'
import OrderTemplateModal from './OrderTemplateModal.vue'
import MaterialSelectModal from './MaterialSelectModal.vue'
import api from "@/lib/api"
import { useToast } from "@/composables/useToast"

const emit = defineEmits(['back-to-list'])
const auth = useAuthStore()
const toast = useToast();

// 상태 관리
const searchQuery = ref('')
const searchResults = ref([])
const orderList = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const isTemplateModalVisible = ref(false)
const isConfirmModalVisible = ref(false)
const isMaterialModalVisible = ref(false)
const allProducts = ref([]) // 전체 자재 목록 추가

// 검색 디바운스를 위한 타이머
let searchTimer = null

// 자재 목록 전체 불러오기 (onMounted)
onMounted(async () => {
    try {
        const res = await api.get('/api/franchise/products/list')
        allProducts.value = res.data.filter(product => product.isActive)
    } catch (e) {
        toast.error('자재 목록을 불러오지 못했습니다.')
    }
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-section')) {
            searchResults.value = []
        }
    })
})

// 자재 검색 (수정)
const searchProducts = () => {
    if (!searchQuery.value.trim()) {
        // 검색어 없으면 전체 목록
        searchResults.value = allProducts.value
    } else {
        // 검색어 있으면 필터링
        const q = searchQuery.value.trim().toLowerCase()
        searchResults.value = allProducts.value.filter(
            p =>
                (p.name && p.name.toLowerCase().includes(q)) ||
                (p.code && p.code.toLowerCase().includes(q))
        )
    }
}

// 주문 목록에 추가 (수정: 수량 반영)
const addToOrderList = (product) => {
    // 이미 추가된 상품인지 확인
    const existingItem = orderList.value.find(item => item.id === product.id)
    if (existingItem) {
        existingItem.quantity += product.quantity || 1
        updateAmount(existingItem)
        toast.error('이미 추가된 상품입니다. 수량을 증가시켰습니다.')
    } else {
        const orderItem = {
            ...product,
            quantity: product.quantity || 1,
            totalAmount: product.sale_price
        }
        orderList.value.push(orderItem)
    }
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
        toast.error('주문할 상품을 추가해주세요.')
        return
    }

    if (orderList.value.some(item => !item.id)) {
        toast.error('주문 목록에 유효하지 않은 상품이 있습니다. 다시 시도해주세요.');
        return;
    }

    if (!auth.franchiseId) {
        toast.error('가맹점 정보를 찾을 수 없습니다.')
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
        toast.success('주문이 성공적으로 등록되었습니다.')

        // 주문 목록 초기화
        orderList.value = []
        emit('back-to-list')

    } catch (error) {
        console.error('주문 등록 실패:', error)
        toast.error('주문 등록에 실패했습니다. 다시 시도해주세요.')
    } finally {
        isSubmitting.value = false
    }
}

// 최근 주문 불러오기 (임시)
const loadRecentOrder = () => {
    toast.error('최근 주문 불러오기 기능은 준비 중입니다.')
}

const loadOrderTemplate = () => {
    isTemplateModalVisible.value = true;
}

const handleSelectTemplate = async (templateId) => {
    isTemplateModalVisible.value = false;
    isLoading.value = true;
    try {
        const res = await api.get(`/api/franchise/orders/templates/${templateId}`);
        const templateProducts = res.data.products;

        const productPromises = templateProducts.map(async (p) => {
            try {
                const searchRes = await api.get(`/api/franchise/products/name/${encodeURIComponent(p.name)}`);
                const matchedProduct = searchRes.data.find(sp => sp.code === p.code);
                
                if (matchedProduct) {
                    return {
                        ...matchedProduct,
                        quantity: p.quantity,
                        totalAmount: matchedProduct.sale_price * p.quantity,
                    };
                }
                return null;
            } catch (searchError) {
                console.error(`Error fetching details for product ${p.name}:`, searchError);
                return null;
            }
        });

        const fullProductDetails = (await Promise.all(productPromises)).filter(p => p !== null);

        if (fullProductDetails.length !== templateProducts.length) {
            toast.error('일부 자재 정보를 불러오지 못했습니다. 목록을 확인해주세요.');
        }

        orderList.value = fullProductDetails;
        toast.success('템플릿을 성공적으로 불러왔습니다. 주문 목록을 확인해주세요.');

    } catch (error) {
        console.error(`Failed to fetch template details for id ${templateId}:`, error);
        toast.error('템플릿 상세 정보를 불러오는 데 실패했습니다.');
    } finally {
        isLoading.value = false;
    }
}

// 가격 포맷팅
const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
}

// 임시 분류 데이터 (실제로는 API에서 가져와야 함)
const getProductGroupName = (id) => {
    const groups = { 1: '상온', 2: '냉장', 3: '냉동', 4: '기타' }
    return groups[id] || '기타'
}

const getProductTypeName = (id) => {
    const types = { 1: '원재료', 2: '상품', 3: '저장품', 4: '소모품', 5: '시설소모품', 6: '경품', 7: '기타' }
    return types[id] || '기타'
}

const getProductAttributeName = (id) => {
    const attributes = { 1: '신선식품', 2: '비신선식품', 3: '비식품' }
    return attributes[id] || '기타'
}

const getTagClass = (category) => {
    const baseClass = 'product-tag';
    const categoryMap = {
        'group': 'tag-blue',
        'type': 'tag-purple',
        'attr': 'tag-green'
    };
    return `${baseClass} ${categoryMap[category] || ''}`;
}

const openConfirmModal = () => { isConfirmModalVisible.value = true; };
const closeConfirmModal = () => { isConfirmModalVisible.value = false; };
const confirmSubmitOrder = async () => {
    closeConfirmModal();
    await submitOrder();
};
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
    /* margin: -50px 0 0 -20px; */
    color: #212529;
    font-size: 18px;
    font-weight: 600;
}

.header-right {
    display: flex;
    gap: 15px;
}

.list-btn {
    background: #f8f9fa;
    color: #212529;
    border: 1px solid #dee2e6;
    padding: 6px 13px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: background-color 0.2s;
}

.list-btn:hover {
    background: #e9ecef;
}

.actions-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
}

.right-actions {
    display: flex;
    gap: 8px;
}

.recent-order-btn {
    padding: 7px 13px;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    background: #fff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border 0.15s;
    display: flex;
    align-items: center;
    gap: 5px;
    color: #1976d2;
    border-color: #bbdefb;
}

.recent-order-btn:hover {
    background: #f5faff;
}

.search-section {
    position: relative;
    /* margin-bottom: 24px; */ /* actions-container로 이동 */
}

.search-container {
    display: flex;
    gap: 8px;
    max-width: 400px;
}

.search-input {
    flex: 1;
    padding: 8px 25px;
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
    padding: 8px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
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
    font-size: 14px;
    font-weight: 600;
    color: #4066fa;
}

.product-table {
    border: 1px solid #eef0f4;
    border-radius: 8px;
    overflow: hidden;
}

.product-table-header, .product-row {
    display: flex;
    align-items: center;
    padding: 0 16px;
}

.product-table-header {
    background: #f8f9fa;
    color: #495057;
    font-size: 13px;
    font-weight: 500;
    height: 48px;
    border-bottom: 1px solid #eef0f4;
}

.product-table-body .product-row {
    border-bottom: 1px solid #eef0f4;
}

.product-table-body .product-row:last-child {
    border-bottom: none;
}

.product-row {
    height: 64px;
    font-size: 14px;
    background: #fff;
}

.product-row:hover {
    background: #f8f9fa;
}

.col {
    text-align: center;
    padding: 0 8px;
    white-space: nowrap;
}

.col-no       { flex-basis: 4%; }
.col-code     { flex-basis: 8%; font-family: monospace; color: #6c757d; }
.col-name     { flex-basis: 12%; text-align: left; font-weight: 500; }
.col-price    { flex-basis: 8%; text-align: right; }
.col-quantity { flex-basis: 8%; }
.col-unit     { flex-basis: 5%; }
.col-spec     { flex-basis: 8%; }
.col-group    { flex-basis: 8%; }
.col-type     { flex-basis: 8%; }
.col-attr     { flex-basis: 8%; }
.col-amount   { flex-basis: 8%; text-align: right; font-weight: 500; }
.col-supplier { flex-basis: 8%; }
.col-delete   { flex-basis: 4%; }

.product-tag {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 500;
}

.tag-blue { background-color: #e6f0ff; color: #4066fa; }
.tag-purple { background-color: #f3e8ff; color: #9333ea; }
.tag-green { background-color: #e6f9ed; color: #16a34a; }

.empty-message {
    text-align: center;
    color: #6c757d;
    padding: 40px;
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
    background: #4066fa;
    color: white;
    border: none;
    padding: 8px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
    background: #3553cc;
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

/* 기존 테이블 관련 스타일 제거 또는 주석 처리 */
.table-container, .order-table {
    display: none;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.modal-content.confirm-modal {
    background: #fff;
    border-radius: 16px;
    padding: 0 0 18px 0;
    min-width: 330px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.13);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

.modal-header-confirm {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    padding: 22px 18px 0 18px;
    position: relative;
}

.modal-icon {
    font-size: 1.4rem;
    color: #4066fa;
    margin-right: 4px;
}

.modal-title-confirm {
    font-size: 1rem;
    font-weight: 700;
    color: #4066fa;
}

.modal-close-btn {
    position: absolute;
    right: 24px;
    top: 28px;
    background: none;
    border: none;
    font-size: 1.7rem;
    color: #888;
    cursor: pointer;
    padding: 0;
    line-height: 1;
}

/* 모달 내부 안내문 */
.modal-message-box {
    background: #eaf3ff;
    color: #234;
    border-radius: 10px;
    padding: 16px 12px;
    margin: 18px 18px 0 18px;
    font-size: 0.9rem;
    text-align: center;
    width: calc(100% - 36px);
}

.modal-actions-confirm {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
    width: 100%;
    padding-right: 18px;
}

.btn-cancel {
    background: #f5f5f5;
    color: #333;
    border: none;
    border-radius: 10px;
    padding: 8px 22px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-cancel:hover {
    background: #e0e0e0;
}

.btn-confirm {
    background: #4066fa;
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 8px 22px;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-confirm:hover {
    background: #2746b6;
}
</style>