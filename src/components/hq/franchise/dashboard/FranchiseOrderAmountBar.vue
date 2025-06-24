<template>
  <div>
    <Bar v-if="chartData && chartData.length" :data="barData" :options="barOptions" />
    <div v-else style="text-align:center; color:#888; padding:32px 0;">데이터가 없습니다.</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
} from 'chart.js'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title)

const props = defineProps({
  chartData: {
    type: Array,
    default: () => []
  }
})

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const PASTEL_COLORS = [
  '#A3CEF1', '#B6E2D3', '#F9F6C9', '#F7D6E0', '#D7C0F7', '#FFD6A5',
  '#B5EAD7', '#FFDAC1', '#E2F0CB', '#C7CEEA', '#FFB7B2', '#B5B9F7'
];

const formatYAxis = value => {
  if (value === 0) return '0원';
  if (value >= 1000) return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return value.toLocaleString() + '원';
};

const barData = computed(() => {
  const monthMap = {};
  props.chartData.forEach(item => {
    monthMap[item.month] = item.orderAmount;
  });
  // 가맹점 선택 시(월별 데이터)와 전체 통계(가맹점별) 구분
  const isMonthly = props.chartData.length && props.chartData[0].month !== undefined;
  return {
    labels: isMonthly
      ? MONTHS.map(m => `${m}월`)
      : (props.chartData.map(item => item.franchiseName || item.name || item.franchise || item.franchise_id || '가맹점')),
    datasets: [
      {
        label: '주문 금액',
        data: isMonthly
          ? MONTHS.map(m => monthMap[m] ?? null)
          : props.chartData.map(item => item.orderAmount),
        backgroundColor: isMonthly
          ? PASTEL_COLORS
          : PASTEL_COLORS.slice(0, props.chartData.length),
        borderRadius: 6
      }
    ]
  }
});

const barOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: formatYAxis
      },
      grid: { display: false }
    },
    x: {
      ticks: {
        autoSkip: false,
        maxRotation: 45,
        minRotation: 20
      },
      grid: { display: false }
    }
  }
}
</script> 