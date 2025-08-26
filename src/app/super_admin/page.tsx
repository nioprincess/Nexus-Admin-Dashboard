// app/dashboard/page.jsx
"use client";
import AnalyticComponent from "./analytics/page";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/firebaseConfig";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
      window.history.go(1); // disables back button
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/auth/login");
      } else {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [router]);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard cards/stats would go here */}
        <div className="bg-white p-6 rounded-lg border-[1px] cursor-pointer hover:shadow-lg  border-greyColor shadow">
          <h3 className="text-lg font-medium">Total Users</h3>
          <p className="text-3xl font-bold mt-2  bg-blue-100 w-24 cursor-pointer hover:w-60 p-1 rounded-md">
            1,234
          </p>
        </div>
        <div className="bg-white p-6 border-[1px] border-greyColor hover:shadow-lg cursor-pointer rounded-lg shadow">
          <h3 className="text-lg font-medium">Engaged users</h3>
          <p className="text-3xl font-bold mt-2 bg-blue-100 w-24 cursor-pointer hover:w-60 p-1 rounded-md">
            24
          </p>
        </div>
        <div className="bg-white p-6 border-[1px] border-greyColor hover:shadow-lg cursor-pointer rounded-lg shadow">
          <h3 className="text-lg font-medium">Received Feedback</h3>
          <p className="text-3xl font-bold mt-2  bg-blue-100 w-24 cursor-pointer rounded-md hover:w-60 p-1">
            5
          </p>
        </div>
      </div>
      <div className="mt-8">
        <AnalyticComponent />
      </div>
    </div>
  );
}
