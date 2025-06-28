<template>
  <div v-if="returnDetail">
    <!-- 상단 버튼: 검토 모드일 때만 노출 -->
    <div class="return-actions" v-if="isEditing">
      <button class="btn cancel-review" @click="handleCancelEdit">취소</button>
      <button class="btn approve" @click="handleReviewCompleted">검토 완료</button>
    </div>
    <!-- 평소 상태: ReturnActionButtons에서 검토/반려 등 노출 -->
    <ReturnActionButtons
      v-if="returnDetail"
      :returnId="props.returnId"
      :rejectedReason="returnDetail.rejectedReason"
      :status="returnDetail.status"
      :isEditing="isEditing"
      :return-data="returnDetail"
      @update:isEditing="val => isEditing = val; if (val) startEdit();"
      @refreshReturn="fetchReturnDetail"
      @close="handleClose"
    />
    <div class="progress-bar-wrapper">
      <ReturnProgressBar :status="currentStatus" />
    </div>
    <div class="detail-wrapper">
      <FranchiseInfoCard :returnData="returnDetail" />
      <ReturnInfoCard
        :returnData="returnDetail"
        :isEditing="isEditing"
        :rejectReason="editRejectReason"
        @update:rejectReason="val => editRejectReason = val"
      />
      <ProductTable
        :products="editProducts"
        :totalAmount="returnDetail?.totalAmount || 0"
        :isEditable="isEditing"
        @update:products="val => editProducts = val"
      />
      <DeliveryInfoCard :returnData="returnDetail" />
      <ApprovalInfoCard :returnData="returnDetail" />
    </div>
  </div>
  <div v-if="loading" class="loading-container">
    <div class="spinner"></div>
    <p>로딩 중</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import ReturnActionButtons from './ReturnActionButtons.vue';
import ReturnProgressBar from './ReturnProgressBar.vue';
import FranchiseInfoCard from './FranchiseInfoCard.vue';
import ReturnInfoCard from './ReturnInfoCard.vue';
import ProductTable from './ProductTable.vue';
import DeliveryInfoCard from './DeliveryInfoCard.vue';
import ApprovalInfoCard from './ApprovalInfoCard.vue';
import api from '@/lib/api';
import { useToast } from "@/composables/useToast";

const toast = useToast()

const props = defineProps({
  returnId: {
    type: [String, Number],
    required: true
  }
});
const emit = defineEmits(['close']);

const returnDetail = ref(null);
const loading = ref(false);

const isEditing = ref(false); // 검토중 상태
const editRejectReason = ref(''); // 반려사유 입력값
const editProducts = ref([]);     // 품목 상태 복사본

const currentStatus = ref('');    // ProgressBar 동기화용 상태

async function fetchReturnDetail() {
  loading.value = true;
  try {
    const res = await api.get(`/api/hq/franchise/return/${props.returnId}`);
    returnDetail.value = res.data ? res.data : res;
    editRejectReason.value = returnDetail.value.rejectedReason || '';
    editProducts.value = (returnDetail.value.returnProducts || returnDetail.value.products || [])
      .map(p => ({ ...p, status: p.returnStatus || '' }));
    currentStatus.value = returnDetail.value.status;
  } catch (e) {
    returnDetail.value = null;
  } finally {
    loading.value = false;
  }
}

function handleClose() {
  emit('close');
}
function startEdit() {
  editRejectReason.value = returnDetail.value.rejectedReason || '';
  editProducts.value = (returnDetail.value.returnProducts || returnDetail.value.products || [])
    .map(p => ({ ...p, status: p.returnStatus || '' }));
}
function handleCancelEdit() {
  isEditing.value = false;
  editRejectReason.value = returnDetail.value.rejectedReason || '';
  editProducts.value = (returnDetail.value.returnProducts || returnDetail.value.products || [])
    .map(p => ({ ...p, status: p.returnStatus || '' }));
}
async function handleReviewCompleted() {
  try {
    const payload = {
      rejectReason: editRejectReason.value,
      statusList: editProducts.value.map(p => ({
        returnDetailId: p.returnDetailId || p.id,
        status: p.status
      })),
    };
    await api.patch(`/api/hq/return/${props.returnId}/review-completed`, payload);
    isEditing.value = false;
    await fetchReturnDetail();
    currentStatus.value = 'REVIEW_COMPLETED';
  } catch (e) {
    toast.error('검토 완료 처리에 실패했습니다.');
  }
}

onMounted(fetchReturnDetail);
</script>
