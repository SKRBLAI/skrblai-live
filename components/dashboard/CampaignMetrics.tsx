'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function CampaignMetrics() {
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Leads Captured',
        data: [12, 19, 3, 5, 2, 3, 15],
        borderColor: '#1E90FF',
        backgroundColor: '#1E90FF20',
      },
      {
        label: 'Post Engagement',
        data: [45, 60, 30, 50, 40, 35, 55],
        borderColor: '#30D5C8',
        backgroundColor: '#30D5C820',
      },
      {
        label: 'Ad CTR',
        data: [2.5, 3.1, 1.8, 2.9, 2.2, 1.5, 3.5],
        borderColor: '#FF6384',
        backgroundColor: '#FF638420',
      },
    ],
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Campaign Metrics</h2>
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-deep-navy/80 p-6 rounded-xl border border-electric-blue/20">
          <Line data={data} />
        </div>
      </div>
    </div>
  );
} 