import { createApp } from "vue";
import App from "./App.vue";
import "./assets/fonts.css";
import router from "./router";
import { createPinia } from "pinia";
import notificationService from "./lib/notificationService";

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia); 
app.mount("#app");

// 페이지 로드 시 기존 알림 로드
const initializeNotifications = async () => {
  try {
    await notificationService.fetchNotifications();
  } catch (error) {
    console.error('기존 알림 로드 실패:', error);
  }
};

// DOM이 로드된 후 알림 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeNotifications);
} else {
  initializeNotifications();
}
