"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [tempToken, setTempToken] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 STEP 1: Password Login
  const login = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/auth/admin/login", { email, password });

      if (res.data.requiresOtp) {
        setTempToken(res.data.tempToken);
        setStep("otp");
        return;
      }

      setError("Unexpected response from server");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 STEP 2: Verify OTP
  const verifyOtp = async () => {
    if (!otp) {
      setError("OTP is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/auth/admin/verify-otp", {
        otp,
        tempToken,
      });
      console.log("Sending OTP verify:", { otp, tempToken });
      localStorage.setItem("admin_token", res.data.token);
      document.cookie = `admin_token=${res.data.token}; path=/;`;

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-amazon-lightGray px-4">
      <div className="w-full max-w-md bg-white border border-amazon-borderGray rounded-xl shadow-amazonLg p-8">

        {/* HEADER */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-amazon-orange/10 flex items-center justify-center mb-3">
            <ShieldCheck className="text-amazon-orange" size={26} />
          </div>

          <h1 className="text-2xl font-bold text-amazon-text">
            ShopyBucks Admin
          </h1>

          <p className="text-sm text-amazon-mutedText mt-1">
            {step === "credentials"
              ? "Sign in to manage your store"
              : "Enter OTP sent to secure admin phone"}
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 text-sm text-amazon-danger bg-red-50 border border-red-200 rounded-md px-4 py-2">
            {error}
          </div>
        )}

        {step === "credentials" && (
          <>
            {/* EMAIL */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-amazon-text">
                Email
              </label>
              <input
                type="email"
                placeholder="admin@shopybucks.com"
                className="mt-1 w-full rounded-md border border-amazon-borderGray px-4 py-2.5
                           focus:outline-none focus:ring-2 focus:ring-amazon-orange/40"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* PASSWORD */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-amazon-text">
                Password
              </label>

              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-amazon-borderGray px-4 py-2.5 pr-10
                             focus:outline-none focus:ring-2 focus:ring-amazon-orange/40"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              onClick={login}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2
                         bg-amazon-orange text-black font-semibold
                         py-2.5 rounded-md
                         hover:bg-amazon-orangeHover
                         transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Verifying...
                </>
              ) : (
                "Continue"
              )}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            {/* OTP INPUT */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-amazon-text">
                One-Time Password
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                className="mt-1 w-full rounded-md border border-amazon-borderGray px-4 py-2.5
                           focus:outline-none focus:ring-2 focus:ring-amazon-orange/40"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2
                         bg-amazon-orange text-black font-semibold
                         py-2.5 rounded-md
                         hover:bg-amazon-orangeHover
                         transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Verifying OTP...
                </>
              ) : (
                "Verify & Login"
              )}
            </button>
          </>
        )}

        <p className="text-xs text-amazon-mutedText text-center mt-6">
          © {new Date().getFullYear()} ShopyBucks Admin
        </p>
      </div>
    </div>
  );
}
