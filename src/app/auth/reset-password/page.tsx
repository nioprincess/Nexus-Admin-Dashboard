"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase/firebaseConfig";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [oobCode, setOobCode] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get the reset code from URL parameters (Firebase includes oobCode parameter)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("oobCode");
    const mode = urlParams.get("mode");

    if (mode === "resetPassword" && code) {
      setOobCode(code);

      // Verify the reset code and get the associated email
      verifyPasswordResetCode(auth, code)
        .then((email) => {
          setEmail(email);
        })
        .catch((error) => {
          console.error("Invalid reset code:", error);
          setError("Invalid or expired reset link. Please request a new one.");
        });
    } else {
      setError(
        "Invalid reset link. Please check the URL or request a new reset email."
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      // Confirm password reset with Firebase Auth
      await confirmPasswordReset(auth, oobCode, password);

      setMessage("Password reset successfully! Redirecting to login...");

      setTimeout(() => {
        router.push("/auth/login?message=Password reset successfully");
      }, 2000);
    } catch (error: any) {
      console.error("Password reset error:", error);

      let errorMessage = "Error resetting password. Please try again.";

      if (error.code === "auth/expired-action-code") {
        errorMessage = "Reset link has expired. Please request a new one.";
      } else if (error.code === "auth/invalid-action-code") {
        errorMessage = "Invalid reset link. Please request a new one.";
      } else if (error.code === "auth/weak-password") {
        errorMessage =
          "Password is too weak. Please choose a stronger password.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!oobCode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-xl shadow-gray-400 text-center">
          <div className="text-red-600 mb-4">
            {error || "Loading reset information..."}
          </div>
          <Link
            href="/auth/forgot-password"
            className="text-blueColor hover:underline"
          >
            Request new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blueColor">NEXUS APP</h1>
      </div>

      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-xl shadow-gray-400">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-gray-600 mt-2">
            Enter your new password for {email}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-200"
              placeholder="Enter new password (min. 8 characters)"
              minLength={8}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-200"
              placeholder="Confirm new password"
            />
          </div>

          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || !oobCode}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-blueColor hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-sm text-blueColor hover:text-blue-600 font-medium"
            >
              ← Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
