<template>
  <div class="return-actions">
    <button
      v-if="isPickedUp"
      class="btn complete"
      @click="showCompleteModal = true"
    >
      <span class="icon">✓</span>반품 수거 완료 
    </button>
    <!-- 접수 대기 상태에서만 반려/검토 버튼 노출 -->
    <template v-if="props.status === 'WAITING_FOR_RECEIPT' && !props.isEditing">
      <button class="btn reject" @click="showRejectModal = true">반려</button>
      <button class="btn approve" @click="startReview">검토</button>
    </template>
    <!-- 검토 모드일 때(상단 취소/검토완료는 부모에서 직접) -->
    <!-- 기타 상태별 버튼은 기존대로 -->
    <button
      v-if="isApproved"
      class="btn delivery"
      @click="showDeliveryModal = true"
    >
      <span class="icon">🚚</span> 반품 수거 정보 입력
    </button>
    <button
      v-if="isDelivering || isPickingUp"
      class="btn delivery-complete"
      @click="showDeliveryCompleteModal = true"
    >
      <span class="icon">🚚</span>
      <span>반품 수거 정보 입력</span>
    </button>
    <button
      v-if="isDelivering"
      class="btn edit"
      @click="showEditDeliveryModal = true"
    >수정</button>
    <button class="btn print"><span class="icon">&#128424;</span> 반품서 출력</button>
    <button class="btn close" @click="handleClose"><span class="icon">&#10005;</span> 닫기</button>

    <!-- Modal 등은 기존대로 -->
    <RejectModal
      :visible="showRejectModal"
      @reject="handleReject"
      @cancel="showRejectModal = false"
    />
    <ReturnDeliveryInfoModal
      :visible="showDeliveryModal"
      :initial-info="latestDeliveryInfo"
      @confirm="handleDeliveryConfirm"
      @cancel="showDeliveryModal = false"
    />
    <ReturnDeliveryCompleteModal
      :visible="showDeliveryCompleteModal"
      :returnData="props.returnData"
      @confirm="handleDeliveryComplete"
      @cancel="showDeliveryCompleteModal = false"
    />
    <DeliveryInfoModal
      v-if="showEditDeliveryModal"
      :visible="showEditDeliveryModal"
      :initial-info="deliveryInfo"
      @confirm="handleEditDeliveryConfirm"
      @cancel="showEditDeliveryModal = false"
    />
    <PickedUpCompleteModal
      :visible="showCompleteModal"
      @confirm="handleCompleteReturn"
      @cancel="showCompleteModal = false"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import RejectModal from '@/components/hq/orders/modal/RejectModal.vue';
import DeliveryInfoModal from '@/components/hq/orders/modal/DeliveryInfoModal.vue';
import ReturnDeliveryCompleteModal from './ReturnDeliveryCompleteModal.vue';
import ReturnDeliveryInfoModal from './ReturnDeliveryInfoModal.vue';
import api from '@/lib/api';
import { useToast } from '@/composables/useToast';
import PickedUpCompleteModal from '@/components/hq/return/modal/PickedUpCompleteModal.vue';

const props = defineProps({
  returnId: [String, Number],
  rejectedReason: String,
  status: String,
  deliveryInfo: Object,
  isEditing: Boolean,
  returnData: Object
});

const showRejectModal = ref(false);
const showDeliveryModal = ref(false);
const showDeliveryCompleteModal = ref(false);
const showEditDeliveryModal = ref(false);
const showCompleteModal = ref(false);

const isApproved = computed(() => props.status === 'APPROVED');
const isDelivering = computed(() => props.status === 'DELIVERING');
const isPickingUp = computed(() => props.status === 'PICKING_UP');
const isPickedUp = computed(() => props.status === 'PICKED_UP');

const emit = defineEmits(['update:isEditing', 'refreshReturn', 'close']);

const toast = useToast();

// 최신 배송 정보 추출 (returnData에서)
const latestDeliveryInfo = computed(() => ({
  deliveryCompany: props.returnData?.deliveryCompany || '',
  driverName: props.returnData?.driverName || '',
  driverPhone: props.returnData?.driverPhone || '',
  trackingNumber: props.returnData?.trackingNumber || ''
}));

