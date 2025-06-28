<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <!-- Header -->
      <div class="modal-header" v-if="!isEditMode">
        <h2>{{ detailedTemplate ? '📂 템플릿 상세 정보' : (isRegisterMode ? '📂 주문 템플릿 등록' : '📂 주문 템플릿 목록') }}</h2>
        <div>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
      </div>
      <!-- 템플릿 검색 input -->
      <div v-if="!detailedTemplate && !isRegisterMode" class="template-search-bar">
        <input v-model="templateSearch" @input="onTemplateSearch" class="template-search-input" placeholder="템플릿 이름 또는 설명으로 검색" />
        <button @click="openRegister" class="register-btn" type="button">+   새 템플릿</button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <!-- Edit Mode -->
        <div v-if="isEditMode && editableTemplate">
          <h2 class="edit-title">📂 템플릿 수정</h2>
          <hr class="edit-divider" />
          <div class="form-group">
            <label for="editName">템플릿 이름</label>
            <input id="editName" type="text" v-model="editableTemplate.name" class="form-input" />
          </div>
          <div class="form-group">
            <label for="editDesc">템플릿 설명</label>
            <textarea id="editDesc" v-model="editableTemplate.description" class="form-input" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label for="editProductSearch">자재 추가</label>
            <div class="search-container-modal">
              <button @click="openMaterialModal" class="search-btn-modal" type="button">자재 검색</button>
            </div>
          </div>
          <h4 class="product-list-title">자재 목록 ({{ editableTemplate.products.length }}개)</h4>
          <ul class="product-list editable">
            <li v-for="(product, idx) in editableTemplate.products" :key="product.code" class="product-item">
              <div class="product-info-left">
                <div class="product-name-code">
                  <span class="product-name">{{ product.name }}</span>
                  <span class="product-code">({{ product.code }})</span>
                </div>
              </div>
              <div class="product-edit-actions">
                <input type="number" v-model.number="product.quantity" min="1" class="quantity-input-modal" />
                <span class="x-mark">x</span>
                <span class="product-unit">{{ product.unit || '' }}</span>
                <button @click="removeProductFromTemplate(product.code)" class="delete-btn-modal">삭제</button>
              </div>
            </li>
          </ul>
          <div class="detail-actions">
            <button @click="cancelEdit" class="btn-secondary">취소</button>
            <button @click="updateTemplate" class="btn-primary">저장</button>
          </div>
        </div>
        <!-- Detail View -->
        <div v-else-if="detailedTemplate && !isEditMode">
          <!-- 상단 정보 카드 -->
          <div class="template-detail-card">
            <div class="template-detail-header">
              <div>
                <div class="template-detail-title">{{ detailedTemplate.name }}</div>
                <div class="template-detail-desc">{{ detailedTemplate.description }}</div>
                <div class="template-detail-meta">
                  <span class="badge">{{ detailedTemplate.products.length }}개 자재</span>
                  <span class="badge badge-green">총 {{ formatPrice(getTemplateTotalAmount(detailedTemplate)) }}원</span>
                </div>
              </div>
              <div class="template-detail-total">
                <span class="total-amount">{{ formatPrice(getTemplateTotalAmount(detailedTemplate)) }}원</span>
                <span class="total-label">총 금액</span>
              </div>
            </div>
          </div>
          <!-- 자재 목록 -->
          <div class="material-list-section">
            <div class="material-list-title">자재 목록</div>
            <div v-for="(product, idx) in detailedTemplate.products" :key="product.code" class="material-list-row">
              <div class="material-index">{{ idx + 1 }}</div>
              <div class="material-info">
                <span class="material-name">{{ product.name }}</span>
                <span class="material-code">{{ product.code }}</span>
                <div class="material-meta">
                  사양: {{ product.spec }} &nbsp; 공급처: {{ product.supplierName }}
                </div>
              </div>
              <div class="material-amount">
                <div class="amount-value">{{ formatPrice(product.salePrice * product.quantity) }}원</div>
                <div class="amount-meta">{{ product.quantity }} x {{ product.unit }} (단가: {{ formatPrice(product.salePrice) }}원)</div>
              </div>
            </div>
          </div>
          <!-- 하단 버튼 -->
          <div class="detail-actions detail-actions-row">
            <button @click="detailedTemplate = null" class="btn-secondary">목록으로</button>
            <button @click="startEdit" class="btn-secondary">수정</button>
            <button @click="applyTemplate" class="btn-primary">이 템플릿 적용하기</button>
          </div>
        </div>

        <!-- List View -->
        <div v-else-if="!isRegisterMode">
          <div v-if="isLoading" class="loading-spinner"></div>
          <div v-else-if="templates.length === 0" class="empty-state">
            사용 가능한 템플릿이 없습니다.
          </div>
          <ul v-else class="template-list">
            <li v-for="template in filteredTemplates" :key="template.id" @click="showTemplateDetails(template.id)" class="template-item">
              <div style="display: flex; flex-direction: column; flex: 1;">
                <div class="template-name">{{ template.name }}</div>
                <div class="template-description" style="margin-bottom:0;">{{ template.description }}</div>
              </div>
              <div class="template-meta" style="color:#4066fa; font-size:0.95em; margin-left:12px; min-width:120px; text-align:right;">
                {{ template.products ? template.products.length : 0 }}개 자재 /
                총 {{ formatPrice(getTemplateTotalAmount(template)) }}원
              </div>
              <button @click.stop="confirmDelete(template.id, template.name)" class="delete-icon-btn" style="margin-left:16px;">
                <img src="@/assets/trash.png" alt="삭제" style="width: 22px; height: 22px; vertical-align: middle;" />
              </button>
            </li>
          </ul>
        </div>

        <!-- Register Mode -->
        <div v-if="isRegisterMode">
          <div class="edit-form">
            <div class="form-group">
              <label for="registerName">템플릿 이름</label>
              <input id="registerName" type="text" v-model="registerForm.name" class="form-input" />
            </div>
            <div class="form-group">
              <label for="registerDesc">템플릿 설명</label>
              <textarea id="registerDesc" v-model="registerForm.description" class="form-input" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label for="registerProductSearch">자재 추가</label>
              <div class="search-container-modal">
                <button @click="openMaterialModal" class="search-btn-modal" type="button">자재 검색</button>
              </div>
            </div>
          </div>
          <h4 class="product-list-title">자재 목록 ({{ registerForm.details.length }}개)</h4>
          <ul class="product-list editable">
            <li v-for="(product, idx) in registerForm.details" :key="product.productId" class="product-item">
              <div class="product-info-left">
                <div class="product-name-code">
                  <span class="product-name">{{ product.name }}</span>
                  <span class="product-code">({{ product.code }})</span>
                </div>
              </div>
              <div class="product-edit-actions">
                <input type="number" v-model.number="product.quantity" min="1" class="quantity-input-modal" />
                <span class="x-mark">x</span>
                <span class="product-unit">{{ product.unit || '' }}</span>
                <button @click="removeProductFromRegister(idx)" class="delete-btn-modal">삭제</button>
              </div>
            </li>
          </ul>
          <div class="detail-actions">
            <button @click="closeRegister" class="btn-secondary">취소</button>
            <button @click="registerTemplate" class="btn-primary">등록</button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="custom-modal-overlay">
        <div class="custom-modal confirm-modal">
          <div class="modal-header-confirm">
            <span class="modal-icon"><img src="@/assets/trash.png" alt="삭제" style="width: 22px; height: 22px; vertical-align: middle;" /></span>
            <span class="modal-title-confirm danger">템플릿 삭제</span>
            <button class="modal-close-btn" @click="showDeleteModal = false">&times;</button>
          </div>
          <div class="modal-message-box danger">
            <span>해당 주문 템플릿을 삭제 하시겠습니까?</span>
          </div>
          <div class="modal-actions-confirm">
            <button class="btn-cancel" @click="showDeleteModal = false">취소</button>
            <button class="btn-danger" @click="doDeleteTemplate">삭제</button>
          </div>
        </div>
      </div>

      <!-- MaterialSelectModal 모달 추가 -->
      <MaterialSelectModal
        v-if="isMaterialModalVisible"
        :products="allProducts"
        :visible="isMaterialModalVisible"
        @close="isMaterialModalVisible = false"
        @register="handleMaterialSelect"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import api from "@/lib/api";
