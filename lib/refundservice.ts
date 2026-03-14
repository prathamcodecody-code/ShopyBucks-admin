/**
 * Complete Refund Management API Service
 * Matches RefundController, UserWalletController, and WalletController
 * Updated: March 2026
 */

import {
  Refund,
  RefundStatus,
  PaginatedResponse,
  ApiResponse,
} from "@/lib/refund.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// ============================================
// UTILITIES
// ============================================

// Get token from localStorage or sessionStorage
const getToken = (): string => {
  if (typeof window === "undefined") return "";
  const token = localStorage.getItem("admin_token") || sessionStorage.getItem("admin_token") || "";
  console.log("[API] Token present:", !!token);
  return token;
};

// Create headers with authorization
const createHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Handle API errors with detailed logging
const handleApiError = (error: unknown, endpoint: string): Error => {
  console.error(`[API] Error at ${endpoint}:`, error);

  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);
  return new Error("An unknown error occurred");
};

// ============================================
// REFUND ENDPOINTS (RefundController)
// ============================================

/**
 * Get all refunds (admin endpoint)
 * GET /api/refunds/admin/all
 */
export const getRefunds = async (
  status: RefundStatus | "all" = "all",
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Refund>> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (status !== "all") params.append("status", status);

    const url = `${API_BASE_URL}/refunds/admin/all?${params}`;
    console.log("[API] GET", url);

    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("[API] ✅ Got refunds:", data.data?.length || 0);

    return data;
  } catch (error) {
    throw handleApiError(error, "getRefunds");
  }
};

/**
 * Get single refund details
 * GET /api/refunds/:id
 * Note: User can only see their own refunds
 */
export const getRefundDetails = async (refundId: number): Promise<ApiResponse<Refund>> => {
  try {
    const url = `${API_BASE_URL}/refunds/${refundId}`;
    console.log("[API] GET", url);

    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch refund`);
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, "getRefundDetails");
  }
};

/**
 * Process a refund (approve/reject) - ADMIN ONLY
 * POST /api/refunds/admin/process/:id
 */
export const processRefund = async (
  refundId: number,
  action: "APPROVE" | "REJECT",
  notes: string = ""
): Promise<ApiResponse<any>> => {
  try {
    const url = `${API_BASE_URL}/refunds/admin/process/${refundId}`;
    console.log("[API] POST", url, "Action:", action);

    const response = await fetch(url, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({ action, notes }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: Failed to process refund`
      );
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, "processRefund");
  }
};

/**
 * Cancel entire order and create refund
 * POST /api/refunds/cancel-order
 * For users (non-admin)
 */
export const cancelOrder = async (
  orderId: number,
  reason?: string
): Promise<ApiResponse<any>> => {
  try {
    const url = `${API_BASE_URL}/refunds/cancel-order`;
    console.log("[API] POST", url);

    const response = await fetch(url, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({ orderId, reason }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: Failed to cancel order`
      );
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, "cancelOrder");
  }
};

/**
 * Cancel specific item and create refund
 * POST /api/refunds/cancel-item
 * For users (non-admin)
 */
export const cancelItem = async (
  orderItemId: number,
  reason: string
): Promise<ApiResponse<any>> => {
  try {
    const url = `${API_BASE_URL}/refunds/cancel-item`;
    console.log("[API] POST", url);

    const response = await fetch(url, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({ orderItemId, reason }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: Failed to cancel item`
      );
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, "cancelItem");
  }
};

/**
 * Get user's refund history
 * GET /api/refunds
 * For users (non-admin)
 */
export const getUserRefunds = async (): Promise<ApiResponse<any>> => {
  try {
    const url = `${API_BASE_URL}/refunds`;
    console.log("[API] GET", url);

    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch user refunds`);
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, "getUserRefunds");
  }
};

// ============================================
// USER WALLET ENDPOINTS (UserWalletController)
// ============================================

/**
 * Get user wallet balance
 * GET /api/wallet
 */
export const getUserWalletBalance = async (): Promise<ApiResponse<{ balance: number }>> => {
  try {
    const url = `${API_BASE_URL}/wallet`;
    console.log("[API] GET", url);

    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch wallet balance`);
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, "getUserWalletBalance");
  }
};

/**
 * Get user wallet summary
 * GET /api/wallet/summary
 */
export const getUserWalletSummary = async (): Promise<ApiResponse<any>> => {
  try {
    const url = `${API_BASE_URL}/wallet/summary`;
    console.log("[API] GET", url);

    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch wallet summary`);
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, "getUserWalletSummary");
  }
};

/**
 * Get user wallet transaction history
 * GET /api/wallet/transactions
 */
export const getUserWalletTransactions = async (
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<any>> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const url = `${API_BASE_URL}/wallet/transactions?${params}`;
    console.log("[API] GET", url);

    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch transactions`);
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, "getUserWalletTransactions");
  }
};

/**
 * Initiate wallet topup payment
 * POST /api/wallet/add-money
 */
export const initiateWalletTopup = async (amount: number): Promise<ApiResponse<any>> => {
  try {
    const url = `${API_BASE_URL}/wallet/add-money`;
    console.log("[API] POST", url, "Amount:", amount);

    const response = await fetch(url, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: Payment initiation failed`
      );
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, "initiateWalletTopup");
  }
};

/**
 * Admin: Get all wallet topups
 * GET /api/wallet/admin/topups
 */
export const getWalletTopups = async (
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | "all" = "all",
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<any>> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (status !== "all") params.append("status", status);

    const url = `${API_BASE_URL}/wallet/admin/topups?${params}`;
    console.log("[API] GET", url);

    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch topups`);
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, "getWalletTopups");
  }
};

/**
 * Admin: Get failed topups
 * GET /api/wallet/admin/failed-topups
 */
