import React from 'react';

interface PieChartData {
  label: string;
  value: number;
}

interface PieChartProps {
  title: string;
  data: PieChartData[];
}

const COLORS = [
  '#ef4444', // red-500
  '#3b82f6', // blue-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#a855f7', // purple-500
  '#f97316', // orange-500
  '#14b8a6', // teal-500
];

export const PieChart: React.FC<PieChartProps> = ({ title, data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg h-full">
        <h3 className="text-xl font-semibold mb-4 text-center">{title}</h3>
        <div className="flex items-center justify-center h-48">
          <p className="text-slate-500 dark:text-slate-400">Sem dados para exibir.</p>
        </div>
      </div>
    );
  }

  let cumulativePercentage = 0;
  const gradientParts = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const color = COLORS[index % COLORS.length];
    const startAngle = cumulativePercentage;
    const endAngle = cumulativePercentage + percentage;
    cumulativePercentage = endAngle;
    return `${color} ${startAngle}% ${endAngle}%`;
  });

  const conicGradient = `conic-gradient(${gradientParts.join(', ')})`;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-center">{title}</h3>
      <div className="flex justify-center items-center my-4">
        <div
          className="w-48 h-48 rounded-full border-4 border-white dark:border-slate-800 shadow-inner"
          style={{ background: conicGradient }}
        />
      </div>
      <ul className="space-y-2 mt-4">
        {data.map((item, index) => (
          <li key={item.label} className="flex items-center text-sm">
            <span
              className="w-4 h-4 rounded-md mr-3"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="flex-1 text-slate-600 dark:text-slate-300">{item.label}</span>
            <span className="font-semibold">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};