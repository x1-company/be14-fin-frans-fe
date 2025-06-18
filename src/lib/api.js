import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import router from "@/router";

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // refreshToken HttpOnly 쿠키 전달을 위해 필요
});

// 요청 인터셉터: accessToken 자동 삽입
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();

    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 → 토큰 재발급 → 요청 재시도
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // accessToken 만료로 401인 경우 (무한 루프 방지 위해 재시도 여부 체크)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const authStore = useAuthStore();

      try {
        const res = await axios.post(
          "http://localhost:8080/api/auth/reissue",
          null, // refreshToken은 HttpOnly 쿠키에 있으므로 body 필요 없음
          { withCredentials: true }
        );

        // const newAccessToken = res.headers['authorization']
        const newAccessToken =
          res.headers["authorization"] || res.headers["Authorization"];
        if (!newAccessToken)
          throw new Error("토큰 재발급 실패 - 응답에 토큰 없음");
        authStore.setAccessToken(newAccessToken.replace("Bearer ", ""));

        // 원래 요청에 새 토큰 삽입 후 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("재발급 실패 → 로그인 페이지로 이동");
        // clearAccessToken 호출 대신 직접 토큰 클리어 (무한 루프 방지)
        authStore.accessToken = "";
        localStorage.removeItem("accessToken");
        router.push("/login");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
