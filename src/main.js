import { createApp } from "vue";
import App from "./App.vue";
import "./assets/fonts.css";
import "./assets/global.css";
import router from "./router";
import { createPinia } from "pinia";
import notificationService from "./lib/notificationService";
import { useAuthStore } from "./stores/auth";
import { useNotificationStore } from "./stores/notification";
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);
app.mount("#app");

// 페이지 로드 시 알림 및 SSE 초기화
const initializeNotifications = async () => {
  const authStore = useAuthStore();

  // 토큰이 있고 유효한 경우에만 알림 초기화 및 SSE 연결
  if (authStore.accessToken && authStore.decodedToken) {
    try {
      console.log("기존 알림 로드 중...");
      await notificationService.fetchNotifications();
      console.log("기존 알림 로드 완료");

      console.log("SSE 연결 시도 중...");
      notificationService.connect(); // 비동기 연결, await 제거
      console.log("SSE 연결 요청 완료");
    } catch (error) {
      console.error("알림 초기화 실패:", error);
      // 초기화 실패 시 토큰 정리
      if (error.response && error.response.status === 401) {
        console.log("토큰이 만료되어 정리합니다.");
        authStore.clearAccessToken();
      }
    }
  } else {
    console.log("로그인되지 않은 상태, 알림 초기화 건너뛰기");
    // 로그인되지 않은 상태에서는 알림 스토어 초기화
    const notificationStore = useNotificationStore();
    notificationStore.reset();

    // 유효하지 않은 토큰이 있다면 정리
    if (authStore.accessToken && !authStore.decodedToken) {
      console.log("유효하지 않은 토큰 정리 중...");
      authStore.clearAccessToken();
    }
  }
};

// 라우터가 준비된 후, 즉 모든 초기화가 완료된 후 알림 초기화 실행
router.isReady().then(() => {
  const authStore = useAuthStore();

  if (authStore.accessToken && authStore.decodedToken) {
    initializeNotifications(); // ✅ 로그인 상태에서만
  } else {
    console.log("초기 알림 초기화 생략: 로그인 상태가 아님");
  }
});

// 브라우저 탭 닫기/새로고침 시 SSE 연결 해제
window.addEventListener('beforeunload', () => {
  notificationService.disconnect();
});
