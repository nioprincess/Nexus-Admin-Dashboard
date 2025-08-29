"use client";
import Link from "next/link";
import { auth, db } from "@/lib/firebase/firebaseConfig";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  linkWithPopup,
} from "firebase/auth";
import { getDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect, startTransition } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [Email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Set session persistence on component mount
    setPersistence(auth, browserSessionPersistence).catch((error) => {
      console.error("Error setting auth persistence:", error);
    });
  }, []);

  const SigIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("Attempting login with:", { Email, password });

    try {
      await setPersistence(auth, browserSessionPersistence);
      await auth.signOut();

      // Changes: login directly with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        Email,
        password
      );
      const user = userCredential.user;

      const userDocRef = doc(db, "normal_users", user.uid);
      const userDoc = await getDoc(userDocRef);

      // // Changes: automatically create Firestore doc if missing
      // if (!userDoc.exists()) {
      //   await setDoc(userDocRef, {
      //     email: user.email,
      //     name: null,
      //     phone: null,
      //     address: null,
      //     profilePicture: null,
      //     role: "super_admin", // default role
      //     createdAt: new Date(),
      //     lastLogin: new Date(),
      //     uid: user.uid,
      //   });
      // } else {
      //   // update lastLogin timestamp
      //   await setDoc(userDocRef, { lastLogin: new Date() }, { merge: true });

      const userData = userDoc.data() || {};
      let userRole = userData?.role || "super_admin";

      // ensure role is set in Firestore
      if (!userData?.role) {
        await setDoc(userDocRef, { role: userRole }, { merge: true });
      }

      console.log("User role:", userRole);

      localStorage.setItem("authLoginEvent", Date.now().toString());
      setTimeout(() => localStorage.removeItem("authLoginEvent"), 100);
      switch (userRole) {
        case "super_admin":
          window.location.href = "/super_admin";
          break;
        case "admin":
          window.location.href = "/dashboard";
          break;
        default:
          throw new Error("Invalid role");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      let errorMessage = "Login failed. Please try again.";
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        errorMessage = "Invalid email or password.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.message === "User profile not found in database") {
        errorMessage = "User account not properly configured.";
      } else if (error.message === "Unknown user role") {
        errorMessage = "Your account has an invalid role configuration.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In function
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();

      // Changes: if user already logged in with email/password, link Google
      if (auth.currentUser) {
        await linkWithPopup(auth.currentUser, provider);
        console.log("Google account linked to existing user.");
      } else {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userDocRef = doc(db, "normal_users", user.uid);
        const userDoc = await getDoc(userDocRef);

        // // Changes: automatically create Firestore doc if missing
        // if (!userDoc.exists()) {
        //   await setDoc(userDocRef, {
        //     email: user.email,
        //     name: null,
        //     phone: null,
        //     address: null,
        //     role: "super_admin", // default role
        //     createdAt: new Date(),
        //     lastLogin: new Date(),
        //     uid: user.uid,
        //     profilePicture: user.photoURL || null,
        //   });
        // } else if (userDoc.exists()) {
        //   await updateDoc(userDocRef, {
        //     email: user.email,
        //     profilePicture: user.photoURL,
        //     name: user.displayName,
        //     lastLogin: new Date(),
        //   });
        // } else {
        //   await setDoc(userDocRef, { lastLogin: new Date() }, { merge: true });
        // }

        const userData = userDoc.data() || { role: "super_admin" };
        const userRole = userData?.role || "super_admin";

        switch (userRole) {
          case "super_admin":
            window.location.href = "/super_admin";
            break;
          case "admin":
            window.location.href = "/dashboard";
            break;
          default:
            throw new Error("Unknown user role");
        }
      }
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        console.error("Google Sign-In error:", error);
        let errorMessage = "Google Sign-In failed. Please try again.";
        if (error.code === "auth/popup-blocked") {
          errorMessage =
            "Popup was blocked. Please allow popups for this site.";
        } else if (error.code === "auth/unauthorized-domain") {
          errorMessage = "This domain is not authorized for Google Sign-In.";
        }
        setError(errorMessage);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blueColor">NEXUS APP</h1>
        </div>
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-xl shadow-gray-400">
          <div className="center">
            <div className="text-center">
              <span className="text-gray-600 font-semibold">
                Welcome Back!!{" "}
                <span className="font-semibold text-blueColor">
                  to Nexus App
                </span>
              </span>
              <p className="text-gray-600 mt-1">Sign in now!!</p>
            </div>
          </div>
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <form onSubmit={SigIn} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 bg-gray-200 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 bg-gray-200 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-blueColor hover:text-blue-500"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-blueColor hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className={`w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  googleLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {googleLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                ) : (
                  <img
                    className="h-5 w-5 mr-2"
                    src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
                    alt="Google logo"
                  />
                )}
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
