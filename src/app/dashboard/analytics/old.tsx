"use client";
import ChartWrapper from "@/components/ChartWrapper";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
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
import {
  FiUsers,
  FiActivity,
  FiAward,
  FiTrendingUp,
  FiBook,
  FiCheckCircle,
} from "react-icons/fi";

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
  Legend
);

export default function AnalyticComponent() {
  const [monthlyEngagement, setMonthlyEngagement] = useState<number[]>([]);
  const [dailyLabels, setDailyLabels] = useState<string[]>([]);
  const [dailyCounts, setDailyCounts] = useState<number[]>([]);
  const [sdgEngagement, setSdgEngagement] = useState<number[]>([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalLessons: 0,
    totalResponses: 0,
    completionRate: 0,
    newUsersThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Fetch users data with safe timestamp handling
        const usersSnapshot = await getDocs(
          query(collection(db, "normal_users"), where("role", "==", "user"))
        );
        const users = usersSnapshot.docs.map((doc) => {
          const data = doc.data();
          let lastLogin = null;
          let createdAt = null;

          // Safe timestamp conversion
          if (data.lastLogin && typeof data.lastLogin.toDate === "function") {
            lastLogin = data.lastLogin.toDate();
          } else if (data.lastLogin instanceof Date) {
            lastLogin = data.lastLogin;
          }

          if (data.createdAt && typeof data.createdAt.toDate === "function") {
            createdAt = data.createdAt.toDate();
          } else if (data.createdAt instanceof Date) {
            createdAt = data.createdAt;
          }

          return {
            id: doc.id,
            ...data,
            lastLogin,
            createdAt,
          };
        });

        // Fetch lessons data
        const lessonsSnapshot = await getDocs(collection(db, "lessons"));
        const lessons = lessonsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch answers data
        const answersSnapshot = await getDocs(collection(db, "answers"));
        const answers = answersSnapshot.docs.map((doc) => doc.data());

        // Calculate metrics
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const totalUsers = users.length;
        const newUsersThisWeek = users.filter(
          (user) => user.createdAt && user.createdAt >= oneWeekAgo
        ).length;

        const activeUsers = users.filter(
          (user) => user.lastLogin && user.lastLogin >= oneDayAgo
        ).length;

        const totalLessons = lessons.length;
        const totalResponses = answers.length;

        // Calculate completion rate
        const usersWithResponses = new Set(
          answers.map((answer) => answer.userId)
        );
        const completionRate =
          totalUsers > 0 ? (usersWithResponses.size / totalUsers) * 100 : 0;

        setMetrics({
          totalUsers,
          activeUsers,
          totalLessons,
          totalResponses,
          completionRate: Math.round(completionRate),
          newUsersThisWeek,
        });

        // Fetch chart data
        // await fetchDailyActiveUsers(users);
        await fetchMonthlyEngagement(users);
        await fetchSdgEngagement(lessons);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // const fetchDailyActiveUsers = async (users: any[]) => {
  //   const today = new Date();
  //   const last7Days: { [date: string]: Set<string> } = {};

  //   for (let i = 6; i >= 0; i--) {
  //     const d = new Date(today);
  //     d.setDate(today.getDate() - i);
  //     const key = d.toLocaleDateString("en-US", {
  //       month: "short",
  //       day: "numeric",
  //     });
  //     last7Days[key] = new Set();
  //   }

  //   users.forEach((user) => {
  //     if (user.lastLogin) {
  //       const loginDate = user.lastLogin;
  //       const key = loginDate.toLocaleDateString("en-US", {
  //         month: "short",
  //         day: "numeric",
  //       });
  //       if (last7Days[key]) {
  //         last7Days[key].add(user.id);
  //       }
  //     }
  //   });

  //   setDailyLabels(Object.keys(last7Days));
  //   setDailyCounts(Object.values(last7Days).map((s) => s.size));
  // };

  const fetchMonthlyEngagement = async (users: any[]) => {
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

    users.forEach((user) => {
      if (user.lastLogin) {
        const month = user.lastLogin.toLocaleString("default", {
          month: "short",
        });
        if (monthlyCounts[month] !== undefined) {
          monthlyCounts[month]++;
        }
      }
    });

    setMonthlyEngagement(Object.values(monthlyCounts));
  };

  const fetchSdgEngagement = async (lessons: any[]) => {
    // Use sample data for SDG engagement as in original design
    const sampleSdgData = [
      1250, 980, 1560, 2100, 1750, 890, 1430, 1120, 950, 1300, 680, 1540, 720,
      1100, 850, 980, 1200,
    ];
    setSdgEngagement(sampleSdgData);
  };

  // Chart Data Definitions - Keeping Original Design
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
        data: sdgEngagement,
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
              0
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

  // const usageData = {
  //   labels: dailyLabels,
  //   datasets: [
  //     {
  //       label: "Daily Active Users",
  //       data: dailyCounts,
  //       borderColor: "rgb(59, 130, 246)",
  //       backgroundColor: "rgba(59, 130, 246, 0.1)",
  //       tension: 0.3,
  //       fill: true,
  //     },
  //   ],
  // };

  // User Feedback Data (keeping original design)
  // const feedbackData = {
  //   labels: [
  //     "Very Satisfied",
  //     "Satisfied",
  //     "Neutral",
  //     "Dissatisfied",
  //     "Very Dissatisfied",
  //   ],
  //   datasets: [
  //     {
  //       label: "Feedback Count",
  //       data: [320, 450, 120, 60, 30],
  //       backgroundColor: [
  //         "rgba(16, 185, 129, 0.7)",
  //         "rgba(101, 163, 13, 0.7)",
  //         "rgba(234, 179, 8, 0.7)",
  //         "rgba(245, 158, 11, 0.7)",
  //         "rgba(239, 68, 68, 0.7)",
  //       ],
  //       borderWidth: 0,
  //     },
  //   ],
  // };

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Nexus Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Engagement Chart - Original Design */}
        <ChartWrapper
          type="bar"
          data={barData}
          options={barOptions}
          className="h-[400px]"
        />

        {/* SDG Engagement Chart - Original Design with Scroll */}
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

        {/* Daily Active Users Chart - Original Design */}
        {/* <ChartWrapper
          type="line"
          data={usageData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: "Daily Active Users (Last 7 Days)",
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
          }}
          className="h-[300px]"
        /> */}

        {/* User Feedback Chart - Original Design
        <ChartWrapper
          type="bar"
          data={feedbackData}
          options={{
            indexAxis: "y" as const,
            responsive: true,
            maintainAspectRatio: false,
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
          }}
          className="h-[300px]"
        /> */}
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative";
}

const MetricCard = ({
  icon,
  title,
  value,
  change,
  changeType,
}: MetricCardProps) => (
  <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
    <div className="flex items-center justify-between mb-2">
      <div className="p-2 rounded-lg bg-gray-50 text-gray-600">{icon}</div>
      <span
        className={`text-xs font-medium ${
          changeType === "positive" ? "text-green-600" : "text-red-600"
        }`}
      >
        {change}
      </span>
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);
