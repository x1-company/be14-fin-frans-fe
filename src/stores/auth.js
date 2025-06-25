import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";
import {
  getDepartmentNameById,
  departmentMap,
  dutyMap,
  positionMap,
} from "@/enums/hqEnums";
import notificationService from "@/lib/notificationService";
import { useNotificationStore } from "@/stores/notification";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: localStorage.getItem("accessToken") || "",
  }),
  getters: {
    decodedToken(state) {
      try {
        return state.accessToken ? jwtDecode(state.accessToken) : null;
      } catch (e) {
        return null;
      }
    },
    userId() {
      return this.decodedToken?.userId || null;
    },
    userName() {
      return this.decodedToken?.userName || "";
    },
    userProfileUrl() {
      return this.decodedToken?.userProfileUrl || "";
    },
    userSignUrl() {
      return this.decodedToken?.userSignUrl || "";
    },
    userEmail() {
      return this.decodedToken?.userEmail || "";
    },
    departmentId() {
      return this.decodedToken?.departmentId || null;
    },
    departmentName() {
      return getDepartmentNameById(this.departmentId);
    },
    dutyId() {
      return this.decodedToken?.dutyId || null;
    },
    dutyName() {
      return dutyMap[this.dutyId] || "";
    },
    positionId() {
      return this.decodedToken?.positionId || null;
    },
    positionName() {
      return positionMap[this.positionId] || "";
    },
    franchiseId() {
      return this.decodedToken?.franchiseId || null;
    },
    franchiseName() {
      return this.decodedToken?.franchiseName || "";
    },
    supplierId() {
      return this.decodedToken?.supplierId || null;
    },
    supplierName() {
      return this.decodedToken?.supplierName || "";
    },
  },
  actions: {
    setAccessToken(token) {
      this.accessToken = token;

      // 개발 편의를 위한 로컬 스토리지 저장
      localStorage.setItem("accessToken", token);
    },
    async clearAccessToken() {
      // 로그아웃 시 서버 SSE emitter/캐시 명시적 정리
      try {
        const api = (await import('@/lib/api')).default;
        await api.delete('/api/notification/disconnect');
        console.log('서버 SSE disconnect 호출 완료');
      } catch (e) {
        // 이미 세션이 만료됐거나 서버 연결이 끊겼을 수도 있으니 무시
        console.warn('서버 SSE disconnect 실패(무시):', e);
      }
      // 기존 SSE 연결 정리
      try {
        await notificationService.cleanup();
        console.log('SSE 연결 정리 완료');
      } catch (error) {
        console.error('SSE 연결 정리 실패:', error);
      }

      this.accessToken = "";

      // 사용자 계정에 귀속되지 않는 accessToken과 팝업 기록만 지웁니다.
      // 사용자별 삭제 기록(localStorage)은 보존됩니다.
      localStorage.removeItem("accessToken");

      // 알림 스토어도 명시적으로 리셋
      const notificationStore = useNotificationStore();
      notificationStore.reset();
      sessionStorage.clear();
    },
    forceLogoutAndClear() {
      console.warn("--- 강제 로그아웃 및 전체 데이터 클리어 실행 ---");

      // 이 함수는 모든 localStorage와 sessionStorage를 지우므로,
      // 사용자별 삭제 기록까지 완벽하게 초기화합니다.
      const notificationService = require("@/lib/notificationService").default;
      notificationService.disconnect();

      localStorage.clear();
      sessionStorage.clear();

      window.location.href = "/login";
    },
  },
});
