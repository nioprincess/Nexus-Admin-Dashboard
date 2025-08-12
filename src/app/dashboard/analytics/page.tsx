'use client';
import ChartWrapper from "@/components/ChartWrapper";

export default function AnalyticComponent() {
    const barData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [
            {
                label: 'User Engagement',
                data: [67, 89, 54, 34, 98],
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
            },
        ],
    };

    const sdgData = {
        labels: [
            'No Poverty', 
            'Zero Hunger',
            'Good Health',
            'Quality Education',
            'Gender Equality',
            'Clean Water',
            'Affordable Energy',
            'Decent Work',
            'Industry',
            'Reduced Inequality',
            'Sustainable Cities',
            'Responsible Consumption',
            'Climate Action',
            'Life Below Water',
            'Life on Land',
            'Peace & Justice',
            'Partnerships'
        ],
        datasets: [
            {
                label: 'Users Engaged',
                data: [1250, 980, 1560, 2100, 1750, 890, 1430, 1120, 950, 1300, 680, 1540, 720, 1100, 850, 980, 1200],
                backgroundColor: [
                    '#E5243B', '#DDA63A', '#4C9F38', '#C5192D', '#FF3A21',
                    '#26BDE2', '#FCC30B', '#A21942', '#FD6925', '#DD1367',
                    '#FD9D24', '#BF8B2E', '#3F7E44', '#0A97D9', '#56C02B',
                    '#00689D', '#19486A'
                ],
                borderWidth: 1,
                borderColor: '#fff',
            }
        ]
    };

    const sdgOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    boxWidth: 12,
                    padding: 10,
                    font: {
                        size: 9
                    },
                    usePointStyle: true,
                },
            },
            title: {
                display: true,
                
                font: {
                    size: 14
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} users (${percentage}%)`;
                    }
                }
            }
        }
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Monthly Engagement',
                font: {
                    size: 14
                }
            }
        },
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Nexus Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bar Chart - Normal size */}
                <ChartWrapper 
                    type='bar' 
                    data={barData} 
                    options={barOptions}
                    className="h-[400px]"
                />
                
                {/* Pie Chart - Scrollable container */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-medium text-gray-800">
                            SDG User Engagement
                        </h3>
                    </div>
                    <div className="overflow-auto h-[400px] p-4">
                        <div className="min-w-[600px] min-h-[350px]">
                            <ChartWrapper 
                                type="pie" 
                                data={sdgData} 
                                options={sdgOptions}
                                className="h-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}