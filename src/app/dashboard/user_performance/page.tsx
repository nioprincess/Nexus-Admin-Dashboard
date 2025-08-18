"use client";
import {
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiBarChart2,
  FiSearch,
  FiUser,
  FiDownload,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { useState } from "react";
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
} from "chart.js";
import { Line, Bar, Radar } from "react-chartjs-2";

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
  Filler
);

interface User {
  id: number;
  name: string;
  avatar: string;
  completionRate: number;
  streak: number;
  sdgsCovered: number;
  lastActive: string;
  projects: number;
  rank: string;
}

const UserPerformanceDashboard = () => {
  // Sample data with TypeScript typing
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "Alice K.",
      avatar: "",
      completionRate: 78,
      streak: 16,
      sdgsCovered: 5,
      lastActive: "2023-11-15",
      projects: 3,
      rank: "Top 15%",
    },
    {
      id: 2,
      name: "Bob R.",
      avatar: "",
      completionRate: 45,
      streak: 5,
      sdgsCovered: 2,
      lastActive: "2023-11-14",
      projects: 1,
      rank: "Top 60%",
    },
    {
      id: 3,
      name: "Charlie P.",
      avatar: "",
      completionRate: 92,
      streak: 24,
      sdgsCovered: 7,
      lastActive: "2023-11-16",
      projects: 5,
      rank: "Top 5%",
    },
  ]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const usersPerPage = 5;

  // Filter and paginate users
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const viewUserPerformance = (userId: number): void => {
    setSelectedUser(users.find((user) => user.id === userId) || null);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const toggleRow = (userId: number) => {
    setExpandedRows((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const exportData = (): void => {
    console.log("Exporting data:", filteredUsers);
    alert("Export functionality would be implemented here");
  };

  // Chart data for the selected user
  const progressChartData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Current"],
    datasets: [
      {
        label: "Completion Rate",
        data: [20, 45, 60, 70, selectedUser?.completionRate || 0],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const activityChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Daily Activity (hours)",
        data: [1.5, 2, 1.8, 2.5, 1.2, 0.5, 0.8],
        backgroundColor: "rgba(99, 102, 241, 0.6)",
      },
    ],
  };

  const sdgProficiencyData = {
    labels: [
      "No Poverty",
      "Zero Hunger",
      "Good Health",
      "Quality Education",
      "Gender Equality",
      "Clean Water",
      "Affordable Energy",
    ],
    datasets: [
      {
        label: "Proficiency Level",
        data: [80, 65, 90, 75, 60, 85, 70],
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(34, 197, 94, 1)",
      },
    ],
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2">
        <FiTrendingUp className="text-blue-600" /> User Performance Dashboard
      </h1>

      {/* Search and filter bar */}
      <div className="mb-4 md:mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <button
          onClick={exportData}
          className="flex items-center justify-center px-3 md:px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <FiDownload className="mr-1 md:mr-2" />
          <span className="text-xs md:text-sm">Export Data</span>
        </button>
      </div>

      {selectedUser ? (
        // Individual User Performance View
        <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-6">
          <button
            onClick={() => setSelectedUser(null)}
            className="mb-3 md:mb-4 flex items-center text-blue-600 hover:text-blue-800 text-sm md:text-base"
          >
            ← Back to all users
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            <MetricCard
              icon={<FiBarChart2 />}
              title="Completion Rate"
              value={`${selectedUser.completionRate}%`}
            />
            <MetricCard
              icon={<FiAward />}
              title="Current Streak"
              value={`${selectedUser.streak} days`}
            />
            <MetricCard
              icon={<FiUsers />}
              title="SDGs Covered"
              value={`${selectedUser.sdgsCovered}/17`}
            />
            <MetricCard
              icon={<FiTrendingUp />}
              title="Peer Rank"
              value={selectedUser.rank}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
              <h3 className="font-medium mb-2 text-sm md:text-base">
                Progress Over Time
              </h3>
              <div className="h-48 md:h-64">
                <Line
                  data={progressChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                      title: {
                        display: true,
                        text: "Weekly Progress",
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                      },
                    },
                  }}
                />
              </div>
            </div>
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
              <h3 className="font-medium mb-2 text-sm md:text-base">
                Weekly Activity
              </h3>
              <div className="h-48 md:h-64">
                <Bar
                  data={activityChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                      title: {
                        display: true,
                        text: "Daily Engagement",
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </div>
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
              <h3 className="font-medium mb-2 text-sm md:text-base">
                SDG Proficiency
              </h3>
              <div className="h-48 md:h-64">
                <Radar
                  data={sdgProficiencyData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                    scales: {
                      r: {
                        angleLines: {
                          display: true,
                        },
                        suggestedMin: 0,
                        suggestedMax: 100,
                      },
                    },
                  }}
                />
              </div>
            </div>
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
              <h3 className="font-medium mb-2 text-sm md:text-base">
                Projects Breakdown
              </h3>
              <div className="h-48 md:h-64 bg-white border rounded-md flex items-center justify-center text-gray-400">
                <PieChartPlaceholder projects={selectedUser.projects} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        // All Users Table View
        <div className="bg-white rounded-xl  shadow overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y  divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Streak
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SDGs
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 md:h-10 w-8 md:w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <FiUser className="text-gray-500 text-sm md:text-base" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 md:w-24 bg-gray-200 rounded-full h-2 md:h-2.5">
                            <div
                              className="bg-blue-600 h-2 md:h-2.5 rounded-full"
                              style={{ width: `${user.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs md:text-sm text-gray-500">
                            {user.completionRate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {user.streak} days
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                        {user.sdgsCovered}/17
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                        {user.lastActive}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium">
                        <button
                          onClick={() => viewUserPerformance(user.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 md:px-6 py-4 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden">
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <div key={user.id} className="border-b border-gray-200 p-3">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleRow(user.id)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <FiUser className="text-gray-500" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Last active: {user.lastActive}
                        </div>
                      </div>
                    </div>
                    {expandedRows.includes(user.id) ? (
                      <FiChevronUp className="text-gray-500" />
                    ) : (
                      <FiChevronDown className="text-gray-500" />
                    )}
                  </div>

                  {expandedRows.includes(user.id) && (
                    <div className="mt-2 space-y-2 pl-13">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Completion:
                        </span>
                        <div className="flex items-center w-24">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${user.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs text-gray-700">
                            {user.completionRate}%
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Streak:</span>
                        <span className="px-2 inline-flex text-xs leading-4 font-semibold rounded-full bg-green-100 text-green-800">
                          {user.streak} days
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">SDGs:</span>
                        <span className="text-xs text-gray-700">
                          {user.sdgsCovered}/17
                        </span>
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={() => viewUserPerformance(user.id)}
                          className="w-full py-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-4 text-center text-gray-500">
                No users found
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredUsers.length > usersPerPage && (
            <div className="px-3 md:px-4 py-3 bg-gray-50 border-t flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
              <div className="text-xs md:text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{indexOfFirstUser + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastUser, filteredUsers.length)}
                </span>{" "}
                of <span className="font-medium">{filteredUsers.length}</span>{" "}
                users
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 md:px-3 py-1 border rounded-md text-xs md:text-sm disabled:opacity-50"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-2 md:px-3 py-1 border rounded-md text-xs md:text-sm ${
                        currentPage === page ? "bg-blue-50 text-blue-600" : ""
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2 md:px-3 py-1 border rounded-md text-xs md:text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}

const MetricCard = ({ icon, title, value }: MetricCardProps) => (
  <div className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200">
    <div className="flex items-center">
      <div className="p-1.5 md:p-2 rounded-full bg-blue-100 text-blue-600">
        {icon}
      </div>
      <div className="ml-2 md:ml-3">
        <p className="text-xs md:text-sm font-medium text-gray-500">{title}</p>
        <p className="text-sm md:text-lg font-semibold">{value}</p>
      </div>
    </div>
  </div>
);

const PieChartPlaceholder = ({ projects }: { projects: number }) => {
  return (
    <div className="text-center">
      <div className="w-24 md:w-32 h-24 md:h-32 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-1 md:mb-2">
        <span className="text-xl md:text-2xl font-bold text-blue-600">
          {projects}
        </span>
      </div>
      <p className="text-xs md:text-sm text-gray-500">Active Projects</p>
    </div>
  );
};

export default UserPerformanceDashboard;
