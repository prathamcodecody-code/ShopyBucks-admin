"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  HiOutlineUserAdd, 
  HiOutlineMail, 
  HiOutlineShieldCheck, 
  HiOutlineCalendar, 
  HiOutlineChevronRight
} from "react-icons/hi";
import { HiOutlineXMark } from "react-icons/hi2";

type Employee = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  isVerified: boolean;
};

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateEmployee = async () => {
    if (!form.name || !form.email || !form.password) {
      alert("All fields are required");
      return;
    }

    try {
      // Pointing to your specific auth route
      await api.post("/auth/admin/create-employee", form);
      setShowModal(false);
      setForm({ name: "", email: "", password: "" });
      fetchEmployees();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to create employee";
      alert(msg);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-amazon-lightGray min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-black text-amazon-text tracking-tight uppercase">
                Staff Directory
              </h1>
              <p className="text-amazon-mutedText text-sm font-medium">
                Manage administrative access and employee accounts.
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue font-black py-2.5 px-6 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-tighter"
            >
              <HiOutlineUserAdd size={20} />
              Add New Employee
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl border border-amazon-borderGray shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amazon-orange"></div>
                <p className="text-amazon-mutedText font-bold text-sm uppercase tracking-widest">Syncing Team...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-amazon-navy text-white">
                      <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em]">Full Name</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em]">Contact</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em]">Joined</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-center">Status</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amazon-borderGray">
                    {employees.length > 0 ? (
                      employees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-amazon-lightGray/30 transition-colors group">
                          <td className="p-4">
                            <span className="font-black text-amazon-text">{emp.name}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-amazon-mutedText font-bold text-xs">
                              <HiOutlineMail className="text-amazon-orange" size={16} />
                              {emp.email}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-amazon-mutedText text-xs font-bold">
                              <HiOutlineCalendar size={16} />
                              {new Date(emp.createdAt).toLocaleDateString('en-IN')}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                              emp.isVerified 
                                ? "bg-green-50 text-amazon-success border-green-200" 
                                : "bg-red-50 text-amazon-danger border-red-200"
                            }`}>
                              <HiOutlineShieldCheck size={12} />
                              {emp.isVerified ? "Verified" : "Pending"}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <Link
                              href={`/employees/${emp.id}`}
                              className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amazon-darkBlue hover:text-amazon-orange transition-colors"
                            >
                              Details
                              <HiOutlineChevronRight size={14} />
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-20 text-center text-amazon-mutedText font-black uppercase text-xs tracking-widest opacity-40">
                          Empty Directory
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* CREATE MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-amazon-darkBlue/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
              <div className="p-6 border-b border-amazon-borderGray flex justify-between items-center bg-amazon-lightGray">
                <h2 className="text-sm font-black text-amazon-darkBlue uppercase tracking-widest">
                  Employee Registration
                </h2>
                <button onClick={() => setShowModal(false)} className="text-amazon-mutedText hover:text-amazon-danger transition-colors">
                  <HiOutlineXMark size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-amazon-mutedText uppercase tracking-[0.2em] mb-2 block">Name</label>
                  <input
                    placeholder="Enter full name"
                    className="w-full border-2 border-amazon-borderGray p-3 rounded-xl focus:outline-none focus:border-amazon-orange transition-all font-bold text-sm"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-amazon-mutedText uppercase tracking-[0.2em] mb-2 block">Email Address</label>
                  <input
                    placeholder="email@shopybucks.com"
                    type="email"
                    className="w-full border-2 border-amazon-borderGray p-3 rounded-xl focus:outline-none focus:border-amazon-orange transition-all font-bold text-sm"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-amazon-mutedText uppercase tracking-[0.2em] mb-2 block">Temporary Password</label>
                  <input
                    placeholder="Min 8 characters"
                    type="password"
                    className="w-full border-2 border-amazon-borderGray p-3 rounded-xl focus:outline-none focus:border-amazon-orange transition-all font-bold text-sm"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="p-6 bg-gray-50 flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-amazon-borderGray rounded-xl font-black text-amazon-mutedText hover:bg-white transition-all text-[10px] uppercase tracking-widest"
                >
                  Discard
                </button>
                <button
                  onClick={handleCreateEmployee}
                  className="flex-1 px-4 py-3 bg-amazon-darkBlue text-white rounded-xl font-black hover:bg-amazon-navy transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-amazon-darkBlue/20"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}