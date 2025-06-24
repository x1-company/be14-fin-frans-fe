import { ref } from "vue"

/**
 * @typedef {Object} Toast
 * @property {string} id
 * @property {string} message
 * @property {'success' | 'error' | 'warning' | 'info'} type
 * @property {number} [duration]
 */

const toasts = ref([])

export const useToast = () => {
  /**
   * 토스트 추가
   * @param {Omit<Toast, 'id'>} toast
   * @returns {string} 토스트 ID
   */
  const addToast = (toast) => {
    const id = Date.now().toString()
    const newToast = {
      id,
      duration: 4000,
      ...toast,
    }

    toasts.value.push(newToast)

    // 자동으로 토스트 제거
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }

  /**
   * 토스트 제거
   * @param {string} id
   */
  const removeToast = (id) => {
    const index = toasts.value.findIndex((toast) => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  /**
   * 성공 토스트
   * @param {string} message
   * @param {number} [duration]
   * @returns {string}
   */
  const success = (message, duration) => {
    return addToast({ message, type: "success", duration })
  }

  /**
   * 에러 토스트
   * @param {string} message
   * @param {number} [duration]
   * @returns {string}
   */
  const error = (message, duration) => {
    return addToast({ message, type: "error", duration })
  }

  /**
   * 경고 토스트
   * @param {string} message
   * @param {number} [duration]
   * @returns {string}
   */
  const warning = (message, duration) => {
    return addToast({ message, type: "warning", duration })
  }

  /**
   * 정보 토스트
   * @param {string} message
   * @param {number} [duration]
   * @returns {string}
   */
  const info = (message, duration) => {
    return addToast({ message, type: "info", duration })
  }

  return {
    toasts: toasts.value,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}
