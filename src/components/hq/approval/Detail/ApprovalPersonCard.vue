<template>
  <div :class="['person-card', cardClass]">
    <div class="person-main">
      <span class="person-icon">
        <component :is="iconComponent" />
      </span>
      <div class="person-info">
        <div class="person-name-section">
          <div class="person-name-role">
            {{ person.name }}
            <span v-if="person.position">{{ person.position }}</span>
          </div>
          <div class="person-dept-read-row">
            <div v-if="person.department" class="person-department">{{
              person.department
            }}</div>
          </div>
        </div>
        <div v-if="person.readTime" class="read-time"
          >열람: {{ formatDateTime(person.readTime) }}</div
        >

        <div v-if="person.comment" class="comment-box">
          의견: {{ person.comment }}
        </div>
      </div>
      <div
        v-if="type === 'reference'"
        class="status-badge"
        :style="
          person.isChecked
            ? {
                background: '#e3eafc',
                color: '#1565c0',
              }
            : {
                background: '#f3f4f6',
                color: '#6b7280',
              }
        "
      >
        {{ person.isChecked ? "열람완료" : "통지됨" }}
      </div>
      <div
        v-else-if="type === 'recipient'"
        class="status-badge"
        :style="
          person.status === 'COMPLETED' || person.status === 'APPROVED'
            ? {
                background: '#e0f7fa',
                color: '#00838f',
              }
            : {
                background: '#f3f4f6',
                color: '#6b7280',
              }
        "
      >
        {{
          person.status === "COMPLETED" || person.status === "APPROVED"
            ? "수신완료"
            : "수신대기"
        }}
      </div>
      <div v-else class="status-badge" :style="badgeInlineStyle">
        {{ statusText }}
      </div>
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
    APPROVED: "승인완료",
    PENDING: "결재대기",
    EXPECTED: "결재예정",
    REJECTED: "반려",
    WAITING: "결재대기",
    COMPLETED: "승인완료",
  },
  collaborator: {
    WAITING: "협의대기",
    COMPLETED: "협의완료",
    EXPECTED: "협의예정",
    APPROVED: "협의완료",
    REJECTED: "반려",
  },
  reference: {
    READ: "열람완료",
    UNREAD: "통지됨",
  },
  recipient: {
    WAITING: "수신대기",
    COMPLETED: "수신완료",
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
const badgeInlineStyle = computed(() => {
  // 결재자(approver)
  if (props.type === "approver") {
    if (
      props.person.status === "APPROVED" ||
      props.person.status === "COMPLETED"
    ) {
      return {
        background: "#e6f9e6",
        color: "#1a7f37",
      };
    }
    if (props.person.status === "REJECTED") {
      return {
        background: "#ffe6e6",
        color: "#d32f2f",
      };
    }
    // 결재대기/예정
    return {
      background: "#ede9fe",
      color: "#7c3aed",
    };
  }
  // 협조자(collaborator)
  if (props.type === "collaborator") {
    if (
      props.person.status === "APPROVED" ||
      props.person.status === "COMPLETED"
    ) {
      return {
        background: "#e3f2fd",
        color: "#1976d2",
      };
    }
    if (props.person.status === "REJECTED") {
      return {
        background: "#ffe6e6",
        color: "#d32f2f",
      };
    }
    // 협의대기/예정
    return {
      background: "#ede9fe",
      color: "#7c3aed",
    };
  }
  // 기본
  return {
    background: "#f3f4f6",
    color: "#212529",
  };
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
<style>
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
.person-name-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 2px;
  flex-wrap: wrap;
}
.person-name-role {
  font-size: 15px;
  font-weight: 600;
  color: #212529;
  white-space: nowrap;
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
.comment-box {
  font-size: 12px;
  color: #6b7280;
}
.person-dept-read-row {
  display: flex;
  gap: 8px;
}
</style>