// 진단용: 두 모달이 열릴 때 latestDeliveryInfo 값 로그
watch(
  () => [showDeliveryModal.value, showDeliveryCompleteModal.value, latestDeliveryInfo.value],
  ([showInfo, showComplete, info]) => {
    if (showInfo) {
      console.log('INFO MODAL OPEN - latestDeliveryInfo:', info);
    }
    if (showComplete) {
      console.log('COMPLETE MODAL OPEN - latestDeliveryInfo:', info);
    }
  },
  { immediate: true, deep: true }
);

function handleClose() {
  emit('close');
}
function startReview() {
  emit('update:isEditing', true);
}

async function handleReject(reason) {
  try {
    await api.patch(`/api/hq/return/${props.returnId}/reject`, {
      rejectReason: reason
    });
    showRejectModal.value = false;
    emit('refreshReturn');
    toast.success('반려 처리가 완료되었습니다.');
  } catch (e) {
    console.error('반려 요청 실패:', e);
    toast.error('반려 처리에 실패했습니다. 다시 시도해 주세요.');
  }
}

async function handleDeliveryConfirm(deliveryInfo) {
  try {
    await api.patch(`/api/hq/return/${props.returnId}/delivery`, {
      deliveryCompany: deliveryInfo.deliveryCompany,
      trackingNumber: deliveryInfo.trackingNumber,
      name: deliveryInfo.name,
      phone: deliveryInfo.phone
    });
    showDeliveryModal.value = false;
    emit('refreshReturn');
    toast.success('배송 정보가 등록되었습니다.');
  } catch (e) {
    toast.error('배송 정보 등록에 실패했습니다.');
  }
}

async function handleDeliveryComplete(deliveryInfo) {
  try {
    await api.patch(`/api/hq/return/${props.returnId}/delivered-at`, {
      deliveredAt: deliveryInfo.deliveredAt
    });
    showDeliveryCompleteModal.value = false;
    emit('refreshReturn');
    toast.success('배송 완료일이 저장되었습니다.');
  } catch (e) {
    toast.error('배송 완료일 저장에 실패했습니다.');
  }
}

async function handleEditDeliveryConfirm(deliveryInfo) {
  try {
    await api.patch(`/api/hq/return/${props.returnId}/delivery`, {
      deliveryCompany: deliveryInfo.deliveryCompany,
      trackingNumber: deliveryInfo.trackingNumber,
      name: deliveryInfo.name,
      phone: deliveryInfo.phone
    });
    showEditDeliveryModal.value = false;
    emit('refreshReturn');
    toast.success('배송 정보가 수정되었습니다.');
  } catch (e) {
    toast.error('배송 정보 수정에 실패했습니다.');
  }
}

async function handleCompleteReturn() {
  try {
    await api.patch(`/api/hq/return/${props.returnId}/complete`);
    showCompleteModal.value = false;
    emit('refreshReturn');
    toast.success('반품이 완료 처리되었습니다.');
  } catch (e) {
    toast.error('반품 완료 처리에 실패했습니다.');
  }
}
</script>

<style scoped>
.return-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}
.btn {
  padding: 6px 13px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border 0.15s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn.reject {
  color: #d32f2f;
  border-color: #ffd6d6;
}
.btn.approve {
  color: #388e3c;
  border-color: #c8e6c9;
}
.btn.cancel-review {
  color: #d32f2f;
  border-color: #ffd6d6;
}
.btn.edit,
.btn.print,
.btn.close {
  color: #1976d2;
  border-color: #bbdefb;
}
.btn:hover {
  background: #f5faff;
}
.icon {
  font-size: 15px;
  vertical-align: middle;
}
.btn.delivery {
  color: #1976d2;
  border-color: #bbdefb;
  background-color: #e3f2fd;
}
.btn.delivery-complete {
  color: #388e3c;
  border-color: #c8e6c9;
  background-color: #e8f5e9;
}
.btn.complete {
  color: #388e3c;
  border-color: #c8e6c9;
  background-color: #e8f5e9;
}
</style>
