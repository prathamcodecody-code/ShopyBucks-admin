"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import { 
  HiOutlineArrowLeft, 
  HiOutlineShieldCheck, 
  HiOutlineLockClosed, 
  HiOutlineUserCircle
} from "react-icons/hi2";
import { HiOutlineClipboardList, HiOutlineCalendar } from "react-icons/hi";

type Employee = {
  id: number;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
};

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showResetModal, setShowResetModal] = useState(false);
const [resetPassword, setResetPassword] = useState("");
const [resetLoading, setResetLoading] = useState(false);
const [resetError, setResetError] = useState<string | null>(null);

    const handleResetPassword = async () => {
  if (!resetPassword || resetPassword.length < 6) {
    setResetError("Password must be at least 6 characters");
    return;
  }

  try {
    setResetLoading(true);
    setResetError(null);

    await api.patch(
      `/admin/employees/${employee?.id}/reset-password`,
      { password: resetPassword }
    );

    setShowResetModal(false);
    setResetPassword("");
  } catch (err: any) {
    setResetError(
      err.response?.data?.message || "Failed to reset password"
    );
  } finally {
    setResetLoading(false);
  }
};

  useEffect(() => {
    if (!id) return;

    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/admin/employees/${id}`);
        setEmployee(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Employee not found");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-10 flex flex-col items-center justify-center animate-pulse">
          <div className="w-12 h-12 bg-amazon-borderGray rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-amazon-borderGray rounded"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !employee) {
    return (
      <AdminLayout>
        <div className="p-10 text-center">
          <div className="inline-flex p-4 bg-red-50 rounded-full mb-4">
            <HiOutlineLockClosed className="text-amazon-danger text-3xl" />
          </div>
          <h1 className="text-xl font-black text-amazon-darkBlue uppercase">Access Error</h1>
          <p className="text-amazon-mutedText font-medium mt-2">{error || "Employee not found"}</p>
          <button
            onClick={() => router.back()}
            className="mt-6 px-8 py-2 bg-amazon-darkBlue text-white rounded-lg font-black uppercase text-xs tracking-widest"
          >
            Go Back
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="bg-amazon-lightGray min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* HEADER & NAVIGATION */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amazon-mutedText hover:text-amazon-darkBlue transition-colors"
            >
              <HiOutlineArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Directory
            </button>
            <span className="text-[10px] font-black text-amazon-mutedText uppercase tracking-widest opacity-50">
              Employee ID: #EB-{employee.id}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* PRIMARY INFO CARD */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-amazon-borderGray p-8 shadow-sm">
              <div className="flex items-start gap-6 mb-8">
                <div className="bg-amazon-navy text-white p-4 rounded-2xl">
                  <HiOutlineUserCircle size={40} />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-amazon-darkBlue tracking-tighter leading-none">
                    {employee.name}
                  </h1>
                  <p className="text-amazon-mutedText font-bold mt-2 flex items-center gap-2">
                    {employee.email}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <span className="px-3 py-1 bg-amazon-lightGray text-amazon-darkBlue text-[10px] font-black uppercase rounded-md border border-amazon-borderGray">
                      {employee.role || "Staff"}
                    </span>
                    <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-md border ${
                      employee.isVerified 
                        ? "bg-green-50 text-amazon-success border-green-200" 
                        : "bg-red-50 text-amazon-danger border-red-200"
                    }`}>
                      {employee.isVerified ? "Verified" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-amazon-borderGray">
                <Detail label="Account Created" value={new Date(employee.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })} />
                <Detail label="System Permissions" value="Administrative" />
              </div>
            </div>

            {/* QUICK ACTIONS / STATUS */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-amazon-borderGray p-6 shadow-sm">
                <h2 className="text-[11px] font-black text-amazon-mutedText uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <HiOutlineShieldCheck className="text-amazon-orange" size={18} /> 
                  Account Status
                </h2>
                <div className="p-4 bg-amazon-lightGray/50 rounded-xl border border-amazon-borderGray">
                  <p className="text-[10px] font-black text-amazon-darkBlue uppercase mb-1">Last Login</p>
                  <p className="text-xs font-bold text-amazon-mutedText">Today, 10:45 AM</p>
                </div>
              </div>

              <div className="bg-amazon-darkBlue rounded-2xl p-6 shadow-xl">
                <h2 className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <HiOutlineLockClosed className="text-amazon-orange" size={18} /> 
                  Security Actions
                </h2>
                <button
  onClick={() => setShowResetModal(true)}
  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
>
  Reset Password
</button>
              </div>
            </div>

          </div>

          {/* ACTIVITY LOG SECTION */}
          <div className="bg-white rounded-2xl border border-amazon-borderGray shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-amazon-borderGray bg-amazon-lightGray/30 flex items-center gap-2">
              <HiOutlineClipboardList className="text-amazon-mutedText" />
              <h2 className="text-[11px] font-black text-amazon-mutedText uppercase tracking-[0.2em]">Activity Logs</h2>
            </div>
            <div className="p-12 text-center">
              <p className="text-xs font-bold text-amazon-mutedText italic opacity-60">
                No recent activity recorded for this employee.
              </p>
            </div>
          </div>

        </div>
      </div>
      {showResetModal && (
  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
      <h2 className="text-lg font-black text-amazon-darkBlue mb-4">
        Reset Employee Password
      </h2>

      <p className="text-xs text-amazon-mutedText mb-4">
        This will overwrite the current password. The employee will need to log in using the new password.
      </p>

      {resetError && (
        <div className="mb-3 text-xs font-bold text-amazon-danger">
          {resetError}
        </div>
      )}

      <input
        type="password"
        placeholder="New Password"
        className="w-full border border-amazon-borderGray rounded-lg px-3 py-2 mb-4"
        value={resetPassword}
        onChange={(e) => setResetPassword(e.target.value)}
      />

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowResetModal(false)}
          className="px-4 py-2 border rounded-lg text-xs font-black uppercase"
        >
          Cancel
        </button>

        <button
          onClick={handleResetPassword}
          disabled={resetLoading}
          className="px-4 py-2 bg-amazon-darkBlue text-white rounded-lg text-xs font-black uppercase disabled:opacity-60"
        >
          {resetLoading ? "Resetting..." : "Reset"}
        </button>
      </div>
    </div>
  </div>
)}
    </AdminLayout>
  );
}

/* -------------------------------------------
   REUSABLE DETAIL COMPONENT
-------------------------------------------- */
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black text-amazon-mutedText uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-sm font-black text-amazon-darkBlue">
        {value}
      </p>
    </div>
  );
}
