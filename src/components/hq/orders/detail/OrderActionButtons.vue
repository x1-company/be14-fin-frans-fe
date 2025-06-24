<template>
    <div class="order-actions">
        <!-- 반려 버튼: 검토 중 또는 검토 완료 상태에서만 노출 -->
        <button
        v-if="(isReviewing || isReviewed) && !isRejected"
        class="btn reject"
        @click="showRejectModal = true"
        >반려</button>

        <!-- 검토 완료 버튼: 검토중 상태에서만 -->
        <button
        v-if="isReviewing && !isRejected"
        class="btn approve"
        @click="showModal = true"
        >검토 완료</button>

        <!-- 검토 취소 버튼: 검토 완료 상태에서만 -->
        <button
        v-if="isReviewed && !isRejected"
        class="btn cancel-review"
        @click="showCancelModal = true"
        >검토 취소</button>

        <!-- 배송 정보 입력 버튼 -->
        <button
        v-if="isApproved"
        class="btn delivery"
        @click="showDeliveryModal = true"
        >
        <span class="icon">🚚</span>
        배송 정보 입력
        </button>

        <button
        v-if="isDelivering"
        class="btn delivery-complete"
        @click="showDeliveryCompleteModal = true"
        >
        <span class="icon">✓</span>
        배송 완료 처리
        </button>

        <button
        v-if="isDelivering"
        class="btn edit"
        @click="showEditDeliveryModal = true"
        >수정</button>

        <button class="btn print"><span class="icon">&#128424;</span> 주문서 출력</button>
        <button class="btn close" @click="handleClose"><span class="icon">&#10005;</span> 닫기</button>
        <ConfirmModal
          :visible="showModal"
          @confirm="handleConfirm"
          @cancel="showModal = false"
        />
        <RejectModal
          :visible="showRejectModal"
          @reject="handleReject"
          @cancel="showRejectModal = false"
        />
        <ConfirmCancelModal
          :visible="showCancelModal"
          @confirm="handleCancelReview"
          @cancel="showCancelModal = false"
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
import { useRouter } from 'vue-router';
import ConfirmModal from '@/components/hq/orders/modal/ConfirmModal.vue';
import RejectModal from '@/components/hq/orders/modal/RejectModal.vue';
import ConfirmCancelModal from '@/components/hq/orders/modal/ConfirmCancelModal.vue';
import DeliveryInfoModal from '@/components/hq/orders/modal/DeliveryInfoModal.vue';
import DeliveryCompleteModal from '@/components/hq/orders/modal/DeliveryCompleteModal.vue';
import api from '@/lib/api';

const props = defineProps({
  orderId: {
    type: [String, Number],
    required: true
  },
  rejectedReason: String,
  status: String,
  deliveryInfo: Object
});

const showModal = ref(false);
const showRejectModal = ref(false);
const showCancelModal = ref(false);
const showDeliveryModal = ref(false);
const showDeliveryCompleteModal = ref(false);
const showEditDeliveryModal = ref(false);

const isRejected = computed(() => props.status === 'REJECTED');
const isReviewed = computed(() => props.status === 'REVIEW_COMPLETED');
const isReviewing = computed(() => props.status === 'REVIEWING'); // 반려
const isApproved = computed(() => props.status === 'APPROVED');
const isDelivering = computed(() => props.status === 'DELIVERING');

// 최초 상태를 부모에서 받아오고 싶으면 watch/props로 동기화
// 예: const isReviewed = computed(() => props.status === 'REVIEW_COMPLETED');

const emits = defineEmits(['refreshOrder', 'close']);

function handleClose() {
  emits('close');
}

const router = useRouter();

async function handleConfirm() {
  showModal.value = false;
  try {
    await api.patch(`/api/hq/orders/${props.orderId}/review-complete`);
    isReviewed.value = true;
    emits('refreshOrder'); // 성공 시 부모에게 알림
  } catch (e) {
    alert('검토 완료 처리에 실패했습니다.');
  }
}

async function handleCancelReview() {
  showCancelModal.value = false;
  try {
    await api.patch(`/api/hq/orders/${props.orderId}/review-cancel`);
    isReviewed.value = false;
    emits('refreshOrder');
  } catch (e) {
    alert('검토 취소 처리에 실패했습니다.');
  }
}

async function handleReject(reason) {
  showRejectModal.value = false;
  try {
    await api.patch(`/api/hq/orders/${props.orderId}/reject`, { reason });
    isRejected.value = true;
    emits('refreshOrder'); // 성공 시 부모에게 알림
  } catch (e) {
    alert('반려 처리에 실패했습니다.');
  }
}

async function handleDeliveryConfirm(deliveryInfo) {
  try {
    await api.patch(`/api/hq/orders/${props.orderId}/delivery`, {
      deliveryCompany: deliveryInfo.deliveryCompany,
      trackingNumber: deliveryInfo.trackingNumber,
      name: deliveryInfo.name,
      phone: deliveryInfo.phone
    });
    showDeliveryModal.value = false;
    emits('refreshOrder');
  } catch (e) {
    alert('배송 정보 등록에 실패했습니다.');
  }
}

async function handleDeliveryComplete(deliveryInfo) {
  try {
    await api.patch(`/api/hq/orders/${props.orderId}/delivery`, {
      deliveryCompany: deliveryInfo.deliveryCompany,
      trackingNumber: deliveryInfo.trackingNumber,
      name: deliveryInfo.name,
      phone: deliveryInfo.phone,
      deliveredAt: deliveryInfo.deliveredAt
    });
    showDeliveryCompleteModal.value = false;
    emits('refreshOrder');
  } catch (e) {
    alert('배송 완료 처리에 실패했습니다.');
  }
}

async function handleEditDeliveryConfirm(deliveryInfo) {
  try {
    await api.patch(`/api/hq/orders/${props.orderId}/delivery`, {
      deliveryCompany: deliveryInfo.deliveryCompany,
      trackingNumber: deliveryInfo.trackingNumber,
      name: deliveryInfo.name,
      phone: deliveryInfo.phone
    });
    showEditDeliveryModal.value = false;
    emits('refreshOrder');
  } catch (e) {
    alert('배송 정보 수정에 실패했습니다.');
  }
}


</script>

<style scoped>
.order-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  /* margin: 40px 55px -70px 0; */
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