export const getFailedTopups = async (): Promise<ApiResponse<any>> => {
  try {
    const url = `${API_BASE_URL}/wallet/admin/failed-topups`;
    console.log("[API] GET", url);

    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch failed topups`);
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, "getFailedTopups");
  }
};

/**
 * Admin: Refund specific topup
 * POST /api/wallet/admin/refund-topup
 */
export const refundTopup = async (
  topupId: number,
  userId: number,
  amount: number,
  txnid: string,
  reason?: string
): Promise<ApiResponse<any>> => {
  try {
    const url = `${API_BASE_URL}/wallet/admin/refund-topup`;
    console.log("[API] POST", url);

    const response = await fetch(url, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({ topupId, userId, amount, txnid, reason }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: Failed to refund topup`
      );
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, "refundTopup");
  }
};

/**
 * Admin: Adjust user wallet
 * POST /api/wallet/admin/adjust/:userId
 */
export const adjustUserWallet = async (
  userId: number,
  amount: number,
  reason: string
): Promise<ApiResponse<any>> => {
  try {
    const url = `${API_BASE_URL}/wallet/admin/adjust/${userId}`;
    console.log("[API] POST", url);

    const response = await fetch(url, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({ amount, reason }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: Failed to adjust wallet`
      );
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, "adjustUserWallet");
  }
};

// ============================================
// SELLER WALLET ENDPOINTS (WalletController)
// ============================================

/**
 * Get seller wallet balance
 * GET /api/seller/wallet
 */
export const getSellerWallet = async (): Promise<ApiResponse<any>> => {
  try {
    const url = `${API_BASE_URL}/seller/wallet`;
    console.log("[API] GET", url);

    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch seller wallet`);
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, "getSellerWallet");
  }
};

/**
 * Get seller wallet summary
 * GET /api/seller/wallet/summary
 */
export const getSellerWalletSummary = async (): Promise<ApiResponse<any>> => {
  try {
    const url = `${API_BASE_URL}/seller/wallet/summary`;
    console.log("[API] GET", url);

    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch wallet summary`);
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, "getSellerWalletSummary");
  }
};

/**
 * Get seller credit transaction history
 * GET /api/seller/wallet/history
 */
export const getSellerCreditHistory = async (
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<any>> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const url = `${API_BASE_URL}/seller/wallet/history?${params}`;
    console.log("[API] GET", url);

    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch credit history`);
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, "getSellerCreditHistory");
  }
};

/**
 * Buy seller credits
 * POST /api/seller/wallet/buy
 */
export const buyCreditsPurchase = async (credits: number): Promise<ApiResponse<any>> => {
  try {
    const url = `${API_BASE_URL}/seller/wallet/buy`;
    console.log("[API] POST", url, "Credits:", credits);

    const response = await fetch(url, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({ credits }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: Failed to initiate purchase`
      );
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, "buyCreditsPurchase");
  }
};

/**
 * Refund campaign credits
 * POST /api/seller/wallet/refund-campaign
 */
export const refundCampaignCredits = async (
  campaignId: number,
  reason?: string
): Promise<ApiResponse<any>> => {
  try {
    const url = `${API_BASE_URL}/seller/wallet/refund-campaign`;
    console.log("[API] POST", url);

    const response = await fetch(url, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({ campaignId, reason }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: Failed to refund credits`
      );
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, "refundCampaignCredits");
  }
};

/**
 * Admin: Get all seller credit purchases
 * GET /api/seller/wallet/admin/purchases
 */
export const getSellerPurchases = async (
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | "all" = "all",
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<any>> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (status !== "all") params.append("status", status);

    const url = `${API_BASE_URL}/seller/wallet/admin/purchases?${params}`;
    console.log("[API] GET", url);

    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch purchases`);
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, "getSellerPurchases");
  }
};

/**
 * Admin: Refund specific seller credit purchase
 * POST /api/seller/wallet/admin/refund-purchase
 */
export const refundPurchase = async (
  purchaseId: number,
  userId: number,
  amount: number,
  txnid: string,
  reason?: string
): Promise<ApiResponse<any>> => {
  try {
    const url = `${API_BASE_URL}/seller/wallet/admin/refund-purchase`;
    console.log("[API] POST", url);

    const response = await fetch(url, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({ purchaseId, userId, amount, txnid, reason }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: Failed to refund purchase`
      );
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, "refundPurchase");
  }
};

/**
 * Admin: Adjust seller credits
 * POST /api/seller/wallet/admin/adjust/:sellerId
 */
export const adjustSellerWallet = async (
  sellerId: number,
  credits: number,
  reason: string
): Promise<ApiResponse<any>> => {
  try {
    const url = `${API_BASE_URL}/seller/wallet/admin/adjust/${sellerId}`;
    console.log("[API] POST", url);

    const response = await fetch(url, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({ credits, reason }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: Failed to adjust credits`
      );
    }

    return await response.json();
  } catch (error) {
    throw handleApiError(error, "adjustSellerWallet");
  }
};

// ============================================
// SERVICE OBJECT
// ============================================

const refundService = {
  // Refund endpoints
  getRefunds,
  getRefundDetails,
  processRefund,
  cancelOrder,
  cancelItem,
  getUserRefunds,

  // User Wallet endpoints
  getUserWalletBalance,
  getUserWalletSummary,
  getUserWalletTransactions,
  initiateWalletTopup,
  getWalletTopups,
  getFailedTopups,
  refundTopup,
  adjustUserWallet,

  // Seller Wallet endpoints
  getSellerWallet,
  getSellerWalletSummary,
  getSellerCreditHistory,
  buyCreditsPurchase,
  refundCampaignCredits,
  getSellerPurchases,
  refundPurchase,
  adjustSellerWallet,
};

export default refundService;