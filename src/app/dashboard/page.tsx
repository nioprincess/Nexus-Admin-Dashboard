// app/dashboard/page.jsx
"use client";
import AnalyticComponent from "./analytics/page";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

export default function DashboardPage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [engagedUsers, setEngagedUsers] = useState(0);
  const [feedbackReceived, setFeedbackReceived] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError("");

        // ✅ Get total users with role = 'user'
        const usersQuery = query(
          collection(db, "normal_users"),
          where("role", "==", "user")
        );
        const usersSnapshot = await getDocs(usersQuery);
        setTotalUsers(usersSnapshot.size);

        // ✅ Get engaged users (active in last 7 days with role = 'user')
        // We'll do this client-side to avoid composite index issues
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // First get all users with role = 'user'
        const allUsersSnapshot = await getDocs(
          query(collection(db, "normal_users"), where("role", "==", "user"))
        );

        // Then filter client-side for last login
        const engagedUsersCount = allUsersSnapshot.docs.filter((doc) => {
          const userData = doc.data();
          if (userData.lastLogin) {
            const lastLogin = userData.lastLogin.toDate
              ? userData.lastLogin.toDate()
              : new Date(userData.lastLogin);
            return lastLogin >= sevenDaysAgo;
          }
          return false;
        }).length;

        setEngagedUsers(engagedUsersCount);

        // ✅ Get feedbacks
        const feedbacksSnapshot = await getDocs(collection(db, "feedbacks"));
        setFeedbackReceived(feedbacksSnapshot.size);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again.");
      }
    };

    fetchData();
  }, []);

  // Alternative approach using separate queries (if you prefer)
  const fetchEngagedUsersAlternative = async () => {
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get users who logged in recently
      const recentUsersQuery = query(
        collection(db, "normal_users"),
        where("lastLogin", ">=", Timestamp.fromDate(sevenDaysAgo))
      );

      const recentUsersSnapshot = await getDocs(recentUsersQuery);

      // Filter by role client-side
      const engagedUsersWithRole = recentUsersSnapshot.docs.filter((doc) => {
        const userData = doc.data();
        return userData.role === "user";
      }).length;

      setEngagedUsers(engagedUsersWithRole);
    } catch (error) {
      console.error("Error fetching engaged users:", error);
      // Fallback to client-side filtering
      fetchAllUsersAndFilter();
    }
  };

  const fetchAllUsersAndFilter = async () => {
    try {
      const allUsersSnapshot = await getDocs(collection(db, "normal_users"));
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const engagedCount = allUsersSnapshot.docs.filter((doc) => {
        const userData = doc.data();
        const hasRoleUser = userData.role === "user";

        if (hasRoleUser && userData.lastLogin) {
          const lastLogin = userData.lastLogin.toDate
            ? userData.lastLogin.toDate()
            : new Date(userData.lastLogin);
          return lastLogin >= sevenDaysAgo;
        }
        return false;
      }).length;

      setEngagedUsers(engagedCount);
    } catch (error) {
      console.error("Error in fallback user fetch:", error);
    }
  };

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-lg border-[1px] cursor-pointer hover:shadow-lg border-greyColor shadow">
          <h3 className="text-lg font-medium">Total Users</h3>
          <p className="text-3xl font-bold mt-2 bg-blue-100 w-24 cursor-pointer hover:w-60 p-1 rounded-md">
            {totalUsers}
          </p>
        </div>

        {/* Engaged Users */}
        <div className="bg-white p-6 border-[1px] border-greyColor hover:shadow-lg cursor-pointer rounded-lg shadow">
          <h3 className="text-lg font-medium">Engaged Users (Last 7 Days)</h3>
          <p className="text-3xl font-bold mt-2 bg-blue-100 w-24 cursor-pointer hover:w-60 p-1 rounded-md">
            {engagedUsers}
          </p>
        </div>

        {/* Feedback */}
        <div className="bg-white p-6 border-[1px] border-greyColor hover:shadow-lg cursor-pointer rounded-lg shadow">
          <h3 className="text-lg font-medium">Received Feedback</h3>
          <p className="text-3xl font-bold mt-2 bg-blue-100 w-24 cursor-pointer rounded-md hover:w-60 p-1">
            {feedbackReceived}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <AnalyticComponent />
      </div>
    </div>
  );
}
