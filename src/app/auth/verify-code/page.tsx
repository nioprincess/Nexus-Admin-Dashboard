"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyCodePage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are filled
    if (newCode.every((digit) => digit !== "") && index === 5) {
      handleVerify();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const verificationCode = code.join("");
      // Simulate API verification
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In real app: await fetch('/api/auth/verify-code', { method: 'POST', body: JSON.stringify({ email, code: verificationCode }) })
      router.push(
        `/auth/reset-password?email=${encodeURIComponent(
          email
        )}&code=${verificationCode}`
      );
    } catch (error) {
      setMessage("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    // Implement resend logic here
    setMessage("New code sent to your email!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blueColor">NEXUS APP</h1>
      </div>

      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-xl shadow-gray-400">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Verify Code</h2>
          <p className="text-gray-600 mt-2">
            Enter the 6-digit code sent to {email}
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center space-x-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ))}
          </div>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.includes("Invalid")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {message}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={isLoading || code.some((digit) => digit === "")}
            className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-blueColor hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </button>

          <div className="text-center space-y-3">
            <button
              onClick={resendCode}
              className="text-sm text-blueColor hover:text-blue-600 font-medium"
            >
              Resend Code
            </button>
            <div>
              <Link
                href="/auth/login"
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                ← Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
