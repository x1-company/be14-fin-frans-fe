<template>
  <div style="display: flex; flex-direction: column; align-items: center;">
    <Doughnut
      v-if="filteredData.length"
      :key="chartKey"
      :data="doughnutData"
      :options="doughnutOptions"
      style="width: 320px; height: 320px; display: block;"
    />
    <div v-else style="text-align:center; color:#888; padding:32px 0;">
      데이터가 없습니다.
    </div>
    <div v-if="filteredData.length" class="custom-legend" style="margin-top: 18px; display: flex; flex-wrap: wrap; gap: 18px 32px; justify-content: center;">
      <div v-for="(label, idx) in doughnutData.labels" :key="idx" style="display: flex; align-items: center; min-width: 120px;">
        <span :style="{display:'inline-block', width:'18px', height:'18px', background: doughnutData.datasets[0].backgroundColor[idx], marginRight:'8px', borderRadius:'4px'}"></span>
        <span>{{ label }}</span>
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
  '#3366FF', '#FFB800', '#FF5C5C', '#00C49A', '#888888', '#FF7F50', '#8A2BE2', '#FF69B4', '#00BFFF', '#FFD700', '#32CD32', '#FF6347'
]

const doughnutData = computed(() => {
  // productName별로 합산
  const map = {};
  filteredData.value.forEach(item => {
    const key = item.productName || item.productId;
    if (!map[key]) map[key] = 0;
    map[key] += item.returnQuantity || 0;
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