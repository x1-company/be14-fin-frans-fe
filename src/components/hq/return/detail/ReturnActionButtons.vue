<template>
  <div class="return-actions">
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
      <span class="icon">🚚</span> 배송 정보 입력
    </button>
    <button
      v-if="isDelivering"
      class="btn delivery-complete"
      @click="showDeliveryCompleteModal = true"
    >
      <span class="icon">✓</span> 배송 완료 처리
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
    <DeliveryInfoModal
      :visible="showDeliveryModal"
      @confirm="handleDeliveryConfirm"
      @cancel="showDeliveryModal = false"
    />
    <DeliveryCompleteModal
      :visible="showDeliveryCompleteModal"
      :delivery-info="deliveryInfo"
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
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import RejectModal from '@/components/hq/orders/modal/RejectModal.vue';
import DeliveryInfoModal from '@/components/hq/orders/modal/DeliveryInfoModal.vue';
import DeliveryCompleteModal from '@/components/hq/orders/modal/DeliveryCompleteModal.vue';

const props = defineProps({
  returnId: [String, Number],
  rejectedReason: String,
  status: String,
  deliveryInfo: Object,
  isEditing: Boolean
});

const showRejectModal = ref(false);
const showDeliveryModal = ref(false);
const showDeliveryCompleteModal = ref(false);
const showEditDeliveryModal = ref(false);

const isApproved = computed(() => props.status === 'APPROVED');
const isDelivering = computed(() => props.status === 'DELIVERING');

const emit = defineEmits(['update:isEditing', 'refreshOrder', 'close']);

function handleClose() {
  emit('close');
}
function startReview() {
  emit('update:isEditing', true);
}

async function handleReject(reason) {
  showRejectModal.value = false;
  // 반려 요청(구현 예시, 실제 api 연결 필요)
  // await api.patch(`/api/hq/return/${props.returnId}/reject`, { reason });
  emit('refreshOrder');
}

async function handleDeliveryConfirm(deliveryInfo) {
  // 배송 정보 등록(구현 예시)
  emit('refreshOrder');
}

async function handleDeliveryComplete(deliveryInfo) {
  // 배송 완료 처리(구현 예시)
  emit('refreshOrder');
}

async function handleEditDeliveryConfirm(deliveryInfo) {
  // 배송 정보 수정(구현 예시)
  emit('refreshOrder');
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
</style>
