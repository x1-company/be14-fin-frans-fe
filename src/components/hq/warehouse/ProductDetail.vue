<template>
  <div class="detail-form-card">
    <div class="card-header">
      <div class="detail-form-title">자재 상세</div>
      <div class="detail-form-btns">
        <template v-if="!isEditing">
          <button class="btn-blue" @click="startEditing">
            <Pencil :size="16" color="white" />
            <span>수정</span>
          </button>
        <button class="btn-blue">재고 확인</button>
        </template>
        <template v-else>
          <button class="btn-outline" @click="cancelEditing">취소</button>
          <button class="btn-blue" @click="saveChanges">저장</button>
        </template>
      </div>
    </div>
    <div class="detail-form-supplier">
      공급처
      <span v-if="!isEditing" class="supplier-name">{{ detail?.supplierName || '-' }}</span>
      <select v-else v-model="editableDetail.supplierId" class="form-select">
        <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
    </div>
    <div class="detail-form-grid">
      <div class="form-col">
        <div class="form-row">
          <label>자재번호</label>
          <input type="text" :value="detail?.code || ''" readonly />
        </div>
        <div class="form-row">
          <label>규격</label>
          <input v-if="!isEditing" type="text" :value="detail?.spec || ''" readonly />
          <input v-else type="text" v-model="editableDetail.spec" />
        </div>
        <div class="form-row">
          <label>재고단위</label>
          <input v-if="!isEditing" type="text" :value="detail?.unit || ''" readonly />
          <input v-else type="text" v-model="editableDetail.unit" />
        </div>
        <div class="form-row">
          <label>자재 구분</label>
          <input v-if="!isEditing" type="text" :value="typeLabel(detail?.productTypeId)" readonly />
          <select v-else v-model="editableDetail.productTypeId" class="form-select">
            <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div class="form-row">
          <label>구매단가</label>
           <input v-if="!isEditing" type="text" :value="detail?.purchasePrice ? detail.purchasePrice + '원' : ''" readonly />
           <input v-else type="number" v-model.number="editableDetail.purchasePrice" />
        </div>
         <div class="form-row">
          <label>사용여부</label>
          <input v-if="!isEditing" type="text" :value="detail?.isActive ? 'Y' : 'N'" readonly />
          <select v-else v-model="editableDetail.isActive" class="form-select">
            <option :value="true">Y</option>
            <option :value="false">N</option>
          </select>
        </div>
      </div>
      <div class="form-col">
        <div class="form-row">
          <label>자재명</label>
          <input v-if="!isEditing" type="text" :value="detail?.name || ''" readonly />
          <input v-else type="text" v-model="editableDetail.name" />
        </div>
        <div class="form-row">
          <label>구매단위</label>
          <input v-if="!isEditing" type="text" :value="detail?.purchaseUnit || ''" readonly />
          <input v-else type="text" v-model="editableDetail.purchaseUnit" />
        </div>
        <div class="form-row">
          <label>자재 분류</label>
          <input v-if="!isEditing" type="text" :value="groupLabel(detail?.productGroupId)" readonly />
          <select v-else v-model="editableDetail.productGroupId" class="form-select">
            <option v-for="opt in groupOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div class="form-row">
          <label>자재 속성</label>
          <input v-if="!isEditing" type="text" :value="attrLabel(detail?.productAttributeId)" readonly />
          <select v-else v-model="editableDetail.productAttributeId" class="form-select">
            <option v-for="opt in attrOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div class="form-row">
          <label>판매단가</label>
          <input v-if="!isEditing" type="text" :value="detail?.salePrice ? detail.salePrice + '원' : ''" readonly />
          <input v-else type="number" v-model.number="editableDetail.salePrice" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Pencil } from 'lucide-vue-next';
import api from '@/lib/api';
import { useToast } from "@/composables/useToast";

const toast = useToast();

const props = defineProps({
  productId: {
    type: String,
    required: true,
  },
});

const detail = ref(null);
const editableDetail = ref(null);
const isEditing = ref(false);
const suppliers = ref([]);

const PRODUCT_TYPE_MAP = {
  1: '원재료',
  2: '상품',
  3: '저장품',
  4: '소모품',
  5: '시설소모품',
  6: '경품',
  7: '기타',
};
const PRODUCT_GROUP_MAP = { 1: '상온', 2: '냉장', 3: '냉동', 4: '기타' };
const PRODUCT_ATTRIBUTE_MAP = {
  1: '신선식품',
  2: '비신선식품',
  3: '비식품',
};

const typeOptions = computed(() => Object.entries(PRODUCT_TYPE_MAP).map(([value, label]) => ({ value: Number(value), label })));
const groupOptions = computed(() => Object.entries(PRODUCT_GROUP_MAP).map(([value, label]) => ({ value: Number(value), label })));
const attrOptions = computed(() => Object.entries(PRODUCT_ATTRIBUTE_MAP).map(([value, label]) => ({ value: Number(value), label })));

function typeLabel(val) {
  return PRODUCT_TYPE_MAP[val] || val;
}
function groupLabel(val) {
  return PRODUCT_GROUP_MAP[val] || val;
}
function attrLabel(val) {
  return PRODUCT_ATTRIBUTE_MAP[val] || val;
}

