// components/ChartWrapper.tsx
'use client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  BubbleController,
  PolarAreaController
} from 'chart.js';
import {
  Bar,
  Line,
  Radar,
  Pie,
  Doughnut,
  Bubble,
  PolarArea
} from 'react-chartjs-2';

// Register all ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  BubbleController,
  PolarAreaController
);

type ChartProps = {
  type: 'bar' | 'line' | 'radar' | 'pie' | 'doughnut' | 'bubble' | 'polarArea';
  data: any;
  options?: any;
  className?: string;
  title?: string;
  showBorder?: boolean;
};

export default function ChartWrapper({
  type,
  data,
  options,
  className = '',
  title,
  showBorder = true
}: ChartProps) {
  const chartComponents = {
    bar: Bar,
    line: Line,
    radar: Radar,
    pie: Pie,
    doughnut: Doughnut,
    bubble: Bubble,
    polarArea: PolarArea
  };

  const ChartComponent = chartComponents[type];

  // Default options merged with custom options
  const mergedOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 20
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        padding: 12,
        usePointStyle: true
      }
    },
    ...options
  };

  return (
    <div className={`bg-white rounded-lg shadow ${showBorder ? 'border border-gray-100' : ''} ${className}`}>
      <div className="p-4 h-full">
        <div className="h-full min-h-[300px]">
          <ChartComponent 
            data={data} 
            options={mergedOptions} 
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}