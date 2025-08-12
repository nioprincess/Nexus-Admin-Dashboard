// app/dashboard/page.jsx
import AnalyticComponent from "./analytics/page";
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard cards/stats would go here */}
        <div className="bg-white p-6 rounded-lg border-[1px] cursor-pointer hover:shadow-lg  border-greyColor shadow">
          <h3 className="text-lg font-medium">Total Users</h3>
          <p className="text-3xl font-bold mt-2  bg-blue-100 w-24 cursor-pointer hover:w-60 p-1 rounded-md">1,234</p>
        </div>
        <div className="bg-white p-6 border-[1px] border-greyColor hover:shadow-lg cursor-pointer rounded-lg shadow">
          <h3 className="text-lg font-medium">Engaged users</h3>
          <p className="text-3xl font-bold mt-2 bg-blue-100 w-24 cursor-pointer hover:w-60 p-1 rounded-md">24</p>
        </div>
        <div className="bg-white p-6 border-[1px] border-greyColor hover:shadow-lg cursor-pointer rounded-lg shadow">
          <h3 className="text-lg font-medium">Received Feedback</h3>
          <p className="text-3xl font-bold mt-2  bg-blue-100 w-24 cursor-pointer rounded-md hover:w-60 p-1">5</p>
        </div>
      </div>
      <div className="mt-8">
        <AnalyticComponent />
      </div>
    </div>
  );
}