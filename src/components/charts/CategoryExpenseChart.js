import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryExpenseChart = ({ data }) => {
  if (!data || !data.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">차트에 표시할 데이터가 없습니다.</p>
      </div>
    );
  }

  const colors = [
    'rgba(147, 51, 234, 0.8)',   // purple
    'rgba(59, 130, 246, 0.8)',   // blue
    'rgba(236, 72, 153, 0.8)',   // pink
    'rgba(6, 182, 212, 0.8)',    // cyan
    'rgba(251, 146, 60, 0.8)',   // orange
    'rgba(34, 197, 94, 0.8)',    // green
    'rgba(156, 163, 175, 0.8)',  // gray
  ];

  const chartData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        label: '카테고리별 지출',
        data: data.map(item => item.totalAmount),
        backgroundColor: colors.slice(0, data.length),
        borderColor: colors.slice(0, data.length).map(color => color.replace('0.8', '1')),
        borderWidth: 2,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = data[context.dataIndex].percentage;
            return `${label}: ${value.toLocaleString()}원 (${percentage.toFixed(1)}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default CategoryExpenseChart;
