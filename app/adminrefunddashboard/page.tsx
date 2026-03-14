"use client";

import React, { useState, useEffect, FC } from "react";
import {
  Search,
  Filter,
  Check,
  X,
  Clock,
  AlertCircle,
  Eye,
  Edit2,
  FileText,
  Zap,
  Wallet,
  TrendingDown,
  Loader,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Refund,
  OrderRefund,
  RefundStatus,
  RefundStats,
} from "@/lib/refund.types";
import refundService from "@/lib/refundservice";
import AdminLayout from "@/components/AdminLayout";

type TabType = "order-refunds" | "wallet-topup" | "seller-credits";
type StatusFilterType = RefundStatus | "all";

interface ModalState {
  showDetail: boolean;
  showAction: boolean;
  selectedItem: any | null;
}

interface ActionState {
  action: "APPROVE" | "REJECT" | "REFUND" | null;
  notes: string;
}

interface ToastMessage {
  message: string;
  type: "success" | "error" | "info";
  id: string;
}

const AdminRefundDashboard: FC = () => {
  // Tab & Filter State
  const [activeTab, setActiveTab] = useState<TabType>("order-refunds");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const LIMIT = 20;

  // Modal State
  const [modal, setModal] = useState<ModalState>({
    showDetail: false,
    showAction: false,
    selectedItem: null,
  });

  // Action State
  const [actionState, setActionState] = useState<ActionState>({
    action: null,
    notes: "",
  });

  // Data State
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<boolean>(false);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [stats, setStats] = useState<RefundStats>({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    rejected: 0,
    totalAmount: 0,
    avgProcessingTime: 0,
    avgRefundAmount: 0,
  });

  // Show toast
  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now().toString();
    setToast({ message, type, id });
    setTimeout(() => setToast(null), 3000);
  };

  // Check auth
  const checkAuth = (): boolean => {
    const token = localStorage.getItem("admin_token") || sessionStorage.getItem("admin_token");
    if (!token) {
      setAuthError(true);
      setError("Authentication required. Please login first.");
      showToast("Please login to access this page", "error");
      return false;
    }
    setAuthError(false);
    return true;
  };

  // Load data based on tab
  const loadData = async () => {
    if (!checkAuth()) return;

    setLoading(true);
    setError(null);

    try {
      let response;

      switch (activeTab) {
        case "order-refunds":
          response = await refundService.getRefunds(statusFilter as any, page, LIMIT);
          break;
        case "wallet-topup":
          response = await refundService.getWalletTopups(statusFilter as any, page, LIMIT);
          break;
        case "seller-credits":
          response = await refundService.getSellerPurchases(statusFilter as any, page, LIMIT);
          break;
      }

      const data = response?.data || [];
      setItems(data);
      setPagination(response?.pagination || { total: 0, totalPages: 0 });
      updateStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load data";

      if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        setAuthError(true);
        setError("Session expired. Please login again.");
        showToast("Please login again", "error");
        localStorage.removeItem("admin_token");
        sessionStorage.removeItem("admin_token");
      } else {
        setError(errorMessage);
        showToast(errorMessage, "error");
      }

      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reload on tab/filter change
  useEffect(() => {
    loadData();
  }, [activeTab, statusFilter, page]);

  const updateStats = (dataList: any[]): void => {
    const pending = dataList.filter((r) => r.status === "PENDING").length;
    const completed = dataList.filter((r) => r.status === "COMPLETED" || r.status === "SUCCESS").length;
    const failed = dataList.filter((r) => r.status === "FAILED").length;
    const rejected = dataList.filter((r) => r.status === "REJECTED").length;
    const totalAmount = dataList.reduce((sum, r) => sum + (r.amount || 0), 0);

    setStats({
      total: pagination.total,
      pending,
      completed,
      failed,
      rejected,
      totalAmount,
      avgProcessingTime: 24,
      avgRefundAmount: dataList.length > 0 ? totalAmount / dataList.length : 0,
    });
  };

  // Filter by search
  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    const email = item.userEmail || item.sellerEmail || item.user?.email || "";
    const id = item.orderId || item.topupId || item.purchaseId || item.id;

    return (
      email?.toLowerCase().includes(term) ||
      id?.toString().includes(term) ||
      item.id?.toString().includes(term)
    );
  });

  // Handle approve/reject order refunds
  const handleApprove = async (): Promise<void> => {
    if (!modal.selectedItem) return;

    setProcessingId(modal.selectedItem.id);
    try {
      await refundService.processRefund(
        modal.selectedItem.id,
        "APPROVE",
        actionState.notes
      );

      showToast(`Item #${modal.selectedItem.id} approved successfully`, "success");
      loadData();
      handleCloseActionModal();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to approve";
      showToast(errorMessage, "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (): Promise<void> => {
    if (!modal.selectedItem) return;

    setProcessingId(modal.selectedItem.id);
    try {
      await refundService.processRefund(
        modal.selectedItem.id,
        "REJECT",
        actionState.notes
      );

      showToast(`Item #${modal.selectedItem.id} rejected successfully`, "success");
      loadData();
      handleCloseActionModal();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reject";
      showToast(errorMessage, "error");
    } finally {
      setProcessingId(null);
    }
  };

  // Handle refund for failed wallet/seller transactions
  const handleRefund = async (): Promise<void> => {
    if (!modal.selectedItem) return;

    setProcessingId(modal.selectedItem.id);
    try {
      // Determine which refund method to use based on tab
      if (activeTab === "wallet-topup") {
        await refundService.refundTopup(
          modal.selectedItem.id,
          modal.selectedItem.userId,
          modal.selectedItem.amount,
          modal.selectedItem.txnid,
          actionState.notes || "Manual refund from admin"
        );
      } else if (activeTab === "seller-credits") {
        await refundService.refundPurchase(
          modal.selectedItem.id,
          modal.selectedItem.userId,
          modal.selectedItem.amount,
          modal.selectedItem.txnid,
          actionState.notes || "Manual refund from admin"
        );
      }

      showToast(`Item #${modal.selectedItem.id} refunded successfully`, "success");
      loadData();
      handleCloseActionModal();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to refund";
      showToast(errorMessage, "error");
      console.error("Refund error:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenDetailModal = (item: any): void => {
    setModal({ ...modal, showDetail: true, selectedItem: item });
  };

  const handleCloseDetailModal = (): void => {
    setModal({ ...modal, showDetail: false });
  };

  const handleOpenActionModal = (item: any): void => {
    setModal({ ...modal, showAction: true, selectedItem: item });
  };

  const handleCloseActionModal = (): void => {
    setModal({ ...modal, showAction: false });
    setActionState({ action: null, notes: "" });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 text-amazon-orange border-yellow-200";
      case "SUCCESS":
      case "COMPLETED":
        return "bg-green-50 text-amazon-success border-green-200";
      case "FAILED":
        return "bg-red-50 text-amazon-danger border-red-200";
      case "REJECTED":
        return "bg-gray-50 text-amazon-text border-amazon-borderGray";
      default:
        return "bg-gray-50 text-amazon-text border-amazon-borderGray";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "SUCCESS":
      case "COMPLETED":
        return <Check className="w-4 h-4" />;
      case "FAILED":
        return <AlertCircle className="w-4 h-4" />;
      case "REJECTED":
        return <X className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEmail = (item: any): string => {
    return item.userEmail || item.sellerEmail || item.user?.email || "N/A";
  };

  // Determine if item can have action
  const canTakeAction = (item: any): boolean => {
    if (activeTab === "order-refunds") {
      return item.status === "PENDING";
    }
    // For wallet and seller: only FAILED can be refunded
    return item.status === "FAILED";
  };

  const getTabs = (): Array<{ id: TabType; label: string; icon?: React.ReactNode }> => [
    { id: "order-refunds", label: "Order Refunds", icon: <FileText className="w-4 h-4" /> },
    { id: "wallet-topup", label: "Wallet Topups", icon: <Wallet className="w-4 h-4" /> },
    { id: "seller-credits", label: "Seller Credits", icon: <Zap className="w-4 h-4" /> },
  ];

  if (authError) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col items-center justify-center gap-6 py-12">
            <AlertCircle className="w-16 h-16 text-amazon-danger" />
            <h2 className="text-2xl font-black text-amazon-text">Authentication Required</h2>
            <p className="text-amazon-mutedText text-center max-w-md">
              Your session has expired. Please login again to access the refund management page.
            </p>
            <button
              onClick={() => (window.location.href = "/login")}
              className="px-6 py-2 bg-amazon-orange text-white font-bold rounded hover:bg-amazon-orangeHover transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-white">
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 z-[60]">
            <div
              className={`px-6 py-3 rounded text-white font-bold shadow-lg flex items-center gap-2 ${
                toast.type === "success"
                  ? "bg-amazon-success"
                  : toast.type === "error"
                  ? "bg-amazon-danger"
                  : "bg-amazon-darkBlue"
              }`}
            >
              {toast.type === "success" && <Check className="w-4 h-4" />}
              {toast.type === "error" && <AlertCircle className="w-4 h-4" />}
              {toast.message}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="border-b border-amazon-borderGray bg-white sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-amazon-darkBlue flex items-center gap-2">
                  <FileText className="w-8 h-8" />
                  Refund Management
                </h1>
                <p className="text-amazon-mutedText text-sm mt-1 font-medium">
                  Manage refunds, wallet topups, and seller credits
                </p>
              </div>
              <button
                onClick={loadData}
                disabled={loading}
                className="px-4 py-2 border border-amazon-borderGray text-amazon-darkBlue rounded font-bold text-sm hover:bg-amazon-lightGray transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="bg-red-50 border border-amazon-danger rounded p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amazon-danger flex-shrink-0" />
              <p className="text-amazon-text font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-5 gap-4 mb-8">
            <div className="bg-white border border-amazon-borderGray rounded p-5 hover:border-amazon-orange transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amazon-mutedText text-sm font-black uppercase">Total</p>
                  <p className="text-3xl font-black text-amazon-darkBlue mt-1">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-amazon-orange" />
              </div>
            </div>

            <div className="bg-white border border-amazon-borderGray rounded p-5 hover:border-amazon-orange transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amazon-mutedText text-sm font-black uppercase">Pending</p>
                  <p className="text-3xl font-black text-amazon-orange mt-1">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-amazon-orange" />
              </div>
            </div>

            <div className="bg-white border border-amazon-borderGray rounded p-5 hover:border-amazon-orange transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amazon-mutedText text-sm font-black uppercase">Completed</p>
                  <p className="text-3xl font-black text-amazon-success mt-1">{stats.completed}</p>
                </div>
                <Check className="w-8 h-8 text-amazon-success" />
              </div>
            </div>

            <div className="bg-white border border-amazon-borderGray rounded p-5 hover:border-amazon-orange transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amazon-mutedText text-sm font-black uppercase">Failed</p>
                  <p className="text-3xl font-black text-amazon-danger mt-1">{stats.failed}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-amazon-danger" />
              </div>
            </div>

            <div className="bg-white border border-amazon-borderGray rounded p-5 hover:border-amazon-orange transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amazon-mutedText text-sm font-black uppercase">Total Amount</p>
                  <p className="text-2xl font-black text-amazon-darkBlue mt-1">
                    ₹{stats.totalAmount.toLocaleString()}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-amazon-darkBlue" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-amazon-borderGray">
            {getTabs().map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-3 border-b-4 font-black text-sm transition-colors ${
                  activeTab === id
                    ? "border-amazon-orange text-amazon-darkBlue"
                    : "border-transparent text-amazon-mutedText hover:text-amazon-text"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-amazon-mutedText" />
              <input
                type="text"
                placeholder="Search by email or ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-white border border-amazon-borderGray rounded text-amazon-text placeholder-amazon-mutedText focus:outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange transition-colors"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-5 h-5 text-amazon-mutedText" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as StatusFilterType);
                  setPage(1);
                }}
                className="pl-10 pr-4 py-2 bg-white border border-amazon-borderGray rounded text-amazon-text focus:outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange transition-colors appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="SUCCESS">Success</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-amazon-borderGray rounded overflow-hidden">
            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                  <Loader className="w-8 h-8 text-amazon-orange animate-spin" />
                  <p className="text-amazon-mutedText font-medium">Loading...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-amazon-borderGray bg-amazon-lightGray">
                      <th className="px-6 py-4 text-left text-xs font-black text-amazon-darkBlue uppercase">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-amazon-darkBlue uppercase">User/Seller</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-amazon-darkBlue uppercase">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-amazon-darkBlue uppercase">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-amazon-darkBlue uppercase">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-amazon-darkBlue uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-amazon-borderGray hover:bg-amazon-lightGray transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span className="text-amazon-darkBlue font-black">#{item.id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-amazon-text text-sm font-bold">{getEmail(item)}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-amazon-darkBlue font-black">
                              ₹{(item.amount || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded border text-xs font-black ${getStatusColor(item.status)}`}>
                              {getStatusIcon(item.status)}
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-amazon-mutedText text-sm">{formatDate(item.createdAt)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleOpenDetailModal(item)}
                                className="p-1.5 hover:bg-amazon-lightGray rounded transition-colors"
                              >
                                <Eye className="w-4 h-4 text-amazon-mutedText" />
                              </button>
                              {canTakeAction(item) && (
                                <button
                                  onClick={() => handleOpenActionModal(item)}
                                  disabled={processingId === item.id}
                                  className="p-1.5 hover:bg-yellow-100 rounded transition-colors disabled:opacity-50"
                                >
                                  {processingId === item.id ? (
                                    <Loader className="w-4 h-4 text-amazon-orange animate-spin" />
                                  ) : (
                                    <Edit2 className="w-4 h-4 text-amazon-orange" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <p className="text-amazon-mutedText font-medium">No items found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-amazon-borderGray">
            <p className="text-xs font-black uppercase tracking-wider text-amazon-mutedText">
              Page <span className="text-amazon-darkBlue">{page}</span> of{" "}
              <span className="text-amazon-darkBlue">{pagination.totalPages}</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 border border-amazon-borderGray rounded text-amazon-darkBlue hover:bg-amazon-lightGray transition-colors disabled:opacity-30"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex gap-1">
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const p = i + 1;
                  if (pagination.totalPages > 5 && p !== 1 && p !== pagination.totalPages && Math.abs(p - page) > 1)
                    return null;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded font-black text-xs transition-all ${
                        page === p
                          ? "bg-amazon-darkBlue text-white"
                          : "text-amazon-mutedText hover:bg-amazon-lightGray"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                disabled={page >= pagination.totalPages}
                className="p-2 border border-amazon-borderGray rounded text-amazon-darkBlue hover:bg-amazon-lightGray transition-colors disabled:opacity-30"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Detail Modal */}
        {modal.showDetail && modal.selectedItem && (
          <DetailModal
            item={modal.selectedItem}
            onClose={handleCloseDetailModal}
            onProcess={() => {
              handleCloseDetailModal();
              handleOpenActionModal(modal.selectedItem);
            }}
            activeTab={activeTab}
          />
        )}

        {/* Action Modal */}
        {modal.showAction && modal.selectedItem && (
          <ActionModal
            item={modal.selectedItem}
            actionState={actionState}
            isProcessing={processingId === modal.selectedItem.id}
            onActionChange={(action) => setActionState({ ...actionState, action })}
            onNotesChange={(notes) => setActionState({ ...actionState, notes })}
            onApprove={handleApprove}
            onReject={handleReject}
            onRefund={handleRefund}
            onClose={handleCloseActionModal}
            activeTab={activeTab}
          />
        )}
      </div>
    </AdminLayout>
  );
};

// Detail Modal
interface DetailModalProps {
  item: any;
  onClose: () => void;
  onProcess: () => void;
  activeTab: TabType;
}

const DetailModal: FC<DetailModalProps> = ({ item, onClose, onProcess, activeTab }) => {
  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Determine if refund button should show
  const showRefundButton =
    (activeTab === "wallet-topup" || activeTab === "seller-credits") &&
    item.status === "FAILED";

  const showProcessButton = activeTab === "order-refunds" && item.status === "PENDING";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border-4 border-amazon-orange rounded max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b-4 border-amazon-orange px-8 py-6 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-black text-amazon-darkBlue">Item Details</h2>
          <button
            onClick={onClose}
            className="text-amazon-mutedText hover:text-amazon-darkBlue transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-8 py-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-amazon-mutedText text-sm font-black uppercase mb-1">ID</p>
              <p className="text-amazon-darkBlue font-black text-lg">#{item.id}</p>
            </div>
            <div>
              <p className="text-amazon-mutedText text-sm font-black uppercase mb-1">Status</p>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded border text-sm font-black bg-yellow-50 text-amazon-orange border-yellow-200">
                {item.status}
              </span>
            </div>
          </div>

          <div className="border-t border-amazon-borderGray pt-6">
            <h3 className="text-amazon-darkBlue font-black mb-4">Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-amazon-mutedText text-sm font-black uppercase mb-1">Email</p>
                <p className="text-amazon-text font-bold">{item.userEmail || item.sellerEmail || item.user?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-amazon-mutedText text-sm font-black uppercase mb-1">Amount</p>
                <p className="text-2xl font-black text-amazon-orange">₹{item.amount?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-amazon-borderGray pt-6">
            <p className="text-amazon-mutedText text-sm font-black uppercase mb-1">Date</p>
            <p className="text-amazon-text">{formatDate(item.createdAt)}</p>
          </div>

          <div className="border-t border-amazon-borderGray pt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-amazon-lightGray text-amazon-darkBlue rounded font-black border border-amazon-borderGray hover:bg-amazon-borderGray transition-colors"
            >
              Close
            </button>
            {showProcessButton && (
              <button
                onClick={onProcess}
                className="flex-1 px-4 py-2 bg-amazon-orange text-white rounded font-black hover:bg-amazon-orangeHover transition-colors"
              >
                Process
              </button>
            )}
            {showRefundButton && (
              <button
                onClick={onProcess}
                className="flex-1 px-4 py-2 bg-amazon-danger text-white rounded font-black hover:bg-red-700 transition-colors"
              >
                Refund
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Action Modal
interface ActionModalProps {
  item: any;
  actionState: ActionState;
  isProcessing: boolean;
  onActionChange: (action: "APPROVE" | "REJECT" | "REFUND") => void;
  onNotesChange: (notes: string) => void;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
  onRefund: () => Promise<void>;
  onClose: () => void;
  activeTab: TabType;
}

const ActionModal: FC<ActionModalProps> = ({
  item,
  actionState,
  isProcessing,
  onActionChange,
  onNotesChange,
  onApprove,
  onReject,
  onRefund,
  onClose,
  activeTab,
}) => {
  const isOrderRefund = activeTab === "order-refunds";
  const isWalletOrSeller = activeTab === "wallet-topup" || activeTab === "seller-credits";

  const handleAction = async () => {
    if (actionState.action === "APPROVE") {
      await onApprove();
    } else if (actionState.action === "REJECT") {
      await onReject();
    } else if (actionState.action === "REFUND") {
      await onRefund();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border-4 border-amazon-orange rounded max-w-xl w-full">
        <div className="border-b-4 border-amazon-orange px-8 py-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-amazon-darkBlue">
            {isOrderRefund ? "Process Refund" : "Refund Payment"} #{item.id}
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-amazon-mutedText hover:text-amazon-darkBlue transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-8 py-6 space-y-6">
          <div className="bg-amazon-lightGray border-2 border-amazon-borderGray rounded p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-amazon-mutedText text-sm font-black uppercase mb-1">Amount</p>
                <p className="text-2xl font-black text-amazon-orange">₹{item.amount?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          {isOrderRefund && (
            <div>
              <h3 className="text-amazon-darkBlue font-black mb-3">Action</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => onActionChange("APPROVE")}
                  disabled={isProcessing}
                  className={`flex-1 px-4 py-3 rounded font-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                    actionState.action === "APPROVE"
                      ? "bg-amazon-success text-white"
                      : "bg-amazon-lightGray text-amazon-darkBlue border-2 border-amazon-borderGray hover:border-amazon-success"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => onActionChange("REJECT")}
                  disabled={isProcessing}
                  className={`flex-1 px-4 py-3 rounded font-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                    actionState.action === "REJECT"
                      ? "bg-amazon-danger text-white"
                      : "bg-amazon-lightGray text-amazon-darkBlue border-2 border-amazon-borderGray hover:border-amazon-danger"
                  }`}
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          )}

          {isWalletOrSeller && (
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
                <p className="text-sm text-blue-700 font-medium">
                  This payment failed. Click the button below to refund the customer.
                </p>
              </div>
              <button
                onClick={() => onActionChange("REFUND")}
                disabled={isProcessing}
                className={`w-full px-4 py-3 rounded font-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                  actionState.action === "REFUND"
                    ? "bg-amazon-danger text-white"
                    : "bg-amazon-lightGray text-amazon-darkBlue border-2 border-amazon-borderGray hover:border-amazon-danger"
                }`}
              >
                <Check className="w-4 h-4" />
                Refund Payment
              </button>
            </div>
          )}

          <div>
            <label className="block text-amazon-darkBlue font-black mb-2 uppercase">Admin Notes</label>
            <textarea
              value={actionState.notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Add notes about this action..."
              disabled={isProcessing}
              className="w-full px-4 py-2 bg-white border-2 border-amazon-borderGray rounded text-amazon-text placeholder-amazon-mutedText focus:outline-none focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange transition-colors resize-none disabled:opacity-50"
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-amazon-borderGray">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-amazon-lightGray text-amazon-darkBlue rounded font-black border-2 border-amazon-borderGray hover:bg-amazon-borderGray transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAction}
              disabled={!actionState.action || isProcessing}
              className={`flex-1 px-4 py-2 rounded font-black transition-colors flex items-center justify-center gap-2 ${
                actionState.action === "APPROVE"
                  ? "bg-amazon-success hover:bg-green-700 text-white disabled:opacity-50"
                  : actionState.action === "REJECT"
                  ? "bg-amazon-danger hover:bg-red-700 text-white disabled:opacity-50"
                  : actionState.action === "REFUND"
                  ? "bg-amazon-orange hover:bg-amazon-orangeHover text-white disabled:opacity-50"
                  : "bg-amazon-lightGray text-amazon-mutedText cursor-not-allowed border-2 border-amazon-borderGray"
              }`}
            >
              {isProcessing && <Loader className="w-4 h-4 animate-spin" />}
              {isProcessing
                ? "Processing..."
                : actionState.action === "APPROVE"
                ? "Approve Refund"
                : actionState.action === "REJECT"
                ? "Reject Refund"
                : actionState.action === "REFUND"
                ? "Refund Payment"
                : "Select Action"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRefundDashboard;