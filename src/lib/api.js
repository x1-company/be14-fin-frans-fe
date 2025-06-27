"use client"

import axios from "axios"
import { useAuthStore } from "@/stores/auth"
import { useToast } from "@/composables/useToast"
import router from "@/router"

// 토스트 인스턴스 생성
const toast = useToast()

// 환경변수에서 API URL 가져오기
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // refreshToken HttpOnly 쿠키 전달을 위해 필요
})

// 요청 인터셉터: accessToken 자동 삽입
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()

    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 응답 인터셉터: 401 → 토큰 재발급 → 요청 재시도
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // accessToken 만료로 419인 경우 (무한 루프 방지 위해 재시도 여부 체크)
    if (error.response?.status === 419 && !originalRequest._retry) {
      originalRequest._retry = true
      const authStore = useAuthStore()

      try {
        const res = await axios.post(
          `${API_BASE_URL}/api/auth/reissue`,
          null, // refreshToken은 HttpOnly 쿠키에 있으므로 body 필요 없음
          { withCredentials: true },
        )

        const newAccessToken = res.headers["authorization"] || res.headers["Authorization"]
        if (!newAccessToken) {
          throw new Error("토큰 재발급 실패 - 응답에 토큰 없음")
        }

        authStore.setAccessToken(newAccessToken.replace("Bearer ", ""))

        // 원래 요청에 새 토큰 삽입 후 재시도
        originalRequest.headers.Authorization = newAccessToken
        return api(originalRequest)
      } catch (refreshError) {
        console.error("재발급 실패 → 로그인 페이지로 이동")
        // clearAccessToken 호출 대신 직접 토큰 클리어 (무한 루프 방지)
        authStore.accessToken = ""
        localStorage.removeItem("accessToken")

        // 토스트로 알림 표시
        toast.error("세션이 만료되었습니다. 다시 로그인해주세요.")

        router.push("/login")
        return Promise.reject(refreshError)
      }
    }

    const message = error.response?.data?.message || "요청이 실패했습니다. 잠시 후 다시 시도해주세요."

    // alert 대신 토스트 사용
    if (error.response?.status >= 500) {
      toast.error(message)
    } else if (error.response?.status >= 400) {
      toast.warning(message)
    } else {
      toast.error(message)
    }

    return Promise.reject(error)
  },
)

export default api
