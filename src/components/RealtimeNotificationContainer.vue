<template>
  <div class="realtime-notification-container">
    <RealtimeNotificationCard
      v-for="notification in activeNotifications"
      :key="notification.id"
      :notification="notification"
      @close="removeNotificationFromView"
    />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useNotificationStore } from "@/stores/notification";
import RealtimeNotificationCard from "./RealtimeNotificationCard.vue";

const SHOWN_IDS_SESSION_KEY = "frans_shown_realtime_ids";

// Helper functions to safely interact with sessionStorage
const getShownIdsFromStorage = () => {
  try {
    const storedIds = sessionStorage.getItem(SHOWN_IDS_SESSION_KEY);
    return storedIds ? new Set(JSON.parse(storedIds)) : new Set();
  } catch (e) {
    console.error("Failed to parse shown notification IDs from sessionStorage", e);
    return new Set();
  }
};

const saveShownIdsToStorage = (ids) => {
  try {
    sessionStorage.setItem(
      SHOWN_IDS_SESSION_KEY,
      JSON.stringify(Array.from(ids))
    );
  } catch (e) {
    console.error("Failed to save shown notification IDs to sessionStorage", e);
  }
};

const notificationStore = useNotificationStore();
const activeNotifications = ref([]);

// This set now persists across reloads for the current session.
const shownIds = ref(getShownIdsFromStorage());

watch(
  () => notificationStore.notifications,
  (newNotifications) => {
    if (!notificationStore.showRealtimeNotifications) {
      return;
    }

    const notificationsToShow = newNotifications.filter(
      (n) => !n.readAt && !shownIds.value.has(n.id)
    );

    if (notificationsToShow.length > 0) {
      activeNotifications.value.push(...notificationsToShow);
      notificationsToShow.forEach((n) => shownIds.value.add(n.id));
      // Persist the updated set to sessionStorage
      saveShownIdsToStorage(shownIds.value);
    }
  },
  { deep: true }
);

const removeNotificationFromView = (notification) => {
  activeNotifications.value = activeNotifications.value.filter(
    (n) => n.id !== notification.id
  );
};
</script>

<style scoped>
.realtime-notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 3000;
  pointer-events: none;
}

.realtime-notification-container > * {
  pointer-events: auto;
}
</style> 