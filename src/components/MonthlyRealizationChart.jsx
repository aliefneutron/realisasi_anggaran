import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const MonthlyRealizationChart = ({ data, title }) => {
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // Default empty data if not provided
    const targets = data?.monthly_targets || Array(12).fill(0);
    const realization = data?.monthly_realization || Array(12).fill(0);

    // Calculate cumulative for line chart (optional, but requested "monitoring" often implies cumulative)
    // But usually "per month" means discrete. Let's stick to discrete for now as per "tiap bulan".

    const chartData = {
        labels: months,
        datasets: [
            {
                type: 'line',
                label: 'Target (Anggaran Kas)',
                borderColor: 'rgb(53, 162, 235)',
                borderWidth: 2,
                fill: false,
                data: targets,
                tension: 0.3
            },
            {
                type: 'bar',
                label: 'Realisasi',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                data: realization,
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: title || 'Realisasi vs Target per Bulan',
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumSignificantDigits: 3 }).format(value);
                    }
                }
            }
        }
    };

    return <Chart type='bar' data={chartData} options={options} />;
};

export default MonthlyRealizationChart;
