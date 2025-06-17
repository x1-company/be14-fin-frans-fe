<template>
  <div class="hq-user-register">
    <div class="register-form-container">
      <form @submit.prevent="handleSubmit" class="register-form">
        <div class="form-section">
          <h3 class="section-title">기본 정보</h3>
          <div class="form-grid">
            <!-- 프로필 사진 업로드 -->
            <div class="form-group profile-upload">
              <label class="form-label">프로필 사진</label>
              <div class="profile-upload-container">
                <div v-if="profileImagePreview" class="profile-preview">
                  <img :src="profileImagePreview" alt="프로필 미리보기" class="profile-image" />
                  <button type="button" @click="removeImage" class="remove-image-btn">
                    <X class="w-4 h-4" />
                  </button>
                </div>
                <div v-else class="profile-placeholder">
                  <Upload class="w-8 h-8 text-gray-400" />
                  <span class="upload-text">프로필 사진 업로드</span>
                </div>
                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  @change="handleImageSelect"
                  class="file-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="name" class="form-label">이름 <span class="required">*</span></label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                class="form-input"
                placeholder="이름을 입력하세요"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="email" class="form-label">이메일 <span class="required">*</span></label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                class="form-input"
                placeholder="이메일을 입력하세요"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="phone" class="form-label">전화번호 <span class="required">*</span></label>
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                class="form-input"
                placeholder="01012345678"
                required
              />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">조직 정보</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="department" class="form-label">부서 <span class="required">*</span></label>
              <select
                id="department"
                v-model="formData.departmentId"
                class="form-select"
                required
                @change="onDepartmentChange"
              >
                <option value="">부서를 선택하세요</option>
                <option
                  v-for="id in topLevelDepartmentIds"
                  :key="id"
                  :value="id"
                >
                  {{ getDepartmentNameById(id) }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="detailDepartment" class="form-label">상세 부서</label>
              <select
                id="detailDepartment"
                v-model="formData.detailDepartmentId"
                class="form-select"
                :disabled="!availableDetailDepartments.length"
              >
                <option value="">선택 안 함</option>
                <option
                  v-for="dept in availableDetailDepartments"
                  :key="dept.id"
                  :value="dept.id"
                >
                  {{ dept.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="position" class="form-label">직급 <span class="required">*</span></label>
              <select
                id="position"
                v-model="formData.positionId"
                class="form-select"
                required
              >
                <option value="">직급을 선택하세요</option>
                <option
                  v-for="(name, id) in positionMap"
                  :key="id"
                  :value="id"
                >
                  {{ name }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="duty" class="form-label">직책 <span class="required">*</span></label>
              <select
                id="duty"
                v-model="formData.dutyId"
                class="form-select"
                required
              >
                <option value="">직책을 선택하세요</option>
                <option
                  v-for="(name, id) in dutyMap"
                  :key="id"
                  :value="id"
                >
                  {{ name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="button"
            @click="resetForm"
            class="btn btn-secondary"
            :disabled="isLoading"
          >
            초기화
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isLoading"
          >
            <LoaderIcon v-if="isLoading" class="w-4 h-4 animate-spin" />
            <span v-if="isLoading">등록 중...</span>
            <span v-else>계정 등록</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { LoaderIcon, Upload, X } from 'lucide-vue-next'
import api from '@/lib/api'
import { topLevelDepartmentIds, positionMap, dutyMap, getDepartmentNameById, departmentMap } from '@/enums/hqEnums'

// Component state
const isLoading = ref(false)
const profileImage = ref(null)
const profileImagePreview = ref(null)

const formData = reactive({
  name: '',
  email: '',
  phone: '',
  userType: 'HQ',
  departmentId: '',
  detailDepartmentId: '',
  positionId: '',
  dutyId: ''
})

// Computed properties
const availableDetailDepartments = computed(() => {
  if (!formData.departmentId) return []
  
  const selectedDept = departmentMap.find(dept => dept.id === parseInt(formData.departmentId))
  return selectedDept ? selectedDept.children : []
})

// Event handlers
const onDepartmentChange = () => {
  // Reset detail department when main department changes
  formData.detailDepartmentId = ''
}

const handleImageSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    profileImage.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      profileImagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  profileImage.value = null
  profileImagePreview.value = null
  const fileInput = document.getElementById('profileImage')
  if (fileInput) fileInput.value = ''
}

const resetForm = () => {
  Object.assign(formData, {
    name: '',
    email: '',
    phone: '',
    userType: 'HQ',
    departmentId: '',
    detailDepartmentId: '',
    positionId: '',
    dutyId: ''
  })
  removeImage()
}

const handleSubmit = async () => {
  if (isLoading.value) return

  isLoading.value = true
  let profileUrl = null
  try {
    
    // 프로필 이미지가 있는 경우 업로드
    if (profileImage.value) {
      const uploadFormData = new FormData()
      uploadFormData.append("files", profileImage.value, formData.name + '-profile.png')
      uploadFormData.append("type", "profile")

      // 파일 업로드 요청
      const uploadRes = await api.post('/api/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // DB에 저장할 url 추출
      const urls = uploadRes.data
      profileUrl = urls.find(url => url.startsWith('https://'))
      if (!profileUrl) {
        throw new Error('유효한 프로필 URL을 찾을 수 없습니다.')
      }
    }

    // 계정 등록 요청 데이터 준비
    const requestData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      userType: formData.userType,
      departmentId: parseInt(formData.detailDepartmentId || formData.departmentId),
      positionId: parseInt(formData.positionId),
      dutyId: parseInt(formData.dutyId)
    }

    if (profileUrl) {
      requestData.profileUrl = profileUrl
    }

    await api.post('/api/hq/user/hq', requestData)

    alert('계정이 성공적으로 등록되었습니다.')
    resetForm()
  } catch (error) {
    console.error('계정 등록 실패:', error)
    await api.delete('/api/upload', {
      params: {
        type: 'profile',
        fileName: profileUrl.split('/').pop()
      }
    })
    alert('계정 등록에 실패했습니다. 다시 시도해주세요.')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.hq-user-register {
  background: white;
  border-radius: 0;
  overflow: hidden;
  margin: 0 24px;
}

.register-form-container {
  padding: 32px;
}

.register-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 32px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  padding-bottom: 8px;
  border-bottom: 2px solid #4066fa;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #dc3545;
}

.form-input,
.form-select {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #4066fa;
  box-shadow: 0 0 0 3px rgba(64, 102, 250, 0.1);
}

.form-select {
  background: white;
  cursor: pointer;
}

.form-select:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.btn-secondary:hover:not(:disabled) {
  background: #e9ecef;
}

.btn-primary {
  background: #4066fa;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3557e8;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.profile-upload {
  grid-column: 1 / -1;
}

.profile-upload-container {
  position: relative;
  width: 120px;
  height: 120px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.profile-upload-container:hover {
  border-color: #4066fa;
}

.profile-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
}

.upload-text {
  font-size: 12px;
  color: #6b7280;
  text-align: center;
}

.profile-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-image-btn:hover {
  background: #c82333;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
</style>