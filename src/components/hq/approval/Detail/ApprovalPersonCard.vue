<template>
  <div :class="['person-card', cardClass]">
    <div class="person-main">
      <span class="person-icon">
        <component :is="iconComponent" />
      </span>
      <div class="person-info">
        <div class="person-name-role">
          {{ person.name }}
          <span v-if="person.position">{{ person.position }}</span>
        </div>
        <div v-if="person.department" class="person-department">{{
          person.department
        }}</div>
        <div v-if="type === 'reference' && person.readTime" class="read-time">
          열람: {{ formatDateTime(person.readTime) }}
        </div>
      </div>
      <div class="status-badge" :class="badgeClass">{{ statusText }}</div>
    </div>
    <div v-if="person.comment" class="person-comment">
      <div class="comment-text">의견: {{ person.comment }}</div>
      <div v-if="person.commentTime" class="comment-time">{{
        formatDateTime(person.commentTime)
      }}</div>
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";
const props = defineProps({
  person: Object,
  type: String, // approver, collaborator, reference, recipient
});

const statusTextMap = {
  approver: {
    completed: "승인완료",
    pending: "결재대기",
    expected: "결재예정",
    rejected: "반려",
  },
  collaborator: {
    waiting: "협의대기",
    completed: "협의완료",
    expected: "협의예정",
  },
  reference: {
    read: "열람완료",
    unread: "통지됨",
  },
  recipient: {
    waiting: "수신대기",
    completed: "수신완료",
  },
};
const statusText = computed(() => {
  const map = statusTextMap[props.type] || {};
  return map[props.person.status] || props.person.status;
});

