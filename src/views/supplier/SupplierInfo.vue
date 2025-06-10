<script setup>
import NavBar from "@/components/NavBar.vue";
import SideBar from "@/components/SideBar.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import InfoHeader from "@/components/InfoHeader.vue";
import InfoForm from "@/components/InfoForm.vue";
</script>

<template>
  <NavBar />
  <div class="layout">
    <SideBar />
    <main>
      <Breadcrumb :items="['HOME', '공급처관리', '공급처정보']" />

      <div class="info-group">
        <InfoHeader
          title="공급처 정보"
          desc="공급처의 기본 정보와 계약 현황을 확인하고 관리할 수 있습니다."
          :tabs="['공급처 정보', '납품관리', '발주관리']"
          :activeTab="0"
        />
        <InfoForm
          title="공급처 정보"
          :rows="[
            [
              { label: '공급처 코드', value: 'SU2025050001' },
              { label: '공급처 명', value: '하림' },
            ],
            [
              { label: '대표자 명', value: '정성찬' },
              { label: '사업자 등록 번호', value: '207-81-50264' },
            ],
            [
              {
                label: '거래여부',
                value: '거래 가능',
                type: 'select',
                options: ['거래 가능', '거래 불가'],
              },
              { label: '연락처', value: '01045389853' },
            ],
            [
              { label: '이메일', value: 'roy1228@naver.com' },
              { label: '계약 일자', value: '2025.05.27' },
            ],
            [
              { label: '주소', value: '서울 종로구 세종대로23길 7' },
              { label: '우편번호', value: '03183' },
            ],
          ]"
          :onEdit="() => alert('수정 클릭!')"
        />
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: row;
  height: calc(100vh - 48px);
}
main {
  flex: 1;
  padding-top: 16px;
  background: #fafbff;
}
.info-group {
  width: 1100px;
  max-width: 100%;
  margin: 10px auto 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0;
}
</style>