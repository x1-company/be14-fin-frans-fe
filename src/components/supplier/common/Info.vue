<template>
    <div class="info-container">
        <div class="breadcrumb-container">
            <Breadcrumb :items="breadcrumbItems" />
        </div>

        <div class="info-content-wrapper">
            <div class="info-wrapper">
                <InfoHeader :title="title" :desc="desc" :tabs="tabs" :activeTab="activeTabSwitch"
                    @select-tab="updateTab" @update-breadcrumb="updateBreadcrumb" />

                <!-- 탭별 컨텐츠 영역 -->
                <div class="tab-content">
                    <RequestedOrderList v-if="activeTabSwitch === 0" />

                    <div v-if="activeTabSwitch === 1" class="content-section">
                        <h3>납품목록 컨텐츠</h3>
                        <p>납품목록 내용이 여기에 표시됩니다.</p>
                        <p>컴포넌트 생성 후 여기에 넣으면 됩니다</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Breadcrumb from "@/components/hq/common/Breadcrumb.vue"
import InfoHeader from './InfoHeader.vue'
import RequestedOrderList from '../deliveryList/RequestedOrderList.vue'

const props = defineProps({
    activeTab: String
})

const emit = defineEmits(['tab-change'])

const breadcrumbItems = ref(["HOME", "납품관리", "납품작성"])

const updateBreadcrumb = (newItems) => {
    breadcrumbItems.value = newItems
}

const tabs = [
    '납품작성',
    '납품목록'
]

const tabInfo = ref([
    { title: "납품작성", desc: "납품 정보를 등록할 수 있습니다." },
    { title: "납품목록", desc: "납품 완료된 목록을 볼 수 있습니다." },
])

const activeTabSwitch = ref(0)

// props.activeTab 값이 변경될 때 activeTabSwitch 업데이트
watch(
    () => props.activeTab,
    (newValue) => {
        const tabIndex = tabs.findIndex(tab => tab === newValue)
        if (tabIndex !== -1) {
            activeTabSwitch.value = tabIndex
        }
    },
    { immediate: true }
)

const title = computed(() => tabInfo.value[activeTabSwitch.value]?.title || '납품작성')
const desc = computed(() => tabInfo.value[activeTabSwitch.value]?.desc || '납품 정보를 등록할 수 있습니다.')

const updateTab = (newTabIndex) => {
    activeTabSwitch.value = newTabIndex
    const selectedTab = tabs[newTabIndex]
    emit('tab-change', selectedTab)
}
</script>

<style scoped>
.info-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #f8f9fa;
    overflow: hidden;
    /* 전체 컨테이너는 overflow 숨김 */
}

.breadcrumb-container {
    flex-shrink: 0;
    /* 브레드크럼은 고정 크기 */
    padding: 20px 30px;
    background: #f8f9fa;
}

.info-content-wrapper {
    flex: 1;
    overflow-y: auto;
    /* 여기서 스크롤 가능하게 */
    padding: 0 24px 24px 24px;
}

.info-wrapper {
    width: 100%;
    max-width: 1250px;
    margin: 0 auto;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 16px 0 rgba(64, 102, 250, 0.06);
    min-height: fit-content;
    /* 내용에 맞게 높이 조정 */
}

.tab-content {
    padding: 32px;
}

.content-section {
    background: #f8f9fa;
    padding: 24px;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.content-section h3 {
    margin: 0 0 16px 0;
    color: #212529;
    font-size: 1.25rem;
    font-weight: 600;
}

.content-section p {
    margin: 0;
    color: #6c757d;
    line-height: 1.5;
}
</style>