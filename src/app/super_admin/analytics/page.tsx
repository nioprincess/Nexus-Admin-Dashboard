"use client";
import ChartWrapper from "@/components/ChartWrapper";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register all required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

export default function AnalyticComponent() {
  // 1. Application Usage Over Time (Line Chart)
  const [monthlyEngagement, setMonthlyEngagement] = useState<number[]>([]);
  const [learningProgress, setLearningProgress] = useState<number[]>([]);
  const [dailyLabels, setDailyLabels] = useState<string[]>([]);
  const [dailyCounts, setDailyCounts] = useState<number[]>([]);

  useEffect(() => {
    const fetchDailyActiveUsers = async () => {
      const snapshot = await getDocs(collection(db, "normal_users"));

      // initialize counts for last 7 days
      const today = new Date();
      const last7Days: { [date: string]: Set<string> } = {};

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toISOString().split("T")[0]; // "YYYY-MM-DD"
        last7Days[key] = new Set();
      }

      snapshot.forEach((doc) => {
        const user = doc.data();
        if (user.lastLogin) {
          const loginDate = user.lastLogin.toDate();
          const key = loginDate.toISOString().split("T")[0];
          if (last7Days[key]) {
            last7Days[key].add(doc.id); // use Set to avoid duplicates
          }
        }
      });

      setDailyLabels(Object.keys(last7Days));
      setDailyCounts(Object.values(last7Days).map((s) => s.size));
    };

    const fetchMonthlyEngagement = async () => {
      const usersSnapshot = await getDocs(collection(db, "normal_users"));
      const monthlyCounts: { [key: string]: number } = {
        Jan: 0,
        Feb: 0,
        Mar: 0,
        Apr: 0,
        May: 0,
        Jun: 0,
        Jul: 0,
        Aug: 0,
        Sep: 0,
        Oct: 0,
        Nov: 0,
        Dec: 0,
      };

      usersSnapshot.forEach((doc) => {
        const user = doc.data();
        if (user.lastLogin) {
          const loginDate = user.lastLogin.toDate(); // Firestore Timestamp → JS Date
          const month = loginDate.toLocaleString("default", { month: "short" });
          if (monthlyCounts[month] !== undefined) {
            monthlyCounts[month]++;
          }
        }
      });

      setMonthlyEngagement(Object.values(monthlyCounts));
    };

    const fetchLearningProgress = async () => {
      const progressSnapshot = await getDocs(
        collection(db, "learning_progress"),
      );
      const totals: { [key: string]: number[] } = {};

      progressSnapshot.forEach((doc) => {
        const progress = doc.data();
        if (progress.sdgId && progress.completionPercentage !== undefined) {
          if (!totals[progress.sdgId]) totals[progress.sdgId] = [];
          totals[progress.sdgId].push(progress.completionPercentage);
        }
      });

      // Calculate averages
      const averages = Object.keys(totals).map((sdgId) =>
        Math.round(
          totals[sdgId].reduce((a, b) => a + b, 0) / totals[sdgId].length,
        ),
      );

      setLearningProgress(averages);
    };

    fetchMonthlyEngagement();
    fetchDailyActiveUsers();
    fetchLearningProgress();
  }, []);

  const barData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "User Engagement",
        data: monthlyEngagement,
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    ],
  };

  const sdgData = {
    labels: [
      "No Poverty",
      "Zero Hunger",
      "Good Health",
      "Quality Education",
      "Gender Equality",
      "Clean Water",
      "Affordable Energy",
      "Decent Work",
      "Industry",
      "Reduced Inequality",
      "Sustainable Cities",
      "Responsible Consumption",
      "Climate Action",
      "Life Below Water",
      "Life on Land",
      "Peace & Justice",
      "Partnerships",
    ],
    datasets: [
      {
        label: "Users Engaged",
        data: [
          1250, 980, 1560, 2100, 1750, 890, 1430, 1120, 950, 1300, 680, 1540,
          720, 1100, 850, 980, 1200,
        ],
        backgroundColor: [
          "#E5243B",
          "#DDA63A",
          "#4C9F38",
          "#C5192D",
          "#FF3A21",
          "#26BDE2",
          "#FCC30B",
          "#A21942",
          "#FD6925",
          "#DD1367",
          "#FD9D24",
          "#BF8B2E",
          "#3F7E44",
          "#0A97D9",
          "#56C02B",
          "#00689D",
          "#19486A",
        ],
        borderWidth: 1,
        borderColor: "#fff",
      },
    ],
  };

  const sdgOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 9,
          },
          usePointStyle: true,
        },
      },
      title: {
        display: true,

        font: {
          size: 14,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0,
            );
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} users (${percentage}%)`;
          },
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Monthly Engagement",
        font: {
          size: 14,
        },
      },
    },
  };

  const usageData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Daily Active Users",
        data: dailyCounts,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // 2. User Feedback (Horizontal Bar)
  const feedbackData = {
    labels: [
      "Very Satisfied",
      "Satisfied",
      "Neutral",
      "Dissatisfied",
      "Very Dissatisfied",
    ],
    datasets: [
      {
        label: "Feedback Count",
        data: [320, 450, 120, 60, 30],
        backgroundColor: [
          "rgba(16, 185, 129, 0.7)",
          "rgba(101, 163, 13, 0.7)",
          "rgba(234, 179, 8, 0.7)",
          "rgba(245, 158, 11, 0.7)",
          "rgba(239, 68, 68, 0.7)",
        ],
        borderWidth: 0,
      },
    ],
  };

  // 3. Learning Progress (Radar Chart)
  const progressData = {
    labels: ["SDG 1", "SDG 4", "SDG 5", "SDG 7", "SDG 13", "SDG 16"],
    datasets: [
      {
        label: "Average Completion %",
        data: learningProgress,
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "rgba(99, 102, 241, 1)",
        pointBackgroundColor: "rgba(99, 102, 241, 1)",
        pointBorderColor: "#fff",
      },
    ],
  };

  // Chart options with proper callback definitions
  const chartOptions = {
    line: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Application Usage Growth",
          font: {
            size: 14,
          },
        },
        legend: {
          labels: {
            usePointStyle: true,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: any) => value,
          },
        },
        x: {
          ticks: {
            callback: (value: any) => value,
          },
        },
      },
    },
    bar: {
      indexAxis: "y" as const,
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "User Feedback Distribution",
          font: {
            size: 14,
          },
        },
        legend: { display: false },
      },
      scales: {
        x: {
          ticks: {
            callback: (value: any) => value,
          },
        },
      },
    },
    radar: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Learning Progress by SDG",
          font: {
            size: 14,
          },
        },
      },
      scales: {
        r: {
          angleLines: { display: true },
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: {
            callback: (value: any) => value,
          },
        },
      },
    },
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Nexus Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Application Usage */}
        {/* Bar Chart - Normal size */}
        <ChartWrapper
          type="bar"
          data={barData}
          options={{
            responsive: true,
            plugins: { title: { display: true, text: "Monthly Engagement" } },
          }}
          className="h-[400px]"
        />

        {/* Pie Chart - Scrollable container */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-800">SDG User Engagement</h3>
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
        <ChartWrapper
          type="line"
          data={usageData}
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: "Daily Active Users (Last 7 Days)",
              },
            },
            scales: {
              x: { title: { display: true, text: "Date" } },
              y: {
                title: { display: true, text: "Active Users" },
                beginAtZero: true,
              },
            },
          }}
          className="h-[300px]"
        />

        {/* User Feedback */}
        <ChartWrapper
          type="bar"
          data={feedbackData}
          options={chartOptions.bar}
          className="h-[300px]"
        />

        {/* Learning Progress */}
        {/* <ChartWrapper
          type="radar"
          data={progressData}
          options={chartOptions.radar}
          className="h-[350px]"
        /> */}
      </div>
    </div>
  );
}