const fetchProductDetail = async () => {
  if (!props.productId) return;
  try {
  const { data } = await api.get(`/api/hq/products/details/${props.productId}`);
  detail.value = data;
  } catch (error) {
    console.error('Failed to fetch product details:', error);
    toast.error('자재 정보를 불러오는 데 실패했습니다.');
  }
};

const fetchSuppliers = async () => {
  try {
    const { data } = await api.get('/api/hq/suppliers/list');
    suppliers.value = data.map(s => ({ ...s, id: Number(s.id) }));
  } catch (error) {
    console.error('Failed to fetch suppliers:', error);
    toast.error('공급처 목록을 불러오는 데 실패했습니다.');
  }
};

function startEditing() {
  isEditing.value = true;
  const clonedDetail = JSON.parse(JSON.stringify(detail.value));
  
  clonedDetail.supplierId = Number(clonedDetail.supplierId);
  clonedDetail.isActive = !!clonedDetail.isActive;

  editableDetail.value = clonedDetail;
}

function cancelEditing() {
  isEditing.value = false;
  editableDetail.value = null;
}

async function saveChanges() {
  if (!editableDetail.value) return;

  const original = detail.value;
  const edited = editableDetail.value;

  const hasActiveChanged = original.isActive !== edited.isActive;
  const haveOtherFieldsChanged =
    original.code !== edited.code ||
    original.name !== edited.name ||
    original.purchasePrice !== edited.purchasePrice ||
    original.salePrice !== edited.salePrice ||
    original.unit !== edited.unit ||
    original.spec !== edited.spec ||
    original.purchaseUnit !== edited.purchaseUnit ||
    original.supplierId !== edited.supplierId ||
    original.productGroupId !== edited.productGroupId ||
    original.productTypeId !== edited.productTypeId ||
    original.productAttributeId !== edited.productAttributeId;

  if (hasActiveChanged && !haveOtherFieldsChanged) {
    try {
      await api.patch(`/api/hq/products/${edited.id}/active`, { active: edited.isActive });
      await fetchProductDetail();
      isEditing.value = false;
      toast.success('자재 사용여부가 성공적으로 변경되었습니다.');
    } catch (error) {
      console.error('Failed to change active status:', error);
      toast.error(`자재 사용여부 변경에 실패했습니다: ${error.response?.data?.message || error.message}`);
      editableDetail.value.isActive = original.isActive;
    }
    return;
  }

  const payload = {
    id: edited.id,
    code: edited.code,
    name: edited.name,
    purchasePrice: edited.purchasePrice,
    salePrice: edited.salePrice,
    unit: edited.unit,
    spec: edited.spec,
    purchaseUnit: edited.purchaseUnit,
    active: edited.isActive,
    supplierId: edited.supplierId,
    productGroupId: edited.productGroupId,
    productTypeId: edited.productTypeId,
    productAttributeId: edited.productAttributeId,
  };
  
  try {
    await api.put('/api/hq/products', payload);
    await fetchProductDetail();
    isEditing.value = false;
    toast.success('자재 정보가 성공적으로 수정되었습니다.');
  } catch (error) {
    console.error('Failed to update product:', error);
    toast.error(`자재 정보 수정에 실패했습니다: ${error.response?.data?.message || error.message}`);
  }
}

onMounted(async () => {
  await fetchProductDetail();
  await fetchSuppliers();
});
</script>

<style scoped>
.detail-form-card {
  background: #fff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.03);
  padding: 40px 100px 32px 100px;
  margin-top: 0;
  margin-bottom: 0;
  color: #222; /* 텍스트 색상 상속 문제 방지 */
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.detail-form-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 0; /* 헤더 안으로 이동했으므로 마진 제거 */
  color: #222;
}
.detail-form-supplier {
  font-size: 1.1rem;
  margin-bottom: 40px;
  color: #222;
}
.supplier-name {
  font-weight: bold;
  margin-left: 8px;
}
.detail-form-grid {
  display: flex;
  gap: 48px;
  margin-bottom: 24px;
}
.form-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
  color: #222;
  font-family: inherit;
}
.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-row label {
  font-size: 1rem;
  color: #222;
  margin-bottom: 2px;
  font-weight: 500;
}
.form-row input, .form-select {
  height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 1rem;
  background: #f8f9fa;
  color: #222;
  font-family: inherit;
}
.form-row input:read-only {
  background: #f8f9fa;
  cursor: default;
}
.form-row input:not(:read-only) {
  background: #fff;
}
.detail-form-btns {
  display: flex;
  gap: 16px;
  /* 기존 스타일 제거 후 위치 이동 */
}
.btn-blue {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #4066fa;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 24px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-blue:hover {
  background: #3453c7;
}
.btn-outline {
  background: #fff;
  color: #4066fa;
  border: 1px solid #4066fa;
  border-radius: 6px;
  padding: 8px 24px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.btn-outline:hover {
  background: #4066fa10;
  color: #3453c7;
}
.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px; /* 추가 */
}
</style> 