import { useToast } from '@/composables/useToast';
import MaterialSelectModal from './MaterialSelectModal.vue';

const props = defineProps({
  isVisible: Boolean,
});

const emit = defineEmits(['close', 'template']);

const templates = ref([]);
const isLoading = ref(false);
const toast = useToast();

const formatPrice = (price) => {
    if (price === undefined || price === null) return 0;
    return new Intl.NumberFormat('ko-KR').format(price);
};

const isManageMode = ref(false);
const detailedTemplate = ref(null);
const isDetailLoading = ref(false);

// Edit mode state
const isEditMode = ref(false);
const editableTemplate = ref(null);
const templateSearchQuery = ref('');
const templateSearchResults = ref([]);

const isRegisterMode = ref(false);
const registerForm = ref({
  name: '',
  description: '',
  seq: null,
  details: []
});
const registerSearchQuery = ref('');
const registerSearchResults = ref([]);

const showDeleteModal = ref(false);
const deleteTarget = ref({ id: null, name: '' });

const isMaterialModalVisible = ref(false);
const allProducts = ref([]);

const templateSearch = ref("");
const filteredTemplates = ref([]);

const fetchTemplates = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/api/franchise/orders/templates');
    const list = response.data;
    // 각 템플릿의 상세 정보 비동기 병렬 호출
    const detailPromises = list.map(async (t) => {
      try {
        const detailRes = await api.get(`/api/franchise/orders/templates/${t.id}`);
        return { ...t, products: detailRes.data.products || [] };
      } catch {
        return { ...t, products: [] };
      }
    });
    templates.value = await Promise.all(detailPromises);
  } catch (error) {
    console.error('Failed to fetch order templates:', error);
    toast.error('주문 템플릿을 불러오는 데 실패했습니다.');
  } finally {
    isLoading.value = false;
  }
};

watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    fetchTemplates();
    isManageMode.value = false;
    detailedTemplate.value = null;
    isEditMode.value = false;
    editableTemplate.value = null;
    templateSearchQuery.value = '';
    templateSearchResults.value = [];
    isRegisterMode.value = false;
    registerForm.value = { name: '', description: '', seq: null, details: [] };
    registerSearchQuery.value = '';
    registerSearchResults.value = [];
  }
});

watch([templates, templateSearch], () => {
  if (!templateSearch.value.trim()) {
    filteredTemplates.value = templates.value;
  } else {
    const q = templateSearch.value.trim().toLowerCase();
    filteredTemplates.value = templates.value.filter(t =>
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  }
}, { immediate: true });

const closeModal = () => {
  emit('close');
};

const applyTemplate = () => {
  if (detailedTemplate.value) {
    emit('select-template', detailedTemplate.value.id);
    closeModal();
  }
};

const toggleManageMode = () => {
  isManageMode.value = !isManageMode.value;
};

const confirmDelete = (templateId, templateName) => {
  deleteTarget.value = { id: templateId, name: templateName };
  showDeleteModal.value = true;
};

const showTemplateDetails = async (templateId) => {
  if (isManageMode.value) return;

  isDetailLoading.value = true;
  detailedTemplate.value = null;
  try {
    const response = await api.get(`/api/franchise/orders/templates/${templateId}`);
    const listData = templates.value.find(t => t.id === templateId);
    detailedTemplate.value = { ...listData, ...response.data };
  } catch (error) {
    console.error('Failed to fetch template details:', error);
    toast.error('템플릿 상세 정보를 불러오는 데 실패했습니다.');
  } finally {
    isDetailLoading.value = false;
  }
};

// --- Edit Mode Functions ---

const startEdit = async () => {
  editableTemplate.value = JSON.parse(JSON.stringify(detailedTemplate.value));
  isEditMode.value = true;

  // productId가 없는 자재는 code로 조회해서 productId를 세팅
  for (const product of editableTemplate.value.products) {
    if (!product.productId) {
      try {
        const res = await api.get(`/api/franchise/products/name/${encodeURIComponent(product.name)}`);
        // code가 일치하는 상품 찾기
        const found = res.data.find(p => p.code === product.code);
        if (found) {
          product.productId = found.id;
        }
      } catch (e) {
        // 무시
      }
    }
  }
};

const cancelEdit = () => {
  isEditMode.value = false;
  editableTemplate.value = null;
  templateSearchQuery.value = '';
  templateSearchResults.value = [];
};

const updateTemplate = async () => {
  if (!editableTemplate.value) return;

  isDetailLoading.value = true;
  try {
    const payload = {
      name: editableTemplate.value.name,
      description: editableTemplate.value.description,
      seq: editableTemplate.value.id,
      details: editableTemplate.value.products.map((p, index) => ({
        quantity: p.quantity,
        seq: index + 1,
        productId: p.productId || p.id,
      })),
    };

    await api.patch(`/api/franchise/orders/template/${editableTemplate.value.id}`, payload);
    toast.success('템플릿이 성공적으로 수정되었습니다.');

    // Refresh detail view and exit edit mode
    detailedTemplate.value = JSON.parse(JSON.stringify(editableTemplate.value));
    isEditMode.value = false;
    
    // Refresh the master list of templates in the background
    fetchTemplates();

  } catch (error) {
    console.error('Failed to update template:', error);
    toast.error('템플릿 수정에 실패했습니다.');
  } finally {
    isDetailLoading.value = false;
  }
};

const searchProductsForTemplate = async () => {
  if (!templateSearchQuery.value.trim()) {
    templateSearchResults.value = [];
    return;
  }
  try {
    const response = await api.get(`/api/franchise/products/name/${encodeURIComponent(templateSearchQuery.value)}`);
    const existingProductIds = editableTemplate.value.products.map(p => p.id);
    templateSearchResults.value = response.data.filter(product => 
      product.isActive && !existingProductIds.includes(product.id)
    );
  } catch (error) {
    console.error('Failed to search products for template:', error);
    toast.error('자재 검색에 실패했습니다.');
  }
};

const addProductToTemplate = (product) => {
  const isAlreadyAdded = editableTemplate.value.products.some(p => p.code === product.code);
  if (isAlreadyAdded) {
    toast.error('이미 등록된 자재입니다.');
    return;
  }

  const newProduct = { ...product, quantity: 1 };
  editableTemplate.value.products.push(newProduct);
  templateSearchQuery.value = '';
  templateSearchResults.value = [];
};

const removeProductFromTemplate = (productCode) => {
  const index = editableTemplate.value.products.findIndex(p => p.code === productCode);
  if (index !== -1) {
    editableTemplate.value.products.splice(index, 1);
  }
};

const openRegister = () => {
  isRegisterMode.value = true;
  registerForm.value = { name: '', description: '', seq: null, details: [] };
  registerSearchQuery.value = '';
  registerSearchResults.value = [];
};

const closeRegister = () => {
  isRegisterMode.value = false;
};

const searchProductsForRegister = async () => {
  if (!registerSearchQuery.value.trim()) {
    registerSearchResults.value = [];
    return;
  }
  try {
    const response = await api.get(`/api/franchise/products/name/${encodeURIComponent(registerSearchQuery.value)}`);
    const existingProductIds = registerForm.value.details.map(p => p.productId);
    registerSearchResults.value = response.data.filter(product => 
      product.isActive && !existingProductIds.includes(product.id)
    );
  } catch (error) {
    toast.error('자재 검색에 실패했습니다.');
  }
};

const addProductToRegister = (product) => {
  const isAlreadyAdded = registerForm.value.details.some(p => p.productId === product.id);
  if (isAlreadyAdded) {
    toast.error('이미 등록된 자재입니다.');
    return;
  }
  registerForm.value.details.push({
    productId: product.id,
    name: product.name,
    code: product.code,
    quantity: 1,
    purchaseUnit: product.unit,
    unit: product.unit
  });
  registerSearchQuery.value = '';
  registerSearchResults.value = [];
};

const removeProductFromRegister = (idx) => {
  registerForm.value.details.splice(idx, 1);
};

const registerTemplate = async () => {
  if (!registerForm.value.name.trim()) {
    toast.error('템플릿 이름을 입력하세요.');
    return;
  }
  if (registerForm.value.details.length === 0) {
    toast.error('자재를 1개 이상 추가하세요.');
    return;
  }
  try {
    const payload = {
      name: registerForm.value.name,
      description: registerForm.value.description,
      seq: null,
      details: registerForm.value.details.map((p, idx) => ({
        productId: p.productId,
        quantity: p.quantity,
        seq: idx + 1
      }))
    };
    await api.post('/api/franchise/orders/template', payload);
    toast.success('템플릿이 등록되었습니다.');
    isRegisterMode.value = false;
    fetchTemplates();
  } catch (error) {
    toast.error('템플릿 등록에 실패했습니다.');
  }
};

const doDeleteTemplate = async () => {
  try {
    await api.delete(`/api/franchise/orders/template/${deleteTarget.value.id}`);
    toast.success('템플릿이 삭제되었습니다.');
    fetchTemplates();
    if (detailedTemplate.value && detailedTemplate.value.id === deleteTarget.value.id) {
      detailedTemplate.value = null;
    }
  } catch (error) {
    toast.error('템플릿 삭제에 실패했습니다.');
  } finally {
    showDeleteModal.value = false;
    deleteTarget.value = { id: null, name: '' };
  }
};

// 템플릿의 총 금액 계산 함수 추가
const getTemplateTotalAmount = (template) => {
  if (!template.products) return 0;
  return template.products.reduce((sum, p) => {
    const price = Number(p.salePrice) || 0;
    const qty = Number(p.quantity) || 0;
    return sum + price * qty;
  }, 0);
};

const openMaterialModal = async () => {
  try {
    const res = await api.get('/api/franchise/products/list');
    allProducts.value = res.data.filter(product => product.isActive);
    isMaterialModalVisible.value = true;
  } catch (e) {
    toast.error('자재 목록을 불러오지 못했습니다.');
  }
};

const handleMaterialSelect = (selected) => {
  // 수정 모드
  if (isEditMode.value && editableTemplate.value) {
    selected.forEach(product => {
      if (!editableTemplate.value.products.some(p => p.id === product.id)) {
        editableTemplate.value.products.push({
          ...product,
          quantity: product.quantity || 1
        });
      }
    });
  }
  // 등록 모드
  if (isRegisterMode.value) {
    selected.forEach(product => {
      if (!registerForm.value.details.some(p => p.productId === product.id)) {
        registerForm.value.details.push({
          productId: product.id,
          name: product.name,
          code: product.code,
          quantity: product.quantity || 1,
          purchaseUnit: product.unit,
          unit: product.unit
        });
      }
    });
  }
  isMaterialModalVisible.value = false;
};

const onTemplateSearch = () => {
  // 입력시 바로 반영 (watch로 처리)
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
  margin-bottom: 16px;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.modal-header > div {
  display: flex;
  align-items: center;
  gap: 8px;
}

.manage-btn {
  background: #f0f0f0;
  border: 1px solid #ccc;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.template-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 400px;
  overflow-y: auto;
}

.template-item {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-item:hover {
  background-color: #f5faff;
  border-color: #4066fa;
}

.template-name {
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 4px;
}

.template-description {
  font-size: 0.9rem;
  color: #666;
}

.delete-icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 4px;
}

.detail-header {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}
.detail-header h3 {
  margin: 0 0 4px 0;
}
.detail-header p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.product-list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
  max-height: 250px;
  overflow-y: auto;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 8px;
  border-bottom: 1px solid #f0f0f0;
}

.product-info-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.product-name-code {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.product-name {
  font-weight: bold;
}
.product-code {
  font-size: 0.8rem;
  color: #666;
  font-family: monospace;
}
.product-meta {
  font-size: 0.85rem;
  color: #888;
  display: flex;
  gap: 8px;
}
.product-info-right {
  text-align: right;
  flex-shrink: 0;
  padding-left: 16px;
}
.product-price {
  font-weight: 500;
}
.product-quantity {
  font-size: 0.9rem;
  color: #555;
  margin-top: 4px;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-secondary {
  padding: 8px 40px;
  border-radius: 6px;
  border: 1px solid;
  cursor: pointer;
  font-weight: bold;
  background-color: #fff;
  border-color: #ccc;
  color: #333;
}

.btn-primary {
  padding: 8px 40px;
  border-radius: 6px;
  border: 1px solid;
  cursor: pointer;
  font-weight: bold;
  background-color: #4066fa;
  border-color: #4066fa;
  color: #fff;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    margin: 20px auto;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #4066fa;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #666;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.product-list.editable .product-item {
  align-items: center;
}

.product-edit-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-input-modal {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.x-mark {
  margin: 0 2px;
  font-weight: 250;
  font-size: 0.8em;
}

.product-unit {
  font-size: 0.95em;
  color: #666;
}

.delete-btn-modal {
  background: #fff1f2;
  color: #dc2626;
  border: 1px solid #ffdde0;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 0.85rem;
}

/* Edit Form Styles */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 1rem;
  margin-top: 20px;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
}

.form-input:focus {
  outline: none;
  border-color: #4066fa;
  box-shadow: 0 0 0 2px rgba(64, 102, 250, 0.1);
}

textarea.form-input {
  resize: vertical;
  min-height: 60px;
}

.product-list-title {
  font-size: 1rem;
  font-weight: 600;
  margin-top: 24px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.search-container-modal {
  display: flex;
  gap: 8px;
}
.search-input-modal {
  flex-grow: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
}
.search-btn-modal {
  background: #4066fa;
    color: white;
    border: none;
    padding: 8px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
    transition: background-color 0.2s;
}

.search-results-modal {
  list-style: none;
  padding: 0;
  margin: 8px 0 0 0;
  border: 1px solid #ddd;
  border-radius: 6px;
  max-height: 150px;
  overflow-y: auto;
}

.search-results-modal li {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}
.search-results-modal li:last-child {
  border-bottom: none;
}
.search-results-modal li:hover {
  background-color: #f5faff;
}

.register-btn {
  background: #4066fa;
  color: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  margin-right: 8px;
  cursor: pointer;
}
.register-btn:hover {
  background: #3453c7;
}

.custom-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.custom-modal.confirm-modal {
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
  color: #e53935;
  margin-right: 4px;
}
.modal-title-confirm {
  font-size: 1rem;
  font-weight: 700;
  color: #e53935;
}
.modal-title-confirm.danger {
  color: #e53935;
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
.modal-message-box.danger {
  background: #f8d7da;
  color: #b71c1c;
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
.btn-danger {
  background: #e53935;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 8px 22px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-danger:hover {
  background: #b71c1c;
}

.template-search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 18px 0 18px 0;
}
.template-search-input {
  flex: 1;
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  background: #f6f7fa;
}
.template-search-input:focus {
  outline: none;
  border-color: #4066fa;
  box-shadow: 0 0 0 2px rgba(64, 102, 250, 0.1);
}
.template-search-btn {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 7px 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.15s;
}
.template-search-btn:hover {
  background: #f5faff;
}

.template-detail-card {
  background: #f6faff;
  border: 1.5px solid #bcdcff;
  border-radius: 14px;
  padding: 15px 28px 5px 28px;
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(64,102,250,0.04);
}
.template-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.template-detail-title {
  font-size: 0.97rem;
  font-weight: 650;
  margin-bottom: 4px;
}
.template-detail-desc {
  color: #2a2a2a;
  font-size: 0.88rem;
  margin-bottom: 10px;
}
.template-detail-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0;
}
.badge {
  background: #eaf3ff;
  color: #4066fa;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  margin-left: -8px;
  display: inline-block;
}
.badge-green {
  background: #e6f9ed;
  color: #16a34a;
}
.template-detail-date {
  color: #888;
  font-size: 0.98rem;
  margin-left: 8px;
}
.template-detail-total {
  text-align: right;
  min-width: 120px;
}
.total-amount {
  color: #4066fa;
  font-size: 1rem;
  font-weight: 600;
  display: block;
}
.total-label {
  color: #888;
  font-size: 0.7rem;
  margin-top: 1.5px;
  display: block;
}
.material-list-section {
  margin-top: 18px;
  max-height: 320px;
  overflow-y: auto;
}
.material-list-title {
  color: #000000;
  font-weight: 650;
  font-size: 0.95rem;
  margin-bottom: 10px;
}
.material-list-row {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(64,102,250,0.06);
  display: flex;
  align-items: center;
  padding: 9px 25px;
  margin-bottom: 12px;
  border: 1.5px solid #e3e8f0;
}
.material-index {
  font-weight: 600;
  color: #4154ff;
  background: #cbd6ff;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  margin-right: 18px;
  box-shadow: 0 2px 8px rgba(64,102,250,0.10);
  /* border: 2.5px solid #eaf3ff; */
  letter-spacing: 0.5px;
  transition: background 0.2s;
}
.material-info {
  flex: 1;
}
.material-name {
  font-weight: 600;
  font-size: 0.9rem;
  margin-right: 8px;
}
.material-code {
  font-weight: 600;
  color: #4066fa;
  background: #e6f0ff;
  border-radius: 6px;
  padding: 2px 4px;
  font-size: 0.7rem;
  margin-left: 6px;
}
.material-meta {
  color: #888;
  font-size: 0.78rem;
  margin-top: 4px;
}
.material-amount {
  text-align: right;
  min-width: 120px;
}
.amount-value {
  font-weight: 700;
  color: #222;
  font-size: 1.05rem;
}
.amount-meta {
  color: #5f5f5f;
  font-size: 0.85rem;
  margin-top: 2px;
}
.detail-actions-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 32px;
}

.edit-title {
  font-size: 1.18rem;
  font-weight: 700;
  margin-bottom: 18px;
  margin-top: 0;
}
.edit-info-card {
  background: #f7f8fa;
  border: 1.5px solid #e3e8f0;
  border-radius: 12px;
  padding: 24px 20px 18px 20px;
  margin-bottom: 24px;
}
.edit-info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
}
.edit-info-icon {
  font-size: 1.15rem;
  color: #4066fa;
}
.edit-info-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #4066fa;
}

.edit-divider {
  border: none;
  border-top: 1px solid #ededed;
  margin: 12px 0 18px 0;
}
</style> 