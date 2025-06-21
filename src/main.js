import { createApp } from "vue";
import App from "./App.vue";
import "./assets/fonts.css";
import "./assets/global.css";
import router from "./router";
import { createPinia } from "pinia";
import notificationService from "./lib/notificationService";
import { useAuthStore } from "./stores/auth";

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia); 
app.mount("#app");

// 페이지 로드 시 알림 및 SSE 초기화
const initializeNotifications = async () => {
  const authStore = useAuthStore();
  
  // 로그인된 상태인 경우에만 알림 초기화 및 SSE 연결
  if (authStore.accessToken) {
    try {
      console.log('기존 알림 로드 중...');
      await notificationService.fetchNotifications();
      console.log('기존 알림 로드 완료');
      
      console.log('SSE 연결 시도 중...');
      notificationService.connect(); // 비동기 연결, await 제거
      console.log('SSE 연결 요청 완료');
    } catch (error) {
      console.error('알림 초기화 실패:', error);
    }
  } else {
    console.log('로그인되지 않은 상태, 알림 초기화 건너뛰기');
  }
};

// 라우터가 준비된 후, 즉 모든 초기화가 완료된 후 알림 초기화 실행
router.isReady().then(() => {
  initializeNotifications();
});
