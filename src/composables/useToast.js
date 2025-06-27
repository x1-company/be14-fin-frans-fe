import { ref } from "vue"

/**
 * @typedef {Object} Toast
 * @property {string} id
 * @property {string} message
 * @property {'success' | 'error' | 'warning' | 'info'} type
 * @property {number} [duration]
 */

const toasts = ref([])

const addToast = (toast) => {
  const id = Date.now().toString()
  const newToast = {
    id,
    ...toast,
    duration: toast.duration ?? 4000,
  }

  toasts.value.push(newToast)

  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
  }

  return id
}

const removeToast = (id) => {
  const index = toasts.value.findIndex((toast) => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

const success = (message, duration) => {
  return addToast({ message, type: "success", duration })
}

const error = (message, duration) => {
  return addToast({ message, type: "error", duration })
}

const warning = (message, duration) => {
  return addToast({ message, type: "warning", duration })
}

const info = (message, duration) => {
  return addToast({ message, type: "info", duration })
}

// ✅ 싱글턴으로 export
export const useToast = () => {
  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}
