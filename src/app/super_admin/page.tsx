// app/dashboard/page.jsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard cards/stats would go here */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium">Total Users</h3>
          <p className="text-3xl font-bold mt-2">1,234</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium">Active Projects</h3>
          <p className="text-3xl font-bold mt-2">24</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium">Upcoming Events</h3>
          <p className="text-3xl font-bold mt-2">5</p>
        </div>
      </div>
    </div>
  );
}