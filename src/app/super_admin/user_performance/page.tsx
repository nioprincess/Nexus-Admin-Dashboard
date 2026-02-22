"use client";
import {
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiBarChart2,
  FiDownload,
  FiTarget,
  FiActivity,
  FiLoader,
  FiBook,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import { useState, useEffect } from "react";
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
  RadialLinearScale,
  Filler,
  ArcElement,
} from "chart.js";
import { Line, Bar, Radar, Doughnut, Pie } from "react-chartjs-2";
import { db } from "@/lib/firebase/firebaseConfig";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler,
  ArcElement
);

interface UserData {
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
}

interface LessonData {
  id: string;
  title: string;
  sdgId: string;
  accessCount: number;
  respondedCount: number;
  goodResponseCount: number;
  partialResponseCount: number;
  poorResponseCount: number;
  read5minCount: number;
  lastUpdated: string;
}

interface DashboardData {
  userData: UserData;
  lessonsData: LessonData[];
  loading: boolean;
}

const UserPerformanceDashboard = () => {
  const [data, setData] = useState<DashboardData>({
    userData: { totalUsers: 0, activeUsers: 0, newUsersThisWeek: 0 },
    lessonsData: [],
    loading: true,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setData((prev) => ({ ...prev, loading: true }));

      // Fetch users data
      const usersQuery = query(
        collection(db, "normal_users"),
        where("role", "==", "user")
      );
      const usersSnapshot = await getDocs(usersQuery);

      const users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        lastLogin: doc.data().lastLogin?.toDate(),
      }));

      // Calculate user metrics
      const totalUsers = users.length;
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const newUsersThisWeek = users.filter(
        (user) => user.createdAt && user.createdAt >= oneWeekAgo
      ).length;

      const FIVE_MINUTES = 5 * 60 * 1000;
      const activeUsers = users.filter(
        (user) =>
          user.lastLogin &&
          now.getTime() - user.lastLogin.getTime() <= FIVE_MINUTES
      ).length;

      // Fetch lessons data
      const lessonsSnapshot = await getDocs(collection(db, "lessons"));
      const lessonsData = lessonsSnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title || "",
        sdgId: doc.data().sdgId || "1",
        accessCount: doc.data().accessCount || 0,
        respondedCount: doc.data().respondedCount || 0,
        goodResponseCount: doc.data().goodResponseCount || 0,
        partialResponseCount: doc.data().partialResponseCount || 0,
        poorResponseCount: doc.data().poorResponseCount || 0,
        read5minCount: doc.data().read5minCount || 0,
        lastUpdated: doc.data().lastUpdated || "",
        ...doc.data(),
      }));

      setData({
        userData: { totalUsers, activeUsers, newUsersThisWeek },
        lessonsData,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setData((prev) => ({ ...prev, loading: false }));
    }
  };

  // Calculate metrics from real data
  const calculateCompletionRate = () => {
    if (data.lessonsData.length === 0) return 0;
    const totalResponded = data.lessonsData.reduce(
      (sum, lesson) => sum + lesson.respondedCount,
      0
    );
    const totalAccessed = data.lessonsData.reduce(
      (sum, lesson) => sum + lesson.accessCount,
      0
    );
    return totalAccessed > 0
      ? ((totalResponded / totalAccessed) * 100).toFixed(1)
      : 0;
  };

  // Chart 1: Completion Rate by SDG
  const getCompletionBySDG = () => {
    const sdgMap = new Map();

    data.lessonsData.forEach((lesson) => {
      const sdgId = lesson.sdgId;
      if (!sdgMap.has(sdgId)) {
        sdgMap.set(sdgId, { accessed: 0, responded: 0, title: `SDG ${sdgId}` });
      }
      const current = sdgMap.get(sdgId);
      current.accessed += lesson.accessCount;
      current.responded += lesson.respondedCount;
    });

    const labels = Array.from(sdgMap.keys())
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((key) => sdgMap.get(key).title);

    const completionRates = Array.from(sdgMap.values()).map((sdg) =>
      sdg.accessed > 0 ? (sdg.responded / sdg.accessed) * 100 : 0
    );

    return {
      labels,
      datasets: [
        {
          label: "Completion Rate (%)",
          data: completionRates,
          backgroundColor: "rgba(59, 130, 246, 0.8)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 2,
          borderRadius: 4,
        },
      ],
    };
  };

  // Chart 2: Response Quality Distribution
  const getResponseQualityData = () => {
    const totalGood = data.lessonsData.reduce(
      (sum, lesson) => sum + lesson.goodResponseCount,
      0
    );
    const totalPartial = data.lessonsData.reduce(
      (sum, lesson) => sum + lesson.partialResponseCount,
      0
    );
    const totalPoor = data.lessonsData.reduce(
      (sum, lesson) => sum + lesson.poorResponseCount,
      0
    );

    return {
      labels: [
        `Good (${totalGood})`,
        `Partial (${totalPartial})`,
        `Poor (${totalPoor})`,
      ],
      datasets: [
        {
          data: [totalGood, totalPartial, totalPoor],
          backgroundColor: [
            "rgba(34, 197, 94, 0.8)",
            "rgba(249, 115, 22, 0.8)",
            "rgba(239, 68, 68, 0.8)",
          ],
          borderColor: [
            "rgba(34, 197, 94, 1)",
            "rgba(249, 115, 22, 1)",
            "rgba(239, 68, 68, 1)",
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  // Chart 3: SDG Engagement - FIXED: Shows ALL SDGs with actual user counts
  const getSdgEngagementData = () => {
    const sdgNames = {
      "1": "1. No Poverty",
      "2": "2. Zero Hunger",
      "3": "3. Good Health",
      "4": "4. Quality Education",
      "5": "5. Gender Equality",
      "6": "6. Clean Water",
      "7": "7. Affordable Energy",
      "8": "8. Decent Work",
      "9": "9. Industry Innovation",
      "10": "10. Reduced Inequalities",
      "11": "11. Sustainable Cities",
      "12": "12. Responsible Consumption",
      "13": "13. Climate Action",
      "14": "14. Life Below Water",
      "15": "15. Life on Land",
      "16": "16. Peace & Justice",
      "17": "17. Partnerships",
    };

    // Initialize all SDGs with 0 engagement
    const sdgEngagement: { [key: string]: number } = {};
    for (let i = 1; i <= 17; i++) {
      sdgEngagement[i.toString()] = 0;
    }

    // Calculate actual engagement per SDG (total accesses)
    data.lessonsData.forEach((lesson) => {
      const sdgId = lesson.sdgId;
      if (sdgEngagement.hasOwnProperty(sdgId)) {
        sdgEngagement[sdgId] += lesson.accessCount;
      }
    });

    // Convert to arrays for chart, maintaining SDG order (1-17)
    const labels = Object.keys(sdgEngagement)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((key) => sdgNames[key as keyof typeof sdgNames]);

    const engagementData = Object.keys(sdgEngagement)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((key) => sdgEngagement[key]);

    return {
      labels,
      datasets: [
        {
          label: "Total Lesson Accesses",
          data: engagementData,
          backgroundColor: "rgba(34, 197, 94, 0.8)",
          borderColor: "rgba(34, 197, 94, 1)",
          borderWidth: 2,
          borderRadius: 4,
        },
      ],
    };
  };

  // Chart 4: Access vs Response - FIXED: Shows ALL lessons with clear numbers
  const getAccessVsResponseData = () => {
    // Show all lessons, sorted by access count
    const sortedLessons = [...data.lessonsData].sort(
      (a, b) => b.accessCount - a.accessCount
    );

    return {
      labels: sortedLessons.map((lesson) => {
        const shortTitle =
          lesson.title.length > 20
            ? lesson.title.substring(0, 20) + "..."
            : lesson.title;
        return `${shortTitle} (SDG ${lesson.sdgId})`;
      }),
      datasets: [
        {
          label: "Users Accessed",
          data: sortedLessons.map((lesson) => lesson.accessCount),
          backgroundColor: "rgba(139, 92, 246, 0.8)",
          borderColor: "rgba(139, 92, 246, 1)",
          borderWidth: 2,
          borderRadius: 4,
        },
        {
          label: "Users Responded",
          data: sortedLessons.map((lesson) => lesson.respondedCount),
          backgroundColor: "rgba(236, 72, 153, 0.8)",
          borderColor: "rgba(236, 72, 153, 1)",
          borderWidth: 2,
          borderRadius: 4,
        },
      ],
    };
  };

  // Chart 5: User Activity Distribution
  const getUserActivityData = () => {
    const totalAccess = data.lessonsData.reduce(
      (sum, lesson) => sum + lesson.accessCount,
      0
    );
    const totalRead = data.lessonsData.reduce(
      (sum, lesson) => sum + lesson.read5minCount,
      0
    );
    const totalResponse = data.lessonsData.reduce(
      (sum, lesson) => sum + lesson.respondedCount,
      0
    );
    const totalGood = data.lessonsData.reduce(
      (sum, lesson) => sum + lesson.goodResponseCount,
      0
    );

    return {
      labels: [
        `Accessed\n${totalAccess.toLocaleString()}`,
        `Read 5+ min\n${totalRead.toLocaleString()}`,
        `Responded\n${totalResponse.toLocaleString()}`,
        `Good Answers\n${totalGood.toLocaleString()}`,
      ],
      datasets: [
        {
          data: [totalAccess, totalRead, totalResponse, totalGood],
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)",
            "rgba(34, 197, 94, 0.8)",
            "rgba(249, 115, 22, 0.8)",
            "rgba(139, 92, 246, 0.8)",
          ],
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toLocaleString();
            }
            return label;
          },
        },
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return typeof value === "number" ? value.toLocaleString() : value;
          },
        },
      },
    },
  };

  const horizontalBarOptions = {
    ...chartOptions,
    indexAxis: "y" as const,
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return typeof value === "number" ? value.toLocaleString() : value;
          },
        },
      },
    },
  };

  if (data.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
      //learn about this loading
      // <div className="p-4 md:p-6 bg-gray-50 min-h-screen flex items-center justify-center">
      //   <div className="text-center">
      //     <FiLoader className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
      //     <p className="text-gray-600">Loading dashboard data...</p>
      //   </div>
      // </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
          <FiBarChart2 className="text-blue-500" />
          User Performance Analytics
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Real-time overview of user engagement and performance metrics
        </p>
      </div>

      {/* Refresh Button */}
      <div className="mb-6">
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium shadow-md"
        >
          Refresh Data
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={<FiUsers className="text-blue-600" />}
          title="Total Users"
          value={data.userData.totalUsers.toLocaleString()}
          change={`+${data.userData.newUsersThisWeek} this week`}
          changeType="positive"
        />
        <MetricCard
          icon={<FiCheckCircle className="text-green-600" />}
          title="Completion Rate"
          value={`${calculateCompletionRate()}%`}
          change="Overall completion"
          changeType="positive"
        />
        <MetricCard
          icon={<FiActivity className="text-purple-600" />}
          title="Active Users"
          value={data.userData.activeUsers.toLocaleString()}
          change="Currently online"
          changeType="positive"
        />
        <MetricCard
          icon={<FiBook className="text-orange-600" />}
          title="Total Lessons"
          value={data.lessonsData.length.toString()}
          change="Available content"
          changeType="positive"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Completion Rate by SDG */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <FiTrendingUp className="text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">
              Completion Rate by SDG (%)
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Percentage of users who responded after accessing each SDG's lessons
          </p>
          <div className="h-80">
            <Bar data={getCompletionBySDG()} options={barChartOptions} />
          </div>
        </div>

        {/* Chart 2: Response Quality Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <FiAward className="text-green-600 mr-2" />
            <h3 className="text-lg font-semibold">
              Response Quality Distribution
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Breakdown of answer quality across all lessons
          </p>
          <div className="h-80">
            <Doughnut data={getResponseQualityData()} options={chartOptions} />
          </div>
        </div>

        {/* Chart 3: SDG Engagement - FIXED */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <FiTarget className="text-emerald-600 mr-2" />
            <h3 className="text-lg font-semibold">SDG Engagement (All SDGs)</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Total lesson accesses for each Sustainable Development Goal
          </p>
          <div className="h-80">
            <Bar data={getSdgEngagementData()} options={horizontalBarOptions} />
          </div>
        </div>

        {/* Chart 4: Access vs Response - FIXED */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <FiUsers className="text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold">
              All Lessons: Access vs Response
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Comparison between users who accessed lessons vs those who responded
          </p>
          <div className="h-80">
            <Bar data={getAccessVsResponseData()} options={barChartOptions} />
          </div>
        </div>

        {/* Chart 5: User Activity Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <FiActivity className="text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold">User Activity Funnel</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            User progression from accessing lessons to providing good answers
          </p>
          <div className="h-80">
            <Pie data={getUserActivityData()} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Data Explanation Section
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">
          📊 Understanding Your Data
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold mb-2">SDG Engagement Chart</h4>
            <ul className="space-y-1">
              <li>
                • Shows <strong>all 17 Sustainable Development Goals</strong>
              </li>
              <li>
                • Numbers represent <strong>total lesson accesses</strong> per
                SDG
              </li>
              <li>• Higher bars = more popular SDG content</li>
              <li>• Helps identify which SDGs need more content</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Lessons: Access vs Response</h4>
            <ul className="space-y-1">
              <li>
                • Shows <strong>all your lessons</strong> sorted by popularity
              </li>
              <li>
                • <span className="text-purple-600">Purple bars</span> = Users
                who accessed
              </li>
              <li>
                • <span className="text-pink-600">Pink bars</span> = Users who
                responded
              </li>
              <li>• Gap shows engagement opportunity</li>
            </ul>
          </div> 
        </div>
      </div>*/}
    </div>
  );
};

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
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner">
        {icon}
      </div>
      <span
        className={`text-xs font-medium px-2 py-1 rounded-full ${
          changeType === "positive"
            ? "text-green-700 bg-green-50"
            : "text-red-700 bg-red-50"
        }`}
      >
        {change}
      </span>
    </div>
    <div>
      <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default UserPerformanceDashboard;