const cardClass = computed(() => {
  // 상태별 배경색 등
  if (props.type === "collaborator") {
    if (props.person.status === "waiting") return "card-collab-wait";
    if (props.person.status === "completed") return "card-collab-done";
    if (props.person.status === "expected") return "card-collab-expected";
  }
  if (props.type === "reference") {
    if (props.person.status === "read") return "card-ref-read";
    if (props.person.status === "unread") return "card-ref-unread";
  }
  if (props.type === "recipient") {
    if (props.person.status === "waiting") return "card-rec-wait";
    if (props.person.status === "completed") return "card-rec-done";
  }
  if (props.type === "approver") {
    if (props.person.status === "completed") return "card-app-done";
    if (props.person.status === "pending") return "card-app-pending";
    if (props.person.status === "expected") return "card-app-expected";
    if (props.person.status === "rejected") return "card-app-reject";
  }
  return "";
});
const badgeClass = computed(() => {
  // 상태별 뱃지 색상
  if (props.type === "collaborator") {
    if (props.person.status === "waiting") return "badge-collab-wait";
    if (props.person.status === "completed") return "badge-collab-done";
    if (props.person.status === "expected") return "badge-collab-expected";
  }
  if (props.type === "reference") {
    if (props.person.status === "read") return "badge-ref-read";
    if (props.person.status === "unread") return "badge-ref-unread";
  }
  if (props.type === "recipient") {
    if (props.person.status === "waiting") return "badge-rec-wait";
    if (props.person.status === "completed") return "badge-rec-done";
  }
  if (props.type === "approver") {
    if (props.person.status === "completed") return "badge-app-done";
    if (props.person.status === "pending") return "badge-app-pending";
    if (props.person.status === "expected") return "badge-app-expected";
    if (props.person.status === "rejected") return "badge-app-reject";
  }
  return "";
});
const iconComponent = computed(() => {
  if (props.type === "collaborator") return "CollabIcon";
  if (props.type === "reference") return "RefIcon";
  if (props.type === "recipient") return "RecIcon";
  if (props.type === "approver") return "AppIcon";
  return "UserIcon";
});
const formatDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};
</script>
<!-- 아이콘 컴포넌트 예시(실제 프로젝트에 맞게 교체) -->
<script>
export default {
  components: {
    CollabIcon: {
      template:
        '<svg width="20" height="20" fill="none" stroke="#a78bfa"><circle cx="10" cy="10" r="9" stroke-width="2"/><path d="M10 6v4l3 2" stroke-width="2"/></svg>',
    },
    RefIcon: {
      template:
        '<svg width="20" height="20" fill="none" stroke="#60a5fa"><circle cx="10" cy="10" r="9" stroke-width="2"/><circle cx="10" cy="10" r="4" stroke-width="2"/></svg>',
    },
    RecIcon: {
      template:
        '<svg width="20" height="20" fill="none" stroke="#a3a3a3"><circle cx="10" cy="10" r="9" stroke-width="2"/><path d="M10 6v4l3 2" stroke-width="2"/></svg>',
    },
    AppIcon: {
      template:
        '<svg width="20" height="20" fill="none" stroke="#34d399"><circle cx="10" cy="10" r="9" stroke-width="2"/><polyline points="6,10 10,14 14,7" stroke-width="2"/></svg>',
    },
    UserIcon: {
      template:
        '<svg width="20" height="20" fill="none" stroke="#bbb"><circle cx="10" cy="7" r="4" stroke-width="2"/><path d="M2 18c0-4 8-4 8-4s8 0 8 4" stroke-width="2"/></svg>',
    },
  },
};
</script>
<style scoped>
.person-card {
  border-radius: 8px;
  padding: 16px;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
}
.card-collab-wait {
  background: #faf5ff;
  border-color: #e9d5ff;
}
.card-collab-done {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.card-collab-expected {
  background: #f3f4f6;
  border-color: #e5e7eb;
}
.card-ref-read {
  background: #eff6ff;
  border-color: #bae6fd;
}
.card-ref-unread {
  background: #f3f4f6;
  border-color: #e5e7eb;
}
.card-rec-wait {
  background: #f3f4f6;
  border-color: #e5e7eb;
}
.card-rec-done {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.card-app-done {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.card-app-pending {
  background: #f3f4f6;
  border-color: #e5e7eb;
}
.card-app-expected {
  background: #f3f4f6;
  border-color: #e5e7eb;
}
.card-app-reject {
  background: #fef2f2;
  border-color: #fecaca;
}
.person-main {
  display: flex;
  align-items: center;
  gap: 16px;
}
.person-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.person-info {
  flex: 1;
}
.person-name-role {
  font-size: 15px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 2px;
}
.person-department {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 2px;
}
.read-time {
  font-size: 12px;
  color: #6b7280;
}
.status-badge {
  font-size: 13px;
  font-weight: 500;
  border-radius: 12px;
  padding: 4px 12px;
  white-space: nowrap;
  margin-left: 8px;
  align-self: flex-start;
}
.badge-collab-wait {
  background: #ede9fe;
  color: #7c3aed;
}
.badge-collab-done {
  background: #dcfce7;
  color: #22c55e;
}
.badge-collab-expected {
  background: #f3f4f6;
  color: #6b7280;
}
.badge-ref-read {
  background: #dbeafe;
  color: #2563eb;
}
.badge-ref-unread {
  background: #f3f4f6;
  color: #6b7280;
}
.badge-rec-wait {
  background: #f3f4f6;
  color: #6b7280;
}
.badge-rec-done {
  background: #dcfce7;
  color: #22c55e;
}
.badge-app-done {
  background: #dcfce7;
  color: #22c55e;
}
.badge-app-pending {
  background: #f3f4f6;
  color: #6b7280;
}
.badge-app-expected {
  background: #f3f4f6;
  color: #6b7280;
}
.badge-app-reject {
  background: #fee2e2;
  color: #ef4444;
}
.person-comment {
  background: #f8fafc;
  border-radius: 6px;
  padding: 12px;
  margin-top: 10px;
  font-size: 13px;
  color: #374151;
}
.comment-text {
  margin-bottom: 6px;
}
.comment-time {
  font-size: 12px;
  color: #6b7280;
}
</style>
