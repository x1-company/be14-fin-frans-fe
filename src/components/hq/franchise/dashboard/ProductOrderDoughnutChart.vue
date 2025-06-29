<template>
  <div style="display: flex; flex-direction: column; align-items: center;">
    <Doughnut
      v-if="filteredData.length"
      :key="chartKey"
      :data="doughnutData"
      :options="doughnutOptions"
      style="width: 220px; height: 220px; display: block;"
    />
    <div v-else style="text-align:center; color:#888; padding:32px 0;">
      데이터가 없습니다.
    </div>
    <div v-if="filteredData.length" class="custom-legend" style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 12px 20px; justify-content: center;">
      <div v-for="(label, idx) in doughnutData.labels" :key="idx" style="display: flex; align-items: center; min-width: 84px;">
        <span :style="{display:'inline-block', width:'13px', height:'13px', background: doughnutData.datasets[0].backgroundColor[idx], marginRight:'6px', borderRadius:'3px'}"></span>
        <span style="min-width: 84px;">{{ label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js'

Chart.register(ArcElement, Tooltip, Legend, Title)

const props = defineProps({
  chartData: {
    type: Array,
    default: () => []
  },
  month: {
    type: Number,
    default: new Date().getMonth() + 1
  },
  isFranchiseSelected: {
    type: Boolean,
    default: false
  },
  selectedFranchiseId: {
    type: [String, Number],
    default: null
  }
})

const filteredData = computed(() =>
  props.chartData.filter(item => item.month === props.month)
)

const colorPalette = [
  '#3867F4', // 진한 파랑
  '#FF8855', // 연한 주황
  '#EAF0FA', // 아주 연한 회색/블루
  '#A259F7', // 보라
  '#FFC145', // 머스타드/노랑
  '#F7B2B7', // 연핑크 (보조)
  '#B5EAD7', // 민트 (보조)
  '#B2C7DA', // 연블루그레이 (보조)
  '#F6EAC2', // 연노랑 (보조)
  '#C3C8E6'  // 연보라 (보조)
]

const doughnutData = computed(() => {
  // productName별로 합산
  const map = {};
  filteredData.value.forEach(item => {
    const key = item.productName || item.productId;
    if (!map[key]) map[key] = 0;
    map[key] += item.orderQuantity || 0;
  });
  // 정렬 및 상위 10개 + 기타
  const sorted = Object.entries(map)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
  const top10 = sorted.slice(0, 10);
  const others = sorted.slice(10);
  let labels = top10.map(item => item.label);
  let data = top10.map(item => item.value);
  if (others.length > 0) {
    labels.push('기타');
    data.push(others.reduce((sum, item) => sum + item.value, 0));
  }
  return {
    labels,
    datasets: [{
      data,
      backgroundColor: colorPalette.slice(0, labels.length),
      borderWidth: 2
    }]
  };
})

const doughnutOptions = {
  responsive: false,
  maintainAspectRatio: false,
  cutout: '70%',
  layout: { padding: 0 },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const value = context.raw
          return `${context.label}: ${value}건`
        }
      }
    },
    title: {
      display: false
    }
  },
  animation: {
    animateRotate: true,
    duration: 1200
  }
}

const chartKey = computed(() =>
  `${props.selectedFranchiseId}-${props.month}`
)
</script>

<style scoped>
.custom-legend {
  font-size: 12px;
}
</style> 