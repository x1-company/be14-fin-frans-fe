<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <!-- Header -->
      <div class="modal-header">
        <h2>{{ detailedTemplate ? '템플릿 상세 정보' : (isRegisterMode ? '주문 템플릿 등록' : '주문 템플릿 목록') }}</h2>
        <div>
          <button v-if="!detailedTemplate && !isRegisterMode" @click="toggleManageMode" class="manage-btn">
            {{ isManageMode ? '완료' : '관리' }}
          </button>
          <button v-if="!detailedTemplate && !isRegisterMode" @click="openRegister" class="register-btn">등록</button>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <!-- Detail View -->
        <div v-if="isDetailLoading" class="loading-spinner"></div>
        <div v-else-if="detailedTemplate">
          <!-- Edit Mode -->
          <div v-if="isEditMode && editableTemplate">
            <div class="edit-form">
              <div class="form-group">
                <label for="templateName">템플릿 이름</label>
                <input id="templateName" type="text" v-model="editableTemplate.name" class="form-input" />
              </div>
              <div class="form-group">
                <label for="templateDesc">템플릿 설명</label>
                <textarea id="templateDesc" v-model="editableTemplate.description" class="form-input" rows="3"></textarea>
              </div>
              <div class="form-group">
                <label for="productSearch">자재 추가</label>
                <div class="search-container-modal">
                  <input id="productSearch" type="text" v-model="templateSearchQuery" @keyup.enter="searchProductsForTemplate"
                    placeholder="추가할 자재 검색" class="search-input-modal" />
                  <button @click="searchProductsForTemplate" class="search-btn-modal">검색</button>
                </div>
                <ul v-if="templateSearchResults.length > 0" class="search-results-modal">
                  <li v-for="product in templateSearchResults" :key="product.id" @click="addProductToTemplate(product)">
                    {{ product.name }} ({{ product.code }})
                  </li>
                </ul>
              </div>
            </div>
            
            <h4 class="product-list-title">자재 목록 ({{ editableTemplate.products.length }}개)</h4>
            <ul class="product-list editable">
              <li v-for="product in editableTemplate.products" :key="product.code" class="product-item">
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
              <button @click="updateTemplate" class="btn-primary">수정 완료</button>
            </div>
          </div>
          <!-- View Mode -->
          <div v-else>
            <div class="detail-header">
              <h3>{{ detailedTemplate.name }}</h3>
              <p>{{ detailedTemplate.description }}</p>
            </div>
            <ul class="product-list">
              <li v-for="product in detailedTemplate.products" :key="product.code" class="product-item">
                <div class="product-info-left">
                  <div class="product-name-code">
                    <span class="product-name">{{ product.name }}</span>
                    <span class="product-code">({{ product.code }})</span>
                  </div>
                  <div class="product-meta">
                    <span>사양: {{ product.spec }}</span>
                    <span>공급처: {{ product.supplierName }}</span>
                  </div>
                </div>
                <div class="product-info-right">
                  <div class="product-price">{{ formatPrice(product.salePrice) }}원</div>
                  <div class="product-quantity">{{ product.quantity }} <span class="x-mark">x</span> {{ product.unit || '' }}</div>
                </div>
              </li>
            </ul>
            <div class="detail-actions">
              <button @click="detailedTemplate = null" class="btn-secondary">목록으로</button>
              <button @click="startEdit" class="btn-secondary">수정</button>
              <button @click="applyTemplate" class="btn-primary">이 템플릿 적용하기</button>
            </div>
          </div>
        </div>

        <!-- List View -->
        <div v-else-if="!isRegisterMode">
          <div v-if="isLoading" class="loading-spinner"></div>
          <div v-else-if="templates.length === 0" class="empty-state">
            사용 가능한 템플릿이 없습니다.
          </div>
          <ul v-else class="template-list">
            <li v-for="template in templates" :key="template.id" @click="showTemplateDetails(template.id)" class="template-item">
              <div>
                <div class="template-name">{{ template.name }}</div>
                <div class="template-description">{{ template.description }}</div>
              </div>
              <button v-if="isManageMode" @click.stop="confirmDelete(template.id, template.name)" class="delete-icon-btn">
                🗑️
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
                <input id="registerProductSearch" type="text" v-model="registerSearchQuery" @keyup.enter="searchProductsForRegister"
                  placeholder="추가할 자재 검색" class="search-input-modal" />
                <button @click="searchProductsForRegister" class="search-btn-modal">검색</button>
              </div>
              <ul v-if="registerSearchResults.length > 0" class="search-results-modal">
                <li v-for="product in registerSearchResults" :key="product.id" @click="addProductToRegister(product)">
                  {{ product.name }} ({{ product.code }})
                </li>
              </ul>
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
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import api from "@/lib/api";
import { useToast } from '@/composables/useToast';

const props = defineProps({
  isVisible: Boolean,
});

const emit = defineEmits(['close', 'select-template']);

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

const fetchTemplates = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/api/franchise/orders/templates');
    templates.value = response.data;
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

const confirmDelete = async (templateId, templateName) => {
  if (confirm(`'${templateName}' 템플릿을 정말 삭제하시겠습니까?`)) {
    try {
      await api.delete(`/api/franchise/orders/template/${templateId}`);
      toast.success('템플릿이 삭제되었습니다.');
      fetchTemplates();
      // If the deleted template was being viewed, go back to list
      if (detailedTemplate.value && detailedTemplate.value.id === templateId) {
        detailedTemplate.value = null;
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('템플릿 삭제에 실패했습니다.');
    }
  }
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

.btn-secondary, .btn-primary {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid;
  cursor: pointer;
  font-weight: bold;
}

.btn-secondary {
  background-color: #fff;
  border-color: #ccc;
  color: #333;
}

.btn-primary {
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
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
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
  padding: 8px 16px;
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
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
  padding: 4px 14px;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  margin-right: 8px;
  cursor: pointer;
}
.register-btn:hover {
  background: #3453c7;
}
</style> 