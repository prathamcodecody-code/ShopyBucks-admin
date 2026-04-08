"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineUserGroup, HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";

export default function SellersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadSellers() {
      try {
        const res = await api.get("/admin/sellers");
        setSellers(res.data);
      } catch (err) {
        console.error("Failed to load sellers", err);
      } finally {
        setLoading(false);
      }
    }
    loadSellers();
  }, []);

  // Helper function to get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          border: "border-green-200",
          dot: "bg-green-600",
        };
      case "SUSPENDED":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          border: "border-red-200",
          dot: "bg-red-600",
        };
      case "PENDING":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          border: "border-yellow-200",
          dot: "bg-yellow-600",
        };
      case "REJECTED":
        return {
          bg: "bg-gray-100",
          text: "text-gray-700",
          border: "border-gray-200",
          dot: "bg-gray-600",
        };
      default:
        return {
          bg: "bg-blue-100",
          text: "text-blue-700",
          border: "border-blue-200",
          dot: "bg-blue-600",
        };
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-amazon-darkBlue pb-6">
          <div>
            <h1 className="text-3xl font-black text-amazon-darkBlue uppercase italic tracking-tighter">
              All <span className="text-amazon-orange">Sellers</span>
            </h1>
            <p className="text-amazon-mutedText font-bold text-sm uppercase tracking-widest mt-1">
              Management Portal
            </p>
          </div>
          <div className="bg-white border-2 border-amazon-darkBlue px-4 py-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(19,25,33,1)] flex items-center gap-3">
            <HiOutlineUserGroup className="text-amazon-orange" size={24} />
            <span className="font-black text-amazon-darkBlue">{sellers.length} Total Sellers</span>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amazon-orange"></div>
            <p className="mt-4 font-black text-amazon-darkBlue uppercase tracking-widest text-xs">Fetching Records...</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && sellers.length === 0 && (
          <div className="bg-white border-4 border-amazon-darkBlue rounded-2xl p-12 text-center shadow-[8px_8px_0px_0px_rgba(19,25,33,1)]">
            <p className="text-amazon-mutedText font-black uppercase italic">No sellers found in database.</p>
          </div>
        )}

        {/* TABLE SECTION */}
        {!loading && sellers.length > 0 && (
          <div className="bg-white border-4 border-amazon-darkBlue rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(19,25,33,1)]">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-amazon-darkBlue text-white">
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Seller Name</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Contact Email</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Joined Date</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y-2 divide-amazon-borderGray">
                  {sellers.map((s) => {
                    const statusStyle = getStatusBadge(s.sellerStatus);
                    
                    return (
                      <tr
                        key={s.id}
                        onClick={() => router.push(`/sellers/${s.id}`)}
                        className="group cursor-pointer hover:bg-amazon-lightGray transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-black text-amazon-darkBlue group-hover:text-amazon-orange transition-colors uppercase italic tracking-tighter">
                            {s.name || "UNNAMED ENTITY"}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-amazon-mutedText">{s.email}</p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-xs font-black text-amazon-darkBlue bg-amazon-lightGray w-fit px-2 py-1 rounded border border-amazon-borderGray">
                            {s.sellerApprovedAt
                              ? new Date(s.sellerApprovedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
                              : "PENDING"}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span 
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusStyle.bg} ${statusStyle.text} border-2 ${statusStyle.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} animate-pulse`} />
                            {s.sellerStatus}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/sellers/${s.id}`}
                            className="inline-flex items-center gap-1 bg-amazon-orange border-2 border-amazon-darkBlue px-3 py-1.5 rounded-lg text-[10px] font-black text-amazon-darkBlue uppercase tracking-tighter shadow-[2px_2px_0px_0px_rgba(19,25,33,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                          >
                            Details <HiOutlineArrowTopRightOnSquare />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
