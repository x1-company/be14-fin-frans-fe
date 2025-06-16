<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- 헤더는 고정 -->
      <div class="modal-header">
        <h2>서명 관리</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>
      
      <!-- 바디만 스크롤 -->
      <div class="modal-body">
        <!-- 현재 서명 표시 -->
        <div class="current-signature">
          <h3>현재 서명</h3>
          <div class="signature-display">
            <img 
              v-if="currentSignature" 
              :src="currentSignature" 
              alt="현재 서명" 
              class="signature-img"
            />
            <div v-else class="no-signature">
              등록된 서명이 없습니다
            </div>
          </div>
        </div>

        <!-- 탭 메뉴 -->
        <div class="tab-menu">
          <button 
            :class="['tab-btn', { active: activeTab === 'draw' }]"
            @click="activeTab = 'draw'"
          >
            직접 그리기
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'upload' }]"
            @click="activeTab = 'upload'"
          >
            이미지 업로드
          </button>
        </div>

        <!-- 직접 그리기 탭 -->
        <div v-if="activeTab === 'draw'" class="draw-section">
          <div class="canvas-container">
            <canvas
              ref="canvasRef"
              width="400"
              height="200"
              class="signature-canvas"
              @mousedown="startDrawing"
              @mousemove="draw"
              @mouseup="stopDrawing"
              @mouseleave="stopDrawing"
              @touchstart="startDrawing"
              @touchmove="draw"
              @touchend="stopDrawing"
            ></canvas>
          </div>
          <div class="canvas-controls">
            <button class="clear-btn" @click="clearCanvas">지우기</button>
            <button class="save-btn" @click="saveDrawnSignature">저장</button>
          </div>
        </div>

        <!-- 이미지 업로드 탭 -->
        <div v-if="activeTab === 'upload'" class="upload-section">
          <!-- 업로드 영역 (이미지가 없을 때만 표시) -->
          <div v-if="!uploadedImage">
            <div class="upload-area" @click="triggerFileInput">
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                @change="handleFileUpload"
                style="display: none"
              />
              <div class="upload-content">
                <div class="upload-icon">📁</div>
                <p>클릭하여 이미지를 선택하세요</p>
                <p class="upload-hint">PNG, JPG, GIF 파일 지원</p>
              </div>
            </div>
          </div>
          
          <!-- 업로드된 이미지 미리보기 -->
          <div v-if="uploadedImage" class="preview-section">
            <div class="preview-header">
              <h4>미리보기</h4>
              <button class="remove-btn" @click="removeUploadedImage" title="이미지 제거">
                ×
              </button>
            </div>
            <img :src="uploadedImage" alt="업로드된 서명" class="preview-img" />
            <div class="preview-controls">
              <button class="save-btn" @click="saveUploadedSignature">저장</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  currentSignature: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'save'])

const activeTab = ref('draw')
const canvasRef = ref(null)
const fileInputRef = ref(null)
const uploadedImage = ref('')

const isDrawing = ref(false)
const ctx = ref(null)

watch(canvasRef, (newCanvas) => {
  if (newCanvas) {
    initializeCanvas()
  }
})

// canvas 초기화 함수
const initializeCanvas = () => {
  if (canvasRef.value) {
    const canvas = canvasRef.value
    const rect = canvas.getBoundingClientRect()

    // 렌더링 크기와 동일하게 실제 픽셀 크기 설정
    canvas.width = rect.width
    canvas.height = rect.height

    ctx.value = canvas.getContext('2d')
    if (ctx.value) {
      ctx.value.strokeStyle = '#000'
      ctx.value.lineWidth = 2
      ctx.value.lineCap = 'round'
      clearCanvas()
    }
  }
}

// 모달 열릴 때 canvas 초기화
watch(() => props.isVisible, async (visible) => {
  if (visible) {
    await nextTick()
    initializeCanvas()
  }
})

// 마우스 or 터치 좌표 가져오기
const getMousePos = (e) => {
  const rect = canvasRef.value.getBoundingClientRect()
  let clientX, clientY
  if (e.touches) {
    clientX = e.touches[0].clientX
    clientY = e.touches[0].clientY
  } else {
    clientX = e.clientX
    clientY = e.clientY
  }

  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  }
}

const startDrawing = (e) => {
  e.preventDefault()
  isDrawing.value = true
  const pos = getMousePos(e)
  ctx.value.beginPath()
  ctx.value.moveTo(pos.x, pos.y)
}

const draw = (e) => {
  if (!isDrawing.value || !ctx.value) return
  e.preventDefault()
  const pos = getMousePos(e)
  ctx.value.lineTo(pos.x, pos.y)
  ctx.value.stroke()
}

const stopDrawing = () => {
  isDrawing.value = false
}

const clearCanvas = () => {
  if (ctx.value && canvasRef.value) {
    ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  }
}

const saveDrawnSignature = () => {
  if (canvasRef.value) {
    const dataURL = canvasRef.value.toDataURL('image/png')
    emit('save', dataURL)
    closeModal()
  }
}

// 파일 업로드 관련
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImage.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 업로드된 이미지 제거 함수 추가
const removeUploadedImage = () => {
  uploadedImage.value = ''
  // 파일 input도 초기화
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const saveUploadedSignature = () => {
  if (uploadedImage.value) {
    emit('save', uploadedImage.value)
    closeModal()
  }
}

const closeModal = () => {
  uploadedImage.value = ''
  clearCanvas()
  // 파일 input 초기화
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 중요: 전체 모달에서 overflow 숨김 */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0; /* 헤더 크기 고정 */
  background: white;
  border-radius: 12px 12px 0 0; /* 상단 모서리만 둥글게 */
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #6b7280;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #374151;
}

.modal-body {
  padding: 24px;
  overflow-y: auto; /* 바디만 스크롤 */
  flex: 1; /* 남은 공간 모두 사용 */
}

/* 스크롤바 스타일링 (선택사항) */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.current-signature {
  margin-bottom: 24px;
}

.current-signature h3 {
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.signature-display {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.signature-img {
  max-width: 100%;
  max-height: 80px;
  object-fit: contain;
}

.no-signature {
  color: #6b7280;
  font-style: italic;
}

.tab-menu {
  display: flex;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
  background: none;
  border: none;
  padding: 12px 24px;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #4066fa;
  border-bottom-color: #4066fa;
  font-weight: 500;
}

.tab-btn:hover {
  color: #374151;
}

.canvas-container {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.signature-canvas {
  display: block;
  cursor: crosshair;
  background: white;
  width: 100%;
}

.canvas-controls {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.clear-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #e5e7eb;
}

.save-btn {
  background: #4066fa;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.save-btn:hover {
  background: #3b5cf0;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;
}

.upload-area:hover {
  border-color: #4066fa;
  background: #f8faff;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.upload-content p {
  margin: 0;
  color: #374151;
}

.upload-hint {
  font-size: 12px !important;
  color: #6b7280 !important;
}

.preview-section {
  text-align: center;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preview-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
}

.remove-btn {
  background: #ef4444;
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.preview-img {
  max-width: 100%;
  max-height: 150px;
  object-fit: contain;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 16px;
}

.preview-controls {
  display: flex;
  justify-content: center;
}
</style>